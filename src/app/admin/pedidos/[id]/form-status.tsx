"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { alterarStatusPedido } from "@/app/actions/admin-pedidos";
import { MensagemStatus } from "@/components/ui/mensagem-status";

const opcoes = [
  ["PENDING", "Pendente"],
  ["CONFIRMED", "Confirmado"],
  ["PROCESSING", "Preparando"],
  ["SHIPPED", "Enviado"],
  ["DELIVERED", "Entregue"],
  ["CANCELLED", "Cancelado"],
] as const;

export function FormStatusPedido({
  pedidoId,
  statusAtual,
}: {
  pedidoId: number;
  statusAtual: string;
}) {
  const [estado, formAction, pending] = useActionState(alterarStatusPedido, {});

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-2 text-sm font-bold text-slate-700">Alterar status</h2>
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
      <input type="hidden" name="id" value={pedidoId} />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          defaultValue={statusAtual}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
        >
          {opcoes.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input
          type="text"
          name="observacao"
          placeholder="Observação (opcional)"
          className="h-10 flex-1 min-w-40 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Salvar
        </button>
      </div>
    </form>
  );
}
