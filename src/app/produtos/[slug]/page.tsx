import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck, Ruler, Truck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Galeria } from "@/components/produto/galeria";
import { ComprarBox } from "@/components/produto/comprar-box";
import { ProductCard } from "@/components/store/product-card";
import { RatingStars } from "@/components/store/rating-stars";
import { SectionHeader } from "@/components/store/section-header";
import { Badge } from "@/components/ui/badge";
import { VoltarButton } from "@/components/ui/voltar-button";
import { discountPercent, formatBRL } from "@/lib/utils";
import { buscarProdutoPorSlug, listarRelacionados } from "@/services/produto";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const dado = await buscarProdutoPorSlug(slug);
    if (dado) {
      return {
        title: dado.produto.nome,
        description: dado.produto.descricaoCurta ?? undefined,
      };
    }
  } catch {
    /* segue com metadata padrão */
  }
  return { title: "Produto" };
}

function FormatarDimensao(valor: string | null, sufixo: string) {
  return valor ? `${Number(valor).toFixed(1).replace(".", ",")} ${sufixo}` : "—";
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params;
  const dado = await buscarProdutoPorSlug(slug);
  if (!dado) notFound();

  const { produto, imagens, nota, totalAvaliacoes, avaliacoes } = dado;
  const relacionados = await listarRelacionados(
    produto.categoriaSlug,
    produto.id,
  );
  const desconto = discountPercent(produto.preco, produto.precoPromocional);
  const precoFinal = Number(produto.precoPromocional ?? produto.preco);
  const parcelado = (precoFinal / 12).toFixed(2).replace(".", ",");
  const dataFmt = (d: Date) =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      {/* Breadcrumb */}
      <Container className="pt-4">
        <VoltarButton />
        <nav
          aria-label="Trilha de navegação"
          className="mt-1 flex items-center gap-1 text-xs text-slate-500 sm:text-sm"
        >
          <Link href="/" className="hover:text-brand-700">
            Início
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link href="/produtos" className="hover:text-brand-700">
            Produtos
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link
            href={`/produtos?categoria=${produto.categoriaSlug}`}
            className="hover:text-brand-700"
          >
            {produto.categoria}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate text-slate-400">{produto.nome}</span>
        </nav>
      </Container>

      <Container className="py-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Galeria imagens={imagens} nomeProduto={produto.nome} />

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{produto.categoria}</Badge>
              {desconto > 0 ? <Badge tone="danger">-{desconto}% OFF</Badge> : null}
              {produto.estoque > 0 ? (
                <Badge tone="success">Em estoque</Badge>
              ) : (
                <Badge tone="neutral">Esgotado</Badge>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-wide text-brand-900 sm:text-4xl">
              {produto.nome}
            </h1>

            <div className="mt-2 flex items-center gap-3">
              <RatingStars nota={nota} total={totalAvaliacoes} tamanho={16} />
              <span className="text-xs text-slate-400">
                SKU: {produto.sku}
              </span>
            </div>

            {produto.descricaoCurta ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                {produto.descricaoCurta}
              </p>
            ) : null}

            {/* Preço */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              {produto.precoPromocional ? (
                <span className="text-sm text-slate-400 line-through">
                  {formatBRL(produto.preco)}
                </span>
              ) : null}
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {formatBRL(precoFinal)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                em até <strong>12x de R$ {parcelado}</strong> sem juros
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                R$ {precoFinal.toFixed(2).replace(".", ",")} à vista no PIX
              </p>
            </div>

            <ComprarBox
              produtoId={produto.id}
              estoque={produto.estoque}
              slug={produto.slug}
              nome={produto.nome}
            />

            {/* Selos */}
            <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-brand-600" aria-hidden />
                Frete grátis acima de R$ 199
              </p>
              <p className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-brand-600" aria-hidden />
                Produto profissional original
              </p>
            </div>
          </div>
        </div>
        {/* ===DESC-AVALIACOES=== */}

        {/* Descrição + especificações */}
        <section
          aria-label="Descrição do produto"
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
        >
          <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
            Descrição
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
            {produto.descricao ?? produto.descricaoCurta}
          </p>

          <h2 className="mt-8 font-display text-xl font-bold tracking-wide text-brand-900">
            Especificações
          </h2>
          <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
            {[
              ["SKU", produto.sku],
              ["Categoria", produto.categoria],
              ["Estoque", `${produto.estoque} unidade(s)`],
              ["Peso", FormatarDimensao(produto.peso, "kg")],
              ["Altura", FormatarDimensao(produto.altura, "cm")],
              ["Largura", FormatarDimensao(produto.largura, "cm")],
              ["Comprimento", FormatarDimensao(produto.comprimento, "cm")],
            ].map(([rotulo, valor]) => (
              <div
                key={rotulo}
                className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0"
              >
                <dt className="text-slate-500">{rotulo}</dt>
                <dd className="font-semibold text-slate-800">{valor}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Ruler className="h-4 w-4 text-brand-600" aria-hidden />
            Dimensões aproximadas da embalagem.
          </p>
        </section>

        {/* Avaliações */}
        <section
          aria-label="Avaliações dos clientes"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
                Avaliações
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <RatingStars nota={nota} total={totalAvaliacoes} tamanho={18} />
                <span className="text-sm text-slate-500">
                  {nota > 0
                    ? `${nota.toFixed(1)} de 5 · ${totalAvaliacoes} avaliação(ões)`
                    : "Sem avaliações ainda"}
                </span>
              </div>
            </div>
          </div>

          {avaliacoes.length > 0 ? (
            <ul className="mt-5 divide-y divide-slate-100">
              {avaliacoes.map((av) => (
                <li key={av.id} className="py-4 first:pt-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {av.usuario}
                    </span>
                    <span className="text-xs text-slate-400">
                      {dataFmt(av.criadoEm)}
                    </span>
                  </div>
                  <RatingStars
                    nota={av.nota}
                    total={0}
                    tamanho={13}
                    className="mt-1"
                  />
                  {av.comentario ? (
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {av.comentario}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Compre este produto e seja o primeiro a avaliar.
            </p>
          )}
        </section>

        {/* Relacionados */}
        {relacionados.length > 0 ? (
          <section aria-label="Produtos relacionados" className="mt-10">
            <SectionHeader
              titulo="Produtos relacionados"
              subtitulo={`Mais da categoria ${produto.categoria}`}
              href={`/produtos?categoria=${produto.categoriaSlug}`}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {relacionados.map((r) => (
                <ProductCard key={r.id} produto={r} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  );
}
