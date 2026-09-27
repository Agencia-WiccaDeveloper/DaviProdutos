import type { Metadata } from "next";
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { buscarMetricasAdmin } from "@/services/admin";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel administrativo" };

const rotulosStatus: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export default async function AdminDashboardPage() {
  const m = await buscarMetricasAdmin();

  const cards = [
    {
      titulo: "Faturamento",
      valor: formatBRL(m.faturamento),
      icon: DollarSign,
      tom: "bg-emerald-50 text-emerald-600",
    },
    {
      titulo: "Pedidos",
      valor: String(m.pedidosTotal),
      icon: ShoppingCart,
      tom: "bg-brand-50 text-brand-600",
    },
    {
      titulo: "Clientes",
      valor: String(m.clientesTotal),
      icon: Users,
      tom: "bg-indigo-50 text-indigo-600",
    },
    {
      titulo: "Estoque total",
      valor: `${m.estoqueTotal} un.`,
      icon: Boxes,
      tom: "bg-amber-50 text-amber-600",
    },
  ];

  const maxVenda = Math.max(...m.vendasPorDia.map((v) => v.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Visão geral do desempenho da loja.
        </p>
      </div>

      {/* Alertas */}
      {(m.semEstoque > 0 || m.estoqueBaixo > 0 || m.pedidosPendentes > 0) ? (
        <div className="flex flex-wrap gap-2">
          {m.pedidosPendentes > 0 ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {m.pedidosPendentes} pedido(s) aguardando
            </span>
          ) : null}
          {m.semEstoque > 0 ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {m.semEstoque} produto(s) sem estoque
            </span>
          ) : null}
          {m.estoqueBaixo > 0 ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {m.estoqueBaixo} produto(s) com estoque baixo
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(({ titulo, valor, icon: Icon, tom }) => (
          <div
            key={titulo}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${tom}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-xs font-semibold text-slate-500">{titulo}</p>
            <p className="font-display text-xl font-bold text-brand-900 sm:text-2xl">
              {valor}
            </p>
          </div>
        ))}
      </div>

      {/* ===DASH-LISTAS=== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de vendas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold tracking-wide text-brand-900">
            Vendas dos últimos 7 dias
          </h2>
          {m.vendasPorDia.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Sem vendas no período.
            </p>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {m.vendasPorDia.map((v) => (
                <div
                  key={v.dia}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-semibold text-slate-500">
                    {v.total > 0 ? `R$${v.total.toFixed(0)}` : ""}
                  </span>
                  <div
                    style={{
                      height: `${Math.max((v.total / maxVenda) * 120, 4)}px`,
                    }}
                    className="w-full max-w-10 rounded-t-md bg-brand-500 transition-all hover:bg-brand-600"
                    title={`${v.dia}: ${formatBRL(v.total)}`}
                  />
                  <span className="text-[10px] text-slate-400">{v.dia}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mais vendidos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold tracking-wide text-brand-900">
            Mais vendidos
          </h2>
          <ul className="space-y-2">
            {m.maisVendidos.map((p, i) => (
              <li
                key={p.nome}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                  {p.nome}
                </span>
                <span className="shrink-0 text-xs font-bold text-slate-500">
                  {p.vendidos} vendido(s)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Vendas recentes */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 p-5 font-display text-lg font-bold tracking-wide text-brand-900">
          Vendas recentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Pedido</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {m.vendasRecentes.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-semibold text-brand-700">
                    #{v.id}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{v.cliente}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {rotulosStatus[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900">
                    {formatBRL(v.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Package className="h-3.5 w-3.5" aria-hidden />
        Módulos de Pedidos, Produtos, Categorias, Estoque, Clientes e Cupons
        chegam nas Fases 11 e 12.
      </p>
    </div>
  );
}
