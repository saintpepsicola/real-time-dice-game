import Pusher from "pusher"

// --- NEW: More complete interface for our Pusher server client ---
interface PusherServer {
  trigger(channel: string, event: string, data: unknown): Promise<unknown>
  authorizeChannel(
    socketId: string,
    channel: string,
    data?: Pusher.PresenceChannelData
  ): Pusher.AuthResponse
}

let pusherServer: PusherServer

// Check if all necessary environment variables for Pusher are available
const arePusherCredsAvailable =
  process.env.PUSHER_APP_ID &&
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.NEXT_PUBLIC_PUSHER_CLUSTER

if (arePusherCredsAvailable) {
  // If credentials exist, create the real Pusher instance
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
  })
} else {
  // If credentials are NOT available, create a dummy client
  console.warn(
    "🚨 Pusher server credentials not found. Pusher events will not be sent. Please check your .env.local file."
  )

  // --- NEW: The dummy client now also implements authorizeChannel ---
  pusherServer = {
    trigger: (channel: string, event: string, data: unknown) => {
      console.log(
        `[PUSHER DUMMY] Not triggering event '${event}' on channel '${channel}' with data:`,
        data
      )
      return Promise.resolve()
    },
    authorizeChannel: () => {
      // In a dummy state, authorization should fail cleanly.
      // We throw an error that can be caught by the calling function.
      throw new Error("Pusher not configured, cannot authorize channel.")
    },
  }
}

// --- NEW: Type guard to check if the client is the real one ---
// This function checks if the object is an instance of the real Pusher class.
// This is a much safer and cleaner way to check than looking for properties.
export function isPusherServerAvailable(client: unknown): client is Pusher {
  return client instanceof Pusher
}

// Export the instance. It will be either the real one or the dummy one.
export { pusherServer }
