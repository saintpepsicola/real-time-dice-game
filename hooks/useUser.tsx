import { useSWRConfig } from "swr"
import { useGameStore } from "@/store/gameStore"
import { useEffect } from "react"
import { pusherClient } from "@/lib/pusher-client"
import { useApiGet } from "./useApi"
import { User } from "@/types"

export function useUser() {
  const { mutate } = useSWRConfig()

  const { data, error, isLoading } = useApiGet<{ user: User }>(
    "/api/auth/session",
    {
      shouldRetryOnError: (err: any) => {
        if (err.status === 401 || err.status === 404) return false
        return true
      },
    }
  )

  const { user, setUser } = useGameStore()

  useEffect(() => {
    if (data?.user) {
      setUser(data.user)
    }
    if (error) {
      setUser(null)
    }
  }, [data, error, setUser])

  useEffect(() => {
    if (user?.id) {
      const channelName = `private-user-${user.id}`
      try {
        const channel = pusherClient.subscribe(channelName)
        channel.bind("balance-update", () => {
          mutate("/api/auth/session")
        })

        return () => {
          pusherClient.unsubscribe(channelName)
        }
      } catch (e) {
        console.error("Failed to subscribe to Pusher channel:", e)
      }
    }
  }, [user?.id, mutate])

  return {
    user,
    isLoading,
    isError: !!error,
  }
}