import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FormRedefinicao } from "./form-redefinicao";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <KeyRound className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-wide text-brand-900">
            Redefinir senha
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma nova senha para a sua conta.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {token ? (
            <FormRedefinicao token={token} />
          ) : (
            <p className="text-center text-sm text-slate-500">
              Link inválido.{" "}
              <Link href="/recuperar-senha" className="font-semibold text-brand-700 hover:underline">
                Solicite um novo link
              </Link>
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
