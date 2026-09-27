import type { Metadata } from "next";
import { Search } from "lucide-react";
import { listarAdminClientes } from "@/services/admin-crud";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Clientes — Admin" };

const rotuloRole: Record<string, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Admin",
  STAFF: "Staff",
  SUPER_ADMIN: "Super Admin",
};

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clientes = await listarAdminClientes(q);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Clientes
        </h1>
        <p className="text-sm text-slate-500">{clientes.length} cliente(s)</p>
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail…"
          className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3 text-right">Total gasto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.nome}</p>
                    <p className="text-xs text-slate-400">
                      desde {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{c.email}</p>
                    <p className="text-xs text-slate-400">{c.telefone ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      {rotuloRole[c.role] ?? c.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {c.totalPedidos}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatBRL(c.totalGasto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clientes.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Nenhum cliente encontrado.</p>
        ) : null}
      </div>
    </div>
  );
}
