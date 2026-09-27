"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { criarCategoria, editarCategoria } from "@/app/actions/admin-categorias";
import { MensagemStatus } from "@/components/ui/mensagem-status";

type Props =
  | { modo?: "criar"; valor?: undefined }
  | { modo: "editar"; valor: { id: number; nome: string; descricao: string } };

export function FormCategoria(props: Props = { modo: "criar" }) {
  const modo = props.modo ?? "criar";
  const abertoInicial = modo === "criar";
  const [aberto, setAberto] = useState(abertoInicial);
  const acao = modo === "editar" ? editarCategoria : criarCategoria;
  const [estado, formAction, pending] = useActionState(acao, {});
  const valor = modo === "editar" ? props.valor : undefined;

  return (
    <>
      {modo === "editar" ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
        >
          <span className="flex items-center gap-1"><Pencil className="h-3.5 w-3.5" aria-hidden /> Editar</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> Nova categoria
        </button>
      )}

      {aberto ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-brand-900">
                {modo === "editar" ? "Editar categoria" : "Nova categoria"}
              </h3>
              <button onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={formAction} className="space-y-3">
              <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
              {modo === "editar" && valor ? <input type="hidden" name="id" value={valor.id} /> : null}
              <div>
                <label htmlFor="nome" className="mb-1 block text-xs font-semibold text-slate-700">Nome</label>
                <input id="nome" name="nome" defaultValue={valor?.nome} required className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label htmlFor="descricao" className="mb-1 block text-xs font-semibold text-slate-700">Descrição (opcional)</label>
                <textarea id="descricao" name="descricao" defaultValue={valor?.descricao} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
              </div>
              <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {pending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Salvando…</> : "Salvar"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

