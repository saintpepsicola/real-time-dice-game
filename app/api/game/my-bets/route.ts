import { db } from "@/db"
import { dice_bets } from "@/drizzle/schema"
import { desc, eq, sql } from "drizzle-orm"
import { NextResponse, NextRequest } from "next/server"
import { ApiError, handleApiError } from "@/lib/api-error"

const BETS_PER_PAGE = 20

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const userPayloadHeader = req.headers.get("X-User-Payload")
    if (!userPayloadHeader) {
      throw new ApiError("Unauthorized", 401)
    }
    const { userId } = JSON.parse(userPayloadHeader)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)

    const [betsResult, countResult] = await Promise.all([
      db.query.dice_bets.findMany({
        where: eq(dice_bets.userId, userId),
        orderBy: [desc(dice_bets.createdAt)],
        columns: {
          id: true,
          amount: true,
          choice: true,
          target: true,
          roll: true,
          win: true,
          payout: true,
          createdAt: true,
        },
        limit: BETS_PER_PAGE,
        offset: (page - 1) * BETS_PER_PAGE,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(dice_bets)
        .where(eq(dice_bets.userId, userId)),
    ])

    const totalBets = countResult[0].count
    const totalPages = Math.ceil(totalBets / BETS_PER_PAGE)

    return NextResponse.json({
      bets: betsResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalBets,
      },
    })
  } catch (error) {
    console.error("Failed to fetch user bets:", error)
    return handleApiError(error)
  }
}
