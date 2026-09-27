"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export type EstadoAdmin = { sucesso?: string; erro?: string };

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const produtoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome.").max(200),
  sku: z.string().trim().min(2, "Informe o SKU.").max(40),
  categoryId: z.coerce.number().int().positive("Selecione a categoria."),
  preco: z.coerce.number().min(0).max(999999),
  estoque: z.coerce.number().int().min(0),
  estoqueMinimo: z.coerce.number().int().min(0),
});

type Valores = {
  nome: string;
  sku: string;
  categoryId: number;
  preco: number;
  precoPromocional: string | null;
  custo: string | null;
  estoque: number;
  estoqueMinimo: number;
  descricao: string | null;
  descricaoCurta: string | null;
  peso: string | null;
  ativo: boolean;
  destaque: boolean;
  imagens: { url: string; alt: string }[];
};

function extrair(formData: FormData): Valores | { erro: string } {
  const parsed = produtoSchema.safeParse({
    nome: formData.get("nome"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    preco: formData.get("preco"),
    estoque: formData.get("estoque"),
    estoqueMinimo: formData.get("estoqueMinimo"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const opt = (key: string, alt = "") => {
    const v = String(formData.get(key) ?? alt).trim();
    return v ? v : null;
  };
  const optNum = (key: string, scale = 2) => {
    const v = opt(key);
    return v && Number(v) >= 0 ? Number(v).toFixed(scale) : null;
  };
  const checado = (key: string) => formData.get(key) === "1";

  const imagens = String(formData.get("imagens") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((url, i) => ({ url, alt: `imagem-${i + 1}` }));

  return {
    nome: parsed.data.nome,
    sku: parsed.data.sku.toUpperCase(),
    categoryId: parsed.data.categoryId,
    preco: parsed.data.preco,
    precoPromocional: optNum("precoPromocional"),
    custo: optNum("custo"),
    estoque: parsed.data.estoque,
    estoqueMinimo: parsed.data.estoqueMinimo,
    descricao: opt("descricao"),
    descricaoCurta: opt("descricaoCurta"),
    peso: opt("peso"),
    ativo: checado("ativo"),
    destaque: checado("destaque"),
    imagens,
  };
}

async function gravarImagens(
  produtoId: number,
  imagens: { url: string; alt: string }[],
) {
  await db.delete(productImages).where(eq(productImages.productId, produtoId));
  if (imagens.length > 0) {
    await db.insert(productImages).values(
      imagens.map((img, i) => ({
        productId: produtoId,
        url: img.url,
        alt: img.alt,
        ordem: i,
        principal: i === 0,
      })),
    );
  }
}

/** Cria um produto. */
export async function criarProduto(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const dados = extrair(formData);
  if ("erro" in dados) return { erro: dados.erro };

  try {
    const [novo] = await db
      .insert(products)
      .values({
        nome: dados.nome,
        slug: slugify(dados.nome),
        sku: dados.sku,
        categoryId: dados.categoryId,
        preco: dados.preco.toFixed(2),
        precoPromocional: dados.precoPromocional,
        custo: dados.custo,
        estoque: dados.estoque,
        estoqueMinimo: dados.estoqueMinimo,
        descricao: dados.descricao,
        descricaoCurta: dados.descricaoCurta,
        peso: dados.peso,
        ativo: dados.ativo,
        destaque: dados.destaque,
      })
      .$returningId();

    await gravarImagens(novo.id, dados.imagens);
    revalidatePath("/admin/produtos");
    return { sucesso: "Produto criado!" };
  } catch {
    return { erro: "SKU já existe ou dados inválidos." };
  }
}

/** Atualiza um produto. */
export async function editarProduto(
  _anterior: EstadoAdmin,
  formData: FormData,
): Promise<EstadoAdmin> {
  if (!(await requireAdmin())) return { erro: "Acesso negado." };
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { erro: "Produto inválido." };

  const dados = extrair(formData);
  if ("erro" in dados) return { erro: dados.erro };

  try {
    await db
      .update(products)
      .set({
        nome: dados.nome,
        slug: slugify(dados.nome),
        sku: dados.sku,
        categoryId: dados.categoryId,
        preco: dados.preco.toFixed(2),
        precoPromocional: dados.precoPromocional,
        custo: dados.custo,
        estoque: dados.estoque,
        estoqueMinimo: dados.estoqueMinimo,
        descricao: dados.descricao,
        descricaoCurta: dados.descricaoCurta,
        peso: dados.peso,
        ativo: dados.ativo,
        destaque: dados.destaque,
      })
      .where(eq(products.id, id));

    await gravarImagens(id, dados.imagens);
    revalidatePath("/admin/produtos");
    return { sucesso: "Produto atualizado!" };
  } catch {
    return { erro: "SKU já existe ou dados inválidos." };
  }
}

/** Alterna ativo/destaque de um produto. */
export async function alternarProduto(
  produtoId: number,
  campo: "ativo" | "destaque",
) {
  if (!(await requireAdmin())) return;
  const [p] = await db
    .select()
    .from(products)
    .where(eq(products.id, produtoId))
    .limit(1);
  if (!p) return;

  await db
    .update(products)
    .set(campo === "ativo" ? { ativo: !p.ativo } : { destaque: !p.destaque })
    .where(eq(products.id, produtoId));
  revalidatePath("/admin/produtos");
}
