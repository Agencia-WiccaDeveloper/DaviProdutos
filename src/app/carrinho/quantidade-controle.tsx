"use client";

import { useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { definirQuantidade } from "@/app/actions/carrinho";

/** Controle +/- da quantidade de um item do carrinho. */
export function QuantidadeControle({
  itemId,
  quantidade,
  estoque,
}: {
  itemId: number;
  quantidade: number;
  estoque: number;
}) {
  const [pending, startTransition] = useTransition();

  function alterar(nova: number) {
    if (nova < 1 || nova > estoque) return;
    startTransition(async () => {
      await definirQuantidade(itemId, nova);
    });
  }

  return (
    <div className="flex items-center rounded-lg border border-slate-300">
      <button
        type="button"
        aria-label="Diminuir"
        onClick={() => alterar(quantidade - 1)}
        disabled={pending || quantidade <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="w-8 text-center text-sm font-bold text-slate-800">
        {quantidade}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        onClick={() => alterar(quantidade + 1)}
        disabled={pending || quantidade >= estoque}
        className="flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
