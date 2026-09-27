import type { Metadata } from "next";
import { AlertTriangle, Boxes } from "lucide-react";
import { listarAdminProdutos, resumoEstoque } from "@/services/admin-produtos";

export const metadata: Metadata = { title: "Estoque — Admin" };

export default async function AdminEstoquePage() {
  const [produtos, resumo] = await Promise.all([
    listarAdminProdutos({}),
    resumoEstoque(),
  ]);

  const problemáticos = produtos.filter((p) => p.estoque <= p.estoqueMinimo);

  const cards = [
    { label: "Sem estoque", valor: resumo.sem, tom: "text-rose-600" },
    { label: "Estoque baixo", valor: resumo.baixo, tom: "text-amber-600" },
    { label: "Estoque saudável", valor: resumo.ok, tom: "text-emerald-600" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Estoque
        </h1>
        <p className="text-sm text-slate-500">
          Acompanhe níveis de estoque e alertas.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map(({ label, valor, tom }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className={`font-display text-2xl font-bold ${tom}`}>{valor}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-900">
          <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
          Produtos que precisam de atenção
        </h2>
        {problemáticos.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            Tudo certo! Nenhum produto com estoque crítico.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {problemáticos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{p.nome}</p>
                  <p className="text-xs text-slate-400">SKU {p.sku}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${p.estoque <= 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.estoque <= 0 ? "Esgotado" : `${p.estoque} un. (mín. ${p.estoqueMinimo})`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="rounded-2xl border border-slate-200 bg-white p-5">
        <summary className="cursor-pointer font-display text-lg font-bold text-brand-900">
          <span className="flex items-center gap-2"><Boxes className="h-5 w-5 text-brand-600" aria-hidden /> Visão geral</span>
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Estoque</th>
                <th className="px-3 py-2">Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 text-slate-700">{p.nome}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{p.estoque}</td>
                  <td className="px-3 py-2 text-slate-500">{p.estoqueMinimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
