import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { lerCarrinho, precoUnitario, subtotalItem } from "@/services/carrinho";
import { formatBRL } from "@/lib/utils";
import { removerDoCarrinho } from "@/app/actions/carrinho";
import { QuantidadeControle } from "./quantidade-controle";

export const metadata: Metadata = { title: "Carrinho" };

const FRETE_GRATIS_ACIMA = 199;
const FRETE_PADRAO = 19.9;

export default async function CarrinhoPage() {
  const itens = await lerCarrinho();
  const subtotal = itens.reduce((soma, i) => soma + subtotalItem(i), 0);
  const frete =
    subtotal >= FRETE_GRATIS_ACIMA ? 0 : itens.length > 0 ? FRETE_PADRAO : 0;
  const total = subtotal + frete;

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
        Seu carrinho
      </h1>

      {itens.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos para vê-los aqui."
        >
          <Link href="/produtos" className="inline-block">
            <Button size="lg">Ver produtos</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ul className="space-y-3">
              {itens.map((item) => (
                <li
                  key={item.itemId}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
                >
                  <Link
                    href={`/produtos/${item.slug}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24"
                  >
                    {item.imagem ? (
                      <Image
                        src={item.imagem}
                        alt={item.nome}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produtos/${item.slug}`}
                        className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-brand-700"
                      >
                        {item.nome}
                      </Link>
                      <form action={removerDoCarrinho.bind(null, item.itemId)}>
                        <button
                          type="submit"
                          aria-label={`Remover ${item.nome}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </form>
                    </div>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      SKU {item.sku}
                    </p>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                      <QuantidadeControle
                        itemId={item.itemId}
                        quantidade={item.quantidade}
                        estoque={item.estoque}
                      />
                      <div className="text-right">
                        {item.precoPromocional ? (
                          <span className="block text-xs text-slate-400 line-through">
                            {formatBRL(item.preco)}
                          </span>
                        ) : null}
                        <span className="font-bold text-slate-900">
                          {formatBRL(precoUnitario(item))}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          Subtotal:{" "}
                          <strong className="text-slate-600">
                            {formatBRL(subtotalItem(item))}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Resumo */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-lg font-bold tracking-wide text-brand-900">
              Resumo
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </p>
              <p className="flex justify-between text-slate-500">
                <span>Frete</span>
                <span>
                  {frete === 0 ? (
                    <span className="font-semibold text-emerald-600">Grátis</span>
                  ) : (
                    formatBRL(frete)
                  )}
                </span>
              </p>
              {frete > 0 ? (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
                  Faltam {formatBRL(FRETE_GRATIS_ACIMA - subtotal)} para frete
                  grátis!
                </p>
              ) : null}
              <p className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatBRL(total)}</span>
              </p>
            </div>

            <Link href="/checkout" className="mt-5 block">
              <Button size="lg" className="w-full">
                Finalizar compra
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Link
              href="/produtos"
              className="mt-3 block text-center text-sm font-semibold text-brand-700 hover:underline"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
