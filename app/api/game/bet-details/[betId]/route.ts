import { db } from "@/db"
import { dice_bets } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { ApiError, handleApiError } from "@/lib/api-error"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ betId: string }> }
) {
  try {
    const { betId } = await params
    if (!betId) {
      throw new ApiError("Bet ID is required.", 400)
    }

    const betDetails = await db.query.dice_bets.findFirst({
      where: eq(dice_bets.id, betId),
      columns: {
        id: true,
        roll: true,
        serverSeed: true,
        serverSeedHash: true,
        clientSeed: true,
      },
    })

    if (!betDetails) {
      throw new ApiError("Bet not found.", 404)
    }

    return NextResponse.json(betDetails)
  } catch (error) {
    console.error("Error fetching bet details:", error)
    return handleApiError(error)
  }
}
