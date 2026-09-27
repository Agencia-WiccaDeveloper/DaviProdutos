import { NextRequest, NextResponse } from "next/server";
import { and, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

/** GET /api/busca?q=termo — sugestões para o autocomplete do header. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ produtos: [] });
  }

  const termo = `%${q}%`;
  const rows = await db
    .select({
      id: products.id,
      nome: products.nome,
      slug: products.slug,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      estoque: products.estoque,
      categoria: categories.nome,
      imagem: sql<string | null>`(
        select pi.url from product_images pi
        where pi.product_id = ${products.id} and pi.principal = true
        limit 1
      )`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.ativo, true),
        or(
          like(products.nome, termo),
          like(products.sku, termo),
          like(categories.nome, termo),
        ),
      ),
    )
    .limit(5);

  return NextResponse.json({ produtos: rows });
}
