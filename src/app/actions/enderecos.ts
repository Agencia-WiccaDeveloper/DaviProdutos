"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { addresses, favorites } from "@/db/schema";
import { lerSessao } from "@/lib/auth";

export type EstadoEndereco = { sucesso?: string; erro?: string };

const enderecoSchema = z.object({
  destinatario: z.string().trim().min(2, "Informe o destinatário.").max(150),
  cep: z.string().trim().min(8, "CEP inválido.").max(9),
  rua: z.string().trim().min(2, "Informe a rua.").max(200),
  numero: z.string().trim().min(1, "Número obrigatório.").max(20),
  complemento: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  bairro: z.string().trim().min(2, "Informe o bairro.").max(100),
  cidade: z.string().trim().min(2, "Informe a cidade.").max(100),
  estado: z.string().trim().length(2, "UF com 2 letras.").toUpperCase(),
  referencia: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

function extrair(formData: FormData) {
  return enderecoSchema.safeParse({
    destinatario: formData.get("destinatario"),
    cep: formData.get("cep"),
    rua: formData.get("rua"),
    numero: formData.get("numero"),
    complemento: formData.get("complemento") ?? undefined,
    bairro: formData.get("bairro"),
    cidade: formData.get("cidade"),
    estado: formData.get("estado"),
    referencia: formData.get("referencia") ?? undefined,
  });
}

/** Cria um novo endereço. */
export async function criarEndereco(
  _anterior: EstadoEndereco,
  formData: FormData,
): Promise<EstadoEndereco> {
  const sessao = await lerSessao();
  if (!sessao) return { erro: "Você precisa estar logado." };

  const dados = extrair(formData);
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  // Primeiro endereço vira principal automaticamente
  const [total] = await db
    .select({ n: addresses.id })
    .from(addresses)
    .where(eq(addresses.userId, sessao.uid))
    .limit(1);
  const principal = !total;

  await db.insert(addresses).values({
    userId: sessao.uid,
    ...dados.data,
    principal,
  });

  revalidatePath("/conta");
  return { sucesso: "Endereço adicionado!" };
}

/** Atualiza um endereço existente. */
export async function editarEndereco(
  _anterior: EstadoEndereco,
  formData: FormData,
): Promise<EstadoEndereco> {
  const sessao = await lerSessao();
  if (!sessao) return { erro: "Você precisa estar logado." };

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { erro: "Endereço inválido." };

  const dados = extrair(formData);
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db
    .update(addresses)
    .set(dados.data)
    .where(and(eq(addresses.id, id), eq(addresses.userId, sessao.uid)));

  revalidatePath("/conta");
  return { sucesso: "Endereço atualizado!" };
}

/** Remove um endereço (se não for o principal). */
export async function removerEndereco(formData: FormData) {
  const sessao = await lerSessao();
  if (!sessao) return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const [endereco] = await db
    .select({ principal: addresses.principal })
    .from(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, sessao.uid)))
    .limit(1);
  if (!endereco || endereco.principal) return;

  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, sessao.uid)));
  revalidatePath("/conta");
}

/** Define um endereço como principal. */
export async function definirPrincipal(formData: FormData) {
  const sessao = await lerSessao();
  if (!sessao) return;

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  await db
    .update(addresses)
    .set({ principal: false })
    .where(eq(addresses.userId, sessao.uid));
  await db
    .update(addresses)
    .set({ principal: true })
    .where(and(eq(addresses.id, id), eq(addresses.userId, sessao.uid)));

  revalidatePath("/conta");
}

/** Adiciona/remove um favorito no banco (usuário logado). */
export async function alternarFavoritoBanco(produtoId: number) {
  const sessao = await lerSessao();
  if (!sessao) return;

  const [existente] = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(
      and(eq(favorites.userId, sessao.uid), eq(favorites.productId, produtoId)),
    )
    .limit(1);

  if (existente) {
    await db.delete(favorites).where(eq(favorites.id, existente.id));
  } else {
    await db
      .insert(favorites)
      .values({ userId: sessao.uid, productId: produtoId });
  }
  revalidatePath("/conta");
}
