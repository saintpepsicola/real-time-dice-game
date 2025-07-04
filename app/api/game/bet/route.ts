import { db } from "@/db"
import { dice_users, dice_bets } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod"
import { runProvablyFairGame } from "@/lib/game"
import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"
import { ApiError, handleApiError, withApiErrorHandling } from "@/lib/api-error"

const betSchema = z.object({
  amount: z.number().positive("Bet amount must be positive."),
  choice: z.enum(["over", "under"]),
  target: z.number().int().min(1).max(99),
  clientSeed: z.string().min(1, "Client seed is required."),
})

const LIVE_FEED_CHANNEL = "public-dice-game"

export const POST = withApiErrorHandling(async (req: Request) => {
  const userPayloadHeader = req.headers.get("X-User-Payload")
  if (!userPayloadHeader) {
    throw new ApiError("Unauthorized", 401)
  }
  const { userId } = JSON.parse(userPayloadHeader)

  const body = await req.json()
  const validation = betSchema.safeParse(body)

  if (!validation.success) {
    const errorMessage = validation.error.errors[0]?.message || 'Invalid request data';
    throw new ApiError(errorMessage, 400);
  }
  const { amount, choice, target, clientSeed } = validation.data

  const betResult = await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ balance: dice_users.balance, username: dice_users.username })
      .from(dice_users)
      .where(eq(dice_users.id, userId))
      .for("update")

    if (!user) {
      throw new ApiError("User not found", 404)
    }
    if (user.balance < amount) {
      throw new ApiError("Insufficient balance", 400)
    }

    const gameResult = runProvablyFairGame(clientSeed, choice, target)
    const payout = gameResult.win ? amount * 1.98 : 0
    const newBalance = user.balance - amount + payout

    await tx
      .update(dice_users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(dice_users.id, userId))

    const [insertedBet] = await tx
      .insert(dice_bets)
      .values({
        id: createId(),
        userId,
        amount,
        choice,
        target,
        roll: gameResult.roll,
        payout,
        win: gameResult.win,
        serverSeed: gameResult.serverSeed,
        serverSeedHash: gameResult.serverSeedHash,
        clientSeed,
      })
      .returning()

    return { ...insertedBet, newBalance, username: user.username }
  })

  const feedPayload = {
    id: betResult.id,
    username: betResult.username,
    amount: betResult.amount,
    choice: betResult.choice,
    win: betResult.win,
  }

  await Promise.all([
    pusherServer.trigger(LIVE_FEED_CHANNEL, "new-bet", feedPayload),
    pusherServer.trigger(`private-user-${userId}`, "balance-update", {
      newBalance: betResult.newBalance,
    }),
  ])
  const publicBetResult = { ...betResult, serverSeed: undefined }
  return NextResponse.json(publicBetResult)
});