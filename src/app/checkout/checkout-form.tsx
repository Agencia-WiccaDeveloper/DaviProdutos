"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Copy, CreditCard, Loader2, MapPin, QrCode, Store, Truck } from "lucide-react";
import { finalizarPedido } from "@/app/actions/checkout";
import { cn, formatBRL } from "@/lib/utils";
import { CONFIG_FRETE, cidadePermitida, cepPermitido, calcularFrete } from "@/config/frete";

export type EnderecoSel = {
  id: number;
  destinatario: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
  areaPermitida?: boolean;
};

export type ResumoItem = {
  itemId: number;
  nome: string;
  quantidade: number;
  preco: number;
};

const etapas = ["Endereço", "Entrega", "Pagamento", "Revisão", "PIX"];

export function CheckoutForm({
  enderecos,
  itens,
  subtotal,
  frete,
  total,
}: {
  enderecos: EnderecoSel[];
  itens: ResumoItem[];
  subtotal: number;
  frete: number;
  total: number;
}) {
  const [passo, setPasso] = useState(0);
  const [enderecoId, setEnderecoId] = useState<number | null>(
    enderecos.find((e) => e.principal)?.id ?? enderecos[0]?.id ?? null,
  );
  const [pagamento, setPagamento] = useState("PIX");
  const [tipoEntrega, setTipoEntrega] = useState<"ENTREGA" | "RETIRADA">("ENTREGA");
  const [observacoes, setObservacoes] = useState("");
  const [estado, formAction, pending] = useActionState(finalizarPedido, {});

  const enderecoSel = enderecos.find((e) => e.id === enderecoId);
  const ehRetirada = tipoEntrega === "RETIRADA";

  // Frete usando config centralizada (subtotal em reais, converte para centavos)
  const subtotalCentavos = Math.round(subtotal * 100);
  const freteCalculado = calcularFrete(subtotalCentavos, tipoEntrega) / 100;
  const totalCalculado = subtotal + freteCalculado;

  const entregaDias = pagamento === "PIX" ? 3 : 5;
  const entrega = new Date();
  entrega.setDate(entrega.getDate() + entregaDias);

  // Validação de área de entrega
  const areaInvalida = enderecoSel && !ehRetirada && enderecoSel.areaPermitida === false;

  // PIX data returned from server action
  const pixData = estado.pixData;

  // Determina o passo atual: se há pixData e é PIX, mostra etapa 4 (PIX)
  const passoAtual = pixData && pagamento === "PIX" ? 4 : passo;

  // ===CHECKOUT-STEPPER===
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form action={formAction} className="lg:col-span-2">
        {/* Stepper */}
        <ol className="mb-5 flex items-center gap-1 text-xs font-semibold">
          {etapas.map((e, i) => (
            <li key={e} className="flex items-center gap-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  i < passoAtual
                    ? "bg-emerald-600 text-white"
                    : i === passoAtual
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-400",
                )}
              >
                {i < passoAtual ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn(i === passoAtual ? "text-brand-700" : "text-slate-400")}>
                {e}
              </span>
              {i < etapas.length - 1 ? (
                <span className="mx-1 h-px w-6 bg-slate-200" aria-hidden />
              ) : null}
            </li>
          ))}
        </ol>

        {estado.erro ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
          >
            {estado.erro}
          </p>
        ) : null}

        {areaInvalida && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
          >
            <strong>Atenção:</strong> O endereço selecionado ({enderecoSel?.cidade}/{enderecoSel?.estado}) está fora da nossa área de entrega (Jacareí, São José dos Campos, Caçapava).&nbsp;
            Selecione outro endereço ou escolha &apos;Retirar na loja&apos;.
          </p>
        )}

        <input type="hidden" name="addressId" value={enderecoId ?? ""} />
        <input type="hidden" name="tipoEntrega" value={tipoEntrega} />
        <input type="hidden" name="pagamento" value={pagamento} />
        <input type="hidden" name="observacoes" value={observacoes} />

        {/* Etapa 1 — Entrega ou Retirada */}
        {passoAtual === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-900">
              <MapPin className="h-5 w-5 text-brand-600" aria-hidden />
              Como você quer receber?
            </h2>

            {/* Seletor retirada/entrega */}
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoEntrega("ENTREGA")}
                className={cn(
                  "rounded-xl border p-3 text-center text-sm font-bold transition-colors",
                  !ehRetirada
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-brand-200",
                )}
              >
                <Truck className="mx-auto mb-1 h-5 w-5" aria-hidden />
                Receber em casa
              </button>
              <button
                type="button"
                onClick={() => setTipoEntrega("RETIRADA")}
                className={cn(
                  "rounded-xl border p-3 text-center text-sm font-bold transition-colors",
                  ehRetirada
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600 hover:border-emerald-200",
                )}
              >
                <Store className="mx-auto mb-1 h-5 w-5" aria-hidden />
                Retirar na loja
                <span className="block text-[10px] font-semibold text-emerald-600">
                  pronto em 2 horas
                </span>
              </button>
            </div>

            {ehRetirada ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Retirada na loja — sem frete</p>
                <p className="mt-1 text-xs">
                  Seu pedido fica pronto para retirada em até <strong>2 horas</strong>
                  . Você receberá um aviso quando estiver disponível.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {enderecos.map((e) => (
                  <li key={e.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                        enderecoId === e.id
                          ? "border-brand-400 bg-brand-50"
                          : e.areaPermitida === false
                            ? "border-amber-200 bg-amber-50 hover:border-amber-300"
                            : "border-slate-200 hover:border-brand-200",
                      )}
                    >
                      <input
                        type="radio"
                        name="enderecoRadio"
                        checked={enderecoId === e.id}
                        onChange={() => setEnderecoId(e.id)}
                        className="mt-1 accent-brand-600"
                        disabled={e.areaPermitida === false}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800">
                          {e.destinatario}
                          {e.principal ? (
                            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                              Principal
                            </span>
                          ) : null}
                          {!e.areaPermitida && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              Fora da área
                            </span>
                          )}
                        </span>
                        <span className="block text-sm text-slate-500">
                          {e.rua}, {e.numero}
                          {e.complemento ? ` — ${e.complemento}` : ""}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {e.bairro} · {e.cidade}/{e.estado} · {e.cep}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {/* Etapa 2 — Entrega / Retirada */}
        {passoAtual === 1 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-900">
              {ehRetirada ? (
                <Store className="h-5 w-5 text-emerald-600" aria-hidden />
              ) : (
                <Truck className="h-5 w-5 text-brand-600" aria-hidden />
              )}
              {ehRetirada ? "Retirada na loja" : "Entrega"}
            </h2>
            <div className="rounded-xl border border-slate-200 p-4">
              {ehRetirada ? (
                <>
                  <p className="text-sm font-semibold text-slate-800">
                    Retirada gratuita
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Seu pedido estará pronto em até{" "}
                    <strong className="text-emerald-700">2 horas</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Você será avisado por e-mail quando puder retirar.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">
                    Envio padrão
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Chega em {entregaDias} dias úteis por{" "}
                    <strong>
                      {freteCalculado === 0 ? "frete grátis" : formatBRL(freteCalculado)}
                    </strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Previsão: {entrega.toLocaleDateString("pt-BR")}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* Etapa 3 — Pagamento */}
        {passoAtual === 2 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-900">
              <CreditCard className="h-5 w-5 text-brand-600" aria-hidden />
              Pagamento
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(["PIX", "CARTAO", "ATENDENTE"] as const).map((p) => (
                <label
                  key={p}
                  className={cn(
                    "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-xl border p-4 text-center transition-colors",
                    pagamento === p
                      ? "border-brand-400 bg-brand-50"
                      : "border-slate-200 hover:border-brand-200",
                  )}
                >
                  <input
                    type="radio"
                    name="pagamentoRadio"
                    checked={pagamento === p}
                    onChange={() => setPagamento(p)}
                    className="accent-brand-600"
                  />
                  <span className="text-sm font-bold text-slate-800">
                    {p === "PIX"
                      ? "PIX"
                      : p === "CARTAO"
                        ? "Cartão"
                        : "Atendente"}
                  </span>
                  {p === "PIX" ? (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Aprovação imediata
                    </span>
                  ) : null}
                  {p === "ATENDENTE" ? (
                    <span className="text-[10px] font-semibold text-brand-600">
                      Combinar com a loja
                    </span>
                  ) : null}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Pagamento PIX e cartão via Mercado Pago · Atendente combina com a
              loja.
            </p>
          </div>
        ) : null}

        {/* Etapa 4 — Revisão */}
        {passoAtual === 3 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-display text-lg font-bold text-brand-900">
              Revisão do pedido
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {ehRetirada ? "Retirada" : "Entrega em"}
                </p>
                <p className="mt-1 text-slate-700">
                  {ehRetirada
                    ? "Retirar na loja (pronto em 2 horas)"
                    : `${enderecoSel?.destinatario} · ${enderecoSel?.rua}, ${enderecoSel?.numero}, ${enderecoSel?.bairro}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Pagamento
                </p>
                <p className="mt-1 text-slate-700">
                  {pagamento === "PIX"
                    ? "PIX"
                    : pagamento === "CARTAO"
                      ? "Cartão"
                      : "Atendente"}
                </p>
              </div>
              <div>
                <label
                  htmlFor="observacoes"
                  className="text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Observações (opcional)
                </label>
                <textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Etapa 5 — PIX QR Code (após confirmar pedido com PIX) */}
        {passoAtual === 4 && pixData ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-brand-900">
              <QrCode className="h-5 w-5 text-brand-600" aria-hidden />
              Pagamento via PIX
            </h2>

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700">
                Aguardando pagamento
              </span>
              {pixData.expiresAt ? (
                <span className="text-xs font-semibold text-slate-500">
                  Expira em {formatarTempoRestante(pixData.expiresAt)}
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              {pixData.qrCodeBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="mx-auto h-52 w-52 max-w-full rounded-lg"
                />
              ) : null}
              <button
                type="button"
                onClick={() => copiarPix(pixData.qrCode)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700"
              >
                <Copy className="h-4 w-4" aria-hidden /> Copiar código PIX
              </button>
              <p className="break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                {pixData.qrCode}
              </p>
              <p className="text-center text-xs text-slate-400">
                Após pagar, o status é atualizado automaticamente.
                <br />
                Você será redirecionado para a página do pedido em instantes.
              </p>
            </div>
          </div>
        ) : null}

        {/* Navegação */}
        <div className="mt-5 flex items-center justify-between">
          {passoAtual > 0 ? (
            <button
              type="button"
              onClick={() => setPasso((p) => p - 1)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              Voltar
            </button>
          ) : (
            <span />
          )}
          {passoAtual < 3 ? (
            <button
              type="button"
              onClick={() => {
                // Valida antes de avançar
                if (passoAtual === 0 && !ehRetirada && !enderecoId) return;
                if (passoAtual === 0 && !ehRetirada && enderecoSel?.areaPermitida === false) return;
                setPasso((p) => p + 1);
              }}
              disabled={passoAtual === 0 && (!ehRetirada && (!enderecoId || enderecoSel?.areaPermitida === false))}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              Continuar
            </button>
          ) : passoAtual === 3 ? (
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Confirmando…
                </>
              ) : (
                "Confirmar pedido"
              )}
            </button>
          ) : (
            <span />
          )}
        </div>
      </form>

      {/* Resumo lateral */}
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-lg font-bold tracking-wide text-brand-900">
          Resumo
        </h2>
        <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto">
          {itens.map((i) => (
            <li key={i.itemId} className="flex justify-between gap-2 text-sm">
              <span className="truncate text-slate-600">
                {i.quantidade}x {i.nome}
              </span>
              <span className="shrink-0 font-semibold text-slate-800">
                {formatBRL(i.preco * i.quantidade)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
          <p className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </p>
          <p className="flex justify-between text-slate-500">
            <span>Frete</span>
            <span>
              {freteCalculado === 0
                ? ehRetirada
                  ? "Grátis (retirada)"
                  : "Grátis"
                : formatBRL(freteCalculado)}
            </span>
          </p>
          <p className="flex justify-between pt-1 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatBRL(totalCalculado)}</span>
          </p>
        </div>
      </aside>
    </div>
  );
}

function formatarTempoRestante(ms: number): string {
  if (ms <= 0) return "expirado";
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

function copiarPix(qrCode: string | null) {
  if (!qrCode) return;
  navigator.clipboard.writeText(qrCode);
}