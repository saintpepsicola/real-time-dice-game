"use client"

import { useState, useMemo, useEffect } from "react"
import { useGameStore } from "@/store/gameStore"
import { BetResultDisplay } from "./BetResultDisplay"
import { useBetMutation } from "@/hooks/useBetMutation"
import { useDebounce } from "@/hooks/useDebounce"
import { RefreshCw, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"

const RefreshIcon = () => <RefreshCw className="w-4 h-4" />

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <ChevronDown
    className={`w-4 h-4 transition-transform duration-200 ${
      isOpen ? "rotate-180" : ""
    }`}
  />
)

export default function GameControls() {
  const { user, lastBetResult } = useGameStore()
  const balance = user ? user.balance : 0
  const { placeBet, isLoading } = useBetMutation()

  const [betAmount, setBetAmount] = useState<string>("10")
  const debouncedBetAmount = useDebounce(betAmount, 500)
  const [clientSeed, setClientSeed] = useState("")
  const [choice, setChoice] = useState<"over" | "under">("over")

  const [isFairnessOpen, setIsFairnessOpen] = useState(false)

  const TARGET_NUMBER = 50

  const parsedAmount = useMemo(
    () => parseFloat(debouncedBetAmount),
    [debouncedBetAmount]
  )

  useEffect(() => {
    setClientSeed(crypto.randomUUID())
  }, [])

  const isBetAmountInvalid = useMemo(() => {
    if (isLoading) return false
    if (isNaN(parsedAmount)) return "Invalid bet amount."
    if (parsedAmount <= 0) return "Bet must be positive."
    if (parsedAmount > balance) return "Bet exceeds your balance."
    return null
  }, [parsedAmount, balance, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(e.target.value)
  }

  const modifyBet = (modifier: (current: number) => number) => {
    const currentAmount = parseFloat(betAmount) || 0
    const newAmount = Math.max(0, modifier(currentAmount))
    setBetAmount(newAmount.toFixed(2).replace(/\.00$/, ""))
  }

  const handleBet = async () => {
    if (isLoading) return
    if (!user) {
      toast.error("You must be logged in to place a bet.")
      return
    }

    if (isBetAmountInvalid) {
      toast.error(isBetAmountInvalid)
      return
    }

    if (!clientSeed) {
      toast.error("Client Seed cannot be empty.")
      return
    }

    try {
      await placeBet({
        amount: parsedAmount,
        choice,
        clientSeed,
        target: TARGET_NUMBER,
      })
      setClientSeed(crypto.randomUUID())
    } catch (error) {
      console.error("Bet error:", error)
    }
  }

  return (
    <div className=" p-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Place Your Bet
      </h2>

      <div className="mb-4">
        <label
          htmlFor="betAmount"
          className="block text-sm font-mono text-foreground/60 mb-2"
        >
          BET AMOUNT
        </label>
        <div className="relative">
          <input
            id="betAmount"
            type="number"
            value={betAmount}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full pr-28 md:pr-32 pl-4 py-3 text-lg font-mono text-primary-foreground bg-primary rounded-md border focus:ring-2 focus:outline-none transition-colors ${
              isBetAmountInvalid
                ? "border-accent-loss ring-[accent-loss/0.5]"
                : "border-primary/20 focus:ring-[hsl(var(--primary))]"
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            <button
              onClick={() => modifyBet((b) => b / 2)}
              className="px-2 md:px-3 py-1 text-xs rounded bg-background hover:bg-background/90"
            >
              ½
            </button>
            <button
              onClick={() => modifyBet((b) => b * 2)}
              className="px-2 md:px-3 py-1 text-xs rounded bg-background hover:bg-background/90"
            >
              2x
            </button>
            <button
              onClick={() => modifyBet(() => balance)}
              className="px-2 md:px-3 py-1 text-xs rounded bg-background hover:bg-background/90"
            >
              Max
            </button>
          </div>
        </div>
        {isBetAmountInvalid && (
          <p className="mt-2 text-sm text-accent-loss">{isBetAmountInvalid}</p>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setIsFairnessOpen(!isFairnessOpen)}
          className="flex items-center gap-2 text-xs font-mono text-foreground/60 hover:text-foreground"
        >
          <span>Fairness Settings</span>
          <ChevronDownIcon isOpen={isFairnessOpen} />
        </button>
        {isFairnessOpen && (
          <div className="mt-4 animate-roll-in">
            <label
              htmlFor="clientSeed"
              className="block text-sm font-mono text-foreground/60 mb-2"
            >
              CLIENT SEED
            </label>
            <div className="relative">
              <input
                id="clientSeed"
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-2 text-sm font-mono text-foreground bg-[hsl(var(--background))] rounded-md border border-foreground/20 focus:ring-2 focus:ring-accent-loss focus:outline-none"
              />
              <button
                title="Generate new seed"
                onClick={() => setClientSeed(crypto.randomUUID())}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-foreground/60 hover:text-foreground"
              >
                <RefreshIcon />
              </button>
            </div>
            <p className="mt-2 text-xs text-foreground/50">
              You can change this seed to add your own randomness to the roll.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4 mb-6">
        <button
          onClick={() => setChoice("under")}
          disabled={isLoading}
          className={`py-3 md:py-4 text-lg md:text-xl font-bold rounded-md transition-all duration-200 ${
            choice === "under"
              ? "bg-primary text-primary-foreground ring-2 ring-primary"
              : "bg-background hover:bg-foreground/10"
          }`}
        >
          Under {TARGET_NUMBER}
        </button>
        <button
          onClick={() => setChoice("over")}
          disabled={isLoading}
          className={`py-3 md:py-4 text-lg md:text-xl font-bold rounded-md transition-all duration-200 ${
            choice === "over"
              ? "bg-primary text-primary-foreground ring-2 ring-primary"
              : "bg-background hover:bg-foreground/10"
          }`}
        >
          Over {TARGET_NUMBER}
        </button>
      </div>

      <button
        onClick={handleBet}
        disabled={
          isLoading ||
          !!isBetAmountInvalid ||
          !user ||
          !betAmount ||
          !clientSeed
        }
        className="w-full py-3 md:py-4 text-xl md:text-2xl font-bold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isLoading ? "Rolling..." : "Place Bet"}
      </button>

      {lastBetResult && <BetResultDisplay result={lastBetResult} />}
    </div>
  )
}
