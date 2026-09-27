import type { Metadata } from "next";
import { listarAdminCupons } from "@/services/admin-crud";
import { alternarCupom } from "@/app/actions/admin-pedidos";
import { FormCupom } from "./form-cupom";

export const metadata: Metadata = { title: "Cupons — Admin" };

const rotuloTipo: Record<string, string> = {
  PERCENTUAL: "Percentual",
  VALOR_FIXO: "Valor fixo",
  FRETE_GRATIS: "Frete grátis",
};

export default async function AdminCuponsPage() {
  const cupons = await listarAdminCupons();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Cupons
        </h1>
        <p className="text-sm text-slate-500">{cupons.length} cupom(ns)</p>
      </div>

      <FormCupom />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {cupons.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-mono font-bold text-brand-700">{c.codigo}</p>
                <p className="text-xs text-slate-500">
                  {rotuloTipo[c.tipo]} · {c.tipo === "PERCENTUAL" ? `${c.valor}%` : c.tipo === "FRETE_GRATIS" ? "Grátis" : `R$${c.valor}`} ·{" "}
                  {c.usos} uso(s)
                </p>
                <p className="text-xs text-slate-400">
                  válido até {new Date(c.validade).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <form action={alternarCupom.bind(null, c.id)}>
                <button className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${c.ativo ? "text-slate-500 hover:bg-slate-100" : "text-emerald-600 hover:bg-emerald-50"}`}>
                  {c.ativo ? "Desativar" : "Ativar"}
                </button>
              </form>
            </li>
          ))}
        </ul>
        {cupons.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">Nenhum cupom cadastrado.</p>
        ) : null}
      </div>
    </div>
  );
}
