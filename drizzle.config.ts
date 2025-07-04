import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!.replace('sslmode=require', 'sslmode=no-verify'),
  },
  tablesFilter: ["dice_users", "dice_bets"],
})
