"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { Check, Heart, ShoppingCart } from "lucide-react";
import { adicionarAoCarrinho } from "@/app/actions/carrinho";
import {
  idsFavoritos,
  inscreverFavoritos,
  alternarFavorito as alternarFavoritoNoStore,
} from "@/lib/favoritos-client";
import { RatingStars } from "@/components/store/rating-stars";
import { Badge } from "@/components/ui/badge";
import { cn, discountPercent, formatBRL } from "@/lib/utils";
import type { ProdutoVitrine } from "@/services/produtos";

export function ProductCard({
  produto,
  className,
}: {
  produto: ProdutoVitrine;
  className?: string;
}) {
  const desconto = discountPercent(produto.preco, produto.precoPromocional);
  const esgotado = produto.estoque <= 0;

  const favorito = useSyncExternalStore(
    inscreverFavoritos,
    () => idsFavoritos().includes(produto.id),
    () => false,
  );
  const [pulse, setPulse] = useState(false);
  const [adicionado, setAdicionado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function alternarFavorito() {
    alternarFavoritoNoStore(produto.id);
    setPulse(true);
    setTimeout(() => setPulse(false), 300);
  }

  function adicionar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await adicionarAoCarrinho(produto.id);
      if (resultado.ok) {
        setAdicionado(true);
        window.dispatchEvent(new Event("davi:carrinho-aberto"));
        setTimeout(() => setAdicionado(false), 1600);
      } else {
        setErro(resultado.msg ?? "Não foi possível adicionar.");
        setTimeout(() => setErro(null), 2200);
      }
    });
  }

  return (
    <article
      className={cn(
        "group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg",
        className,
      )}
    >
      {/* Imagem */}
      <Link
        href={`/produtos/${produto.slug}`}
        className="relative block aspect-square overflow-hidden bg-slate-100"
        aria-label={produto.nome}
      >
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <ShoppingCart className="h-10 w-10" aria-hidden />
          </div>
        )}
      </Link>

      {/* Badges flutuantes */}
      <div className="absolute left-2 top-2 flex flex-col gap-1">
        {desconto > 0 ? (
          <Badge tone="danger" className="shadow-sm">
            -{desconto}%
          </Badge>
        ) : null}
        {esgotado ? <Badge tone="neutral">Esgotado</Badge> : null}
      </div>

      {/* Favorito */}
      <button
        type="button"
        aria-label={
          favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        aria-pressed={favorito}
        onClick={alternarFavorito}
        className={cn(
          "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 active:scale-95",
          pulse && "scale-110",
        )}
      >
        <Heart
          className={cn(
            "h-4.5 w-4.5 transition-colors",
            favorito ? "fill-rose-500 text-rose-500" : "text-slate-400",
          )}
        />
      </button>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
          {produto.categoria}
        </span>
        <Link
          href={`/produtos/${produto.slug}`}
          className="line-clamp-2 min-h-9 text-sm font-medium leading-snug text-slate-800 transition-colors hover:text-brand-700"
        >
          {produto.nome}
        </Link>
        <RatingStars nota={produto.nota} total={produto.totalAvaliacoes} />

        <div className="mt-auto pt-1">
          {produto.precoPromocional ? (
            <span className="text-xs text-slate-400 line-through">
              {formatBRL(produto.preco)}
            </span>
          ) : null}
          <p className="text-lg font-bold text-slate-900">
            {formatBRL(produto.precoPromocional ?? produto.preco)}
            <span className="ml-1 text-[11px] font-medium text-slate-500">
              à vista
            </span>
          </p>

          <button
            type="button"
            onClick={adicionar}
            disabled={esgotado || pending}
            className={cn(
              "mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
              adicionado
                ? "bg-emerald-600 text-white"
                : "bg-brand-600 text-white hover:bg-brand-700",
            )}
          >
            {esgotado ? (
              "Produto esgotado"
            ) : adicionado ? (
              <>
                <Check className="h-4 w-4" aria-hidden /> Adicionado!
              </>
            ) : erro ? (
              erro
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden />
                {pending ? "Adicionando..." : "Adicionar"}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
