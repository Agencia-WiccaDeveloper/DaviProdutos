import Link from "next/link";
import { X } from "lucide-react";
import { FiltrosDrawer } from "@/components/store/filtros-drawer";
import {
  montarHref,
  type ValoresFiltros,
} from "@/components/store/filtros";

type ChipsProps = {
  valores: ValoresFiltros;
  params: URLSearchParams;
  nomeCategoria?: string;
  q?: string;
};

/** Botão "Filtros" + drawer (mobile). */
export function FiltrosBotaoMobile({
  children,
  ativos = 0,
}: {
  children: React.ReactNode;
  ativos?: number;
}) {
  return (
    <div className="lg:hidden">
      <FiltrosDrawer quantidadeAtivos={ativos}>
        {children}
      </FiltrosDrawer>
    </div>
  );
}

/** Sidebar de filtros (desktop). */
export function FiltrosSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside
      className="hidden w-64 shrink-0 lg:block"
      aria-label="Filtros"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {children}
      </div>
    </aside>
  );
}

/** Chips dos filtros ativos com remoção por clique. */
export function ChipsFiltros({
  valores,
  params,
  nomeCategoria,
  q,
}: ChipsProps) {
  const chips: { label: string; href: string }[] = [];

  if (valores.categoria && nomeCategoria) {
    chips.push({
      label: nomeCategoria,
      href: montarHref(params, { categoria: null }),
    });
  }

  if (q) {
    chips.push({
      label: `"${q}"`,
      href: montarHref(params, { q: null }),
    });
  }

  if (valores.ofertas) {
    chips.push({
      label: "Ofertas",
      href: montarHref(params, { ofertas: null }),
    });
  }

  if (valores.disponivel) {
    chips.push({
      label: "Disponíveis",
      href: montarHref(params, { disponivel: null }),
    });
  }

  if (valores.precoMin || valores.precoMax) {
    chips.push({
      label: `Preço: ${
        valores.precoMin ? `R$${valores.precoMin}` : "0"
      } – ${
        valores.precoMax ? `R$${valores.precoMax}` : "∞"
      }`,
      href: montarHref(params, {
        precoMin: null,
        precoMax: null,
      }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          {chip.label}

          <X
            className="h-3 w-3"
            aria-hidden
          />

          <span className="sr-only">
            Remover filtro
          </span>
        </Link>
      ))}

      <Link
        href="/produtos"
        className="text-xs font-semibold text-slate-500 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
      >
        Limpar tudo
      </Link>
    </div>
  );
}
