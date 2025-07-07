import { createHmac, createHash } from "crypto"

const SERVER_SECRET = process.env.SERVER_SECRET

if (!SERVER_SECRET) {
  throw new Error("SERVER_SECRET is not defined in environment variables.")
}

const TYPED_SERVER_SECRET: string = SERVER_SECRET

export function verifyBet(bet: {
  id: string
  roll: number
  serverSeed: string
  serverSeedHash: string
  clientSeed: string
}): boolean {
  if (!bet.id || typeof bet.id !== "string" || bet.id.trim() === "") {
    console.error("Invalid bet ID")
    return false
  }
  const rehashedServerSeed = createHash("sha256")
    .update(bet.serverSeed)
    .digest("hex")
  if (rehashedServerSeed !== bet.serverSeedHash) {
    console.error("Server seed hash mismatch!")
    return false
  }

  const hmac = createHmac("sha512", bet.serverSeed)
  hmac.update(bet.clientSeed)
  const resultHash = hmac.digest("hex")
  const decimal = parseInt(resultHash.substring(0, 5), 16)
  const roll = Math.floor((decimal % 10000) / 100) + 1

  return roll === bet.roll
}

export function runProvablyFairGame(
  clientSeed: string,
  choice: "over" | "under",
  target: number
) {
  const serverSeed = createHash("sha256")
    .update(TYPED_SERVER_SECRET + Date.now())
    .digest("hex")
  const serverSeedHash = createHash("sha256").update(serverSeed).digest("hex")

  const hmac = createHmac("sha512", serverSeed)
  hmac.update(clientSeed)
  const resultHash = hmac.digest("hex")

  const decimal = parseInt(resultHash.substring(0, 5), 16)
  const roll = (decimal % 10000) / 100

  const diceRoll = Math.floor(roll) + 1

  let win = false
  if (choice === "over" && diceRoll > target) {
    win = true
  } else if (choice === "under" && diceRoll < target) {
    win = true
  }

  return {
    roll: diceRoll,
    serverSeed,
    serverSeedHash,
    win,
  }
}
