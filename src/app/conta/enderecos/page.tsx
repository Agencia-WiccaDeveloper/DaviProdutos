import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { db } from "@/db";
import { asc, desc, eq } from "drizzle-orm";
import { addresses } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { definirPrincipal, removerEndereco } from "@/app/actions/enderecos";
import { FormEndereco } from "./form-endereco";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = { title: "Meus endereços" };

export default async function EnderecosPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");

  const lista = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, sessao.uid))
    .orderBy(desc(addresses.principal), asc(addresses.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
          Meus endereços
        </h2>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <MapPin className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">
            Você ainda não cadastrou nenhum endereço.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((end) => (
            <li
              key={end.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">
                    {end.destinatario}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {end.rua}, {end.numero}
                    {end.complemento ? ` — ${end.complemento}` : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {end.bairro}, {end.cidade}/{end.estado}
                  </p>
                  <p className="text-xs text-slate-400">CEP {end.cep}</p>
                </div>
                {end.principal ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                    <Star className="h-3 w-3 fill-brand-600 text-brand-600" aria-hidden />
                    Principal
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {!end.principal ? (
                  <form action={definirPrincipal}>
                    <input type="hidden" name="id" value={end.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
                    >
                      Tornar principal
                    </button>
                  </form>
                ) : null}
                <FormEndereco
                  modo="editar"
                  endereco={{
                    id: end.id,
                    destinatario: end.destinatario,
                    cep: end.cep,
                    rua: end.rua,
                    numero: end.numero,
                    complemento: end.complemento ?? "",
                    bairro: end.bairro,
                    cidade: end.cidade,
                    estado: end.estado,
                    referencia: end.referencia ?? "",
                  }}
                />
                {!end.principal ? (
                  <form action={removerEndereco}>
                    <input type="hidden" name="id" value={end.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50"
                    >
                      Remover
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2">
        <FormEndereco modo="criar" />
      </div>
    </div>
  );
}
