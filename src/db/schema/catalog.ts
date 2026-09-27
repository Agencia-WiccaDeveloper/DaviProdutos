import {
  boolean,
  decimal,
  index,
  int,
  mysqlTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const categories = mysqlTable(
  "categories",
  {
    id: int().autoincrement().primaryKey(),
    nome: varchar({ length: 120 }).notNull(),
    slug: varchar({ length: 140 }).notNull(),
    descricao: text(),
    imagem: varchar({ length: 500 }),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("categories_slug_unique").on(t.slug)],
);

export const products = mysqlTable(
  "products",
  {
    id: int().autoincrement().primaryKey(),
    categoryId: int("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    nome: varchar({ length: 200 }).notNull(),
    slug: varchar({ length: 220 }).notNull(),
    descricao: text(),
    descricaoCurta: varchar("descricao_curta", { length: 300 }),
    sku: varchar({ length: 40 }).notNull(),
    preco: decimal({ precision: 10, scale: 2 }).notNull(),
    precoPromocional: decimal("preco_promocional", { precision: 10, scale: 2 }),
    custo: decimal({ precision: 10, scale: 2 }),
    estoque: int().default(0).notNull(),
    estoqueMinimo: int("estoque_minimo").default(5).notNull(),
    peso: decimal({ precision: 8, scale: 3 }),
    altura: decimal({ precision: 8, scale: 2 }),
    largura: decimal({ precision: 8, scale: 2 }),
    comprimento: decimal({ precision: 8, scale: 2 }),
    ativo: boolean().default(true).notNull(),
    destaque: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("products_slug_unique").on(t.slug),
    uniqueIndex("products_sku_unique").on(t.sku),
    index("products_category_idx").on(t.categoryId),
  ],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: int().autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: varchar({ length: 500 }).notNull(),
    alt: varchar({ length: 200 }),
    ordem: smallint().default(0).notNull(),
    principal: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
