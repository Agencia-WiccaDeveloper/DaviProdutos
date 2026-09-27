import Link from "next/link";

import { Container } from "@/components/layout/container";
import {
  Beneficios,
  Categorias,
  Hero,
} from "@/components/store/home-sections";
import { ProductCarousel } from "@/components/store/product-carousel";
import { SectionHeader } from "@/components/store/section-header";
import { listarCategorias } from "@/services/categorias";
import {
  contarProdutosAtivos,
  listarDestaques,
  listarMaisVendidos,
  listarOfertas,
} from "@/services/produtos";

export default async function HomePage() {
  const [destaques, ofertas, maisVendidos, categorias, totalProdutos] =
    await Promise.all([
      listarDestaques(10),
      listarOfertas(8),
      listarMaisVendidos(8),
      listarCategorias(),
      contarProdutosAtivos(),
    ]);

  return (
    <>
      <Hero totalProdutos={totalProdutos} totalCategorias={categorias.length} />
      <Beneficios />
      <Categorias categorias={categorias} />

      <section aria-label="Produtos destacados" className="pb-10">
        <Container>
          <SectionHeader
            titulo="Destaques"
            subtitulo="Os preferidos da galera do detailing"
            href="/produtos"
          />
          <ProductCarousel produtos={destaques} />
        </Container>
      </section>

      <section
        aria-label="Ofertas"
        className="border-y border-brand-100 bg-brand-50/50 py-10"
      >
        <Container>
          <SectionHeader
            titulo="Ofertas da semana"
            subtitulo="Descontos reais por tempo limitado"
            href="/produtos?ofertas=1"
          />
          <ProductCarousel produtos={ofertas} />
        </Container>
      </section>

      <section aria-label="Mais vendidos" className="py-10">
        <Container>
          <SectionHeader
            titulo="Mais vendidos"
            subtitulo="O que os clientes mais levam"
            href="/produtos"
          />
          <ProductCarousel produtos={maisVendidos} />
        </Container>
      </section>
    </>
  );
}
