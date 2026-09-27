import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { orders } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { formatBRL } from "@/lib/utils";

export const metadata: Metadata = { title: "Meus pedidos" };

const rotulosStatus: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const tomStatus: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-brand-100 text-brand-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export default async function PedidosPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");
  const lista = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, sessao.uid))
    .orderBy(desc(orders.createdAt));

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-bold tracking-wide text-brand-900">
        Meus pedidos
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Acompanhe o histórico e o status dos seus pedidos.
      </p>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">
            Você ainda não fez nenhum pedido.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.map((pedido) => (
            <li key={pedido.id}>
              <Link
                href={`/conta/pedidos/${pedido.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Pedido #{pedido.id}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatBRL(pedido.total)}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${tomStatus[pedido.status]}`}
                  >
                    {rotulosStatus[pedido.status] ?? pedido.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
