import { count, desc, eq, gt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, users } from "@/db/schema";

export type MetricasAdmin = {
  faturamento: number;
  pedidosTotal: number;
  clientesTotal: number;
  estoqueTotal: number;
  estoqueBaixo: number;
  semEstoque: number;
  pedidosPendentes: number;
  vendasRecentes: {
    id: number;
    cliente: string;
    total: string;
    status: string;
    createdAt: Date;
  }[];
  maisVendidos: {
    nome: string;
    vendidos: number;
  }[];
  vendasPorDia: { dia: string; total: number }[];
};

/** Métricas para o dashboard administrativo. */
export async function buscarMetricasAdmin(): Promise<MetricasAdmin> {
  const [faturamentoRow] = await db
    .select({
      valor: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(sql`${orders.status} not in ('CANCELLED')`);

  const [[pedidosTotal], [clientesTotal], [pendentes], [estoque], [semEstoque], [baixo]] =
    await Promise.all([
      db.select({ n: count() }).from(orders),
      db.select({ n: count() }).from(users),
      db
        .select({ n: count() })
        .from(orders)
        .where(sql`${orders.status} in ('PENDING', 'CONFIRMED')`),
      db
        .select({ n: sql<number>`coalesce(sum(${products.estoque}), 0)` })
        .from(products),
      db
        .select({ n: count() })
        .from(products)
        .where(lte(products.estoque, 0)),
      db
        .select({ n: count() })
        .from(products)
        .where(sql`${products.estoque} > 0 and ${products.estoque} <= ${products.estoqueMinimo}`),
    ]);

  const vendasRecentes = await db
    .select({
      id: orders.id,
      cliente: users.nome,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(8);

  const maisVendidos = await db
    .select({
      nome: products.nome,
      vendidos: sql<string>`coalesce(sum(${orderItems.quantidade}), 0)`,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(products.id, products.nome)
    .orderBy(desc(sql`coalesce(sum(${orderItems.quantidade}), 0)`))
    .limit(5);

  const vendasPorDia = await db
    .select({
      dia: sql<string>`date_format(${orders.createdAt}, '%d/%m')`,
      total: sql<string>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(sql`${orders.status} not in ('CANCELLED') and ${orders.createdAt} >= date_sub(now(), interval 7 day)`)
    .groupBy(sql`date_format(${orders.createdAt}, '%d/%m')`)
    .orderBy(sql`date_format(${orders.createdAt}, '%d/%m')`);

  return {
    faturamento: Number(faturamentoRow.valor),
    pedidosTotal: Number(pedidosTotal.n),
    clientesTotal: Number(clientesTotal.n),
    estoqueTotal: Number(estoque.n),
    estoqueBaixo: Number(baixo.n),
    semEstoque: Number(semEstoque.n),
    pedidosPendentes: Number(pendentes.n),
    vendasRecentes,
    maisVendidos: maisVendidos.map((p) => ({
      nome: p.nome,
      vendidos: Number(p.vendidos),
    })),
    vendasPorDia: vendasPorDia.map((v) => ({ dia: v.dia, total: Number(v.total) })),
  };
}