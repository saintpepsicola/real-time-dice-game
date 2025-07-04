import { db } from "@/db"
import { dice_bets, dice_users } from "@/drizzle/schema"
import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error"

const MAX_BETS_TO_FETCH = 8

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const recentBets = await db
      .select({
        id: dice_bets.id,
        username: dice_users.username,
        amount: dice_bets.amount,
        choice: dice_bets.choice,
        win: dice_bets.win,
      })
      .from(dice_bets)
      .innerJoin(dice_users, eq(dice_bets.userId, dice_users.id))
      .orderBy(desc(dice_bets.createdAt))
      .limit(MAX_BETS_TO_FETCH)

    return NextResponse.json(recentBets)
  } catch (error) {
    console.error("Failed to fetch recent bets:", error)
    return handleApiError(error)
  }
}
