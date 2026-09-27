import { and, asc, avg, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  productImages,
  products,
  reviews,
  users,
} from "@/db/schema";
import { anexarDetalhes } from "@/services/produtos";

export type AvaliacaoItem = {
  id: number;
  nota: number;
  comentario: string | null;
  criadoEm: Date;
  usuario: string;
};

export type ProdutoDetalhado = {
  produto: {
    id: number;
    nome: string;
    slug: string;
    descricao: string | null;
    descricaoCurta: string | null;
    sku: string;
    preco: string;
    precoPromocional: string | null;
    estoque: number;
    peso: string | null;
    altura: string | null;
    largura: string | null;
    comprimento: string | null;
    categoria: string;
    categoriaSlug: string;
  };
  imagens: { id: number; url: string; alt: string | null }[];
  nota: number;
  totalAvaliacoes: number;
  avaliacoes: AvaliacaoItem[];
};

/** Produto completo por slug: imagens, avaliações e notas agregadas. */
export async function buscarProdutoPorSlug(
  slug: string,
): Promise<ProdutoDetalhado | null> {
  const [row] = await db
    .select({
      id: products.id,
      nome: products.nome,
      slug: products.slug,
      descricao: products.descricao,
      descricaoCurta: products.descricaoCurta,
      sku: products.sku,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      estoque: products.estoque,
      peso: products.peso,
      altura: products.altura,
      largura: products.largura,
      comprimento: products.comprimento,
      categoria: categories.nome,
      categoriaSlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.ativo, true)))
    .limit(1);

  if (!row) return null;

  const [imagens, [notaRow], avaliacoesRows] = await Promise.all([
    db
      .select({
        id: productImages.id,
        url: productImages.url,
        alt: productImages.alt,
      })
      .from(productImages)
      .where(eq(productImages.productId, row.id))
      .orderBy(asc(productImages.ordem), asc(productImages.id)),
    db
      .select({ media: avg(reviews.nota), total: count() })
      .from(reviews)
      .where(and(eq(reviews.productId, row.id), eq(reviews.status, "APPROVED"))),
    db
      .select({
        id: reviews.id,
        nota: reviews.nota,
        comentario: reviews.comentario,
        criadoEm: reviews.createdAt,
        usuario: users.nome,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(and(eq(reviews.productId, row.id), eq(reviews.status, "APPROVED")))
      .orderBy(desc(reviews.createdAt))
      .limit(30),
  ]);

  return {
    produto: row,
    imagens,
    nota: Number(notaRow.media ?? 0) || 0,
    totalAvaliacoes: Number(notaRow.total),
    avaliacoes: avaliacoesRows,
  };
}

/** Produtos da mesma categoria (excluindo o atual). */
export async function listarRelacionados(
  categoriaSlug: string,
  excluirId: number,
  limite = 8,
) {
  const rows = await db
    .select({
      id: products.id,
      nome: products.nome,
      slug: products.slug,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      estoque: products.estoque,
      categoria: categories.nome,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.ativo, true),
        eq(categories.slug, categoriaSlug),
        ne(products.id, excluirId),
      ),
    )
    .orderBy(desc(products.destaque))
    .limit(limite);
  return anexarDetalhes(rows);
}
