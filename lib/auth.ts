import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { UserJWTPayload } from "@/types"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function getSession(
  request: NextRequest
): Promise<UserJWTPayload | null> {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserJWTPayload
  } catch (error) {
    console.error("JWT Verification Failed:", error)
    return null
  }
}