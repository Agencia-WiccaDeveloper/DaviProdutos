import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const CHAVE_SEGREDO = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "davi-produtos-segredo-local-troque-em-producao",
);

const COOKIE_SESSAO = "davi_sessao";
const DIAS_30 = 60 * 60 * 24 * 30;

export type Sessao = {
  uid: number;
  nome: string;
  email: string;
  role: string;
};

/** Cria o cookie de sessão assinado (JWT HS256, httpOnly). */
export async function criarSessao(sessao: Sessao) {
  const token = await new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(CHAVE_SEGREDO);

  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_30,
  });
}

/** Lê a sessão atual (null se não logado ou token inválido/expirado). */
export async function lerSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, CHAVE_SEGREDO);
    return payload as unknown as Sessao;
  } catch {
    return null;
  }
}

export const ROLES_ADMIN = ["ADMIN", "STAFF", "SUPER_ADMIN"] as const;

/** Retorna a sessão se for admin/staff; caso contrário null (autorização). */
export async function requireAdmin(): Promise<Sessao | null> {
  const sessao = await lerSessao();
  if (!sessao) return null;
  if (!ROLES_ADMIN.includes(sessao.role as (typeof ROLES_ADMIN)[number])) {
    return null;
  }
  return sessao;
}

/** Remove o cookie de sessão. */
export async function destruirSessao() {
  (await cookies()).delete(COOKIE_SESSAO);
}

export function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}

export function conferirSenha(senha: string, hash: string | null) {
  if (!hash) return false;
  return bcrypt.compare(senha, hash);
}
