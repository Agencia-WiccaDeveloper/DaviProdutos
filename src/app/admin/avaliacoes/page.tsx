import type { Metadata } from "next";
import { listarAdminAvaliacoes } from "@/services/admin-crud";
import { moderarAvaliacaoAcao } from "@/app/actions/admin-pedidos";
import { Star } from "lucide-react";

export const metadata: Metadata = { title: "Avaliações — Admin" };

const rotuloStatus: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};

export default async function AdminAvaliacoesPage() {
  const avaliacoes = await listarAdminAvaliacoes();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Avaliações
        </h1>
        <p className="text-sm text-slate-500">{avaliacoes.length} avaliação(ões)</p>
      </div>

      <div className="space-y-3">
        {avaliacoes.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800">{a.usuario}</p>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < a.nota ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  sobre <strong className="text-slate-500">{a.produto}</strong>
                </p>
                {a.comentario ? (
                  <p className="mt-2 text-sm text-slate-600">{a.comentario}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {rotuloStatus[a.status]}
                </span>
                <div className="flex gap-1">
                  {a.status !== "APPROVED" ? (
                    <form action={moderarAvaliacaoAcao}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <button className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">Aprovar</button>
                    </form>
                  ) : null}
                  {a.status !== "REJECTED" ? (
                    <form action={moderarAvaliacaoAcao}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">Ocultar</button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        {avaliacoes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhuma avaliação ainda.
          </p>
        ) : null}
      </div>
    </div>
  );
}
