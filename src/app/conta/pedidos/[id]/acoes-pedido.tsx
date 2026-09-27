"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, XCircle } from "lucide-react";
import { cancelarPedido, comprarNovamente } from "@/app/actions/pedidos";

/** Botões de ação do detalhe do pedido (cancelar / comprar novamente). */
export function AcoesPedido({
  pedidoId,
  status,
}: {
  pedidoId: number;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const podeCancelar = ["PENDING", "CONFIRMED"].includes(status);
  const podeRecomprar = ["DELIVERED", "CANCELLED"].includes(status);

  function cancelar() {
    setMsg(null);
    startTransition(async () => {
      const r = await cancelarPedido(pedidoId);
      if (r.ok) {
        router.refresh();
      } else {
        setMsg(r.msg ?? "Não foi possível cancelar.");
      }
    });
  }

  function recomprar() {
    setMsg(null);
    startTransition(async () => {
      const r = await comprarNovamente(pedidoId);
      if (r.ok) {
        router.push("/carrinho");
      } else {
        setMsg(r.msg ?? "Não foi possível recomprar.");
      }
    });
  }

  return (
    <div className="space-y-2">
      {msg ? (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
        >
          {msg}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {podeRecomprar ? (
          <button
            type="button"
            onClick={recomprar}
            disabled={pending}
            className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            Comprar novamente
          </button>
        ) : null}

        {podeCancelar ? (
          confirmar ? (
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelar}
                disabled={pending}
                className="flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
              >
                Confirmar cancelamento
              </button>
              <button
                type="button"
                onClick={() => setConfirmar(false)}
                className="h-10 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600"
              >
                Voltar
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              disabled={pending}
              className="flex h-10 items-center gap-2 rounded-xl border border-rose-300 px-4 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" aria-hidden />
              Cancelar pedido
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}
