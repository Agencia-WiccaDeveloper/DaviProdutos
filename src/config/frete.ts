/**
 * Configurações centralizadas de frete e áreas de entrega.
 * Evita hardcode espalhado pelo código.
 */

export const CONFIG_FRETE = {
  /** Valor mínimo do pedido para frete grátis (em centavos = R$ 100,00) */
  VALOR_MINIMO_FRETE_GRATIS: 10000,

  /** Valor do frete padrão (em centavos = R$ 19,90) */
  VALOR_FRETE_PADRAO: 1990,
} as const;

/** Cidades permitidas para entrega (normalizadas: minúsculas, sem acentos) */
export const CIDADES_ENTREGA_PERMITIDAS = [
  "jacarei",
  "sao jose dos campos",
  "cacapava",
] as const;

/** CEPs iniciais das cidades permitidas (para validação por CEP) */
export const CEP_PREFIXOS_PERMITIDOS = [
  // Jacareí: 12300-000 a 12349-999
  "1230", "1231", "1232", "1233", "1234",
  // São José dos Campos: 12200-000 a 12249-999
  "1220", "1221", "1222", "1223", "1224",
  // Caçapava: 12280-000 a 12289-999
  "1228",
] as const;

/** Normaliza nome da cidade para comparação */
export function normalizarCidade(cidade: string): string {
  return cidade
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim();
}

/** Verifica se a cidade está na área de entrega permitida */
export function cidadePermitida(cidade: string): boolean {
  const normalizada = normalizarCidade(cidade);
  return CIDADES_ENTREGA_PERMITIDAS.includes(normalizada as (typeof CIDADES_ENTREGA_PERMITIDAS)[number]);
}

/** Verifica se o CEP está na área de entrega permitida (pelos 4 primeiros dígitos) */
export function cepPermitido(cep: string): boolean {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length < 4) return false;
  const prefixo = limpo.substring(0, 4);
  return CEP_PREFIXOS_PERMITIDOS.includes(prefixo as (typeof CEP_PREFIXOS_PERMITIDOS)[number]);
}

/** Calcula frete baseado no subtotal (em centavos) e tipo de entrega */
export function calcularFrete(subtotalCentavos: number, tipoEntrega: "ENTREGA" | "RETIRADA"): number {
  if (tipoEntrega === "RETIRADA") return 0;
  if (subtotalCentavos >= CONFIG_FRETE.VALOR_MINIMO_FRETE_GRATIS) return 0;
  return CONFIG_FRETE.VALOR_FRETE_PADRAO;
}

/** Formata valor em centavos para BRL */
export function formatarBRL(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}