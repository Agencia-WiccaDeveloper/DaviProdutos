"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartItems,
  orderItems,
  orderStatusHistory,
  orders,
  products,
  users,
} from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { obterOuCriarCarrinho } from "@/lib/session-cart";
import { criarPagamentoPix } from "@/services/integracoes/pagamento/mercado-pago";

const CANCELAVEIS = ["PENDING", "CONFIRMED"];

/** Cancela um pedido do usuário, devolvendo o estoque. */
export async function cancelarPedido(pedidoId: number): Promise<{
  ok: boolean;
  msg?: string;
}> {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };

  const [pedido] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, pedidoId), eq(orders.userId, sessao.uid)))
    .limit(1);

  if (!pedido) return { ok: false, msg: "Pedido não encontrado." };
  if (!CANCELAVEIS.includes(pedido.status)) {
    return {
      ok: false,
      msg: "Este pedido não pode mais ser cancelado.",
    };
  }

  const itens = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, pedido.id));

  // Devolve o estoque
  for (const item of itens) {
    await db
      .update(products)
      .set({ estoque: sql`${products.estoque} + ${item.quantidade}` })
      .where(eq(products.id, item.productId));
  }

  await db
    .update(orders)
    .set({ status: "CANCELLED" })
    .where(eq(orders.id, pedido.id));

  await db.insert(orderStatusHistory).values({
    orderId: pedido.id,
    status: "CANCELLED",
    observacao: "Cancelado pelo cliente",
  });

  revalidatePath("/conta/pedidos");
  return { ok: true };
}

/** Re-adiciona os itens de um pedido ao carrinho da sessão. */
export async function comprarNovamente(pedidoId: number): Promise<{
  ok: boolean;
  msg?: string;
}> {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };

  const [pedido] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, pedidoId), eq(orders.userId, sessao.uid)))
    .limit(1);
  if (!pedido) return { ok: false, msg: "Pedido não encontrado." };

  const itens = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, pedidoId));

  const carrinho = await obterOuCriarCarrinho();
  for (const item of itens) {
    await db
      .insert(cartItems)
      .values({
        cartId: carrinho.id,
        productId: item.productId,
        quantidade: item.quantidade,
      })
      .onDuplicateKeyUpdate({
        set: { quantidade: sql`${cartItems.quantidade} + ${item.quantidade}` },
      });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Gera um novo QR Code PIX para um pedido PENDING (tentativa anterior invalidada). */
export async function gerarNovoPix(pedidoId: number): Promise<{
  ok: boolean;
  msg?: string;
}> {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false, msg: "Você precisa estar logado." };

  const [pedido] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, pedidoId), eq(orders.userId, sessao.uid)))
    .limit(1);

  if (!pedido) return { ok: false, msg: "Pedido não encontrado." };
  if (pedido.pagamento !== "PIX") {
    return { ok: false, msg: "Este pedido não é PIX." };
  }
  if (pedido.paymentStatus === "APPROVED" || pedido.status === "CONFIRMED") {
    return { ok: false, msg: "Este pedido já foi aprovado." };
  }

  const [usuario] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);

  const novaChave = randomUUID();
  try {
    const pix = await criarPagamentoPix({
      pedidoId: pedido.id,
      idempotencyKey: novaChave,
      valor: Number(pedido.total),
      metodo: "PIX",
      emailComprador: usuario?.email ?? sessao.email,
    });

    await db
      .update(orders)
      .set({
        paymentExternalId: pix.pagamentoExternoId,
        paymentStatus: "PENDING",
        paymentMethodId: pix.metodo,
        paymentQrCode: pix.qrCode,
        paymentQrCode64: pix.qrCodeBase64,
        paymentIdempotencyKey: novaChave,
        paymentExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
      .where(eq(orders.id, pedido.id));

    revalidatePath(`/conta/pedidos/${pedido.id}`);
    return { ok: true };
  } catch {
    return {
      ok: false,
      msg: "Não foi possível gerar o pagamento PIX. Tente novamente.",
    };
  }
}
