"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons, orderStatusHistory, orders, reviews } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import type { EstadoAdmin } from "@/app/actions/admin-produtos";

export type EstadoPedido = { sucesso?: string; erro?: string };

/** Altera o status de um pedido e registra no histórico. */
export async function alterarStatusPedido(
  _anterior: EstadoPedido,
  formData: FormData,
): Promise<EstadoPedido> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim();

  const validos = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validos.includes(status)) return { erro: "Status inválido." };
  if (!Number.isInteger(id)) return { erro: "Pedido inválido." };

  await db.update(orders).set({ status: status as never }).where(eq(orders.id, id));
  await db.insert(orderStatusHistory).values({
    orderId: id,
    status,
    observacao: observacao || null,
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/pedidos/[id]", "page");
  return { sucesso: "Status atualizado!" };
}

/* ============ CUPONS ============ */
export async function criarCupom(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const codigo = String(formData.get("codigo") ?? "").trim().toUpperCase();
  const tipo = String(formData.get("tipo") ?? "PERCENTUAL");
  const valor = Number(formData.get("valor") ?? 0);
  const validade = String(formData.get("validade") ?? "");
  const limite = formData.get("limite") ? Number(formData.get("limite")) : null;

  if (codigo.length < 3) return { erro: "Código deve ter ao menos 3 letras." };
  if (!["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"].includes(tipo))
    return { erro: "Tipo inválido." };
  if (!validade) return { erro: "Informe a validade." };

  try {
    await db.insert(coupons).values({
      codigo,
      tipo: tipo as never,
      valor: valor.toFixed(2),
      validade: new Date(validade),
      limiteUso: limite,
    });
    revalidatePath("/admin/cupons");
    return { sucesso: "Cupom criado!" };
  } catch {
    return { erro: "Já existe um cupom com esse código." };
  }
}

export async function alternarCupom(cupomId: number) {
  if (!(await requireAdmin())) return;
  const [c] = await db.select().from(coupons).where(eq(coupons.id, cupomId)).limit(1);
  if (!c) return;
  await db.update(coupons).set({ ativo: !c.ativo }).where(eq(coupons.id, cupomId));
  revalidatePath("/admin/cupons");
}

/* ============ AVALIACOES ============ */
export async function moderarAvaliacao(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status))
    return { erro: "Status inválido." };

  await db.update(reviews).set({ status: status as never }).where(eq(reviews.id, id));
  revalidatePath("/admin/avaliacoes");
  return { sucesso: "Avaliação atualizada." };
}

/** Action simples (form action) para aprovar/ocultar avaliação. */
export async function moderarAvaliacaoAcao(formData: FormData): Promise<void> {
  await moderarAvaliacao({}, formData);
}

/** Confirma a retirada de um pedido na loja (valida o código de retirada). */
export async function confirmarRetirada(
  pedidoId: number,
  codigoInformado: string,
): Promise<{ ok: boolean; msg?: string }> {
  if (!(await requireAdmin())) return { ok: false, msg: "Acesso negado." };

  const [pedido] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, pedidoId))
    .limit(1);

  if (!pedido) return { ok: false, msg: "Pedido não encontrado." };
  if (pedido.tipoEntrega !== "RETIRADA") {
    return { ok: false, msg: "Este pedido não é de retirada na loja." };
  }
  if (pedido.paymentStatus !== "APPROVED") {
    return { ok: false, msg: "O pagamento deste pedido ainda não foi aprovado." };
  }
  if (pedido.pickupAt) {
    return { ok: false, msg: "Este pedido já foi retirado." };
  }
  if (!pedido.pickupCode) {
    return { ok: false, msg: "Código de retirada não disponível." };
  }
  if (codigoInformado.trim().toUpperCase() !== pedido.pickupCode.toUpperCase()) {
    return { ok: false, msg: "Código de retirada incorreto." };
  }

  await db
    .update(orders)
    .set({ status: "DELIVERED", pickupAt: new Date() })
    .where(eq(orders.id, pedido.id));

  await db.insert(orderStatusHistory).values({
    orderId: pedido.id,
    status: "DELIVERED",
    observacao: "Retirada confirmada na loja",
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${pedido.id}`);
  return { ok: true };
}

