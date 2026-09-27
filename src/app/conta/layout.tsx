import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { lerSessao } from "@/lib/auth";
import { NavConta } from "./nav-conta";

export default async function ContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");

  return (
    <Container className="py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
          Minha conta
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Olá, <strong className="text-slate-700">{sessao.nome}</strong> ·{" "}
          {sessao.email}
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <NavConta />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
