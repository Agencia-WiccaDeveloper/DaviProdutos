import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";
import { users } from "./users";

export const coupons = mysqlTable(
  "coupons",
  {
    id: int().autoincrement().primaryKey(),
    codigo: varchar({ length: 30 }).notNull(),
    tipo: mysqlEnum("tipo", ["PERCENTUAL", "VALOR_FIXO", "FRETE_GRATIS"])
      .notNull(),
    valor: decimal({ precision: 10, scale: 2 }).notNull(),
    validade: timestamp("validade").notNull(),
    limiteUso: int("limite_uso"),
    usos: int().default(0).notNull(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("coupons_codigo_unique").on(t.codigo)],
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    titulo: varchar({ length: 150 }).notNull(),
    mensagem: text().notNull(),
    tipo: mysqlEnum("tipo", ["PEDIDO", "PROMOCAO", "SISTEMA"])
      .default("SISTEMA")
      .notNull(),
    lida: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
