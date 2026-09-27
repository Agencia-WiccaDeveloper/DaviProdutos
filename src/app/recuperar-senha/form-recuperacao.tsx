"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { solicitarRecuperacao } from "@/app/actions/recuperacao";
import { MensagemStatus } from "@/components/ui/mensagem-status";

export function FormRecuperacao() {
  const [estado, formAction, pending] = useActionState(
    solicitarRecuperacao,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />

      {/* Em dev, exibe o link de redefinição (sem provedor de e-mail) */}
      {estado.link ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="mb-1 text-xs font-bold text-brand-800">
            Ambiente de desenvolvimento — link de redefinição:
          </p>
          <a
            href={estado.link}
            className="break-all text-xs font-semibold text-brand-700 underline"
          >
            {estado.link}
          </a>
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">
          E-mail cadastrado
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="voce@email.com"
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          "Enviar link de recuperação"
        )}
      </button>
    </form>
  );
}
