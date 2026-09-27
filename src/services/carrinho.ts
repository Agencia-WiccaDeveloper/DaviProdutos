import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, categories, productImages, products } from "@/db/schema";

export type ItemCarrinho = {
  itemId: number;
  productId: number;
  nome: string;
  slug: string;
  sku: string;
  preco: string;
  precoPromocional: string | null;
  quantidade: number;
  estoque: number;
  imagem: string | null;
};

const COOKIE_CARRINHO = "davi_carrinho";

/** Lê o carrinho da sessão com os produtos e imagens. */
export async function lerCarrinho(): Promise<ItemCarrinho[]> {
  const sid = (await cookies()).get(COOKIE_CARRINHO)?.value;
  if (!sid) return [];

  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.sessionId, sid))
    .limit(1);
  if (!cart) return [];

  const linhas = await db
    .select({
      itemId: cartItems.id,
      productId: products.id,
      nome: products.nome,
      slug: products.slug,
      sku: products.sku,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      quantidade: cartItems.quantidade,
      estoque: products.estoque,
      imagem: productImages.url,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.principal, true),
      ),
    )
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(cartItems.createdAt);

  return linhas as ItemCarrinho[];
}

export function precoUnitario(item: ItemCarrinho): number {
  return Number(item.precoPromocional ?? item.preco);
}

export function subtotalItem(item: ItemCarrinho): number {
  return precoUnitario(item) * item.quantidade;
}
