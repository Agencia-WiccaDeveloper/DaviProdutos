import "server-only";

/**
 * Tipos compartilhados para integrações de pagamento.
 * Este arquivo NÃO importa código de banco/React e é seguro para uso
 * somente no servidor (server actions, route handlers, services).
 */

export type MetodoPagamento = "PIX" | "CARTAO";

export type StatusPagamentoGateway =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED"
  | "IN_PROCESS";

/** Contrato que qualquer gateway (Mercado Pago, Stripe, etc.) deve implementar. */
export interface ProvedorPagamento {
  readonly nome: string;

  /**
   * Cria uma intenção de pagamento (preference/checkout) no gateway.
   * Retorna a URL para onde o cliente deve ser redirecionado.
   */
  criarIntencao(params: CriarIntencaoParams): Promise<IntencaoPagamento>;

  /**
   * Verifica o status de um pagamento no gateway.
   * Usado pelo webhook e por checagens manuais (fallback).
   */
  consultarStatus(pagamentoExternoId: string): Promise<StatusPagamentoGateway>;
}

export type CriarIntencaoParams = {
  /** ID interno do pedido (usado como referência externa). */
  pedidoId: number;
  /** Chave de idempotência para evitar cobranças duplicadas. */
  idempotencyKey: string;
  valor: number; // em reais (decimal)
  metodo: MetodoPagamento;
  /** E-mail do comprador (para exibição no checkout do gateway). */
  emailComprador: string;
};

export type IntencaoPagamento = {
  /** ID da preference/payment no gateway. */
  pagamentoExternoId: string;
  /** URL de checkout/redirecionamento do gateway. */
  urlCheckout: string;
};

/** Payload recebido do webhook do gateway (normalizado). */
export type EventoWebhookPagamento = {
  provider: string;
  pagamentoExternoId: string;
  status: StatusPagamentoGateway;
  /** Idempotência do evento — útil para processar o webhook uma única vez. */
  idEvento: string;
  raw?: unknown;
};
