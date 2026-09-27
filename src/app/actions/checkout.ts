"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  addresses,
  cartItems,
  carts,
  orderItems,
  orderStatusHistory,
  orders,
  products,
  users,
} from "@/db/schema";
import { cookies } from "next/headers";
import { lerSessao } from "@/lib/auth";
import { lerCarrinho, precoUnitario } from "@/services/carrinho";
import { criarPagamentoPix } from "@/services/integracoes/pagamento/mercado-pago";
import { notificarNovoPedidoWhatsApp } from "@/services/integracoes/whatsapp/notificar";
import { calcularFrete, cidadePermitida, cepPermitido } from "@/config/frete";

export type EstadoCheckout = {
  erro?: string;
  pixData?: {
    qrCode: string | null;
    qrCodeBase64: string | null;
    expiresAt: number | null;
  };
};

/** Gera um código de retirada único e difícil de adivinhar (ex.: DAVI-482731). */
function gerarPickupCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `DAVI-${n}`;
}

export async function finalizarPedido(
  _anterior: EstadoCheckout,
  formData: FormData,
): Promise<EstadoCheckout> {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");

  const tipoEntrega = String(formData.get("tipoEntrega") ?? "ENTREGA");
  const ehRetirada = tipoEntrega === "RETIRADA";
  const addressId = Number(formData.get("addressId"));
  const pagamento = String(formData.get("pagamento") ?? "PIX");
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!ehRetirada && (!Number.isInteger(addressId) || addressId < 1)) {
    return { erro: "Selecione um endereço de entrega." };
  }
  if (!["PIX", "CARTAO", "ATENDENTE"].includes(pagamento)) {
    return { erro: "Forma de pagamento inválida." };
  }

  // Valida o endereço pertence ao usuário e está na área de entrega (somente para entrega)
  let enderecoData: { cidade: string; cep: string; rua: string; numero: string; estado: string } | null = null;
  if (!ehRetirada) {
    const [endereco] = await db
      .select({
        id: addresses.id,
        cidade: addresses.cidade,
        cep: addresses.cep,
        rua: addresses.rua,
        numero: addresses.numero,
        estado: addresses.estado,
      })
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, sessao.uid)))
      .limit(1);
    if (!endereco) return { erro: "Endereço inválido." };
    enderecoData = endereco;

    // Validação de área de entrega
    if (!cidadePermitida(endereco.cidade) || !cepPermitido(endereco.cep)) {
      return {
        erro: `Entrega não disponível para ${endereco.cidade}/${endereco.cep}. Áreas atendidas: Jacareí, São José dos Campos e Caçapava.`,
      };
    }
  }

  const itens = await lerCarrinho();
  if (itens.length === 0) return { erro: "Seu carrinho está vazio." };

  // Revalida o estoque no momento da compra (não baixa ainda — baixa no APPROVED).
  const ids = itens.map((i) => i.productId);
  const emEstoque = await db
    .select({ id: products.id, estoque: products.estoque })
    .from(products)
    .where(sql`${products.id} in (${ids.join(",")})`);

  const mapaEstoque = new Map(emEstoque.map((p) => [p.id, p.estoque]));
  for (const item of itens) {
    const disponivel = mapaEstoque.get(item.productId) ?? 0;
    if (item.quantidade > disponivel) {
      return {
        erro: `Estoque insuficiente para "${item.nome}". Disponível: ${disponivel}.`,
      };
    }
  }

  // Registra preços no momento da compra
  const subtotal = itens.reduce(
    (soma, i) => soma + precoUnitario(i) * i.quantidade,
    0,
  );
  const subtotalCentavos = Math.round(subtotal * 100);
  const frete = calcularFrete(subtotalCentavos, tipoEntrega as "ENTREGA" | "RETIRADA") / 100;
  const total = subtotal + frete;

  const idempotencyKey = randomUUID();

  const pickupCode = ehRetirada ? gerarPickupCode() : null;

  const [pedido] = await db
    .insert(orders)
    .values({
      userId: sessao.uid,
      addressId: ehRetirada ? null : addressId,
      subtotal: subtotal.toFixed(2),
      desconto: "0.00",
      frete: frete.toFixed(2),
      total: total.toFixed(2),
      status: "PENDING",
      pagamento: pagamento as "PIX" | "CARTAO" | "ATENDENTE",
      tipoEntrega: tipoEntrega as "ENTREGA" | "RETIRADA",
      paymentProvider: "MercadoPago",
      paymentIdempotencyKey: idempotencyKey,
      pickupCode,
      observacoes: observacoes || null,
    })
    .$returningId();

  await db.insert(orderItems).values(
    itens.map((item) => ({
      orderId: pedido.id,
      productId: item.productId,
      nomeProduto: item.nome,
      sku: item.sku,
      quantidade: item.quantidade,
      precoUnitario: precoUnitario(item).toFixed(2),
      subtotal: (precoUnitario(item) * item.quantidade).toFixed(2),
    })),
  );

  await db.insert(orderStatusHistory).values({
    orderId: pedido.id,
    status: "PENDING",
    observacao: "Pedido realizado",
  });

  // Limpa o carrinho da sessão
  const sid = (await cookies()).get("davi_carrinho")?.value;
  if (sid) {
    const [cart] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.sessionId, sid))
      .limit(1);
    if (cart) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }
  }

  // Notifica o dono da loja via WhatsApp (todas as formas de pagamento).
  const [usuario] = await db
    .select({ telefone: users.telefone })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);

  let entregaDescricao = "Retirada na loja (pronto em 2h)";
  if (!ehRetirada && addressId && enderecoData) {
    entregaDescricao = `${enderecoData.rua}, ${enderecoData.numero} — ${enderecoData.cidade}/${enderecoData.estado}`;
  }

  const rotuloMetodo =
    pagamento === "PIX"
      ? "PIX"
      : pagamento === "CARTAO"
        ? "Cartão"
        : "Atendente da loja";

  await notificarNovoPedidoWhatsApp({
    pedidoId: pedido.id,
    cliente: sessao.nome,
    email: sessao.email,
    telefone: usuario?.telefone ?? null,
    pagamento: rotuloMetodo,
    entrega: entregaDescricao,
    itens: itens.map((i) => ({
      nome: i.nome,
      quantidade: i.quantidade,
      subtotal: (precoUnitario(i) * i.quantidade).toFixed(2),
    })),
    subtotal: subtotal.toFixed(2),
    frete: frete.toFixed(2),
    total: total.toFixed(2),
  });

  // Cria a cobrança PIX no Mercado Pago
  if (pagamento === "PIX") {
    try {
      const pix = await criarPagamentoPix({
        pedidoId: pedido.id,
        idempotencyKey,
        valor: total,
        metodo: "PIX",
        emailComprador: sessao.email,
      });
      await db
        .update(orders)
        .set({
          paymentExternalId: pix.pagamentoExternoId,
          paymentStatus: pix.status,
          paymentMethodId: pix.metodo,
          paymentQrCode: pix.qrCode,
          paymentQrCode64: pix.qrCodeBase64,
          paymentExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        })
        .where(eq(orders.id, pedido.id));

      // Retorna dados do PIX para exibir QR Code na tela de checkout (em vez de redirect)
      return {
        pixData: {
          qrCode: pix.qrCode,
          qrCodeBase64: pix.qrCodeBase64,
          expiresAt: pix.qrCode ? Date.now() + 60 * 60 * 1000 : null,
        },
      };
    } catch (e) {
      // Sem token de teste/configuração, o pedido continua PENDING
      console.error("[checkout] Erro ao criar PIX:", e);
      return { erro: "Erro ao gerar pagamento PIX. Tente novamente." };
    }
  }

  if (pagamento === "CARTAO") {
    // O cartão é tokenizado no browser (Card Payment Brick) e processado
    // em /api/pagamento/cartao. Aqui só redirecionamos para a página de pagamento.
    redirect(`/conta/pedidos/${pedido.id}?pagar=cartao`);
  }

  // ATENDENTE: pedido fica PENDING aguardando confirmação.
  // O dono já foi notificado via WhatsApp.
  redirect(`/conta/pedidos/${pedido.id}`);
}