"use client";

import Link from "next/link";
import { Megaphone, Sparkles, Truck, Zap } from "lucide-react";

const banners = [
  {
    icon: Truck,
    titulo: "Frete grátis acima de R$ 199",
    texto: "Em todo o Brasil",
    href: "/produtos",
    tom: "from-brand-600 to-brand-800",
  },
  {
    icon: Zap,
    titulo: "Retirada na loja em 2h",
    texto: "Compre e retire sem frete",
    href: "/checkout",
    tom: "from-emerald-600 to-emerald-800",
  },
  {
    icon: Sparkles,
    titulo: "Ofertas da semana",
    texto: "Até 25% OFF em selecionados",
    href: "/produtos?ofertas=1",
    tom: "from-amber-500 to-orange-600",
  },
  {
    icon: Megaphone,
    titulo: "Kits de detailing",
    texto: "Tudo para começar",
    href: "/produtos?categoria=kits",
    tom: "from-indigo-600 to-brand-800",
  },
];

/** Carrossel fino de propagandas (scroll horizontal). */
export function PromoCarousel() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      {banners.map(({ icon: Icon, titulo, texto, href, tom }) => (
        <Link
          key={titulo}
          href={href}
          className={`flex w-72 shrink-0 snap-start items-center gap-3 rounded-xl bg-gradient-to-r ${tom} px-4 py-3 text-white transition-transform hover:-translate-y-0.5 sm:w-80`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{titulo}</span>
            <span className="block truncate text-xs text-white/80">{texto}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
