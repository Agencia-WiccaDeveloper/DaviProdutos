"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import type { ProdutoVitrine } from "@/services/produtos";

/** Carrossel horizontal de produtos com setas e scroll por toque/arraste. */
export function ProductCarousel({ produtos }: { produtos: ProdutoVitrine[] }) {
  const trilhoRef = useRef<HTMLDivElement>(null);

  function rolar(direcao: 1 | -1) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const largura = trilho.querySelector("article")?.clientWidth ?? 200;
    trilho.scrollBy({ left: direcao * (largura + 12), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trilhoRef}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:-mx-6 sm:px-6 sm:gap-4"
      >
        {produtos.map((p) => (
          <div
            key={p.id}
            className="w-40 shrink-0 snap-start sm:w-52 md:w-56"
          >
            <ProductCard produto={p} />
          </div>
        ))}
      </div>

      {/* Setas (somente desktop) */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => rolar(-1)}
        className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:border-brand-400 hover:text-brand-700 md:flex"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Próximo"
        onClick={() => rolar(1)}
        className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:border-brand-400 hover:text-brand-700 md:flex"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
