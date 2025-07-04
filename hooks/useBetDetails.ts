import { useState } from "react"
import { toast } from "react-hot-toast"
import { fetcher as apiFetcher } from "./useApi"
import { FullBetDetails } from "@/types"

export function useBetDetails() {
  const [selectedBet, setSelectedBet] = useState<FullBetDetails | null>(null)
  const [isModalLoading, setIsModalLoading] = useState(false)

  const fetchBetDetails = async (betId: string) => {
    setIsModalLoading(true)
    try {
      const data = await apiFetcher(`/api/game/bet-details/${betId}`)
      setSelectedBet(data)
      return data
    } catch (error: any) {
      toast.error(error.message)
      console.error(error)
      throw error
    } finally {
      setIsModalLoading(false)
    }
  }

  return {
    selectedBet,
    isModalLoading,
    fetchBetDetails,
    clearSelectedBet: () => setSelectedBet(null),
  }
}