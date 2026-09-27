"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Volta para a página anterior do histórico (fallback: catálogo). */
export function VoltarButton() {
  const router = useRouter();

  function voltar() {
    // Se veio de dentro do site, volta; caso contrário, vai ao catálogo.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/produtos");
    }
  }

  return (
    <button
      type="button"
      onClick={voltar}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-700"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Voltar
    </button>
  );
}
