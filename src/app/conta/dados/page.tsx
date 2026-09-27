import type { Metadata } from "next";
import Image from "next/image";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { users } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { atualizarPerfil } from "@/app/actions/perfil";
import { FormDados } from "./form-dados";

export const metadata: Metadata = { title: "Dados pessoais" };

export default async function DadosPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");
  const [usuario] = await db
    .select({
      nome: users.nome,
      email: users.email,
      telefone: users.telefone,
      cpf: users.cpf,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
        Dados pessoais
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Mantenha suas informações de contato atualizadas.
      </p>

      {/* Avatar */}
      <div className="mt-5 flex items-center gap-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-100">
          {usuario.avatar ? (
            <Image
              src={usuario.avatar}
              alt="Foto de perfil"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-brand-700">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{usuario.nome}</p>
          <p className="text-xs text-slate-400">
            {usuario.avatar ? "Foto de perfil atual" : "Sem foto — use a inicial"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
        E-mail de login: <strong className="text-slate-700">{usuario.email}</strong>{" "}
        <span className="text-xs">(não pode ser alterado)</span>
      </div>

      <FormDados
        acao={atualizarPerfil}
        nome={usuario.nome}
        telefone={usuario.telefone ?? ""}
        cpf={usuario.cpf ?? ""}
        avatar={usuario.avatar ?? ""}
      />
    </section>
  );
}
