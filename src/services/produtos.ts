import { and, count, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  orderItems,
  productImages,
  products,
  reviews,
} from "@/db/schema";

export type ProdutoVitrine = {
  id: number;
  nome: string;
  slug: string;
  preco: string;
  precoPromocional: string | null;
  estoque: number;
  categoria: string;
  imagem: string | null;
  nota: number;
  totalAvaliacoes: number;
};

const camposBase = {
  id: products.id,
  nome: products.nome,
  slug: products.slug,
  preco: products.preco,
  precoPromocional: products.precoPromocional,
  estoque: products.estoque,
  categoria: categories.nome,
};

/** Busca imagem principal e avaliações aprovadas para um conjunto de produtos. */
export async function anexarDetalhes(
  rows: Omit<ProdutoVitrine, "imagem" | "nota" | "totalAvaliacoes">[],
): Promise<ProdutoVitrine[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const [imagens, notas] = await Promise.all([
    db
      .select({
        productId: productImages.productId,
        url: productImages.url,
      })
      .from(productImages)
      .where(
        and(
          inArray(productImages.productId, ids),
          eq(productImages.principal, true),
        ),
      ),
    db
      .select({
        productId: reviews.productId,
        media: sql<number>`avg(${reviews.nota})`,
        total: count(),
      })
      .from(reviews)
      .where(
        and(
          inArray(reviews.productId, ids),
          eq(reviews.status, "APPROVED"),
        ),
      )
      .groupBy(reviews.productId),
  ]);

  const mapaImagens = new Map(imagens.map((i) => [i.productId, i.url]));
  const mapaNotas = new Map(
    notas.map((n) => [n.productId, { media: Number(n.media), total: n.total }]),
  );

  return rows.map((r) => ({
    ...r,
    imagem: mapaImagens.get(r.id) ?? null,
    nota: Number(mapaNotas.get(r.id)?.media.toFixed(1) ?? 0),
    totalAvaliacoes: mapaNotas.get(r.id)?.total ?? 0,
  }));
}

/** Produtos marcados como destaque. */
export async function listarDestaques(limite = 10): Promise<ProdutoVitrine[]> {
  const rows = await db
    .select(camposBase)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.ativo, true), eq(products.destaque, true)))
    .orderBy(desc(products.updatedAt))
    .limit(limite);
  return anexarDetalhes(rows);
}

/** Produtos com preço promocional ativo. */
export async function listarOfertas(limite = 8): Promise<ProdutoVitrine[]> {
  const rows = await db
    .select(camposBase)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(eq(products.ativo, true), isNotNull(products.precoPromocional)),
    )
    .orderBy(desc(products.updatedAt))
    .limit(limite);
  return anexarDetalhes(rows);
}

/** Produtos mais vendidos (soma de quantidades em order_items). */
export async function listarMaisVendidos(limite = 8): Promise<ProdutoVitrine[]> {
  const rows = await db
    .select({
      ...camposBase,
      vendidos: sql<number>`coalesce(sum(${orderItems.quantidade}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.ativo, true))
    .groupBy(
      products.id,
      products.nome,
      products.slug,
      products.preco,
      products.precoPromocional,
      products.estoque,
      categories.nome,
    )
    .orderBy(desc(sql`coalesce(sum(${orderItems.quantidade}), 0)`))
    .limit(limite);
  return anexarDetalhes(rows);
}

/** Total de produtos ativos (para exibição no hero). */
export async function contarProdutosAtivos(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(products)
    .where(eq(products.ativo, true));
  return Number(row.total);
}
