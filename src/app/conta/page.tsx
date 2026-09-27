import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, Heart, CreditCard } from "lucide-react";
import { db } from "@/db";
import { count, eq } from "drizzle-orm";
import { addresses, favorites, orders, users } from "@/db/schema";
import { lerSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaResumoPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");

  const [pedidos, enderecos, favoritos] = await Promise.all([
    db
      .select({ n: count() })
      .from(orders)
      .where(eq(orders.userId, sessao.uid)),
    db
      .select({ n: count() })
      .from(addresses)
      .where(eq(addresses.userId, sessao.uid)),
    db
      .select({ n: count() })
      .from(favorites)
      .where(eq(favorites.userId, sessao.uid)),
  ]);

  const [usuario] = await db
    .select({ criadoEm: users.createdAt })
    .from(users)
    .where(eq(users.id, sessao.uid))
    .limit(1);

  const cards = [
    {
      href: "/conta/pedidos",
      icon: Package,
      label: "Pedidos",
      valor: pedidos[0].n,
    },
    {
      href: "/conta/enderecos",
      icon: MapPin,
      label: "Endereços",
      valor: enderecos[0].n,
    },
    {
      href: "/conta/favoritos",
      icon: Heart,
      label: "Favoritos",
      valor: favoritos[0].n,
    },
    {
      href: "/conta/senha",
      icon: CreditCard,
      label: "Segurança",
      valor: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ href, icon: Icon, label, valor }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-slate-500">
              {label}
            </span>
            <span className="block font-display text-2xl font-bold text-brand-900">
              {valor === null ? "—" : valor}
            </span>
          </span>
        </Link>
      ))}
      {usuario ? (
        <p className="col-span-full text-xs text-slate-400">
          Cliente desde{" "}
          {new Date(usuario.criadoEm).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      ) : null}
    </div>
  );
}

