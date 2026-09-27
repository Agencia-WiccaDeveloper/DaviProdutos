"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { MensagemStatus } from "@/components/ui/mensagem-status";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAX = 300 * 1024;

type Props = {
  acao: (
    anterior: { sucesso?: string; erro?: string },
    formData: FormData,
  ) => Promise<{ sucesso?: string; erro?: string }>;
  nome: string;
  telefone: string;
  cpf: string;
  avatar: string;
};

export function FormDados({ acao, nome, telefone, cpf, avatar }: Props) {
  const [estado, formAction, pending] = useActionState(acao, {});
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(avatar ?? "");
  const [erroImagem, setErroImagem] = useState<string | null>(null);

  useEffect(() => {
    if (estado.sucesso && formRef.current) {
      formRef.current.reset();
      formRef.current
        .querySelector<HTMLInputElement>("#nome")
        ?.focus();
    }
  }, [estado.sucesso]);

  function aoSelecionar(arquivo: File | undefined) {
    setErroImagem(null);
    if (!arquivo) return;
    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setErroImagem("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (arquivo.size > TAMANHO_MAX) {
      setErroImagem("Imagem muito grande (máx. 300KB).");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => setPreview(String(leitor.result));
    leitor.readAsDataURL(arquivo);
  }

  function removerFoto() {
    setPreview("");
    setErroImagem(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-5 space-y-3"
    >
      <MensagemStatus sucesso={estado.sucesso} erro={estado.erro} />

      <div>
        <label htmlFor="nome" className="mb-1 block text-xs font-semibold text-slate-700">
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={nome}
          required
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="telefone" className="mb-1 block text-xs font-semibold text-slate-700">
            Telefone
          </label>
          <input
            id="telefone"
            name="telefone"
            defaultValue={telefone}
            placeholder="(11) 99999-0000"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="cpf" className="mb-1 block text-xs font-semibold text-slate-700">
            CPF
          </label>
          <input
            id="cpf"
            name="cpf"
            defaultValue={cpf}
            placeholder="000.000.000-00"
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700">
          Foto de perfil
        </label>
        <div className="flex items-center gap-3">
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-brand-100">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Pré-visualização da foto"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">
                {nome.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400"
              >
                <Camera className="h-4 w-4" aria-hidden /> Escolher foto
              </button>
              {preview ? (
                <button
                  type="button"
                  onClick={removerFoto}
                  className="flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Remover
                </button>
              ) : null}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              JPG, PNG ou WEBP · máx. 300KB
            </p>
            {erroImagem ? (
              <p className="mt-0.5 text-[11px] font-semibold text-rose-600">
                {erroImagem}
              </p>
            ) : null}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => aoSelecionar(e.target.files?.[0])}
        />
        <input type="hidden" name="avatar" value={preview} />
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
          "Salvar alterações"
        )}
      </button>
    </form>
  );
}
