"use client"
import { useGameStore } from "@/store/gameStore"
import BalanceDisplaySkeleton from "./BalanceDisplaySkeleton"
import { useUser } from "@/hooks/useUser"

export default function BalanceDisplay() {
  const user = useGameStore((state) => state.user)
  const { isLoading } = useUser()
  const balance = user ? user.balance : 0

  if (isLoading) {
    return <BalanceDisplaySkeleton />
  }

  return (
    <div className="p-4 bg-mint-500  text-center">
      <h3 className="text-lg text-foreground/60 font-mono uppercase tracking-widest">
        Your Balance
      </h3>

      <p className={`text-5xl font-bold font-mono tracking-tighter`}>
        ${balance.toFixed(2)}
      </p>
    </div>
  )
}
