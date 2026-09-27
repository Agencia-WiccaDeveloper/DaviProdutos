import "server-only";

/**
 * Serviço de e-mail transacional (abstração server-side).
 * A implementação real (Resend/SMTP/etc.) virá na próxima etapa;
 * aqui definimos apenas o contrato e o ponto único de entrada.
 *
 * Nenhum segredo (RESEND_API_KEY) é lido aqui — apenas o `from`
 * via variável de ambiente não-secreta (EMAIL_FROM).
 */

export type TemplateEmail =
  | "cadastro"
  | "recuperacao-senha"
  | "pedido-realizado"
  | "pagamento-aprovado"
  | "pedido-enviado"
  | "pedido-entregue";

export type EnviarEmailParams = {
  para: string;
  assunto: string;
  html: string;
  template: TemplateEmail;
};

export interface ServicoEmail {
  enviar(params: EnviarEmailParams): Promise<void>;
}

/** Remetente padrão configurável via EMAIL_FROM (não é segredo). */
export function remetentePadrao(): string {
  return process.env.EMAIL_FROM ?? "DAVI PRODUTOS <noreply@localhost>";
}

/**
 * Placeholder do serviço: em produção será substituído pela implementação
 * real (Resend). Por enquanto, apenas registra o e-mail em dev.
 */
export const servicoEmail: ServicoEmail = {
  async enviar(params) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[e-mail][${params.template}] para=${params.para} assunto="${params.assunto}"`);
      return;
    }
    // Em produção, sem provedor configurado, não falha silenciosamente no fluxo.
    console.warn(`[e-mail] provedor não configurado — e-mail "${params.template}" não enviado.`);
  },
};
