import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Star, StarOff } from "lucide-react";
import { listarAdminProdutos, listarTodasCategorias } from "@/services/admin-produtos";
import { alternarProduto } from "@/app/actions/admin-produtos";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Produtos — Admin" };

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ativo?: string }>;
}) {
  const p = await searchParams;
  const [produtos, categorias] = await Promise.all([
    listarAdminProdutos({ q: p.q, categoria: p.categoria, ativo: p.ativo }),
    listarTodasCategorias(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
            Produtos
          </h1>
          <p className="text-sm text-slate-500">
            {produtos.length} produto(s) listado(s)
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden /> Novo produto
        </Link>
      </div>

      {/* Busca e filtros */}
      <form className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={p.q}
            placeholder="Buscar por nome ou SKU…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          name="categoria"
          defaultValue={p.categoria}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
        <select
          name="ativo"
          defaultValue={p.ativo}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="1">Ativos</option>
          <option value="0">Inativos</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
        >
          Filtrar
        </button>
      </form>

      {/* ===TABELA-PRODUTOS=== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/produtos/${prod.id}`} className="font-medium text-slate-800 hover:text-brand-700">
                      {prod.nome}
                    </Link>
                    <p className="text-xs text-slate-400">{prod.categoria}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{prod.sku}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800">{formatBRL(prod.preco)}</span>
                    {prod.precoPromocional ? (
                      <span className="block text-xs text-emerald-600">{formatBRL(prod.precoPromocional)}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={prod.estoque <= 0 ? "font-bold text-rose-600" : prod.estoque <= prod.estoqueMinimo ? "font-bold text-amber-600" : "text-slate-700"}>
                      {prod.estoque}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${prod.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {prod.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <form action={alternarProduto.bind(null, prod.id, "destaque")}>
                        <button title={prod.destaque ? "Remover destaque" : "Destacar"} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-500">
                          {prod.destaque ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                        </button>
                      </form>
                      <form action={alternarProduto.bind(null, prod.id, "ativo")}>
                        <button className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100">
                          {prod.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <Link href={`/admin/produtos/${prod.id}`} className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {produtos.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Nenhum produto encontrado com esses filtros.
          </p>
        ) : null}
      </div>
    </div>
  );
}
