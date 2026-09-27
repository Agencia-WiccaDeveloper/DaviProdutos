import type { Metadata } from "next";
import { listarTodasCategorias } from "@/services/admin-produtos";
import { alternarCategoria } from "@/app/actions/admin-categorias";
import { FormCategoria } from "./form-categoria";

export const metadata: Metadata = { title: "Categorias — Admin" };

export default async function AdminCategoriasPage() {
  const categorias = await listarTodasCategorias();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Categorias
        </h1>
        <p className="text-sm text-slate-500">
          {categorias.length} categoria(s)
        </p>
      </div>

      <FormCategoria />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {categorias.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{c.nome}</p>
                <p className="truncate text-xs text-slate-400">
                  slug: {c.slug} · {c.ativo ? "Ativa" : "Inativa"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <FormCategoria
                  modo="editar"
                  valor={{ id: c.id, nome: c.nome, descricao: c.descricao ?? "" }}
                />
                <form action={alternarCategoria.bind(null, c.id)}>
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${c.ativo ? "text-slate-500 hover:bg-slate-100" : "text-emerald-600 hover:bg-emerald-50"}`}>
                    {c.ativo ? "Desativar" : "Ativar"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
