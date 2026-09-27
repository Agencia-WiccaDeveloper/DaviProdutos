"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Imagem = { id: number; url: string; alt: string | null };

/** Galeria com miniaturas, zoom no hover (desktop) e swipe (mobile). */
export function Galeria({
  imagens,
  nomeProduto,
}: {
  imagens: Imagem[];
  nomeProduto: string;
}) {
  const [ativa, setAtiva] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origem, setOrigem] = useState("50% 50%");
  const ref = useRef<HTMLDivElement>(null);
  const lista = imagens.length > 0 ? imagens : [];

  function mover(e: React.MouseEvent<HTMLDivElement>) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    setOrigem(`${x}% ${y}%`);
  }

  const atual = lista[ativa];

  return (
    <div className="flex flex-col gap-3">
      {/* Imagem principal */}
      <div
        ref={ref}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={mover}
        className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        {atual ? (
          <Image
            key={atual.id}
            src={atual.url}
            alt={atual.alt ?? nomeProduto}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            style={{ transformOrigin: origem }}
            className={cn(
              "object-cover transition-transform duration-200",
              zoom && "scale-[1.8]",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            Sem imagem
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {lista.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {lista.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setAtiva(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === ativa}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:h-20 sm:w-20",
                i === ativa
                  ? "border-brand-600"
                  : "border-slate-200 hover:border-brand-300",
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${nomeProduto} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
