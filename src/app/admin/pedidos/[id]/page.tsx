import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarAdminPedido } from "@/services/admin-crud";
import { formatBRL } from "@/lib/utils";
import { FormStatusPedido } from "./form-status";
import { FormRetirada } from "./form-retirada";

export const metadata: Metadata = { title: "Detalhe do pedido — Admin" };

export default async function AdminPedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dados = await buscarAdminPedido(Number(id));
  if (!dados) notFound();
  const { pedido, itens } = dados;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Pedido #{pedido.id}
        </h1>
        <p className="text-sm text-slate-500">
          {pedido.cliente} · {pedido.email} ·{" "}
          {new Date(pedido.createdAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-slate-700">Itens</h2>
          <ul className="divide-y divide-slate-100">
            {itens.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-800">{i.nomeProduto}</p>
                  <p className="text-xs text-slate-400">
                    {i.quantidade}x · {i.sku}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-900">
                  {formatBRL(i.subtotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <p className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>{formatBRL(pedido.subtotal)}</span>
            </p>
            <p className="flex justify-between text-slate-500">
              <span>Desconto</span><span>- {formatBRL(pedido.desconto)}</span>
            </p>
            <p className="flex justify-between text-slate-500">
              <span>Frete</span><span>{Number(pedido.frete) === 0 ? "Grátis" : formatBRL(pedido.frete)}</span>
            </p>
            <p className="flex justify-between pt-1 text-base font-bold text-slate-900">
              <span>Total</span><span>{formatBRL(pedido.total)}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-bold text-slate-700">
              {pedido.tipoEntrega === "RETIRADA"
                ? "Retirada na loja"
                : "Endereço de entrega"}
            </h2>
            {pedido.tipoEntrega === "RETIRADA" ? (
              <p className="text-sm text-slate-600">
                Retirada gratuita — pedido pronto em até 2 horas.
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  {pedido.endereco?.destinatario ?? "—"}
                </p>
                <p className="text-sm text-slate-500">
                  {pedido.endereco?.rua ?? ""}, {pedido.endereco?.numero ?? ""}
                  {pedido.endereco?.complemento
                    ? ` — ${pedido.endereco.complemento}`
                    : ""}
                </p>
                <p className="text-sm text-slate-500">
                  {pedido.endereco?.bairro ?? ""}, {pedido.endereco?.cidade ?? ""}/
                  {pedido.endereco?.estado ?? ""}
                </p>
                <p className="text-xs text-slate-400">
                  CEP {pedido.endereco?.cep ?? "—"}
                </p>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-bold text-slate-700">Pagamento</h2>
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
            <p className="mt-1 text-sm text-slate-600">
              Status:{" "}
              <span className="font-semibold">
                {pedido.paymentStatus ?? "PENDING"}
              </span>
            </p>
            {pedido.paymentProvider ? (
              <p className="mt-1 text-xs text-slate-400">
                Provedor: {pedido.paymentProvider}
              </p>
            ) : null}
            {pedido.paymentExternalId ? (
              <p className="mt-1 text-xs text-slate-400">
                ID pagamento: {pedido.paymentExternalId}
              </p>
            ) : null}
            {pedido.observacoes ? (
              <p className="mt-2 text-xs text-slate-500">Obs: {pedido.observacoes}</p>
            ) : null}
          </div>
          <FormStatusPedido pedidoId={pedido.id} statusAtual={pedido.status} />
          {pedido.tipoEntrega === "RETIRADA" ? (
            <FormRetirada
              pedidoId={pedido.id}
              pickupCode={pedido.pickupCode ?? null}
              jaRetirado={!!pedido.pickupAt}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
