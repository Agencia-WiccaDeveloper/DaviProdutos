import "server-only";

/**
 * Barreira de integrações do DAVI PRODUTOS.
 * Tudo aqui é server-side; não importe este módulo em Client Components.
 */
export * from "./pagamento/provedor";
export * from "./email/servico";
export * from "./pagamento/mercado-pago";
export * from "./pagamento/processador";
