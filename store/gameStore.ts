import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { User, Bet } from "@/types"

interface GameState {
  user: User | null
  lastBetResult: Bet | null
  setLastBetResult: (result: Bet | null) => void
  setUser: (user: User | null) => void
  setBalance: (newBalance: number) => void
  reset: () => void
}

// Wrap the store creator with the immer middleware
export const useGameStore = create<GameState>()(
  immer((set) => ({
    user: null,
    lastBetResult: null,
    setLastBetResult: (result) => {
      set((state) => {
        state.lastBetResult = result
      })
    },
    setUser: (user) => {
      set((state) => {
        state.user = user
      })
    },
    setBalance: (newBalance) => {
      set((state) => {
        if (state.user) {
          state.user.balance = newBalance
        }
      })
    },
    reset: () => {
      set((state) => {
        state.user = null
        state.lastBetResult = null
      })
    },
  }))
)