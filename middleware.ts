import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify, JWTPayload } from "jose"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { ApiError, handleApiError } from "@/lib/api-error"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(20, "10s"),
  ephemeralCache: new Map(),
  prefix: "@upstash/ratelimit",
})

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    if (!success) {
      throw new ApiError("Rate limit exceeded", 429, {
        limit,
        reset,
        remaining,
      })
    }

    const token = req.cookies.get("token")?.value
    const { pathname } = req.nextUrl

    const sessionPayload = token ? await verifyToken(token) : null
    const isAuthenticated = !!sessionPayload

    const isProtectedRoute =
      pathname.startsWith("/game") || pathname.startsWith("/my-bets")
    const isPublicAuthPage = pathname === "/"

    const response = NextResponse.next()
    let shouldDeleteCookie = !!token && !isAuthenticated

    if (isProtectedRoute && !isAuthenticated) {
      const url = req.nextUrl.clone()
      url.pathname = "/"
      const redirectResponse = NextResponse.redirect(url)
      if (shouldDeleteCookie) {
        redirectResponse.cookies.delete("token")
      }
      return redirectResponse
    }

    if (isPublicAuthPage && isAuthenticated) {
      const url = req.nextUrl.clone()
      url.pathname = "/game"
      return NextResponse.redirect(url)
    }

    if (isAuthenticated) {
      response.headers.set("X-User-Payload", JSON.stringify(sessionPayload))
    }

    if (shouldDeleteCookie && !isProtectedRoute) {
      response.cookies.delete("token")
    }

    return response
  } catch (error) {
    console.error("Middleware Error:", error)
    return handleApiError(error)
  }
}

// Keep the matcher the same
export const config = {
  matcher: [
    "/game/:path*",
    "/my-bets/:path*",
    "/",
    "/api/game/:path*",
    "/api/pusher/:path*",
    "/api/auth/:path*",
  ],
}
