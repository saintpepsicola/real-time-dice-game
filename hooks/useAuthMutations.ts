import { useRouter } from "next/navigation"
import { useGameStore } from "@/store/gameStore"
import { toast } from "react-hot-toast"
import useSWRMutation from "swr/mutation"
import { ApiError } from "@/lib/api-error"
import { LoginData } from "@/types"

export function useAuthMutations() {
  const router = useRouter()
  const { setUser, reset } = useGameStore()

  const loginMutation = useSWRMutation(
    "/api/auth/login",
    async (url, { arg }: { arg: LoginData }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new ApiError(
          data.error || "Login failed. Please try again.",
          res.status
        )
      }
      return data
    },
    {
      onSuccess: (data) => {
        setUser(data.user)
        router.push("/game")
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    }
  )

  const logoutMutation = useSWRMutation(
    "/api/auth/logout",
    async (url) => {
      const res = await fetch(url, { method: "POST" })
      if (!res.ok) {
        throw new ApiError("Failed to log out. Please try again.", res.status)
      }
      reset()
      return res.json()
    },
    {
      onSuccess: () => {
        setUser(null)
        toast.success("You have been logged out.")
        router.push("/")
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    }
  )

  return {
    login: loginMutation.trigger,
    isLoggingIn: loginMutation.isMutating,
    logout: logoutMutation.trigger,
    isLoggingOut: logoutMutation.isMutating,
  }
}