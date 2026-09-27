import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts } from "@/db/schema";

const COOKIE_CARRINHO = "davi_carrinho";
const MESES_30 = 60 * 60 * 24 * 30;

async function lerSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_CARRINHO)?.value ?? null;
}

/** Conta itens do carrinho da sessão atual (0 se não existir). */
export async function contarItensCarrinho(): Promise<number> {
  const sid = await lerSessionId();
  if (!sid) return 0;

  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sid))
    .limit(1);
  if (!cart) return 0;

  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${cartItems.quantidade}), 0)` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));
  return Number(row.total);
}

/** Obtém o carrinho da sessão ou cria um novo (define o cookie). */
export async function obterOuCriarCarrinho() {
  const store = await cookies();
  const sidAtual = store.get(COOKIE_CARRINHO)?.value;

  if (sidAtual) {
    const [existente] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sidAtual))
      .limit(1);
    if (existente) return existente;
  }

  const novoSid = crypto.randomUUID();
  const [novo] = await db
    .insert(carts)
    .values({ sessionId: novoSid })
    .$returningId();
  store.set(COOKIE_CARRINHO, novoSid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MESES_30,
  });
  return { id: novo.id, sessionId: novoSid };
}
