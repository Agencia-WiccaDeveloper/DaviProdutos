import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { lerSessao, ROLES_ADMIN } from "@/lib/auth";
import { redirect } from "next/navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DAVI PRODUTOS — Lavagem e Estética Automotiva",
    template: "%s | DAVI PRODUTOS",
  },
  description:
    "Produtos profissionais para lavagem, limpeza e estética automotiva. Shampoos, ceras, descontaminantes, microfibras, acessórios e kits.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4488",
};

/**
 * Verifica se deve mostrar a tela de "Em breve"
 * Só em produção (VERCEL_ENV === 'production') e para não-admins
 */
async function deveMostrarEmBreve(): Promise<boolean> {
  // Em desenvolvimento local, nunca mostra
  if (process.env.NODE_ENV === "development") {
    return false;
  }
  // Em produção Vercel, verifica se é produção (não preview)
  if (process.env.VERCEL_ENV === "production") {
    const sessao = await lerSessao();
    if (!sessao) return true; // Não logado = mostra
    const ehAdmin = ROLES_ADMIN.includes(sessao.role as (typeof ROLES_ADMIN)[number]);
    return !ehAdmin; // Não admin = mostra
  }
  // Preview deployments ou outros ambientes não mostram
  return false;
}

/**
 * Componente que renderiza a tela de "Em breve"
 * É uma página completa (com html/body) para substituir o layout normal
 */
async function EmBreveShell() {
  // Redireciona para a página /em-breve que tem o formulário de login
  redirect("/em-breve");
  // Never reached, but TypeScript needs a return
  return null;
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const mostrarEmBreve = await deveMostrarEmBreve();

  if (mostrarEmBreve) {
    // Renderiza apenas a tela de "Em breve" (que faz redirect interno)
    return <EmBreveShell />;
  }

  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlow.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}