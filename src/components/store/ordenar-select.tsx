"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ORDENACOES } from "@/components/store/ordenacoes";

/** Select de ordenação — mantém os demais parâmetros da URL. */
export function OrdenarSelect({
  valor,
  params,
}: {
  valor: string;
  params: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function trocar(novoValor: string) {
    const p = new URLSearchParams(params);

    if (novoValor === "relevancia") {
      p.delete("ordenar");
    } else {
      p.set("ordenar", novoValor);
    }

    p.delete("page");

    const qs = p.toString();

    startTransition(() => {
      router.push(
        qs ? `/produtos?${qs}` : "/produtos",
        { scroll: false },
      );
    });
  }

  return (
    <div className="relative flex items-center">
      {pending ? (
        <Loader2
          className="absolute left-3 h-4 w-4 animate-spin text-brand-600"
          aria-hidden
        />
      ) : null}

      <label htmlFor="ordenar" className="sr-only">
        Ordenar por
      </label>

      <select
        id="ordenar"
        value={valor}
        onChange={(e) => trocar(e.target.value)}
        className={`h-10 cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white pr-9 text-sm font-semibold text-slate-700 outline-none transition-colors hover:border-brand-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          pending ? "pl-9" : "pl-4"
        }`}
      >
        {ORDENACOES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </select>

      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="m6 9 6 6 6-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}