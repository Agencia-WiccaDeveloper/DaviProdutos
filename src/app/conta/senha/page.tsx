import type { Metadata } from "next";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { alterarSenha } from "@/app/actions/perfil";
import { FormSenha } from "./form-senha";

export const metadata: Metadata = { title: "Alterar senha" };

export default async function SenhaPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");
  const [usuario] = await db
    .select({ senhaHash: users.senhaHash })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);
  const temSenha = !!usuario?.senhaHash;

  return (
    <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
        Alterar senha
      </h2>
      {!temSenha ? (
        <p className="mt-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
          Sua conta foi criada com o Google e ainda não tem senha. Defina uma
          senha abaixo para poder entrar com e-mail também.
        </p>
      ) : null}
      <FormSenha acao={alterarSenha} exigeAtual={temSenha} />
    </section>
  );
}
