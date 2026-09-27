import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { categories, favorites, products } from "@/db/schema";
import { lerSessao } from "@/lib/auth";
import { ProductCard } from "@/components/store/product-card";
import { anexarDetalhes } from "@/services/produtos";

export const metadata: Metadata = { title: "Meus favoritos" };

export default async function FavoritosPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/entrar");

  const linhas = await db
    .select({
      id: products.id,
      nome: products.nome,
      slug: products.slug,
      preco: products.preco,
      precoPromocional: products.precoPromocional,
      estoque: products.estoque,
      categoria: categories.nome,
    })
    .from(favorites)
    .innerJoin(products, eq(favorites.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(favorites.userId, sessao.uid))
    .orderBy(desc(favorites.createdAt));

  const detalhados = await anexarDetalhes(linhas);

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-bold tracking-wide text-brand-900">
        Meus favoritos
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        {detalhados.length}{" "}
        {detalhados.length === 1 ? "produto salvo" : "produtos salvos"}
      </p>

      {detalhados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <Heart className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
          <p className="mt-2 text-sm text-slate-500">
            Nenhum favorito ainda. Toque no coração dos produtos para salvá-los.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {detalhados.map((p) => (
            <ProductCard key={p.id} produto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
