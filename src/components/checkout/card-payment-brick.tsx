"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

declare global {
  interface Window {
    MercadoPago?: {
      new (publicKey: string, options?: { locale?: string }): MPInstance;
    };
  }
}

type MPInstance = {
  bricks: {
    create: (
      tipo: string,
      name: string,
      config: {
        initialization: { amount: number };
        callbacks: {
          onSubmit?: (dados: unknown) => Promise<unknown> | void;
          onReady?: () => void;
          onError?: (erro: unknown) => void;
        };
      },
    ) => void;
  };
};

const MP_SDK_URL = "https://sdk.mercadopago.com/js/v2";

/**
 * Card Payment Brick do Mercado Pago: tokeniza o cartão no navegador
 * (via Public Key) e envia SÓ o token ao nosso backend. O número/CVV
 * nunca passam pelo nosso servidor.
 */
export function CardPaymentBrick({
  publicKey,
  orderId,
  amount,
}: {
  publicKey: string;
  orderId: number;
  amount: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "carregando" | "erro">("idle");
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pago, setPago] = useState(false);
  const [sdkPronto, setSdkPronto] = useState(
    () => typeof window !== "undefined" && Boolean(window.MercadoPago),
  );

  // Carrega o SDK.js do Mercado Pago uma única vez.
  useEffect(() => {
    if (!publicKey || window.MercadoPago) return;
    const script = document.createElement("script");
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => setSdkPronto(true);
    script.onerror = () => {
      setStatus("erro");
      setMensagem("Não foi possível carregar o SDK de pagamento.");
    };
    document.body.appendChild(script);
  }, [publicKey]);

  // Monta o Brick quando o SDK + container estiverem prontos.
  useEffect(() => {
    if (!sdkPronto || !containerRef.current || !window.MercadoPago) return;

    const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
    mp.bricks.create("cardPayment", "cardPaymentBrick_container", {
      initialization: { amount: Number(amount.toFixed(2)) },
      callbacks: {
        onReady: () => setStatus("idle"),
        onError: () => {
          setStatus("erro");
          setMensagem("Não foi possível carregar o formulário de cartão.");
        },
        onSubmit: async (dados: unknown) => {
          const d = dados as {
            token?: string;
            issuer_id?: string | null;
            payment_method_id?: string;
            installments?: number;
          };
          if (!d.token) {
            setMensagem("Erro ao tokenizar o cartão. Tente novamente.");
            return;
          }

          setStatus("carregando");
          try {
            const res = await fetch("/api/pagamento/cartao", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                token: d.token,
                paymentMethodId: d.payment_method_id,
                issuerId: d.issuer_id ?? null,
                installments: d.installments ?? 1,
              }),
            });
            const json = (await res.json()) as { status?: string; erro?: string };
            if (json.erro) {
              setStatus("erro");
              setMensagem(json.erro);
              return;
            }
            if (json.status === "APPROVED") {
              setPago(true);
              setStatus("idle");
            } else if (json.status === "REJECTED") {
              setStatus("erro");
              setMensagem("Pagamento recusado. Verifique os dados e tente novamente.");
            } else {
              setStatus("idle");
              setMensagem("Pagamento em processamento. O status será atualizado em instantes.");
            }
          } catch {
            setStatus("erro");
            setMensagem("Falha na comunicação. Tente novamente em instantes.");
          }
        },
      },
    });
  }, [sdkPronto, publicKey, orderId, amount]);

  if (!publicKey) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Configuração do cartão pendente (Public Key não informada).
      </div>
    );
  }

  if (pago) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700">
        ✅ Pagamento aprovado! Obrigado pela compra.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
        <CreditCard className="h-4 w-4 text-brand-600" aria-hidden />
        Pagamento com cartão
      </h3>

      <div ref={containerRef} id="cardPaymentBrick_container" />

      {!sdkPronto ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando
          formulário…
        </p>
      ) : status === "carregando" ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Processando…
        </p>
      ) : null}

      {mensagem ? (
        <p
          className={
            status === "erro"
              ? "mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
              : "mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600"
          }
        >
          {mensagem}
        </p>
      ) : null}
    </div>
  );
}

