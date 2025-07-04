import { NextRequest, NextResponse } from "next/server"
import { pusherServer, isPusherServerAvailable } from "@/lib/pusher"
import { getSession } from "@/lib/auth"
import { ApiError, handleApiError } from "@/lib/api-error"
export async function POST(req: NextRequest) {
  if (!isPusherServerAvailable(pusherServer)) {
    console.error(
      "🚨 Pusher auth failed: Pusher server credentials are not configured."
    )
    return handleApiError(
      new ApiError("Real-time service is not configured.", 503)
    )
  }

  const session = await getSession(req)
  if (!session) {
    return handleApiError(new ApiError("Unauthorized", 401))
  }

  const data = await req.formData()
  const socketId = data.get("socket_id") as string
  const channel = data.get("channel_name") as string
  const userData = {
    user_id: session.userId,
    user_info: {
      username: session.username,
    },
  }

  try {
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channel,
      userData
    )
    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("Pusher Auth Error:", error)
    if (error instanceof Error && error.message.includes("authorize")) {
      return handleApiError(new ApiError("Forbidden", 403))
    }
    return handleApiError(error)
  }
}
