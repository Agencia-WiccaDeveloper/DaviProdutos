import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export type CategoriaResumo = {
  id: number;
  nome: string;
  slug: string;
};

/** Lista categorias ativas ordenadas por nome (para navegação/filtros). */
export async function listarCategorias(): Promise<CategoriaResumo[]> {
  return db
    .select({
      id: categories.id,
      nome: categories.nome,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.ativo, true))
    .orderBy(asc(categories.nome));
}
