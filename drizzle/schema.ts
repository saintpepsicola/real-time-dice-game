import {
  pgTable,
  text,
  real,
  integer,
  boolean,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const dice_users = pgTable("dice_users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 256 }).unique().notNull(),
  balance: real("balance").default(100.0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  usernameIdx: index("dice_users_username_idx").on(table.username),
  createdAtIdx: index("dice_users_created_at_idx").on(table.createdAt.desc()),
}))

export const dice_bets = pgTable("dice_bets", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => dice_users.id, { onDelete: "cascade" }),
  amount: real("amount").notNull(),
  choice: text("choice", { enum: ["over", "under"] }).notNull(),
  target: integer("target").notNull(),
  roll: integer("roll").notNull(),
  payout: real("payout").notNull(),
  win: boolean("win").notNull(),
  serverSeed: text("server_seed").notNull(),
  serverSeedHash: text("server_seed_hash").notNull(),
  clientSeed: text("client_seed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  userIdIdx: index("dice_bets_user_id_idx").on(table.userId),
  createdAtIdx: index("dice_bets_created_at_idx").on(table.createdAt.desc()),
  winStatusIdx: index("dice_bets_win_status_idx").on(table.win),
  amountIdx: index("dice_bets_amount_idx").on(table.amount),
}))

export const dice_usersRelations = relations(dice_users, ({ many }) => ({
  bets: many(dice_bets),
}))

export const dice_betsRelations = relations(dice_bets, ({ one }) => ({
  user: one(dice_users, {
    fields: [dice_bets.userId],
    references: [dice_users.id],
  }),
}))
