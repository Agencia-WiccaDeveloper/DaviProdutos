import "server-only";

import {
  type CriarIntencaoParams,
  type StatusPagamentoGateway,
} from "./provedor";

/**
 * Cliente Mercado Pago — Checkout Transparente via Orders API.
 * =============================================================
 * Usa o endpoint /v1/orders (Orders API), compatível com a aplicação
 * criada como "Checkout Transparente via Orders".
 *
 * NUNCA importe este módulo em um Client Component.
 * O Access Token é lido somente aqui, do ambiente do servidor.
 */

const MP_BASE = "https://api.mercadopago.com";

function token(): string {
  return process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "";
}

/** Formato de resposta de uma Order (/v1/orders). */
type MpOrderResponse = {
  id?: string;
  status?: string;
  status_detail?: string;
  external_reference?: string;
  transactions?: {
    payments?: Array<{
      id?: string;
      status?: string;
      status_detail?: string;
      payment_method?: {
        id?: string;
        type?: string;
        ticket_url?: string;
        qr_code?: string;
        qr_code_base64?: string;
      };
    }>;
  };
};

export type ResultadoPagamentoPix = {
  pagamentoExternoId: string;
  status: StatusPagamentoGateway;
  metodo: string;
  qrCode: string | null;
  qrCodeBase64: string | null;
};

export type ResultadoPagamentoCartao = {
  pagamentoExternoId: string;
  status: StatusPagamentoGateway;
  metodo: string;
};

export type ConsultaOrderResultado = {
  status: StatusPagamentoGateway;
  metodo: string;
  externalReference: string | null;
};

/**
 * Interpreta o status efetivo de uma Order (fonte de verdade = transação de
 * pagamento). A prioridade é o payment interno (transactions.payments[0]);
 * se não existir, usa o status da própria order.
 */
export function interpretarStatusOrder(
  ordem: MpOrderResponse,
): StatusPagamentoGateway {
  const pagamento = ordem.transactions?.payments?.[0];

  if (pagamento) {
    const st = pagamento.status ?? "";
    const detail = pagamento.status_detail ?? "";

    // Aprovado/processado (accredited)
    if (st === "approved" || st === "processed" || detail === "accredited") {
      return "APPROVED";
    }
    // Rejeitado (cartão)
    if (st === "rejected" || detail.startsWith("cc_rejected")) {
      return "REJECTED";
    }
    // Cancelado/expirado
    if (
      st === "cancelled" ||
      st === "canceled" ||
      st === "expired" ||
      detail === "canceled"
    ) {
      return "CANCELLED";
    }
    // Reembolsado/chargeback
    if (st === "refunded" || st === "charged_back") {
      return "REFUNDED";
    }
    // pending | pending_waiting_transfer | pending_review_manual | authorized | in_process
    return "PENDING";
  }

  // Fallback: status da order
  const st = ordem.status ?? "";
  const detail = ordem.status_detail ?? "";
  if (st === "processed" || detail === "accredited") return "APPROVED";
  if (st === "canceled" || st === "cancelled" || st === "expired") return "CANCELLED";
  if (st === "refunded") return "REFUNDED";
  return "PENDING";
}

function extrairMetodo(ordem: MpOrderResponse): string {
  return ordem.transactions?.payments?.[0]?.payment_method?.id ?? "";
}

async function mpPost(
  path: string,
  body: Record<string, unknown>,
  idempotencyKey: string,
): Promise<{ response: MpOrderResponse; status: number }> {
  const t = token();
  if (!t) {
    throw new Error(
      "Mercado Pago não configurado (MERCADO_PAGO_ACCESS_TOKEN ausente).",
    );
  }

  const res = await fetch(`${MP_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
      // Idempotência no gateway: chave estável por operação.
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as MpOrderResponse;
  return { response: data, status: res.status };
}

/** Base comum do corpo de uma Order (modelo automático). */
function corpoOrder(params: {
  pedidoId: number;
  valor: number;
  emailComprador: string;
  payment: Record<string, unknown>;
}) {
  return {
    type: "online",
    processing_mode: "automatic",
    external_reference: String(params.pedidoId),
    total_amount: params.valor.toFixed(2),
    description: `Pedido #${params.pedidoId} — DAVI PRODUTOS`,
    payer: { email: params.emailComprador },
    transactions: {
      payments: [
        {
          amount: params.valor.toFixed(2),
          ...params.payment,
        },
      ],
    },
  };
}

/** Cria uma Order PIX e retorna o QR code + copia-e-cola. */
export async function criarPagamentoPix(
  params: CriarIntencaoParams,
): Promise<ResultadoPagamentoPix> {
  const { response, status } = await mpPost(
    "/v1/orders",
    corpoOrder({
      pedidoId: params.pedidoId,
      valor: params.valor,
      emailComprador: params.emailComprador,
      payment: {
        payment_method: { id: "pix", type: "bank_transfer" },
      },
    }),
    params.idempotencyKey,
  );

  if (status >= 400 || !response.id) {
    throw new Error(
      `Falha ao criar Order PIX (status ${status}). Verifique as credenciais de teste.`,
    );
  }

  const paymentMethod =
    response.transactions?.payments?.[0]?.payment_method ?? {};

  return {
    pagamentoExternoId: response.id,
    status: interpretarStatusOrder(response),
    metodo: paymentMethod.id ?? "pix",
    qrCode: paymentMethod.qr_code ?? null,
    qrCodeBase64: paymentMethod.qr_code_base64 ?? null,
  };
}

/** Cria uma Order de cartão a partir de um token (cartão já tokenizado no browser). */
export async function criarPagamentoCartao(
  params: CriarIntencaoParams & {
    tokenCartao: string;
    parcelas: number;
    issuerId?: string | null;
    idPagamentoCartao?: string | null;
  },
): Promise<ResultadoPagamentoCartao> {
  const payment: Record<string, unknown> = {
    payment_method: {
      id: params.idPagamentoCartao ?? undefined,
      type: "credit_card",
      token: params.tokenCartao,
      installments: params.parcelas,
    },
  };
  if (params.issuerId) payment.issuer_id = params.issuerId;

  const { response, status } = await mpPost(
    "/v1/orders",
    corpoOrder({
      pedidoId: params.pedidoId,
      valor: params.valor,
      emailComprador: params.emailComprador,
      payment,
    }),
    params.idempotencyKey,
  );

  if (status >= 400 || !response.id) {
    throw new Error(
      `Falha ao processar cartão (status ${status}). Verifique o token do cartão.`,
    );
  }

  return {
    pagamentoExternoId: response.id,
    status: interpretarStatusOrder(response),
    metodo: extrairMetodo(response) || "card",
  };
}

/** Consulta uma Order no Mercado Pago (fonte de verdade). */
export async function consultarOrder(
  orderId: string,
): Promise<ConsultaOrderResultado | null> {
  const t = token();
  if (!t) return null;

  const res = await fetch(
    `${MP_BASE}/v1/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${t}` } },
  );
  if (!res.ok) return null;

  const data = (await res.json()) as MpOrderResponse;
  return {
    status: interpretarStatusOrder(data),
    metodo: extrairMetodo(data),
    externalReference: data.external_reference ?? null,
  };
}

export const mercadoPago = {
  nome: "MercadoPago",
  criarPagamentoPix,
  criarPagamentoCartao,
  consultarOrder,
} as const;

