import { count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";

export type AdminProduto = {
  id: number;
  nome: string;
  slug: string;
  sku: string;
  preco: string;
  precoPromocional: string | null;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  destaque: boolean;
  categoria: string;
};

/** Lista produtos (admin) com busca por nome/SKU e filtro por categoria. */
export async function listarAdminProdutos(params: {
  q?: string;
  categoria?: string;
  ativo?: string;
}): Promise<AdminProduto[]> {
  const condicoes = [];
  if (params.q) {
    const t = `%${params.q}%`;
    condicoes.push(or(like(products.nome, t), like(products.sku, t)));
  }
  if (params.categoria) condicoes.push(eq(categories.slug, params.categoria));
  if (params.ativo === "1") condicoes.push(eq(products.ativo, true));
  if (params.ativo === "0") condicoes.push(eq(products.ativo, false));

  const rows = await db
    .select({
      id: products.id,
      nome: products.nome,
      slug: products.slug,
      sku: products.sku,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      estoque: products.estoque,
      estoqueMinimo: products.estoqueMinimo,
      ativo: products.ativo,
      destaque: products.destaque,
      categoria: categories.nome,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(condicoes.length ? sql`${sql.join(condicoes, sql` and `)}` : undefined)
    .orderBy(desc(products.updatedAt))
    .limit(200);

  return rows;
}

/** Total de produtos por status de estoque (para o módulo de estoque). */
export async function resumoEstoque() {
  const [sem, baixo, ok] = await Promise.all([
    db.select({ n: count() }).from(products).where(sql`${products.estoque} <= 0`),
    db
      .select({ n: count() })
      .from(products)
      .where(sql`${products.estoque} > 0 and ${products.estoque} <= ${products.estoqueMinimo}`),
    db
      .select({ n: count() })
      .from(products)
      .where(sql`${products.estoque} > ${products.estoqueMinimo}`),
  ]);
  return { sem: Number(sem[0].n), baixo: Number(baixo[0].n), ok: Number(ok[0].n) };
}

/** Produto com imagens para edição. */
export async function buscarAdminProduto(id: number) {
  const [produto] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!produto) return null;

  const imagens = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(productImages.ordem);

  return { produto, imagens };
}

/** Todas as categorias para selects. */
export async function listarTodasCategorias() {
  return db.select().from(categories).orderBy(categories.nome);
}

export type ProdutoDados = {
  nome: string;
  slug: string;
  sku: string;
  categoryId: number;
  preco: string;
  precoPromocional: string | null;
  custo: string | null;
  estoque: number;
  estoqueMinimo: number;
  descricao: string | null;
  descricaoCurta: string | null;
  peso: string | null;
  altura: string | null;
  largura: string | null;
  comprimento: string | null;
  ativo: boolean;
  destaque: boolean;
  imagens: { url: string; alt: string | null }[];
};
