import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/store/section-header";

export function Hero({
  totalProdutos,
  totalCategorias,
}: {
  totalProdutos: number;
  totalCategorias: number;
}) {
  return (
    <section className="relative overflow-hidden bg-brand-800 text-white">
      {/* Vídeo em loop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/videos/hero-car-wash.mp4" type="video/mp4" />
      </video>
      {/* Overlay para legibilidade */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-900/80 to-brand-700/50"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_90%_at_80%_10%,rgba(255,255,255,0.08),transparent_60%)]"
      />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="animate-fade-up">
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-50 sm:text-xs">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Lavagem · Limpeza · Estética automotiva
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-wide sm:text-5xl lg:text-6xl">
          Cuidado profissional
          <span className="block text-brand-200">para o seu carro.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-brand-100 sm:text-base lg:text-lg">
          Shampoos, ceras, descontaminantes, microfibras e kits completos —
          com qualidade de detailing profissional e preço justo.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/produtos"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-brand-800 shadow-lg transition-all hover:bg-brand-50 active:scale-[0.98] sm:text-base"
          >
            Comprar agora
          </Link>
          <Link
            href="/produtos"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10 active:scale-[0.98] sm:text-base"
          >
            Ver produtos
          </Link>
        </div>
        <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-xs sm:text-sm">
          <div>
            <dt className="text-brand-200">Produtos selecionados</dt>
            <dd className="font-display text-xl font-bold sm:text-2xl">
              +{totalProdutos}
            </dd>
          </div>
          <div>
            <dt className="text-brand-200">Categorias</dt>
            <dd className="font-display text-xl font-bold sm:text-2xl">
              {totalCategorias}
            </dd>
          </div>
          <div>
            <dt className="text-brand-200">Envio em</dt>
            <dd className="font-display text-xl font-bold sm:text-2xl">
              até 48h
            </dd>
          </div>
        </dl>
        </div>
      </Container>
    </section>
  );
}

// ===BENEFICIOS-CATEGORIAS===
import {
  BadgeCheck,
  Headset,
  ShieldCheck,
  Truck,
} from "lucide-react";

const beneficios = [
  { icon: ShieldCheck, titulo: "Compra segura", texto: "Site protegido com criptografia" },
  { icon: BadgeCheck, titulo: "Produtos selecionados", texto: "Linha profissional testada" },
  { icon: Headset, titulo: "Atendimento humano", texto: "Seg a sáb, 8h às 18h" },
  { icon: Truck, titulo: "Envio rápido", texto: "Frete grátis acima de R$ 199" },
  { icon: Sparkles, titulo: "Qualidade garantida", texto: "Satisfação ou devolução fácil" },
];

export function Beneficios() {
  return (
    <section
      aria-label="Benefícios"
      className="border-b border-slate-200 bg-white"
    >
      <Container className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {beneficios.map(({ icon: Icon, titulo, texto }) => (
          <div
            key={titulo}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition-shadow hover:shadow-md"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                {titulo}
              </p>
              <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                {texto}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

export function Categorias({
  categorias,
}: {
  categorias: { id: number; nome: string; slug: string }[];
}) {
  return (
    <section aria-label="Categorias" className="py-10">
      <Container>
        <SectionHeader
          titulo="Categorias"
          subtitulo="Encontre por tipo de produto"
        />
      </Container>
      <div className="no-scrollbar overflow-x-auto pb-1">
        <Container className="flex w-max gap-3 sm:gap-4">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.slug}`}
              className="group relative flex w-36 shrink-0 flex-col justify-end overflow-hidden rounded-2xl p-4 text-white transition-transform hover:-translate-y-1 sm:w-44 sm:p-5"
            >
              {/* Imagem de fundo */}
              <Image
                src={`https://picsum.photos/seed/davi-cat-${cat.slug}/400/400`}
                alt=""
                fill
                sizes="176px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay azul da marca */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-800/70 to-brand-600/30"
              />
              <span className="relative font-display text-lg font-bold leading-tight tracking-wide sm:text-xl">
                {cat.nome}
              </span>
              <span className="relative mt-1 flex items-center gap-1 text-xs font-semibold text-white/80 transition-colors group-hover:text-white">
                Ver produtos
                <ChevronRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </Container>
      </div>
    </section>
  );
}
