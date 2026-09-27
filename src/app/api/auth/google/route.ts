import { NextRequest, NextResponse } from "next/server";

/** Base do site, derivada de ambiente (localhost em dev, domínio em produção). */
function siteBase() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Redireciona o usuário para a tela de consentimento do Google. */
export async function GET(_req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    const url = new URL(siteBase());
    url.pathname = "/entrar";
    url.searchParams.set("google", "nao-configurado");
    return NextResponse.redirect(url);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${siteBase()}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}

