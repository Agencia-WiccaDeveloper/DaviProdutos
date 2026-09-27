import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { lerSessao, ROLES_ADMIN } from "@/lib/auth";

/**
 * Middleware para tela de "Em breve" em produção
 * Bloqueia acesso ao site para não-admins, exceto rotas livres
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rotas que NUNCA são bloqueadas
  const rotasLivres = ["/em-breve", "/api/auth/login", "/api/auth/google", "/api/webhooks"];
  if (rotasLivres.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Em desenvolvimento local, nunca bloqueia
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Em produção Vercel, só bloqueia em production (não preview)
  if (process.env.VERCEL_ENV === "production") {
    const sessao = await lerSessao();
    if (!sessao) {
      // Não logado -> redireciona para /em-breve
      const url = request.nextUrl.clone();
      url.pathname = "/em-breve";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const ehAdmin = ROLES_ADMIN.includes(sessao.role as (typeof ROLES_ADMIN)[number]);
    if (!ehAdmin) {
      // Logado mas não admin -> redireciona para /em-breve
      const url = request.nextUrl.clone();
      url.pathname = "/em-breve";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Admin ou preview -> permite acesso
  return NextResponse.next();
}

export const config = {
  // Aplica a todas as rotas exceto arquivos estáticos e _next
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};