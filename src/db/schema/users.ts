import {
  boolean,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Roles: CUSTOMER | ADMIN (preparado para STAFF | SUPER_ADMIN) */
export const users = mysqlTable(
  "users",
  {
    id: int().autoincrement().primaryKey(),
    nome: varchar({ length: 150 }).notNull(),
    email: varchar({ length: 180 }).notNull(),
    senhaHash: varchar("senha_hash", { length: 255 }),
    telefone: varchar({ length: 25 }),
    cpf: varchar({ length: 14 }),
    avatar: text(),
    role: mysqlEnum("role", ["CUSTOMER", "ADMIN", "STAFF", "SUPER_ADMIN"])
      .default("CUSTOMER")
      .notNull(),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE", "BLOCKED"])
      .default("ACTIVE")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    index("users_role_idx").on(t.role),
  ],
);

export const addresses = mysqlTable(
  "addresses",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinatario: varchar({ length: 150 }).notNull(),
    cep: varchar({ length: 9 }).notNull(),
    rua: varchar({ length: 200 }).notNull(),
    numero: varchar({ length: 20 }).notNull(),
    complemento: varchar({ length: 120 }),
    bairro: varchar({ length: 100 }).notNull(),
    cidade: varchar({ length: 100 }).notNull(),
    estado: varchar({ length: 2 }).notNull(),
    referencia: varchar({ length: 200 }),
    principal: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

/** Tokens de recuperação de senha (validade curta). */
export const passwordResets = mysqlTable(
  "password_resets",
  {
    id: int().autoincrement().primaryKey(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar({ length: 64 }).notNull(),
    expiraEm: datetime("expira_em").notNull(),
    usadoEm: datetime("usado_em"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("password_resets_token_unique").on(t.token),
    index("password_resets_user_idx").on(t.userId),
  ],
);

export type PasswordReset = typeof passwordResets.$inferSelect;
