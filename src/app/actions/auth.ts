"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  conferirSenha,
  criarSessao,
  destruirSessao,
  hashSenha,
} from "@/lib/auth";

export type EstadoAuth = { erro?: string };

const registroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(150),
  email: z.string().trim().email("E-mail inválido.").max(180),
  telefone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres.").max(72),
});

/** Cria a conta e já inicia a sessão. */
export async function registrar(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const dados = registroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") ?? undefined,
    senha: formData.get("senha"),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { nome, email, telefone, senha } = dados.data;
  const emailNormalizado = email.toLowerCase();

  const [existente] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, emailNormalizado))
    .limit(1);

  if (existente) {
    return { erro: "Este e-mail já está cadastrado. Faça login." };
  }

  const senhaHash = await hashSenha(senha);
  const [novo] = await db
    .insert(users)
    .values({ nome, email: emailNormalizado, telefone, senhaHash })
    .$returningId();

  await criarSessao({
    uid: novo.id,
    nome,
    email: emailNormalizado,
    role: "CUSTOMER",
  });

  redirect("/");
}

/** Autentica com e-mail e senha. */
export async function entrar(
  _anterior: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const [usuario] = await db
    .select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      senhaHash: users.senhaHash,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!usuario || !(await conferirSenha(senha, usuario.senhaHash))) {
    return { erro: "E-mail ou senha incorretos." };
  }
  if (usuario.status !== "ACTIVE") {
    return { erro: "Sua conta está desativada. Fale com o suporte." };
  }

  await criarSessao({
    uid: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  });

  redirect("/");
}

/** Encerra a sessão. */
export async function sair() {
  await destruirSessao();
  redirect("/");
}
