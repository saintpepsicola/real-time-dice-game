import { NextResponse } from "next/server"
import { serialize } from "cookie"

export async function POST() {
  const serializedCookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: -1,
    path: "/",
  })

  const response = NextResponse.json({ message: "Logged out" })
  response.headers.set("Set-Cookie", serializedCookie)

  return response
}
