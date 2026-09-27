"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { conferirSenha, hashSenha, lerSessao } from "@/lib/auth";

export type EstadoPerfil = { sucesso?: string; erro?: string };

const perfilSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(150),
  telefone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  cpf: z
    .string()
    .trim()
    .max(14)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  avatar: z
    .string()
    .trim()
    .max(600000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine(
      (v) =>
        !v || /^(data:image\/(jpeg|png|webp);base64,|https?:\/\/)/i.test(v),
      "Imagem inválida.",
    ),
});

/** Atualiza nome, telefone, CPF e avatar do usuário logado. */
export async function atualizarPerfil(
  _anterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const sessao = await lerSessao();
  if (!sessao) return { erro: "Você precisa estar logado." };

  const dados = perfilSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone") ?? undefined,
    cpf: formData.get("cpf") ?? undefined,
    avatar: formData.get("avatar") ?? undefined,
  });
  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db
    .update(users)
    .set(dados.data)
    .where(eq(users.id, sessao.uid));

  revalidatePath("/conta");
  revalidatePath("/", "layout");
  return { sucesso: "Dados atualizados com sucesso!" };
}

/** Altera a senha do usuário logado (verifica a atual). */
export async function alterarSenha(
  _anterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const sessao = await lerSessao();
  if (!sessao) return { erro: "Você precisa estar logado." };

  const atual = String(formData.get("senhaAtual") ?? "");
  const nova = String(formData.get("senhaNova") ?? "");
  const confirmacao = String(formData.get("senhaConfirmacao") ?? "");

  if (nova.length < 8) return { erro: "Nova senha deve ter no mínimo 8 caracteres." };
  if (nova !== confirmacao) return { erro: "As senhas não coincidem." };

  const [usuario] = await db
    .select({ senhaHash: users.senhaHash })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);

  if (!usuario) return { erro: "Usuário não encontrado." };

  // Se o usuário não tem senha (login via Google) e digita "atual" vazio, permite definir
  if (usuario.senhaHash) {
    if (!(await conferirSenha(atual, usuario.senhaHash))) {
      return { erro: "Senha atual incorreta." };
    }
  }

  await db
    .update(users)
    .set({ senhaHash: await hashSenha(nova) })
    .where(eq(users.id, sessao.uid));

  return { sucesso: "Senha alterada com sucesso!" };
}
