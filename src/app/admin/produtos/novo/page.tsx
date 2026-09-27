import type { Metadata } from "next";
import { FormProduto } from "../form-produto";
import { listarTodasCategorias } from "@/services/admin-produtos";

export const metadata: Metadata = { title: "Novo produto — Admin" };

export default async function NovoProdutoPage() {
  const categorias = await listarTodasCategorias();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
        Novo produto
      </h1>
      <FormProduto categorias={categorias.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug }))} />
    </div>
  );
}
