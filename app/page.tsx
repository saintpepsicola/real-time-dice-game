"use client"

import { useState } from "react"
import { useAuthMutations } from "@/hooks/useAuthMutations"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const { login, isLoggingIn } = useAuthMutations()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError("Username cannot be empty.")
      return
    }

    try {
      await login({ username })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background font-sans">
      <div className="w-full max-w-md p-8 space-y-6 ">
        <h1 className="text-3xl font-bold text-center text-foreground">
          Welcome to Dice Arena
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-lg text-foreground bg-background rounded-md border border-foreground/20 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Enter your username"
            />
          </div>
          {error && <p className="text-sm text-accent-loss">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full px-4 py-3 font-bold text-lg text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground mr-3"></div>
                  Entering...
                </>
              ) : (
                "Play Now"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}