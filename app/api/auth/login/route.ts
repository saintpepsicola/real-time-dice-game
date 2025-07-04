import { db } from "@/db"
import { dice_users } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { serialize } from "cookie"
import { ApiError, handleApiError } from "@/lib/api-error"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const username = body.username as string

    if (!username || username.trim().length < 3) {
      throw new ApiError("Username must be at least 3 characters.", 400)
    }

    let user = await db.query.dice_users.findFirst({
      where: eq(dice_users.username, username),
    })

    if (!user) {
      const newUserId = createId()
      ;[user] = await db
        .insert(dice_users)
        .values({ id: newUserId, username, balance: 100 })
        .returning()
    }

    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    const serializedCookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    const response = NextResponse.json({ user })
    response.headers.set("Set-Cookie", serializedCookie)

    return response
  } catch (error) {
    console.error("Login API Error:", error)
    return handleApiError(error)
  }
}
