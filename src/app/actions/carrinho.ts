"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";
import {
  contarItensCarrinho,
  obterOuCriarCarrinho,
} from "@/lib/session-cart";

export type ResultadoCarrinho = {
  ok: boolean;
  contagem: number;
  msg?: string;
};

/** Adiciona um produto ao carrinho da sessão (respeitando estoque). */
export async function adicionarAoCarrinho(
  produtoId: number,
  quantidade = 1,
): Promise<ResultadoCarrinho> {
  const qtd = Number(quantidade);
  if (!Number.isInteger(qtd) || qtd < 1 || qtd > 99) {
    return { ok: false, contagem: 0, msg: "Quantidade inválida." };
  }

  const [produto] = await db
    .select({
      id: products.id,
      estoque: products.estoque,
      ativo: products.ativo,
    })
    .from(products)
    .where(eq(products.id, produtoId))
    .limit(1);

  if (!produto || !produto.ativo) {
    return { ok: false, contagem: 0, msg: "Produto indisponível." };
  }
  if (produto.estoque <= 0) {
    return { ok: false, contagem: 0, msg: "Produto esgotado." };
  }

  const carrinho = await obterOuCriarCarrinho();

  const [item] = await db
    .select({ quantidade: cartItems.quantidade })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, carrinho.id),
        eq(cartItems.productId, produtoId),
      ),
    )
    .limit(1);

  if (item && item.quantidade + qtd > produto.estoque) {
    return {
      ok: false,
      contagem: await contarItensCarrinho(),
      msg: "Estoque máximo atingido.",
    };
  }

  await db
    .insert(cartItems)
    .values({ cartId: carrinho.id, productId: produtoId, quantidade: qtd })
    .onDuplicateKeyUpdate({
      set: { quantidade: sql`${cartItems.quantidade} + ${qtd}` },
    });

  revalidatePath("/", "layout");
  return { ok: true, contagem: await contarItensCarrinho() };
}

/** Define a quantidade exata de um item do carrinho (valida estoque). */
export async function definirQuantidade(
  itemId: number,
  quantidade: number,
): Promise<ResultadoCarrinho> {
  const qtd = Number(quantidade);
  if (!Number.isInteger(qtd) || qtd < 1 || qtd > 99) {
    return { ok: false, contagem: 0, msg: "Quantidade inválida." };
  }

  const [item] = await db
    .select({
      id: cartItems.id,
      estoque: products.estoque,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.id, itemId))
    .limit(1);

  if (!item) {
    return { ok: false, contagem: 0, msg: "Item não encontrado." };
  }
  if (qtd > item.estoque) {
    return {
      ok: false,
      contagem: await contarItensCarrinho(),
      msg: `Estoque disponível: ${item.estoque}.`,
    };
  }

  await db
    .update(cartItems)
    .set({ quantidade: qtd })
    .where(eq(cartItems.id, itemId));

  revalidatePath("/", "layout");
  return { ok: true, contagem: await contarItensCarrinho() };
}

/** Remove um item do carrinho. */
export async function removerDoCarrinho(itemId: number) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  revalidatePath("/", "layout");
}

/** Limpa todo o carrinho da sessão. */
export async function limparCarrinho() {
  const sid = (await cookies()).get("davi_carrinho")?.value;
  if (!sid) return;
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sid))
    .limit(1);
  if (cart) await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  revalidatePath("/", "layout");
}

