"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn, formatBRL } from "@/lib/utils";

type Sugestao = {
  id: number;
  nome: string;
  slug: string;
  preco: string;
  precoPromocional: string | null;
  estoque: number;
  categoria: string;
  imagem: string | null;
};

type SearchBarProps = {
  className?: string;
  placeholder?: string;
};

/** Busca do site com sugestões instantâneas (autocomplete). */
export function SearchBar({
  className,
  placeholder = "Busque shampoos, ceras, kits...",
}: SearchBarProps) {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = termo.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setCarregando(true);
        const res = await fetch(
          `/api/busca?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as { produtos: Sugestao[] };
        setSugestoes(data.produtos ?? []);
      } catch {
        /* requisição cancelada */
      } finally {
        setCarregando(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [termo]);

  function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    setAberto(false);
    const q = termo.trim();
    router.push(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
  }

  return (
    <div
      className={cn("relative w-full", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setAberto(false);
        }
      }}
      ref={containerRef}
    >
      <form role="search" onSubmit={enviar}>
        <label htmlFor="busca-site" className="sr-only">
          Buscar produtos
        </label>
        <input
          id="busca-site"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={termo}
          onChange={(e) => {
            const v = e.target.value;
            setTermo(v);
            setAberto(true);
            if (v.trim().length < 2) {
              setSugestoes([]);
              setCarregando(false);
            }
          }}
          onFocus={() => setAberto(true)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 text-sm text-slate-800 outline-none transition-[background-color,border-color,box-shadow] placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 p-2 text-white transition-all hover:bg-brand-700 active:scale-90"
        >
          <Search className="h-4 w-4" aria-hidden />
        </button>
      </form>

      {/* Sugestões */}
      {aberto && termo.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {carregando ? (
            <p className="flex items-center gap-2 px-4 py-4 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden />
              Buscando…
            </p>
          ) : sugestoes.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">
              Nada encontrado para “{termo}”.
            </p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
              {sugestoes.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/produtos/${s.slug}`}
                    onClick={() => setAberto(false)}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-brand-50"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {s.imagem ? (
                        <Image
                          src={s.imagem}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {s.nome}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {s.categoria} · SKU {s.estoque > 0 ? "disponível" : "esgotado"}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-brand-700">
                      {formatBRL(s.precoPromocional ?? s.preco)}
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => enviar()}
                  className="w-full bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Ver todos os resultados para “{termo.trim()}”
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
