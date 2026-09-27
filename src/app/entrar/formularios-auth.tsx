"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Campo({
  id,
  label,
  tipo = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  tipo?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [ver, setVer] = useState(false);
  const isSenha = tipo === "password";

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={isSenha && ver ? "text" : tipo}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {isSenha ? (
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
          >
            {ver ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BotaoSubmit({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Processando…
        </>
      ) : (
        label
      )}
    </button>
  );
}

function ErroAuth({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
    >
      {mensagem}
    </p>
  );
}

// ===FORMULARIOS===
import { entrar, registrar } from "@/app/actions/auth";

export function FormulariosAuth() {
  const [aba, setAba] = useState<"entrar" | "criar">("entrar");
  const [estadoEntrar, acaoEntrar, pendenteEntrar] = useActionState(entrar, {});
  const [estadoRegistro, acaoRegistro, pendenteRegistro] = useActionState(
    registrar,
    {},
  );

  return (
    <div>
      {/* Tabs */}
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {(
          [
            ["entrar", "Entrar"],
            ["criar", "Criar conta"],
          ] as const
        ).map(([valor, label]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setAba(valor)}
            aria-current={aba === valor}
            className={cn(
              "h-9 rounded-lg text-sm font-bold transition-colors",
              aba === valor
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === "entrar" ? (
        <form action={acaoEntrar} className="space-y-3">
          <ErroAuth mensagem={estadoEntrar.erro} />
          <Campo
            id="email"
            label="E-mail"
            tipo="email"
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <Campo
            id="senha"
            label="Senha"
            tipo="password"
            placeholder="Sua senha"
            autoComplete="current-password"
          />
          <div className="text-right">
            <Link
              href="/recuperar-senha"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <BotaoSubmit label="Entrar" pending={pendenteEntrar} />
        </form>
      ) : (
        <form action={acaoRegistro} className="space-y-3">
          <ErroAuth mensagem={estadoRegistro.erro} />
          <Campo
            id="nome"
            label="Nome completo"
            placeholder="Seu nome"
            autoComplete="name"
          />
          <Campo
            id="email"
            label="E-mail"
            tipo="email"
            placeholder="voce@email.com"
            autoComplete="email"
          />
          <Campo
            id="telefone"
            label="Telefone (opcional)"
            tipo="tel"
            placeholder="(11) 99999-0000"
            autoComplete="tel"
            required={false}
          />
          <Campo
            id="senha"
            label="Senha (mínimo 8 caracteres)"
            tipo="password"
            placeholder="Crie uma senha"
            autoComplete="new-password"
          />
          <BotaoSubmit label="Criar minha conta" pending={pendenteRegistro} />
        </form>
      )}
    </div>
  );
}

/** Botão de login com Google (SVG oficial simplificado). */
export function BotaoGoogle() {
  return (
    <a
      href="/api/auth/google"
      className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        />
      </svg>
      Continuar com o Google
    </a>
  );
}
