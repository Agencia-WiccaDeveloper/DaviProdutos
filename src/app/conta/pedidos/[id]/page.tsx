import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Check } from "lucide-react";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import {
  addresses,
  orderItems,
  orderStatusHistory,
  orders,
} from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { formatBRL } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AcoesPedido } from "./acoes-pedido";
import { PagarPix } from "@/components/checkout/pagar-pix";
import { CardPaymentBrick } from "@/components/checkout/card-payment-brick";
import { expirarPixSeNecessario } from "@/services/integracoes/pagamento/processador";

export const metadata: Metadata = { title: "Detalhe do pedido" };

const passos = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const rotuloPasso: Record<string, string> = {
  PENDING: "Pedido realizado",
  CONFIRMED: "Pagamento confirmado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
};

const rotuloPagamento: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  APPROVED: "Pagamento aprovado",
  REJECTED: "Pagamento rejeitado",
  CANCELLED: "Pagamento cancelado",
  REFUNDED: "Pagamento estornado",
};

const corPagamento: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  REFUNDED: "bg-slate-200 text-slate-600",
};

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");
  const { id } = await params;
  const pedidoId = Number(id);

  const [pedidoInicial] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.id, pedidoId), eq(orders.userId, sessao.uid)))
    .limit(1);
  if (!pedidoInicial) notFound();

  // Expira o PIX se o prazo de 1 hora passou (idempotente).
  await expirarPixSeNecessario(pedidoInicial.id);

  const [pedido] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, pedidoId), eq(orders.userId, sessao.uid)))
    .limit(1);
  if (!pedido) notFound();

  const [endereco] = pedido.addressId
    ? await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, pedido.addressId))
        .limit(1)
    : [];

  const itens = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, pedido.id));

  const historico = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, pedido.id));

  const indiceAtual = passos.indexOf(pedido.status);
  const cancelado = pedido.status === "CANCELLED";
  const publicKeyMp = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? "";

  const statusPagamento = pedido.paymentStatus ?? "PENDING";
  const aguardandoPagamento =
    statusPagamento !== "APPROVED" && !cancelado;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-brand-900">
            Pedido #{pedido.id}
          </h2>
          <p className="text-xs text-slate-500">
            {new Date(pedido.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              corPagamento[statusPagamento] ?? corPagamento.PENDING,
            )}
          >
            {rotuloPagamento[statusPagamento] ?? rotuloPagamento.PENDING}
          </span>
          <AcoesPedido pedidoId={pedido.id} status={pedido.status} />
        </div>
      </div>

      {/* Bloco de pagamento (PIX / Cartão) */}
      {aguardandoPagamento && pedido.pagamento === "PIX" ? (
        <PagarPix
          qrCode={pedido.paymentQrCode ?? null}
          qrCodeBase64={pedido.paymentQrCode64 ?? null}
          status={statusPagamento}
          expiresAt={pedido.paymentExpiresAt}
          pedidoId={pedido.id}
        />
      ) : null}

      {aguardandoPagamento && pedido.pagamento === "CARTAO" ? (
        <CardPaymentBrick
          publicKey={publicKeyMp}
          orderId={pedido.id}
          amount={Number(pedido.total)}
        />
      ) : null}

      {aguardandoPagamento && pedido.pagamento === "ATENDENTE" ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-700">
          Pagamento combinado com o atendente da loja. Nossa equipe entrará em
          contato para concluir sua compra.
        </div>
      ) : null}

      {statusPagamento === "REJECTED" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Pagamento recusado. Você pode tentar novamente ou entrar em contato com
          o suporte.
        </div>
      ) : null}

      {/* Timeline */}
      {!cancelado ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ol className="space-y-4">
            {passos.map((passo, i) => {
              const concluido = i <= indiceAtual;
              const atual = i === indiceAtual;
              const dataStatus = historico.find((h) => h.status === passo);
              return (
                <li key={passo} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        concluido
                          ? atual
                            ? "bg-brand-600 text-white ring-4 ring-brand-100"
                            : "bg-brand-500 text-white"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {concluido ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                    </span>
                    {i < passos.length - 1 ? (
                      <span
                        className={cn(
                          "h-8 w-px",
                          i < indiceAtual ? "bg-brand-500" : "bg-slate-200",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className="pb-1">
                    <p
                      className={cn(
                        "text-sm",
                        concluido ? "font-semibold text-slate-800" : "text-slate-400",
                      )}
                    >
                      {rotuloPasso[passo]}
                    </p>
                    {dataStatus ? (
                      <p className="text-xs text-slate-400">
                        {new Date(dataStatus.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
          Pedido cancelado.
          {historico.find((h) => h.status === "CANCELLED") ? (
            <span className="ml-2 font-normal text-rose-600">
              em{" "}
              {new Date(
                historico.find((h) => h.status === "CANCELLED")!.createdAt,
              ).toLocaleDateString("pt-BR")}
            </span>
          ) : null}
        </div>
      )}

      {/* Itens */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Itens do pedido</h3>
        <ul className="divide-y divide-slate-100">
          {itens.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {item.nomeProduto}
                </p>
                <p className="text-xs text-slate-400">
                  {item.quantidade}x · {formatBRL(item.precoUnitario)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-slate-900">
                {formatBRL(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
          <p className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatBRL(pedido.subtotal)}</span>
          </p>
          <p className="flex justify-between text-slate-500">
            <span>Desconto</span>
            <span>- {formatBRL(pedido.desconto)}</span>
          </p>
          <p className="flex justify-between text-slate-500">
            <span>Frete</span>
            <span>{Number(pedido.frete) === 0 ? "Grátis" : formatBRL(pedido.frete)}</span>
          </p>
          <p className="flex justify-between pt-1 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatBRL(pedido.total)}</span>
          </p>
        </div>
      </div>

      {/* Entrega/Retirada + pagamento */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-700">
            {pedido.tipoEntrega === "RETIRADA"
              ? "Retirada na loja"
              : "Endereço de entrega"}
          </h3>
          {pedido.tipoEntrega === "RETIRADA" ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Retirada gratuita — pedido pronto em até 2 horas.
              </p>
              {pedido.pickupCode ? (
                <div className="rounded-xl bg-slate-900 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Código de retirada
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold tracking-widest text-white">
                    {pedido.pickupCode}
                  </p>
                </div>
              ) : null}
            </div>
          ) : endereco ? (
            <>
              <p className="text-sm text-slate-600">{endereco.destinatario}</p>
              <p className="text-sm text-slate-500">
                {endereco.rua}, {endereco.numero}
              </p>
              <p className="text-sm text-slate-500">
                {endereco.bairro}, {endereco.cidade}/{endereco.estado}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Endereço não informado.</p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-700">Pagamento</h3>
          <p className="text-sm text-slate-600">
            {pedido.pagamento === "PIX"
              ? "PIX"
              : pedido.pagamento === "CARTAO"
                ? "Cartão"
                : pedido.pagamento === "BOLETO"
                  ? "Boleto"
                  : pedido.pagamento === "ATENDENTE"
                    ? "Atendente da loja"
                    : "—"}
          </p>
          <span
            className={cn(
              "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
              corPagamento[statusPagamento] ?? corPagamento.PENDING,
            )}
          >
            {rotuloPagamento[statusPagamento] ?? rotuloPagamento.PENDING}
          </span>
          {pedido.paymentExternalId ? (
            <p className="mt-2 text-xs text-slate-400">
              ID pagamento: {pedido.paymentExternalId}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
