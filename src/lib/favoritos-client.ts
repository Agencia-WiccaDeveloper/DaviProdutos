"use client";

/* Loja de favoritos baseada em localStorage, observável via useSyncExternalStore.
   Compartilhada entre o ProductCard e a página do produto. */
const CHAVE_FAVORITOS = "davi_favoritos";

let cache = { raw: "[]", ids: [] as number[] };
const listeners = new Set<() => void>();

function notificar() {
  listeners.forEach((l) => l());
}

function lerSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  const raw = localStorage.getItem(CHAVE_FAVORITOS) ?? "[]";
  if (raw !== cache.raw) {
    try {
      cache = { raw, ids: JSON.parse(raw) as number[] };
    } catch {
      cache = { raw: "[]", ids: [] };
    }
  }
  return cache.raw;
}

export function idsFavoritos(): number[] {
  lerSnapshot();
  return cache.ids;
}

export function inscreverFavoritos(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function alternarFavorito(produtoId: number): boolean {
  const atuais = idsFavoritos();
  const ativo = atuais.includes(produtoId);
  const proximos = ativo
    ? atuais.filter((id) => id !== produtoId)
    : [...atuais, produtoId];
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(proximos));
  notificar();
  return !ativo;
}
