"use client"

import { useEffect } from "react"
import { pusherClient } from "@/lib/pusher-client"
import BetFeedItemSkeleton from "./BetFeedItemSkeleton"
import ProvablyFairModal from "./ProvablyFairModal"
import { useApiGet } from "@/hooks/useApi"
import { useBetDetails } from "@/hooks/useBetDetails"
import { z } from "zod"
import { SimpleBet } from "@/types"

const simpleBetSchema = z.object({
  id: z.string(),
  username: z.string(),
  amount: z.number(),
  choice: z.enum(["over", "under"]),
  win: z.boolean(),
})

const MAX_BETS_IN_FEED = 15
const LIVE_FEED_CHANNEL = "public-dice-game"

export default function RecentBetsFeed() {
  const {
    data: bets,
    error,
    mutate,
  } = useApiGet<SimpleBet[]>("/api/game/recent-bets", {
    revalidateOnMount: true,
    revalidateOnFocus: true,
  })

  const { selectedBet, fetchBetDetails, clearSelectedBet } = useBetDetails()

  useEffect(() => {
    if (error) {
      console.error("Error loading live bets:", error)
    }
  }, [error])

  useEffect(() => {
    const channel = pusherClient.subscribe(LIVE_FEED_CHANNEL)
    channel.bind("new-bet", (data: unknown) => {
      const validation = simpleBetSchema.safeParse(data)
      if (!validation.success) {
        console.error("Invalid bet data:", validation.error)
        return
      }
      const newBet = validation.data
      mutate((currentBets = []) => {
        if (currentBets.some((bet) => bet.id === newBet.id)) return currentBets
        return [newBet, ...currentBets].slice(0, MAX_BETS_IN_FEED)
      }, false)
    })
    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(LIVE_FEED_CHANNEL)
    }
  }, [mutate])

  const handleBetClick = async (betId: string) => {
    try {
      await fetchBetDetails(betId)
    } catch (error) {
      console.error("Error in handleBetClick:", error)
    }
  }

  const renderBetItem = (bet: SimpleBet) => (
    <li key={bet.id}>
      <button
        onClick={() => handleBetClick(bet.id)}
        className="w-full cursor-pointer flex justify-between items-center bg-background/50 p-2 rounded-md animate-roll-in hover:bg-background transition-colors"
      >
        <div>
          <span className="font-bold text-primary">{bet.username}</span>
          <span className="text-foreground/70">
            {" "}
            bet ${bet.amount} on {bet.choice}
          </span>
        </div>
        {bet.win ? (
          <span className="font-bold text-accent-win">WIN</span>
        ) : (
          <span className="font-bold text-accent-loss">LOSS</span>
        )}
      </button>
    </li>
  )

  return (
    <>
      {selectedBet && (
        <ProvablyFairModal bet={selectedBet} onClose={clearSelectedBet} />
      )}

      <div className="p-8 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Live Bets</h2>
        </div>

        {error && (
          <p className="text-accent-loss/80 text-center pt-8 text-sm">
            Could not load live bets.
          </p>
        )}

        {!error && bets === undefined && (
          <ul className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <BetFeedItemSkeleton key={i} />
            ))}
          </ul>
        )}

        {!error && bets && bets.length === 0 && (
          <p className="text-foreground/60 text-center pt-8">
            No recent bets. Be the first!
          </p>
        )}

        {!error && bets && bets.length > 0 && (
          <ul className="space-y-3 font-mono text-sm">
            {bets.map(renderBetItem)}
          </ul>
        )}
      </div>
    </>
  )
}