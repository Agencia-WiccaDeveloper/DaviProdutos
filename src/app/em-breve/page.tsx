"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmBrevePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao fazer login");
        return;
      }

      // Redireciona para onde o usuário queria ir (ou home)
      router.push(redirectTo);
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh flex-col bg-slate-50">
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Container className="w-full max-w-md">
            <div className="text-center mb-8">
              <Logo />
              <h1 className="mt-6 text-3xl font-bold text-slate-900">Lançamento em breve</h1>
              <p className="mt-3 text-slate-500">
                Estamos preparando tudo com carinho para você.
                <br />
                A loja abrirá em breve!
              </p>
            </div>

            {/* Área de login admin */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                <AlertCircle className="h-4 w-4" aria-hidden />
                <span>Acesso administrativo</span>
              </div>

              <p className="mb-4 text-center text-sm text-slate-500">
                Se você é administrador, faça login para acessar o site completo.
              </p>

              {erro && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                  {erro}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@daviprodutos.com.br"
                    className="mt-1"
                    required
                    disabled={carregando}
                  />
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
                    Senha
                  </label>
                  <Input
                    id="senha"
                    type="password"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                    required
                    disabled={carregando}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={carregando}>
                  {carregando ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                      Entrando...
                    </>
                  ) : (
                    "Acessar painel admin"
                  )}
                </Button>
              </form>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden />
                Área restrita para administradores
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              DAVI PRODUTOS — Lavagem e Estética Automotiva
            </p>
          </Container>
        </main>
      </body>
    </html>
  );
}