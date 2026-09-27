import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes condicionais com resolução de conflitos Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata valores monetários para BRL. */
export function formatBRL(valor: number | string) {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

/** Calcula o percentual de desconto entre preço cheio e promocional. */
export function discountPercent(
  preco: string | number,
  promocional: string | number | null,
) {
  if (!promocional) return 0;
  const cheio = Number(preco);
  const promo = Number(promocional);
  if (!cheio || promo >= cheio) return 0;
  return Math.round(((cheio - promo) / cheio) * 100);
}
