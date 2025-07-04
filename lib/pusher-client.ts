import PusherClient from "pusher-js"

// Define types for the dummy client-side objects
interface DummyChannel {
  bind(event: string, callback: (data: unknown) => void): void
  unbind_all(): void
}

interface DummyPusherClient {
  subscribe(channelName: string): DummyChannel
  unsubscribe(channelName: string): void
}

let pusherClient: PusherClient | DummyPusherClient

// Check if necessary client-side environment variables for Pusher are available
const arePusherCredsAvailable =
  process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER

if (arePusherCredsAvailable) {
  // If credentials exist, create the real PusherClient instance
  pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
    authTransport: "ajax",
  })
} else {
  // If credentials are NOT available, create a dummy client
  console.warn(
    "🚨 Pusher client credentials not found. Real-time features will be disabled. Please check your .env.local file."
  )

  // The dummy client has the same methods but they do nothing.
  // This prevents the application from crashing when trying to call .subscribe() or .bind().
  pusherClient = {
    subscribe: (channelName: string) => {
      console.log(`[PUSHER DUMMY] Not subscribing to channel '${channelName}'.`)
      return {
        bind: (event: string) => {
          console.log(`[PUSHER DUMMY] Not binding to event '${event}'.`)
        },
        unbind_all: () => {
          console.log(`[PUSHER DUMMY] Unbinding all events.`)
        },
      }
    },
    unsubscribe: (channelName: string) => {
      console.log(`[PUSHER DUMMY] Unsubscribing from channel '${channelName}'.`)
    },
  }
}

export { pusherClient }
