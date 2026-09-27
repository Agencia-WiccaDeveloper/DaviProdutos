"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { criarProduto, editarProduto } from "@/app/actions/admin-produtos";
import type { CategoriaResumo } from "@/services/categorias";
import { MensagemStatus } from "@/components/ui/mensagem-status";
import { cn } from "@/lib/utils";

type ValorInicial = {
  id?: number;
  nome: string;
  sku: string;
  categoryId: number;
  preco: string;
  precoPromocional: string;
  custo: string;
  estoque: number;
  estoqueMinimo: number;
  descricao: string;
  descricaoCurta: string;
  peso: string;
  ativo: boolean;
  destaque: boolean;
  imagens: string;
};

function Campo({
  id,
  label,
  tipo = "text",
  defaultValue,
  placeholder,
  metade,
  required,
}: {
  id: string;
  label: string;
  tipo?: string;
  defaultValue?: string | number;
  placeholder?: string;
  metade?: boolean;
  required?: boolean;
}) {
  return (
    <div className={cn(metade && "sm:col-span-1", !metade && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        step={tipo === "number" ? "0.01" : undefined}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

// ===FORM-PRODUTO-JSX===
export function FormProduto({
  categorias,
  valor,
}: {
  categorias: CategoriaResumo[];
  valor?: ValorInicial;
}) {
  const acao = valor?.id ? editarProduto : criarProduto;
  const [estado, formAction, pending] = useActionState(acao, {});
  const v = valor ?? ({} as ValorInicial);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
      {valor?.id ? <input type="hidden" name="id" value={valor.id} /> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo id="nome" label="Nome do produto" defaultValue={v.nome} required />
        <Campo id="sku" label="SKU" defaultValue={v.sku} required metade />

        <div className="sm:col-span-1">
          <label htmlFor="categoryId" className="mb-1 block text-xs font-semibold text-slate-700">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={v.categoryId}
            required
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <Campo id="preco" label="Preço (R$)" tipo="number" defaultValue={v.preco} required metade />
        <Campo id="precoPromocional" label="Preço promocional (R$)" tipo="number" defaultValue={v.precoPromocional} metade />
        <Campo id="custo" label="Custo (R$)" tipo="number" defaultValue={v.custo} metade />
        <Campo id="estoque" label="Estoque" tipo="number" defaultValue={v.estoque} required metade />
        <Campo id="estoqueMinimo" label="Estoque mínimo" tipo="number" defaultValue={v.estoqueMinimo} metade />
        <Campo id="peso" label="Peso (kg)" tipo="number" defaultValue={v.peso} metade />

        <div className="sm:col-span-2">
          <label htmlFor="descricaoCurta" className="mb-1 block text-xs font-semibold text-slate-700">
            Descrição curta
          </label>
          <input
            id="descricaoCurta"
            name="descricaoCurta"
            defaultValue={v.descricaoCurta}
            maxLength={300}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="descricao" className="mb-1 block text-xs font-semibold text-slate-700">
            Descrição completa
          </label>
          <textarea
            id="descricao"
            name="descricao"
            defaultValue={v.descricao}
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="imagens" className="mb-1 block text-xs font-semibold text-slate-700">
            URLs das imagens (uma por linha)
          </label>
          <textarea
            id="imagens"
            name="imagens"
            defaultValue={v.imagens}
            rows={3}
            placeholder={"https://exemplo.com/foto-1.jpg\nhttps://exemplo.com/foto-2.jpg"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex gap-5 sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="ativo" value="1" defaultChecked={v.ativo ?? true} className="h-4 w-4 accent-brand-600" />
            Produto ativo
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="destaque" value="1" defaultChecked={v.destaque ?? false} className="h-4 w-4 accent-brand-600" />
            Destaque na home
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Salvando…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden /> Salvar produto
          </>
        )}
      </button>
    </form>
  );
}
