"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { MensagemStatus } from "@/components/ui/mensagem-status";

type Props = {
  acao: (
    anterior: { sucesso?: string; erro?: string },
    formData: FormData,
  ) => Promise<{ sucesso?: string; erro?: string }>;
  exigeAtual: boolean;
};

export function FormSenha({ acao, exigeAtual }: Props) {
  const [estado, formAction, pending] = useActionState(acao, {});

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />

      {exigeAtual ? (
        <div>
          <label htmlFor="senhaAtual" className="mb-1 block text-xs font-semibold text-slate-700">
            Senha atual
          </label>
          <input
            id="senhaAtual"
            name="senhaAtual"
            type="password"
            required
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="senhaNova" className="mb-1 block text-xs font-semibold text-slate-700">
          Nova senha
        </label>
        <input
          id="senhaNova"
          name="senhaNova"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label htmlFor="senhaConfirmacao" className="mb-1 block text-xs font-semibold text-slate-700">
          Confirmar nova senha
        </label>
        <input
          id="senhaConfirmacao"
          name="senhaConfirmacao"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Alterando…
          </>
        ) : (
          "Alterar senha"
        )}
      </button>
    </form>
  );
}
