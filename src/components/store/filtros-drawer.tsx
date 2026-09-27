"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** Botão + drawer lateral (mobile) que envolve os filtros server-rendered. */
export function FiltrosDrawer({
  children,
  quantidadeAtivos = 0,
}: {
  children: React.ReactNode;
  quantidadeAtivos?: number;
}) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filtros
        {quantidadeAtivos > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
            {quantidadeAtivos}
          </span>
        ) : null}
      </button>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${aberto ? "" : "pointer-events-none"}`}
        aria-hidden={!aberto}
      >
        <div
          onClick={() => setAberto(false)}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${
            aberto ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-250 ease-out ${
            aberto ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <span className="font-display text-lg font-bold tracking-wide text-brand-900">
              Filtros
            </span>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar filtros"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
            {children}
          </div>
        </aside>
      </div>
    </>
  );
}
