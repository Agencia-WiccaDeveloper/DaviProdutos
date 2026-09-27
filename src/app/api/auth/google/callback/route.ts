import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { criarSessao } from "@/lib/auth";

type GoogleToken = { access_token?: string; error?: string };
type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

/** Base do site, derivada de ambiente. */
function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Callback do OAuth Google: troca o código, cria/atualiza o usuário e loga. */
export async function GET(req: NextRequest) {
  const base = siteBase();
  const code = req.nextUrl.searchParams.get("code");

  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${base}/entrar`);
  }

  // 1. Troca o código pelo token de acesso
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${base}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const token = (await tokenRes.json()) as GoogleToken;
  if (!token.access_token) {
    return NextResponse.redirect(`${base}/entrar`);
  }

  // 2. Busca os dados do perfil
  const perfilRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${token.access_token}` } },
  );
  const perfil = (await perfilRes.json()) as GoogleUserInfo;

  if (!perfil.email || perfil.email_verified === false) {
    return NextResponse.redirect(`${base}/entrar`);
  }
  const email = perfil.email.toLowerCase();

  // 3. Cria ou reutiliza o usuário (sem senha — entra pelo Google)
  const [existente] = await db
    .select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      role: users.role,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let usuario = existente;
  if (!usuario) {
    const [novo] = await db
      .insert(users)
      .values({
        nome: perfil.name ?? "Cliente DAVI",
        email,
        avatar: perfil.picture ?? null,
        role: "CUSTOMER",
      })
      .$returningId();
    usuario = {
      id: novo.id,
      nome: perfil.name ?? "Cliente DAVI",
      email,
      role: "CUSTOMER",
      avatar: perfil.picture ?? null,
    };
  } else {
    // Usuário já existe: sincroniza foto e nome do Google (mantém role)
    await db
      .update(users)
      .set({
        avatar: perfil.picture ?? usuario.avatar ?? null,
        nome: perfil.name ?? usuario.nome,
      })
      .where(eq(users.id, usuario.id));
    usuario = { ...usuario, nome: perfil.name ?? usuario.nome };
  }

  // 4. Sessão e retorno
  await criarSessao({
    uid: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  });
  return NextResponse.redirect(base);
}
