import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { criarPagamentoCartao } from "@/services/integracoes/pagamento/mercado-pago";

/**
 * Processa o pagamento com cartão a partir do token gerado pelo
 * Card Payment Brick (no browser). O número do cartão/CVV NUNCA chega
 * ao nosso backend — recebemos apenas o token do Mercado Pago.
 */
export async function POST(req: NextRequest) {
  const sessao = await lerSessao();
  if (!sessao) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  let body: {
    orderId?: number;
    token?: string;
    paymentMethodId?: string;
    issuerId?: string | null;
    installments?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ erro: "payload inválido" }, { status: 400 });
  }

  const orderId = Number(body.orderId);
  if (!Number.isInteger(orderId) || orderId < 1 || !body.token) {
    return NextResponse.json({ erro: "dados incompletos" }, { status: 400 });
  }

  // Garante que o pedido pertence ao usuário e está aguardando pagamento.
  const [pedido] = await db
    .select({
      id: orders.id,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      paymentIdempotencyKey: orders.paymentIdempotencyKey,
    })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, sessao.uid)))
    .limit(1);

  if (!pedido) {
    return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
  }
  if (pedido.paymentStatus === "APPROVED") {
    return NextResponse.json({ erro: "Pedido já pago" }, { status: 409 });
  }

  try {
    const resultado = await criarPagamentoCartao({
      pedidoId: orderId,
      idempotencyKey: pedido.paymentIdempotencyKey ?? randomUUID(),
      valor: Number(pedido.total),
      metodo: "CARTAO",
      emailComprador: sessao.email,
      tokenCartao: body.token,
      parcelas: body.installments ?? 1,
      issuerId: body.issuerId ?? null,
      idPagamentoCartao: body.paymentMethodId ?? null,
    });

    await db
      .update(orders)
      .set({
        paymentExternalId: resultado.pagamentoExternoId,
        paymentStatus: resultado.status,
        paymentMethodId: resultado.metodo,
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ status: resultado.status });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar cartão";
    return NextResponse.json({ erro: msg }, { status: 502 });
  }
}

