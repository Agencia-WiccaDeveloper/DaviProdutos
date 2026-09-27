import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Paginação server-rendered mantendo os filtros da URL. */
export function Paginacao({
  page,
  totalPaginas,
  params,
}: {
  page: number;
  totalPaginas: number;
  params: string;
}) {
  if (totalPaginas <= 1) return null;

  function href(numero: number) {
    const p = new URLSearchParams(params);
    if (numero <= 1) p.delete("page");
    else p.set("page", String(numero));
    const qs = p.toString();
    return qs ? `/produtos?${qs}` : "/produtos";
  }

  const numeros = Array.from({ length: totalPaginas }, (_, i) => i + 1).filter(
    (n) =>
      n === 1 ||
      n === totalPaginas ||
      Math.abs(n - page) <= 1,
  );

  return (
    <nav
      aria-label="Paginação de produtos"
      className="mt-8 flex items-center justify-center gap-1"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          aria-label="Página anterior"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {numeros.map((n, i) => {
        const anterior = numeros[i - 1];
        const gap = anterior && n - anterior > 1;
        return (
          <span key={n} className="flex items-center gap-1">
            {gap ? (
              <span className="px-1 text-slate-400" aria-hidden>
                …
              </span>
            ) : null}
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors",
                n === page
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700",
              )}
            >
              {n}
            </Link>
          </span>
        );
      })}

      {page < totalPaginas ? (
        <Link
          href={href(page + 1)}
          aria-label="Próxima página"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
