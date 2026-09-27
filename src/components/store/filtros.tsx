import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoriaResumo } from "@/services/categorias";

/** Constrói /produtos com params modificados (resetando a página). */
export function montarHref(
  base: URLSearchParams,
  mudancas: Record<string, string | number | null>,
) {
  const p = new URLSearchParams(base.toString());
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (valor === null || valor === "") p.delete(chave);
    else p.set(chave, String(valor));
  }
  p.delete("page");
  const s = p.toString();
  return s ? `/produtos?${s}` : "/produtos";
}

export type ValoresFiltros = {
  categoria?: string;
  ofertas?: string;
  disponivel?: string;
  precoMin?: string;
  precoMax?: string;
};

const faixasPreco = [
  { label: "Até R$ 50", min: null, max: "50" },
  { label: "R$ 50 a R$ 100", min: "50", max: "100" },
  { label: "R$ 100 a R$ 200", min: "100", max: "200" },
  { label: "Acima de R$ 200", min: "200", max: null },
];

function ItemFiltro({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        ativo
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-brand-700",
      )}
    >
      <span className="truncate">{children}</span>
      {ativo ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
    </Link>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

export function FiltrosLista({
  categorias,
  params,
  valores,
}: {
  categorias: CategoriaResumo[];
  params: URLSearchParams;
  valores: ValoresFiltros;
}) {
  return (
    <div>
      <Grupo titulo="Categorias">
        <ItemFiltro
          href={montarHref(params, { categoria: null })}
          ativo={!valores.categoria}
        >
          Todas
        </ItemFiltro>
        {categorias.map((cat) => (
          <ItemFiltro
            key={cat.id}
            href={montarHref(params, { categoria: cat.slug })}
            ativo={valores.categoria === cat.slug}
          >
            {cat.nome}
          </ItemFiltro>
        ))}
      </Grupo>

      <Grupo titulo="Preço">
        {faixasPreco.map((f) => {
          const ativo =
            valores.precoMin === (f.min ?? "") &&
            valores.precoMax === (f.max ?? "");
          return (
            <ItemFiltro
              key={f.label}
              href={montarHref(params, {
                precoMin: f.min,
                precoMax: f.max,
              })}
              ativo={ativo}
            >
              {f.label}
            </ItemFiltro>
          );
        })}
      </Grupo>

      <Grupo titulo="Disponibilidade">
        <ItemFiltro
          href={montarHref(params, {
            disponivel: valores.disponivel ? null : "1",
          })}
          ativo={!!valores.disponivel}
        >
          Somente disponíveis
        </ItemFiltro>
        <ItemFiltro
          href={montarHref(params, {
            ofertas: valores.ofertas ? null : "1",
          })}
          ativo={!!valores.ofertas}
        >
          Somente ofertas
        </ItemFiltro>
      </Grupo>
    </div>
  );
}
