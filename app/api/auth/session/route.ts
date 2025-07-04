import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { dice_users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { ApiError, handleApiError } from "@/lib/api-error"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session) {
      throw new ApiError("Unauthorized", 401)
    }

    const user = await db.query.dice_users.findFirst({
      where: eq(dice_users.id, session.userId),
    })

    if (!user) {
      throw new ApiError("User not found", 404)
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
