"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { MenuDrawer } from "@/components/layout/menu-drawer";
import type { CategoriaResumo } from "@/services/categorias";

/**
 * Botão hambúrguer (mobile) + drawer de navegação.
 * O Header (server) busca as categorias e repassa para cá.
 */
export function HeaderClient({ categorias }: { categorias: CategoriaResumo[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={aberto}
        onClick={() => setAberto(true)}
        className="flex min-w-10 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-700 lg:hidden"
      >
        <Menu className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
        <span className="text-[10px] font-semibold leading-none">Menu</span>
      </button>

      <MenuDrawer
        aberto={aberto}
        onFechar={() => setAberto(false)}
        categorias={categorias}
      />
    </>
  );
}
