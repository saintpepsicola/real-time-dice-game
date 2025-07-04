"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useAuthMutations } from "@/hooks/useAuthMutations"
import BalanceDisplay from "@/components/BalanceDisplay"
import GameControls from "@/components/GameControls"
import RecentBetsFeed from "@/components/RecentBetsFeed"
import Link from "next/link"

export default function GamePage() {
  const router = useRouter()
  const { user, isLoading, isError } = useUser()
  const { logout } = useAuthMutations()

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/")
    }
  }, [isLoading, isError, router])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
  }

  if (isLoading || !user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Loading Your Session...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans p-4 ">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Dice Arena
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-foreground/80 hidden sm:inline">
              Welcome, {user.username}
            </span>
            <Link
              href="/my-bets"
              className="px-3 md:px-4 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/10 rounded-md transition-colors"
            >
              My Bets
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 text-sm hover:bg-foreground/20 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <BalanceDisplay />
            <GameControls />
          </div>
          <div className="lg:col-span-1">
            <RecentBetsFeed />
          </div>
        </div>
      </div>
    </main>
  )
}
