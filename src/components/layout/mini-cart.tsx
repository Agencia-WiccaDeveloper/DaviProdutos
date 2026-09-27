"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, Loader2, ShoppingCart, X } from "lucide-react";
import { formatBRL } from "@/lib/utils";
import type { ItemCarrinho } from "@/services/carrinho";

/** Drawer lateral do carrinho (abre após adicionar ou pelo header). */
export function MiniCart({ inicial }: { inicial: ItemCarrinho[] }) {
  return <MiniCartInner inicial={inicial} />;
}

function MiniCartInner({ inicial }: { inicial: ItemCarrinho[] }) {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<ItemCarrinho[]>(inicial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function aoAdicionar() {
      setAberto(true);
      startTransition(async () => {
        const res = await fetch("/api/mini-cart", { cache: "no-store" });
        const data = (await res.json()) as { itens: ItemCarrinho[] };
        setItens(data.itens ?? []);
      });
    }
    window.addEventListener("davi:carrinho-aberto", aoAdicionar);
    return () => window.removeEventListener("davi:carrinho-aberto", aoAdicionar);
  }, []);

  const subtotal = itens.reduce(
    (soma, i) =>
      soma + Number(i.precoPromocional ?? i.preco) * i.quantidade,
    0,
  );

  return (
    <>
      {/* Botão (integrado ao header, chamado via evento) */}
      <div className={`fixed inset-0 z-[80] ${aberto ? "" : "pointer-events-none"}`} aria-hidden={!aberto}>
        <div
          onClick={() => setAberto(false)}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-200 ${
            aberto ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-250 ease-out ${
            aberto ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Seu carrinho"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-brand-800 px-4 py-4 text-white">
            <span className="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
              <ShoppingCart className="h-5 w-5" aria-hidden />
              Carrinho
            </span>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar carrinho"
              className="rounded-lg p-1.5 transition-colors hover:bg-brand-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {pending ? (
              <p className="flex items-center gap-2 py-6 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden />
                Atualizando…
              </p>
            ) : itens.length === 0 ? (
              <div className="py-10 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
                <p className="mt-2 text-sm text-slate-500">Seu carrinho está vazio.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {itens.map((item) => (
                  <li key={item.itemId} className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {item.quantidade}x {item.nome}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {formatBRL(Number(item.precoPromocional ?? item.preco) * item.quantidade)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {itens.length > 0 ? (
            <div className="border-t border-slate-100 px-4 py-4">
              <p className="mb-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/carrinho"
                  onClick={() => setAberto(false)}
                  className="flex h-11 items-center justify-center rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700"
                >
                  Ver carrinho
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setAberto(false)}
                  className="flex h-11 items-center justify-center gap-1 rounded-xl bg-brand-600 text-sm font-bold text-white transition-colors hover:bg-brand-700"
                >
                  Comprar <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}
