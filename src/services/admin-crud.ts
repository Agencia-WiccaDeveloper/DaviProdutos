import { count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  addresses,
  categories,
  coupons,
  notifications,
  orderItems,
  orders,
  products,
  reviews,
  users,
} from "@/db/schema";

/* ============ CLIENTES ============ */
export async function listarAdminClientes(q?: string) {
  const cond = q
    ? or(like(users.nome, `%${q}%`), like(users.email, `%${q}%`))
    : undefined;

  return db
    .select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      telefone: users.telefone,
      role: users.role,
      status: users.status,
      criadoEm: users.createdAt,
      totalPedidos: sql<number>`(select count(*) from orders o where o.user_id = ${users.id})`,
      totalGasto: sql<string>`coalesce((select sum(o.total) from orders o where o.user_id = ${users.id} and o.status <> 'CANCELLED'), 0)`,
    })
    .from(users)
    .where(cond)
    .orderBy(desc(users.createdAt))
    .limit(200);
}

/* ============ PEDIDOS ============ */
export async function listarAdminPedidos(params: { q?: string; status?: string }) {
  const condicoes = [];
  if (params.q) {
    const t = `%${params.q}%`;
    condicoes.push(or(like(users.nome, t), like(users.email, t)));
  }
  if (params.status) condicoes.push(eq(orders.status, params.status as never));

  return db
    .select({
      id: orders.id,
      cliente: users.nome,
      email: users.email,
      total: orders.total,
      status: orders.status,
      pagamento: orders.pagamento,
      paymentStatus: orders.paymentStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(condicoes.length ? sql`${sql.join(condicoes, sql` and `)}` : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);
}

export async function buscarAdminPedido(id: number) {
  const [pedido] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      cliente: users.nome,
      email: users.email,
      subtotal: orders.subtotal,
      desconto: orders.desconto,
      frete: orders.frete,
      total: orders.total,
      status: orders.status,
      pagamento: orders.pagamento,
      tipoEntrega: orders.tipoEntrega,
      paymentProvider: orders.paymentProvider,
      paymentStatus: orders.paymentStatus,
      paymentExternalId: orders.paymentExternalId,
      paymentMethodId: orders.paymentMethodId,
      pickupCode: orders.pickupCode,
      pickupAt: orders.pickupAt,
      observacoes: orders.observacoes,
      createdAt: orders.createdAt,
      endereco: {
        destinatario: addresses.destinatario,
        rua: addresses.rua,
        numero: addresses.numero,
        complemento: addresses.complemento,
        bairro: addresses.bairro,
        cidade: addresses.cidade,
        estado: addresses.estado,
        cep: addresses.cep,
      },
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .leftJoin(addresses, eq(orders.addressId, addresses.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!pedido) return null;

  const itens = await db
    .select({
      id: orderItems.id,
      nomeProduto: orderItems.nomeProduto,
      sku: orderItems.sku,
      quantidade: orderItems.quantidade,
      precoUnitario: orderItems.precoUnitario,
      subtotal: orderItems.subtotal,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return { pedido, itens };
}

/* ============ CUPONS ============ */
export async function listarAdminCupons() {
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

/* ============ AVALIACOES ============ */
export async function listarAdminAvaliacoes() {
  return db
    .select({
      id: reviews.id,
      produto: products.nome,
      usuario: users.nome,
      nota: reviews.nota,
      comentario: reviews.comentario,
      status: reviews.status,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(users, eq(reviews.userId, users.id))
    .orderBy(desc(reviews.createdAt))
    .limit(200);
}

export async function contarAdminNotifications() {
  const [r] = await db.select({ n: count() }).from(notifications);
  return Number(r.n);
}

export { categories };
