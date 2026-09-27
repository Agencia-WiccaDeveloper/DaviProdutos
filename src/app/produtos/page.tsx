import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/store/product-card";
import { OrdenarSelect } from "@/components/store/ordenar-select";
import { Paginacao } from "@/components/store/paginacao";
import { FiltrosLista } from "@/components/store/filtros";
import { PromoCarousel } from "@/components/store/promo-carousel";
import {
  ChipsFiltros,
  FiltrosBotaoMobile,
  FiltrosSidebar,
} from "@/components/store/filtros-painel";
import { EmptyState } from "@/components/ui/empty-state";
import { listarCategorias } from "@/services/categorias";
import { buscarProdutos } from "@/services/catalogo";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Catálogo completo DAVI PRODUTOS: shampoos, ceras, descontaminantes, microfibras, acessórios e kits.",
};

type BuscaParams = {
  q?: string;
  categoria?: string;
  ordenar?: string;
  ofertas?: string;
  disponivel?: string;
  precoMin?: string;
  precoMax?: string;
  page?: string;
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<BuscaParams>;
}) {
  const p = await searchParams;
  const params = new URLSearchParams(
    Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

  const valores = {
    categoria: p.categoria,
    ofertas: p.ofertas,
    disponivel: p.disponivel,
    precoMin: p.precoMin,
    precoMax: p.precoMax,
  };
  const ativos = [
    p.categoria,
    p.ofertas,
    p.disponivel,
    p.precoMin || p.precoMax ? "preco" : undefined,
  ].filter(Boolean).length;

  const [categorias, resultado] = await Promise.all([
    listarCategorias(),
    buscarProdutos({
      q: p.q?.trim(),
      categoria: p.categoria,
      ordenar: p.ordenar,
      ofertas: p.ofertas === "1",
      disponivel: p.disponivel === "1",
      precoMin: p.precoMin ? Number(p.precoMin) : undefined,
      precoMax: p.precoMax ? Number(p.precoMax) : undefined,
      page: p.page ? Number(p.page) : 1,
    }),
  ]);

  const nomeCategoria = categorias.find(
    (c) => c.slug === p.categoria,
  )?.nome;
  const titulo = p.q
    ? `Resultados para "${p.q}"`
    : nomeCategoria
      ? nomeCategoria
      : p.ofertas === "1"
        ? "Ofertas"
        : "Todos os produtos";

  return (
    <Container className="py-6 sm:py-8">
      <header className="mb-5">
        <h1 className="font-display text-3xl font-bold tracking-wide text-brand-900 sm:text-4xl">
          {titulo}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {resultado.total}{" "}
          {resultado.total === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </header>

      <div className="mb-5">
        <PromoCarousel />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FiltrosBotaoMobile ativos={ativos}>
          <FiltrosLista
            categorias={categorias}
            params={params}
            valores={valores}
          />
        </FiltrosBotaoMobile>
        <OrdenarSelect
          valor={p.ordenar ?? "relevancia"}
          params={params.toString()}
        />
      </div>

      <div className="mb-5">
        <ChipsFiltros
          valores={valores}
          params={params}
          nomeCategoria={nomeCategoria}
          q={p.q}
        />
      </div>

      <div className="flex gap-6">
        <FiltrosSidebar>
          <FiltrosLista
            categorias={categorias}
            params={params}
            valores={valores}
          />
        </FiltrosSidebar>
        <div className="min-w-0 flex-1">
          {resultado.produtos.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Nenhum produto encontrado"
              description="Tente remover alguns filtros ou buscar por outro termo."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
              {resultado.produtos.map((prod) => (
                <ProductCard key={prod.id} produto={prod} />
              ))}
            </div>
          )}
          <Paginacao
            page={resultado.page}
            totalPaginas={resultado.totalPaginas}
            params={params.toString()}
          />
        </div>
      </div>
    </Container>
  );
}
