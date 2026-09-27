"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sair } from "@/app/actions/auth";

const itens = [
  { href: "/conta", label: "Resumo", icon: User, exacta: true },
  { href: "/conta/pedidos", label: "Pedidos", icon: Package },
  { href: "/conta/enderecos", label: "Endereços", icon: MapPin },
  { href: "/conta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/conta/dados", label: "Dados pessoais", icon: Settings },
  { href: "/conta/senha", label: "Alterar senha", icon: CreditCard },
];

export function NavConta() {
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar lg:w-56 lg:shrink-0">
      <ul className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:flex-col lg:gap-0.5">
        {itens.map(({ href, label, icon: Icon, exacta }) => {
          const ativo = exacta ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0 lg:shrink">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  ativo
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-700",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="lg:block">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 border-t border-slate-100 pt-0.5 lg:mt-2 lg:border-t lg:pt-2">
          <form action={sair}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Sair
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
