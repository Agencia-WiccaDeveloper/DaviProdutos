import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { listarAdminPedidos } from "@/services/admin-crud";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Pedidos — Admin" };

const rotulos: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const p = await searchParams;
  const pedidos = await listarAdminPedidos({ q: p.q, status: p.status });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Pedidos
        </h1>
        <p className="text-sm text-slate-500">{pedidos.length} pedido(s)</p>
      </div>

      <form className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={p.q}
            placeholder="Buscar por cliente ou e-mail…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select name="status" defaultValue={p.status} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500">
          <option value="">Todos os status</option>
          {Object.entries(rotulos).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${p.id}`} className="font-semibold text-brand-700 hover:underline">
                      #{p.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{p.cliente}</p>
                    <p className="text-xs text-slate-400">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {rotulos[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{p.pagamento ?? "—"}</p>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.paymentStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.paymentStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : p.paymentStatus === "REFUNDED" ||
                                p.paymentStatus === "CANCELLED" ||
                                p.paymentStatus === "EXPIRED"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.paymentStatus ?? "PENDING"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatBRL(p.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pedidos.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Nenhum pedido.</p>
        ) : null}
      </div>
    </div>
  );
}
