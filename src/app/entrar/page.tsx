import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { lerSessao } from "@/lib/auth";
import { BotaoGoogle, FormulariosAuth } from "./formularios-auth";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage() {
  const sessao = await lerSessao();
  if (sessao) redirect("/conta");

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <p className="mt-3 text-sm text-slate-500">
            Acesse sua conta para acompanhar pedidos, favoritos e cupons.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <FormulariosAuth />

          {/* Aviso Google não configurado */}
          {!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
              Para ativar o login com Google, preencha GOOGLE_CLIENT_ID e
              GOOGLE_CLIENT_SECRET no arquivo .env.local.
            </p>
          ) : null}

          {/* Divisor */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              ou
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <BotaoGoogle />

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
            Seus dados são protegidos. Senhas salvas com criptografia.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Ao continuar você concorda com os{" "}
          <Link href="#" className="underline hover:text-brand-700">
            Termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="#" className="underline hover:text-brand-700">
            Política de privacidade
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
