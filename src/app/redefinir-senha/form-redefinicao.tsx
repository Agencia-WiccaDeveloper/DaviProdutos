"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { redefinirSenha } from "@/app/actions/recuperacao";
import { MensagemStatus } from "@/components/ui/mensagem-status";

export function FormRedefinicao({ token }: { token: string }) {
  const [estado, formAction, pending] = useActionState(redefinirSenha, {});

  return (
    <form action={formAction} className="space-y-3">
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="senha" className="mb-1 block text-xs font-semibold text-slate-700">
          Nova senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {estado.sucesso ? (
        <Link
          href="/entrar"
          className="flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white transition-all hover:bg-brand-700"
        >
          Ir para o login
        </Link>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Salvando…
            </>
          ) : (
            "Redefinir senha"
          )}
        </button>
      )}
    </form>
  );
}
