import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  orderItems,
  orders,
  orderStatusHistory,
  products,
} from "@/db/schema";
import type { StatusPagamentoGateway } from "./provedor";

/**
 * Mapeamento Mercado Pago → DAVI PRODUTOS.
 * payment_status representa o pagamento; status representa o pedido.
 */
const MAPEAMENTO_PEDIDO: Record<StatusPagamentoGateway, string | null> = {
  APPROVED: "CONFIRMED",
  REJECTED: null, // pedido continua PENDING (aguardando nova tentativa)
  PENDING: null,
  IN_PROCESS: null,
  CANCELLED: "CANCELLED",
  REFUNDED: "CANCELLED",
};

function normalizarStatus(st: StatusPagamentoGateway): string {
  if (st === "IN_PROCESS") return "PENDING";
  return st;
}

type PedidoPagamento = {
  id: number;
  paymentStatus: string | null;
  paymentExternalId: string | null;
  paymentProvider: string | null;
  status: string;
};

/**
 * Processa um evento de pagamento de forma IDEMPOTENTE.
 * - Se o pedido já está no mesmo estado, não faz nada (retorna false).
 * - Só baixa estoque na transição → APPROVED.
 * - Só registra histórico quando o status realmente muda.
 */
export async function conciliarPagamento(params: {
  pedidoId: number;
  provider: string;
  pagamentoExternoId: string;
  statusGateway: StatusPagamentoGateway;
  metodo?: string | null;
}): Promise<{ alterado: boolean }> {
  const [pedido] = await db
    .select({
      id: orders.id,
      paymentStatus: orders.paymentStatus,
      paymentExternalId: orders.paymentExternalId,
      paymentProvider: orders.paymentProvider,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, params.pedidoId))
    .limit(1);

  if (!pedido) return { alterado: false };

  const novoStatus = normalizarStatus(params.statusGateway);
  const jaProcessado =
    pedido.paymentStatus === novoStatus &&
    pedido.paymentExternalId === params.pagamentoExternoId;

  // Idempotência básica: mesmo status + mesmo ID externo já foi processado.
  if (jaProcessado) return { alterado: false };

  // Atualiza o pagamento
  await db
    .update(orders)
    .set({
      paymentStatus: novoStatus,
      paymentProvider: params.provider,
      paymentExternalId: params.pagamentoExternoId,
      paymentMethodId: params.metodo ?? undefined,
      ...(novoStatus === "APPROVED" ? { paidAt: new Date() } : {}),
    })
    .where(eq(orders.id, params.pedidoId));

  // Atualiza o status do pedido (logística) quando aplicável
  const statusPedido = MAPEAMENTO_PEDIDO[novoStatus as StatusPagamentoGateway];
  if (statusPedido && pedido.status !== statusPedido) {
    await db
      .update(orders)
      .set({ status: statusPedido as never })
      .where(eq(orders.id, params.pedidoId));
    await db.insert(orderStatusHistory).values({
      orderId: params.pedidoId,
      status: statusPedido,
      observacao:
        novoStatus === "APPROVED" ? "Pagamento aprovado" : "Pagamento cancelado",
    });
  }

  // Só baixa estoque quando o pagamento é aprovado E ainda não estava aprovado.
  if (novoStatus === "APPROVED" && pedido.paymentStatus !== "APPROVED") {
    await baixarEstoque(params.pedidoId);
  }

  return { alterado: true };
}

/** Baixa o estoque dos itens do pedido de forma segura (nunca negativo). */
async function baixarEstoque(pedidoId: number) {
  const itens = await db
    .select({
      productId: orderItems.productId,
      quantidade: orderItems.quantidade,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, pedidoId));

  for (const item of itens) {
    await db
      .update(products)
      .set({ estoque: sql`greatest(${products.estoque} - ${item.quantidade}, 0)` })
      .where(eq(products.id, item.productId));
  }
}

/** Devolve o estoque (usado ao cancelar um pedido já aprovado). */
export async function devolverEstoque(pedidoId: number) {
  const itens = await db
    .select({
      productId: orderItems.productId,
      quantidade: orderItems.quantidade,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, pedidoId));

  for (const item of itens) {
    await db
      .update(products)
      .set({ estoque: sql`${products.estoque} + ${item.quantidade}` })
      .where(eq(products.id, item.productId));
  }
}

export type { PedidoPagamento };

/**
 * Expira um PIX não pago após o prazo (idempotente).
 * Se o pedido ainda estiver PENDING (pagamento PENDING) e o prazo passou,
 * marca o pagamento como EXPIRED e cancela o pedido. Nunca afeta pedidos
 * já aprovados ou em outro status.
 */
export async function expirarPixSeNecessario(pedidoId: number) {
  const [pedido] = await db
    .select({
      id: orders.id,
      status: orders.status,
      pagamento: orders.pagamento,
      paymentStatus: orders.paymentStatus,
      paymentExpiresAt: orders.paymentExpiresAt,
    })
    .from(orders)
    .where(eq(orders.id, pedidoId))
    .limit(1);

  if (!pedido) return;
  if (pedido.pagamento !== "PIX") return;
  if (pedido.status !== "PENDING" || pedido.paymentStatus !== "PENDING") return;
  if (!pedido.paymentExpiresAt) return;
  if (new Date(pedido.paymentExpiresAt).getTime() > Date.now()) return;

  await db
    .update(orders)
    .set({ status: "CANCELLED", paymentStatus: "EXPIRED" })
    .where(eq(orders.id, pedidoId));

  await db.insert(orderStatusHistory).values({
    orderId: pedidoId,
    status: "CANCELLED",
    observacao: "PIX expirado (prazo de 1 hora)",
  });
}
