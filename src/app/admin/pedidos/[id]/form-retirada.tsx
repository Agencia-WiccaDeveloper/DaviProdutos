"use client";

import { useState, useTransition } from "react";
import { Loader2, PackageCheck } from "lucide-react";
import { confirmarRetirada } from "@/app/actions/admin-pedidos";

export function FormRetirada({
  pedidoId,
  pickupCode,
  jaRetirado,
}: {
  pedidoId: number;
  pickupCode: string | null;
  jaRetirado: boolean;
}) {
  const [codigo, setCodigo] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmar() {
    setMsg(null);
    startTransition(async () => {
      const r = await confirmarRetirada(pedidoId, codigo);
      setMsg({ ok: r.ok, texto: r.msg ?? "Retirada confirmada!" });
      if (r.ok) setCodigo("");
    });
  }

  if (jaRetirado) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
        Pedido já retirado.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-2 text-sm font-bold text-slate-700">Confirmar retirada</h2>
      {pickupCode ? (
        <p className="mb-3 text-sm text-slate-500">
          Código do cliente:{" "}
          <span className="font-mono font-bold tracking-widest text-slate-800">
            {pickupCode}
          </span>
        </p>
      ) : null}
      {msg ? (
        <p
          className={`mb-2 rounded-lg px-3 py-2 text-xs font-semibold ${
            msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {msg.texto}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Informe o código de retirada"
          className="h-10 min-w-40 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={confirmar}
          disabled={pending || !codigo.trim()}
          className="flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PackageCheck className="h-4 w-4" aria-hidden />
          )}
          Confirmar retirada
        </button>
      </div>
    </div>
  );
}
