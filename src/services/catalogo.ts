import { and, asc, count, desc, eq, gt, gte, isNotNull, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { anexarDetalhes } from "@/services/produtos";

export type FiltrosCatalogo = {
  q?: string;
  categoria?: string;
  ordenar?: string;
  ofertas?: boolean;
  precoMin?: number;
  precoMax?: number;
  disponivel?: boolean;
  page?: number;
  perPage?: number;
};

export type ResultadoCatalogo = {
  produtos: Awaited<ReturnType<typeof anexarDetalhes>>;
  total: number;
  page: number;
  perPage: number;
  totalPaginas: number;
};


function orderPor(ordenar: string | undefined) {
  switch (ordenar) {
    case "menor-preco":
      return [asc(products.preco)];
    case "maior-preco":
      return [desc(products.preco)];
    case "novidades":
      return [desc(products.createdAt)];
    case "mais-vendidos":
      return [
        desc(
          sql`coalesce((select sum(oi.quantidade) from order_items oi where oi.product_id = ${products.id}), 0)`,
        ),
      ];
    case "melhor-avaliados":
      return [
        desc(
          sql`coalesce((select avg(r.nota) from reviews r where r.product_id = ${products.id} and r.status = 'APPROVED'), 0)`,
        ),
      ];
    default:
      return [desc(products.destaque), desc(products.updatedAt)];
  }
}

/** Busca produtos do catálogo com filtros, ordenação e paginação. */
export async function buscarProdutos(
  f: FiltrosCatalogo,
): Promise<ResultadoCatalogo> {
  const page = Math.max(1, f.page ?? 1);
  const perPage = Math.min(48, Math.max(1, f.perPage ?? 12));

  const conditions = [eq(products.ativo, true)];

  if (f.q) {
    const termo = `%${f.q}%`;
    const busca = or(
      like(products.nome, termo),
      like(products.sku, termo),
      like(categories.nome, termo),
    );
    if (busca) conditions.push(busca);
  }
  if (f.categoria) conditions.push(eq(categories.slug, f.categoria));
  if (f.ofertas) conditions.push(isNotNull(products.precoPromocional));
  if (f.precoMin !== undefined)
    conditions.push(gte(products.preco, String(f.precoMin)));
  if (f.precoMax !== undefined)
    conditions.push(lte(products.preco, String(f.precoMax)));
  if (f.disponivel) conditions.push(gt(products.estoque, 0));

  const where = and(...conditions);
  const order = orderPor(f.ordenar);

  const [rows, [totalRow]] = await Promise.all([
    db
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
      .where(where)
      .orderBy(...order)
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  const total = Number(totalRow.total);
  return {
    produtos: await anexarDetalhes(rows),
    total,
    page,
    perPage,
    totalPaginas: Math.max(1, Math.ceil(total / perPage)),
  };
}
