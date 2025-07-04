import { useCallback } from "react"
import useSWRMutation from "swr/mutation"
import { useGameStore } from "@/store/gameStore"
import { toast } from "react-hot-toast"
import { BetData } from "@/types"

export function useBetMutation() {
  const { setBalance, setLastBetResult } = useGameStore()

  const betFetcher = async (url: string, { arg }: { arg: BetData }) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(arg),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(
        typeof error === "object" && error !== null && "error" in error
          ? (error as { error: string }).error
          : "An error occurred while placing your bet"
      )
    }

    return res.json()
  }

  const { trigger: placeBet, isMutating } = useSWRMutation(
    "/api/game/bet",
    betFetcher,
    {
      onSuccess: (data) => {
        setBalance(data.newBalance)
        setLastBetResult({
          id: data.id,
          amount: data.amount,
          choice: data.choice,
          target: data.target,
          win: data.win,
          roll: data.roll,
          payout: data.payout,
        })
      },
      onError: (error: Error) => {
        toast.error(error.message)
      },
    }
  )

  const handleBet = useCallback(
    async (betData: BetData) => {
      try {
        await placeBet(betData)
      } catch (error) {
        console.error("Bet error:", error)
      }
    },
    [placeBet]
  )

  return {
    placeBet: handleBet,
    isLoading: isMutating,
  }
}