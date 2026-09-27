"use server";

import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { hashSenha } from "@/lib/auth";

export type EstadoRecuperacao = {
  sucesso?: string;
  erro?: string;
  link?: string;
};

/** Gera token de recuperação e (em dev) devolve o link de redefinição. */
export async function solicitarRecuperacao(
  _anterior: EstadoRecuperacao,
  formData: FormData,
): Promise<EstadoRecuperacao> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { erro: "Informe seu e-mail." };

  const [usuario] = await db
    .select({ id: users.id, nome: users.nome })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Não revela se o e-mail existe (evita enumeração)
  if (!usuario) {
    return {
      sucesso:
        "Se o e-mail existir, enviaremos um link de redefinição de senha.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await db.insert(passwordResets).values({
    userId: usuario.id,
    token,
    expiraEm,
  });

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const link = `${base}/redefinir-senha?token=${token}`;

  // Em produção você integraria um provedor de e-mail (SMTP/SendGrid).
  return {
    sucesso: "Link de redefinição gerado com sucesso.",
    link,
  };
}

/** Aplica a nova senha com o token válido. */
export async function redefinirSenha(
  _anterior: EstadoRecuperacao,
  formData: FormData,
): Promise<EstadoRecuperacao> {
  const token = String(formData.get("token") ?? "");
  const senha = String(formData.get("senha") ?? "");

  if (senha.length < 8) {
    return { erro: "A senha deve ter no mínimo 8 caracteres." };
  }
  if (!token) return { erro: "Token inválido." };

  const agora = new Date();
  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.token, token),
        isNull(passwordResets.usadoEm),
        gt(passwordResets.expiraEm, agora),
      ),
    )
    .limit(1);

  if (!reset) return { erro: "Link inválido ou expirado." };

  const novoHash = await hashSenha(senha);
  await db
    .update(users)
    .set({ senhaHash: novoHash })
    .where(eq(users.id, reset.userId));
  await db
    .update(passwordResets)
    .set({ usadoEm: agora })
    .where(eq(passwordResets.id, reset.id));

  return { sucesso: "Senha alterada com sucesso! Faça login." };
}
