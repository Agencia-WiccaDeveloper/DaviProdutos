"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { adicionarAoCarrinho } from "@/app/actions/carrinho";
import {
  idsFavoritos,
  inscreverFavoritos,
  alternarFavorito as alternarFavoritoNoStore,
} from "@/lib/favoritos-client";
import { cn } from "@/lib/utils";

type ComprarBoxProps = {
  produtoId: number;
  estoque: number;
  slug: string;
  nome: string;
};

/** Quantidade + adicionar ao carrinho + comprar agora + favorito + compartilhar. */
export function ComprarBox({ produtoId, estoque, slug, nome }: ComprarBoxProps) {
  const esgotado = estoque <= 0;
  const router = useRouter();

  const [quantidade, setQuantidade] = useState(1);
  const [confirmado, setConfirmado] = useState(false);
  const [compartilhado, setCompartilhado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const favorito = useSyncExternalStore(
    inscreverFavoritos,
    () => idsFavoritos().includes(produtoId),
    () => false,
  );

  function adicionar(ateCarrinho = false) {
    setErro(null);
    startTransition(async () => {
      const resultado = await adicionarAoCarrinho(produtoId, quantidade);
      if (resultado.ok) {
        if (ateCarrinho) {
          router.push("/carrinho");
        } else {
          window.dispatchEvent(new Event("davi:carrinho-aberto"));
          setConfirmado(true);
          setTimeout(() => setConfirmado(false), 1800);
        }
      } else {
        setErro(resultado.msg ?? "Não foi possível adicionar.");
        setTimeout(() => setErro(null), 2500);
      }
    });
  }

  async function compartilhar() {
    const url = `${window.location.origin}/produtos/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: nome, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCompartilhado(true);
      setTimeout(() => setCompartilhado(false), 2000);
    } catch {
      /* usuário cancelou o compartilhamento */
    }
  }

  // ===CB-JSX===
  return (
    <div className="mt-6 space-y-4">
      {/* Quantidade */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">Quantidade</span>
        <div className="flex items-center rounded-xl border border-slate-300">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            disabled={esgotado || quantidade <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-l-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span
            aria-live="polite"
            className="w-10 text-center text-sm font-bold text-slate-800"
          >
            {quantidade}
          </span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            onClick={() => setQuantidade((q) => Math.min(estoque || 99, q + 1))}
            disabled={esgotado || quantidade >= estoque}
            className="flex h-10 w-10 items-center justify-center rounded-r-xl text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {estoque > 0 && estoque <= 5 ? (
          <span className="text-xs font-semibold text-amber-600">
            Últimas {estoque} unidades!
          </span>
        ) : null}
      </div>

      {/* Ações principais */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => adicionar(false)}
          disabled={esgotado || pending}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
            confirmado
              ? "bg-emerald-600 text-white"
              : "bg-brand-600 text-white hover:bg-brand-700",
          )}
        >
          {esgotado ? (
            "Produto esgotado"
          ) : confirmado ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Adicionado!
            </>
          ) : erro ? (
            erro
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" aria-hidden />
              {pending ? "Adicionando..." : "Adicionar ao carrinho"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => adicionar(true)}
          disabled={esgotado || pending}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          <Zap className="h-4 w-4" aria-hidden />
          Comprar agora
        </button>
      </div>

      {/* Secundárias */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => alternarFavoritoNoStore(produtoId)}
          aria-pressed={favorito}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all active:scale-[0.98]",
            favorito
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-slate-300 text-slate-700 hover:border-rose-300 hover:text-rose-600",
          )}
        >
          <Heart
            className={cn("h-4 w-4", favorito && "fill-rose-500 text-rose-500")}
            aria-hidden
          />
          {favorito ? "Favoritado" : "Favoritar"}
        </button>
        <button
          type="button"
          onClick={compartilhar}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition-all hover:border-brand-400 hover:text-brand-700 active:scale-[0.98]"
        >
          {compartilhado ? (
            <>
              <Check className="h-4 w-4" aria-hidden /> Link copiado!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" aria-hidden /> Compartilhar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
