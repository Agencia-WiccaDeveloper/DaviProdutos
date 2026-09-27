import {
  boolean,
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { products } from "./catalog";
import { users } from "./users";

export const favorites = mysqlTable(
  "favorites",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("favorites_user_product_unique").on(t.userId, t.productId),
  ],
);

export const carts = mysqlTable(
  "carts",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("carts_user_unique").on(t.userId),
    index("carts_session_idx").on(t.sessionId),
  ],
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: int().autoincrement().primaryKey(),
    cartId: int("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantidade: int().default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("cart_items_cart_product_unique").on(t.cartId, t.productId),
  ],
);

export type Favorite = typeof favorites.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
