import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { products } from "./catalog";
import { users } from "./users";

export const reviews = mysqlTable(
  "reviews",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    nota: smallint().notNull(),
    comentario: text(),
    status: mysqlEnum("status", ["PENDING", "APPROVED", "REJECTED"])
      .default("PENDING")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("reviews_user_product_unique").on(t.userId, t.productId),
    index("reviews_product_idx").on(t.productId),
  ],
);

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
