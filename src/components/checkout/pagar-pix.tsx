"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Copy, Loader2, QrCode, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { gerarNovoPix } from "@/app/actions/pedidos";

/**
 * Exibe o QR Code PIX (imagem base64) + código copia-e-cola, com status
 * claro do pagamento (aguardando/aprovado/rejeitado/cancelado).
 */
function formatarTempoRestante(ms: number): string {
  if (ms <= 0) return "expirado";
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export function PagarPix({
  qrCode,
  qrCodeBase64,
  status,
  expiresAt,
  pedidoId,
}: {
  qrCode: string | null;
  qrCodeBase64: string | null;
  status: string | null;
  expiresAt?: Date | null;
  pedidoId?: number;
}) {
  const [copiado, setCopiado] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const expirado = expiresAt ? new Date(expiresAt).getTime() <= agora : false;
  const restanteMs = expiresAt ? new Date(expiresAt).getTime() - agora : 0;

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(t);
  }, [copiado]);

  useEffect(() => {
    if (!expiresAt || expirado) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt, expirado]);

  const rotulo: Record<string, string> = {
    PENDING: "Aguardando pagamento",
    APPROVED: "Pagamento aprovado",
    REJECTED: "Pagamento rejeitado",
    CANCELLED: "Pagamento cancelado/expirado",
    EXPIRED: "Pagamento expirado",
    REFUNDED: "Pagamento estornado",
  };

  function gerarNovo() {
    if (!pedidoId) return;
    setMsg(null);
    startTransition(async () => {
      const r = await gerarNovoPix(pedidoId);
      if (r.ok) {
        setAgora(Date.now());
      } else {
        setMsg(r.msg ?? "Não foi possível gerar o pagamento PIX.");
      }
    });
  }

  async function copiar() {
    if (!qrCode) return;
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const badge: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-rose-100 text-rose-700",
    CANCELLED: "bg-slate-200 text-slate-600",
    EXPIRED: "bg-slate-200 text-slate-600",
    REFUNDED: "bg-slate-200 text-slate-600",
  };

  const pagamentoExpirado =
    status === "EXPIRED" || (status === "PENDING" && expirado);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <QrCode className="h-4 w-4 text-brand-600" aria-hidden />
        Pagamento via PIX
      </h3>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-bold",
            badge[status ?? "PENDING"] ?? badge.PENDING,
          )}
        >
          {rotulo[status ?? "PENDING"] ?? rotulo.PENDING}
        </span>
        {status === "PENDING" && !expirado && restanteMs > 0 ? (
          <span className="text-xs font-semibold text-slate-500">
            Expira em {formatarTempoRestante(restanteMs)}
          </span>
        ) : null}
      </div>

      {status === "APPROVED" ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <Check className="h-5 w-5" aria-hidden /> Pagamento confirmado! Obrigado
          pela compra.
        </div>
      ) : pagamentoExpirado ? (
        <div className="space-y-3">
          <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            Este QR Code expirou. Gere um novo PIX para continuar.
          </p>
          {msg ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {msg}
            </p>
          ) : null}
          <button
            type="button"
            onClick={gerarNovo}
            disabled={pending || !pedidoId}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            Gerar novo PIX
          </button>
        </div>
      ) : qrCode ? (
        <>
          {qrCodeBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              className="mx-auto h-52 w-52 max-w-full rounded-lg"
            />
          ) : null}
          <button
            type="button"
            onClick={copiar}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700"
          >
            {copiado ? (
              <>
                <Check className="h-4 w-4" aria-hidden /> Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden /> Copiar código PIX
              </>
            )}
          </button>
          <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            {qrCode}
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Após pagar, o status é atualizado automaticamente.
          </p>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Não foi possível gerar o pagamento PIX.
          </p>
          {msg ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {msg}
            </p>
          ) : null}
          <button
            type="button"
            onClick={gerarNovo}
            disabled={pending || !pedidoId}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RotateCcw className="h-4 w-4" aria-hidden />
            )}
            Gerar novo PIX
          </button>
        </div>
      )}
    </div>
  );
}
