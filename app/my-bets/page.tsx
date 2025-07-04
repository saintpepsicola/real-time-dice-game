"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/hooks/useUser"
import { useBetDetails } from "@/hooks/useBetDetails"
import Link from "next/link"
import ProvablyFairModal from "@/components/ProvablyFairModal"
import { toast } from "react-hot-toast"
import { Info } from "lucide-react"
import { useApiGet } from "@/hooks/useApi"
import { BetHistoryResponse } from "@/types"
import BetHistorySkeleton from "@/components/BetHistorySkeleton"

export default function MyBetsPage() {
  const { user, isLoading: isUserLoading } = useUser()
  const [page, setPage] = useState(1)

  const {
    data,
    error,
    isLoading: areBetsLoading,
  } = useApiGet<BetHistoryResponse>(
    user ? `/api/game/my-bets?page=${page}&userId=${user.id}` : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { selectedBet, fetchBetDetails, clearSelectedBet } = useBetDetails()

  const betHistory = data?.bets ?? []
  const pagination = data?.pagination

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load bet history")
    }
  }, [error])

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading your session...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-accent-loss">Failed to load bet history.</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4">
      {selectedBet && (
        <ProvablyFairModal bet={selectedBet} onClose={clearSelectedBet} />
      )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              My Bets
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              {pagination?.totalBets ?? 0} total bets
            </p>
          </div>
          <Link
            href="/game"
            className="w-full sm:w-auto text-center px-4 py-2 text-sm hover:bg-foreground/10 rounded-md transition-colors border border-foreground/20"
          >
            ← Back to Game
          </Link>
        </header>

        {areBetsLoading && <BetHistorySkeleton />}

        {!areBetsLoading && betHistory.length === 0 ? (
          <div className="bg-foreground/5 rounded-lg p-8 text-center">
            <p className="text-lg mb-2">No bets yet</p>
            <p className="text-sm text-foreground/60">
              Place your first bet to see it here!
            </p>
          </div>
        ) : (
          !areBetsLoading && (
            <div className="space-y-3">
              <div className="sm:hidden space-y-3">
                {betHistory.map((bet) => (
                  <div
                    key={bet.id}
                    className="bg-foreground/5 rounded-lg p-4 space-y-2 border border-foreground/10 cursor-pointer"
                    onClick={() => fetchBetDetails(bet.id).catch(console.error)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          ${bet.amount.toFixed(2)}
                          <span className="ml-2 text-sm font-normal text-foreground/60">
                            {bet.win ? "Won" : "Lost"} ${bet.payout.toFixed(2)}
                          </span>
                        </p>
                        <p className="text-sm text-foreground/60">
                          {new Date(bet.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={
                            bet.win ? "text-accent-win" : "text-accent-loss"
                          }
                        >
                          {bet.win ? "Win" : "Loss"} ({bet.roll})
                        </p>
                        <p className="text-xs text-foreground/60">
                          Target: {bet.choice} {bet.target}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                  <thead className="bg-foreground/5">
                    <tr>
                      <th className="p-3 text-xs text-foreground/60 font-normal">
                        Amount
                      </th>
                      <th className="p-3 text-xs text-foreground/60 font-normal">
                        Result
                      </th>
                      <th className="p-3 text-xs text-foreground/60 font-normal">
                        Payout
                      </th>
                      <th className="p-3 text-xs text-foreground/60 font-normal hidden md:table-cell">
                        Date
                      </th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {betHistory.map((bet) => (
                      <tr
                        key={bet.id}
                        className="hover:bg-foreground/5 cursor-pointer transition-colors border-t border-foreground/5"
                        onClick={() =>
                          fetchBetDetails(bet.id).catch(console.error)
                        }
                      >
                        <td className="p-3">
                          <div className="font-medium">
                            ${bet.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-foreground/60 md:hidden">
                            {new Date(bet.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={
                              bet.win ? "text-accent-win" : "text-accent-loss"
                            }
                          >
                            {bet.win ? "Win" : "Loss"} ({bet.roll})
                          </span>
                          <div className="text-xs text-foreground/60">
                            {bet.choice} {bet.target}
                          </div>
                        </td>
                        <td
                          className={`p-3 ${
                            bet.win ? "text-accent-win" : "text-foreground"
                          }`}
                        >
                          ${bet.payout.toFixed(2)}
                        </td>
                        <td className="p-3 text-foreground/70 hidden md:table-cell">
                          {new Date(bet.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              fetchBetDetails(bet.id).catch(console.error)
                            }}
                            className="p-1.5 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                            aria-label="View bet details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm font-mono">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.currentPage === 1 || areBetsLoading}
                    className="px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/10 transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-foreground/80">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={
                      pagination.currentPage === pagination.totalPages ||
                      areBetsLoading
                    }
                    className="px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/10 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}