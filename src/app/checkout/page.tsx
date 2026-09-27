import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { db } from "@/db";
import { asc, eq } from "drizzle-orm";
import { addresses } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { lerCarrinho, precoUnitario, subtotalItem } from "@/services/carrinho";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar?proximo=/checkout");

  const [itens, enderecos] = await Promise.all([
    lerCarrinho(),
    db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, sessao.uid))
      .orderBy(asc(addresses.id)),
  ]);

  if (itens.length === 0) redirect("/carrinho");

  const subtotal = itens.reduce((soma, i) => soma + subtotalItem(i), 0);
  const frete = subtotal >= 199 ? 0 : 19.9;
  const total = subtotal + frete;

  return (
    <Container className="py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
        Finalizar compra
      </h1>

      <CheckoutForm
        enderecos={enderecos.map((e) => ({
          id: e.id,
          destinatario: e.destinatario,
          rua: e.rua,
          numero: e.numero,
          complemento: e.complemento ?? "",
          bairro: e.bairro,
          cidade: e.cidade,
          estado: e.estado,
          cep: e.cep,
          principal: e.principal,
        }))}
        itens={itens.map((i) => ({
          itemId: i.itemId,
          nome: i.nome,
          quantidade: i.quantidade,
          preco: precoUnitario(i),
        }))}
        subtotal={subtotal}
        frete={frete}
        total={total}
      />
    </Container>
  );
}
