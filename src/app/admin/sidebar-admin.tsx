"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Boxes, LayoutDashboard, Menu, MessageSquareText, Package, ShoppingCart, Store, Tags, Ticket, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const itens = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exacta: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: MessageSquareText },
];

function ConteudoSidebar({
  pathname,
  adminNome,
}: {
  pathname: string;
  adminNome: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-display text-lg font-bold text-white">
          D
        </span>
        <span className="font-display text-lg font-bold tracking-wide text-white">
          DAVI <span className="text-brand-300">PRODUTOS</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {itens.map(({ href, label, icon: Icon, exacta }) => {
          const ativo = exacta ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                ativo
                  ? "bg-brand-600 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-xs text-slate-400">
          Logado como <strong className="text-white">{adminNome}</strong>
        </p>
        <Link
          href="/"
          className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Store className="h-3.5 w-3.5" aria-hidden /> Ver loja
        </Link>
      </div>
    </div>
  );
}

export function SidebarAdmin({ adminNome }: { adminNome: string }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 bg-brand-950 lg:block">
        <ConteudoSidebar pathname={pathname} adminNome={adminNome} />
      </aside>

      {/* Mobile: barra superior + drawer */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-brand-950 px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded-lg p-1.5 hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display text-lg font-bold tracking-wide">
          DAVI <span className="text-brand-300">ADMIN</span>
        </span>
      </div>

      {aberto ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-slate-900/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand-950 shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 text-white">
              <span className="font-display text-lg font-bold">Menu</span>
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ConteudoSidebar pathname={pathname} adminNome={adminNome} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
