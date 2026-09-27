import { NextRequest, NextResponse } from "next/server";
import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";
import { consultarOrder } from "@/services/integracoes/pagamento/mercado-pago";
import { conciliarPagamento } from "@/services/integracoes/pagamento/processador";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { orders } from "@/db/schema";

/**
 * Webhook do Mercado Pago — Orders API (type=order).
 * ==================================================
 * 1) Recebe a notificação;
 * 2) valida a assinatura (x-signature + x-request-id + data.id + secret);
 * 3) consulta a Order no MP (fonte de verdade — nunca confia só no payload);
 * 4) localiza o pedido via external_reference;
 * 5) reconcilia de forma idempotente.
 */

type MpWebhookBody = {
  type?: string;
  action?: string;
  application_id?: string | number;
  live_mode?: boolean;
  data?: { id?: string | number };
};

export async function POST(req: NextRequest) {
  let body: MpWebhookBody;
  try {
    body = (await req.json()) as MpWebhookBody;
  } catch {
    return NextResponse.json({ erro: "payload inválido" }, { status: 400 });
  }

  // Orders API envia type=order.
  if (body.type !== "order") {
    return NextResponse.json({ recebido: true });
  }

  // O data.id usado na assinatura vem SEMPRE da query string (?data.id=...),
  // conforme a documentação oficial do Mercado Pago. Sem fallback para o body.
  const orderId = req.nextUrl.searchParams.get("data.id");
  if (!orderId) {
    return NextResponse.json({ erro: "id ausente" }, { status: 400 });
  }

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(
      "[webhook] MERCADO_PAGO_WEBHOOK_SECRET não configurado — notificação ignorada.",
    );
    return NextResponse.json({ recebido: true, assinaturaPendente: true });
  }

  // Valida a assinatura com o validador oficial do SDK (HMAC-SHA256).
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId: orderId,
      secret,
    });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      // Apenas o motivo da falha — nunca valores sensíveis (secret/HMAC/v1).
      console.warn(`[webhook] assinatura inválida (motivo=${err.reason})`);
      return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
    }
    throw err;
  }

  // Fonte de verdade: consulta a Order no Mercado Pago.
  const ordem = await consultarOrder(orderId);
  if (!ordem) {
    return NextResponse.json({ recebido: true, pendente: true });
  }

  // Localiza o pedido pela referência externa (external_reference = pedido id).
  const pedidoId = Number(ordem.externalReference);
  if (!Number.isInteger(pedidoId) || pedidoId < 1) {
    return NextResponse.json({ recebido: true, semPedido: true });
  }

  const [pedido] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.id, pedidoId))
    .limit(1);
  if (!pedido) {
    return NextResponse.json({ recebido: true, semPedido: true });
  }

  await conciliarPagamento({
    pedidoId,
    provider: "MercadoPago",
    pagamentoExternoId: orderId,
    statusGateway: ordem.status,
    metodo: ordem.metodo,
  });

  // Sempre 200 — idempotente e rápido para o gateway não reenviar em loop.
  return NextResponse.json({ recebido: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
