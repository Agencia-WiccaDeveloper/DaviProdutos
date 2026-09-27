"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, Package, ShoppingBag, Sparkles, Wrench, X } from "lucide-react";
import type { CategoriaResumo } from "@/services/categorias";

type MenuDrawerProps = {
  aberto: boolean;
  onFechar: () => void;
  categorias: CategoriaResumo[];
};

const linksPrincipais = [
  { href: "/produtos", label: "Todos os produtos", icon: Package },
  { href: "/produtos?ofertas=1", label: "Ofertas", icon: Sparkles },
  { href: "/conta", label: "Minha conta", icon: Wrench },
];

export function MenuDrawer({ aberto, onFechar, categorias }: MenuDrawerProps) {
  useEffect(() => {
    if (!aberto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", onKey);
    };
  }, [aberto, onFechar]);

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden ${aberto ? "" : "pointer-events-none"}`}
      aria-hidden={!aberto}
    >
      {/* Backdrop */}
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Painel */}
      <aside
        className={`absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-250 ease-out ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-brand-800 px-4 py-4 text-white">
          <span className="font-display text-lg font-bold tracking-wide">
            DAVI <span className="text-brand-300">PRODUTOS</span>
          </span>
          <button
            onClick={onFechar}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 transition-colors hover:bg-brand-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-3 py-3">
            {linksPrincipais.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={onFechar}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon className="h-5 w-5 text-brand-600" aria-hidden />
                {label}
              </Link>
            ))}
          </div>

          <p className="px-6 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Categorias
          </p>
          <div className="px-3 pb-6">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                href={`/produtos?categoria=${cat.slug}`}
                onClick={onFechar}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {cat.nome}
                <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden />
              </Link>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 px-4 py-3">
          <Link
            href="/carrinho"
            onClick={onFechar}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Ver carrinho
          </Link>
        </div>
      </aside>
    </div>
  );
}
