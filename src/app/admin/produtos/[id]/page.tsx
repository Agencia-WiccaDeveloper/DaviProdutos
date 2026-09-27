import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormProduto } from "../form-produto";
import { buscarAdminProduto, listarTodasCategorias } from "@/services/admin-produtos";

export const metadata: Metadata = { title: "Editar produto — Admin" };

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dados = await buscarAdminProduto(Number(id));
  if (!dados) notFound();

  const categorias = await listarTodasCategorias();
  const imagens = dados.imagens.map((i) => i.url).join("\n");

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold tracking-wide text-brand-900 sm:text-3xl">
        Editar produto
      </h1>
      <FormProduto
        categorias={categorias.map((c) => ({ id: c.id, nome: c.nome, slug: c.slug }))}
        valor={{
          id: dados.produto.id,
          nome: dados.produto.nome,
          sku: dados.produto.sku,
          categoryId: dados.produto.categoryId,
          preco: dados.produto.preco,
          precoPromocional: dados.produto.precoPromocional ?? "",
          custo: dados.produto.custo ?? "",
          estoque: dados.produto.estoque,
          estoqueMinimo: dados.produto.estoqueMinimo,
          descricao: dados.produto.descricao ?? "",
          descricaoCurta: dados.produto.descricaoCurta ?? "",
          peso: dados.produto.peso ?? "",
          ativo: dados.produto.ativo,
          destaque: dados.produto.destaque,
          imagens,
        }}
      />
    </div>
  );
}
