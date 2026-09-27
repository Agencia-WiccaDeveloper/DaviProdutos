"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import type { EstadoAdmin } from "@/app/actions/admin-produtos";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Alterna ativo de uma categoria. */
export async function alternarCategoria(categoriaId: number) {
  if (!(await requireAdmin())) return;
  const [c] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoriaId))
    .limit(1);
  if (!c) return;
  await db
    .update(categories)
    .set({ ativo: !c.ativo })
    .where(eq(categories.id, categoriaId));
  revalidatePath("/admin/categorias");
}

/** Cria uma categoria. */
export async function criarCategoria(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da categoria." };

  try {
    await db.insert(categories).values({
      nome,
      slug: slugify(nome),
      descricao: descricao || null,
    });
    revalidatePath("/admin/categorias");
    return { sucesso: "Categoria criada!" };
  } catch {
    return { erro: "Já existe uma categoria com esse nome." };
  }
}

/** Atualiza uma categoria. */
export async function editarCategoria(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const id = Number(formData.get("id"));
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da categoria." };

  try {
    await db
      .update(categories)
      .set({ nome, slug: slugify(nome), descricao: descricao || null })
      .where(eq(categories.id, id));
    revalidatePath("/admin/categorias");
    return { sucesso: "Categoria atualizada!" };
  } catch {
    return { erro: "Já existe uma categoria com esse nome." };
  }
}
