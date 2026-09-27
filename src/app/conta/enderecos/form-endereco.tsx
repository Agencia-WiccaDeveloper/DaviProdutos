"use client";

import { useActionState, useState } from "react";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { criarEndereco, editarEndereco } from "@/app/actions/enderecos";
import { MensagemStatus } from "@/components/ui/mensagem-status";
import { cn } from "@/lib/utils";

type EnderecoBasico = {
  id?: number;
  destinatario: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia: string;
};

type Props =
  | { modo: "criar"; endereco?: undefined }
  | { modo: "editar"; endereco: EnderecoBasico };

/** Busca o endereço a partir do CEP (ViaCEP). */
async function buscarCep(cep: string) {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    const dados = (await res.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (dados.erro || !dados.logradouro) return null;
    return dados;
  } catch {
    return null;
  }
}

function CampoContolado({
  id,
  nome,
  label,
  value,
  onChange,
  placeholder,
  required = true,
  metade,
  maxLength,
}: {
  id: string;
  nome: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  metade?: boolean;
  maxLength?: number;
}) {
  return (
    <div className={cn(metade && "sm:col-span-1", !metade && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={nome}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

const mascaraCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

// ===FORM-ENDERECO-MAIN===
export function FormEndereco(props: Props) {
  const [aberto, setAberto] = useState(props.modo === "criar");
  const acao = props.modo === "editar" ? editarEndereco : criarEndereco;
  const [estado, formAction, pending] = useActionState(acao, {});

  const [destinatario, setDestinatario] = useState(props.endereco?.destinatario ?? "");
  const [cep, setCep] = useState(props.endereco?.cep ?? "");
  const [rua, setRua] = useState(props.endereco?.rua ?? "");
  const [numero, setNumero] = useState(props.endereco?.numero ?? "");
  const [complemento, setComplemento] = useState(props.endereco?.complemento ?? "");
  const [bairro, setBairro] = useState(props.endereco?.bairro ?? "");
  const [cidade, setCidade] = useState(props.endereco?.cidade ?? "");
  const [uf, setUf] = useState(props.endereco?.estado ?? "");
  const [referencia, setReferencia] = useState(props.endereco?.referencia ?? "");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepMsg, setCepMsg] = useState<string | null>(null);

  // Modal fecha automaticamente quando a ação foi concluída com sucesso.
  const modalVisivel = aberto && !estado.sucesso;

  async function aoDigitarCep(valorCep: string) {
    setCep(valorCep);
    setCepMsg(null);
    const limpo = valorCep.replace(/\D/g, "");
    if (limpo.length === 8) {
      setBuscandoCep(true);
      const dados = await buscarCep(valorCep);
      setBuscandoCep(false);
      if (dados) {
        setRua(dados.logradouro ?? "");
        setBairro(dados.bairro ?? "");
        setCidade(dados.localidade ?? "");
        setUf(dados.uf ?? "");
        setCepMsg("Endereço preenchido automaticamente.");
      } else {
        setCepMsg("CEP não encontrado.");
      }
    }
  }

  return (
    <>
      {props.modo === "editar" ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" aria-hidden /> Adicionar endereço
        </button>
      )}

      {modalVisivel ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold tracking-wide text-brand-900">
                {props.modo === "editar" ? "Editar endereço" : "Novo endereço"}
              </h3>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-3">
              <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />
              {props.modo === "editar" ? (
                <input type="hidden" name="id" value={props.endereco.id} />
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* ===CAMPOS-ENDERECO=== */}
                <CampoContolado id="destinatario" nome="destinatario" label="Destinatário" value={destinatario} onChange={setDestinatario} />

                <div className="sm:col-span-1">
                  <label htmlFor="cep" className="mb-1 block text-xs font-semibold text-slate-700">CEP</label>
                  <div className="relative">
                    <input
                      id="cep"
                      name="cep"
                      value={cep}
                      onChange={(e) => aoDigitarCep(mascaraCep(e.target.value))}
                      placeholder="00000-000"
                      required
                      maxLength={9}
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    {buscandoCep ? (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-brand-600" aria-hidden />
                    ) : null}
                  </div>
                  {cepMsg ? (
                    <p className={cn("mt-1 text-[11px] font-semibold", cepMsg.includes("preenchido") ? "text-emerald-600" : "text-amber-600")}>
                      {cepMsg}
                    </p>
                  ) : null}
                </div>

                <CampoContolado id="rua" nome="rua" label="Rua" value={rua} onChange={setRua} />
                <CampoContolado id="numero" nome="numero" label="Número" value={numero} onChange={setNumero} metade />
                <CampoContolado id="complemento" nome="complemento" label="Complemento (opcional)" value={complemento} onChange={setComplemento} required={false} metade />
                <CampoContolado id="bairro" nome="bairro" label="Bairro" value={bairro} onChange={setBairro} />
                <CampoContolado id="cidade" nome="cidade" label="Cidade" value={cidade} onChange={setCidade} metade />
                <CampoContolado id="estado" nome="estado" label="UF" value={uf} onChange={(v) => setUf(v.toUpperCase())} placeholder="SP" metade maxLength={2} />
                <CampoContolado id="referencia" nome="referencia" label="Referência (opcional)" value={referencia} onChange={setReferencia} required={false} />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Salvando…
                  </>
                ) : props.modo === "editar" ? (
                  "Salvar alterações"
                ) : (
                  "Adicionar endereço"
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
