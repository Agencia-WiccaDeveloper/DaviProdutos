"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { criarCupom } from "@/app/actions/admin-pedidos";
import { MensagemStatus } from "@/components/ui/mensagem-status";

export function FormCupom() {
  const [aberto, setAberto] = useState(false);
  const [estado, formAction, pending] = useActionState(criarCupom, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" aria-hidden /> Novo cupom
      </button>

      {aberto ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-brand-900">Novo cupom</h3>
              <button onClick={() => setAberto(false)} aria-label="Fechar" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={formAction} className="space-y-3">
              <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
              <div>
                <label htmlFor="codigo" className="mb-1 block text-xs font-semibold text-slate-700">Código</label>
                <input id="codigo" name="codigo" required placeholder="DAVI10" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm uppercase outline-none focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tipo" className="mb-1 block text-xs font-semibold text-slate-700">Tipo</label>
                  <select id="tipo" name="tipo" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500">
                    <option value="PERCENTUAL">Percentual</option>
                    <option value="VALOR_FIXO">Valor fixo</option>
                    <option value="FRETE_GRATIS">Frete grátis</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="valor" className="mb-1 block text-xs font-semibold text-slate-700">Valor</label>
                  <input id="valor" name="valor" type="number" step="0.01" defaultValue="10" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="validade" className="mb-1 block text-xs font-semibold text-slate-700">Validade</label>
                  <input id="validade" name="validade" type="datetime-local" required className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label htmlFor="limite" className="mb-1 block text-xs font-semibold text-slate-700">Limite de uso</label>
                  <input id="limite" name="limite" type="number" placeholder="Ilimitado" className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-brand-500" />
                </div>
              </div>
              <button type="submit" disabled={pending} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Criar cupom
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
