import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/drizzle/schema"

declare global {
  var client: postgres.Sql | undefined
}

let client: postgres.Sql

if (process.env.NODE_ENV === "production") {
  client = postgres(process.env.DATABASE_URL!, { prepare: false })
} else {
  if (!global.client) {
    global.client = postgres(process.env.DATABASE_URL!, { prepare: false })
  }
  client = global.client
}

export const db = drizzle(client, { schema })
