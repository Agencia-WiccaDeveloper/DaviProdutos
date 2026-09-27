import {
  datetime,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { addresses, users } from "./users";
import { products } from "./catalog";

export const orders = mysqlTable(
  "orders",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    addressId: int("address_id").references(() => addresses.id, {
      onDelete: "restrict",
    }),
    subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
    desconto: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    frete: decimal({ precision: 10, scale: 2 }).default("0.00").notNull(),
    total: decimal({ precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ])
      .default("PENDING")
      .notNull(),
    pagamento: mysqlEnum("pagamento", ["PIX", "CARTAO", "BOLETO", "ATENDENTE"]),
    tipoEntrega: mysqlEnum("tipo_entrega", ["ENTREGA", "RETIRADA"])
      .default("ENTREGA")
      .notNull(),
    paymentProvider: varchar("payment_provider", { length: 30 }),
    paymentExternalId: varchar("payment_external_id", { length: 120 }),
    paymentStatus: varchar("payment_status", { length: 30 }).default("PENDING"),
    paymentIdempotencyKey: varchar("payment_idempotency_key", { length: 64 }),
    paymentMethodId: varchar("payment_method_id", { length: 30 }),
    paymentQrCode: text("payment_qr_code"),
    paymentQrCode64: text("payment_qr_code64"),
    paidAt: datetime("paid_at"),
    paymentExpiresAt: datetime("payment_expires_at"),
    pickupCode: varchar("pickup_code", { length: 20 }),
    pickupAt: datetime("pickup_at"),
    observacoes: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    uniqueIndex("orders_payment_idempotency_unique").on(t.paymentIdempotencyKey),
    index("orders_payment_external_idx").on(t.paymentExternalId),
  ],
);

/**
 * O preço é registrado no momento da compra: alterações futuras no
 * produto NÃO afetam pedidos antigos.
 */
export const orderItems = mysqlTable(
  "order_items",
  {
    id: int().autoincrement().primaryKey(),
    orderId: int("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    nomeProduto: varchar("nome_produto", { length: 200 }).notNull(),
    sku: varchar({ length: 40 }).notNull(),
    quantidade: int().notNull(),
    precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 })
      .notNull(),
    subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

/** Histórico de mudanças de status de um pedido. */
export const orderStatusHistory = mysqlTable(
  "order_status_history",
  {
    id: int().autoincrement().primaryKey(),
    orderId: int("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: varchar({ length: 20 }).notNull(),
    observacao: varchar({ length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("osh_order_idx").on(t.orderId)],
);

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
