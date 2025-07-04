import { runProvablyFairGame, verifyBet } from "../game"
import { createHash, createHmac } from "crypto"

describe("runProvablyFairGame", () => {
  beforeEach(() => {
    jest.spyOn(global.Date, "now").mockImplementation(() => 1625382000000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("should return valid game result structure", () => {
    const result = runProvablyFairGame("test-client-seed", "over", 50)

    expect(result).toHaveProperty("roll")
    expect(result).toHaveProperty("serverSeed")
    expect(result).toHaveProperty("serverSeedHash")
    expect(result).toHaveProperty("win")
    expect(typeof result.roll).toBe("number")
    expect(typeof result.serverSeed).toBe("string")
    expect(typeof result.serverSeedHash).toBe("string")
    expect(typeof result.win).toBe("boolean")
  })

  it("should return roll between 1 and 100", () => {
    for (let i = 0; i < 50; i++) {
      const result = runProvablyFairGame(`seed-${i}`, "over", 50)
      expect(result.roll).toBeGreaterThanOrEqual(1)
      expect(result.roll).toBeLessThanOrEqual(100)
    }
  })

  it("should determine win correctly for 'over' choice", () => {
    const result1 = runProvablyFairGame("test-seed-1", "over", 50)
    expect(result1.win).toBe(result1.roll > 50)

    const result2 = runProvablyFairGame("test-seed-2", "over", 99)
    expect(result2.win).toBe(result2.roll > 99)
  })

  it("should determine win correctly for 'under' choice", () => {
    const result1 = runProvablyFairGame("test-seed-3", "under", 50)
    expect(result1.win).toBe(result1.roll < 50)

    const result2 = runProvablyFairGame("test-seed-4", "under", 2)
    expect(result2.win).toBe(result2.roll < 2)
  })

  it("should generate same result with same inputs", () => {
    const result1 = runProvablyFairGame("same-seed", "over", 50)
    const result2 = runProvablyFairGame("same-seed", "over", 50)

    expect(result1.roll).toBe(result2.roll)
    expect(result1.serverSeed).toBe(result2.serverSeed)
    expect(result1.serverSeedHash).toBe(result2.serverSeedHash)
    expect(result1.win).toBe(result2.win)
  })

  it("should generate different results with different client seeds", () => {
    const result1 = runProvablyFairGame("seed-1", "over", 50)
    const result2 = runProvablyFairGame("seed-2", "over", 50)
    
    // The server seed is based on Date.now() which we've mocked, so it will be the same
    // between test runs. Instead, we'll verify that the hash of the result differs.
    expect(result1.roll).not.toBe(result2.roll)
    
    // Since we're using the same timestamp, serverSeed and serverSeedHash will be the same
    // Instead, let's verify the structure and that the hash is derived correctly
    expect(result1.serverSeed).toBeDefined()
    expect(result2.serverSeed).toBeDefined()
    expect(result1.serverSeedHash).toBeDefined()
    expect(result2.serverSeedHash).toBeDefined()
    
    // The win condition should be different due to different client seeds affecting the roll
    expect(result1.win !== result2.win || result1.roll !== result2.roll).toBe(true)
  })

  it("should handle edge case targets correctly", () => {
    const result1 = runProvablyFairGame("edge-seed-1", "over", 99)
    expect(result1.win).toBe(result1.roll > 99)

    const result2 = runProvablyFairGame("edge-seed-2", "under", 1)
    expect(result2.win).toBe(result2.roll < 1)
  })
})

describe("verifyBet", () => {
  // Generate test data
  const serverSeed = "test-server-seed-123"
  const serverSeedHash = createHash("sha256").update(serverSeed).digest("hex")
  const clientSeed = "test-client-seed-456"
  
  // Calculate a valid roll
  const hmac = createHmac("sha512", serverSeed)
  hmac.update(clientSeed)
  const resultHash = hmac.digest("hex")
  const decimal = parseInt(resultHash.substring(0, 5), 16)
  const validRoll = Math.floor((decimal % 10000) / 100) + 1

  const validBet = {
    id: "bet-123",
    roll: validRoll,
    serverSeed,
    serverSeedHash,
    clientSeed,
  }

  it("should return true for a valid bet", () => {
    expect(verifyBet(validBet)).toBe(true)
  })

  it("should return false if the server seed was tampered with", () => {
    const tamperedBet = {
      ...validBet,
      serverSeed: "tampered-server-seed",
    }
    expect(verifyBet(tamperedBet)).toBe(false)
  })

  it("should return false if the server seed hash doesn't match", () => {
    const tamperedBet = {
      ...validBet,
      serverSeedHash: "tampered-hash-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    }
    expect(verifyBet(tamperedBet)).toBe(false)
  })

  it("should return false if the client seed was tampered with", () => {
    const tamperedBet = {
      ...validBet,
      clientSeed: "tampered-client-seed",
    }
    expect(verifyBet(tamperedBet)).toBe(false)
  })

  it("should return false if the roll was tampered with", () => {
    const tamperedBet = {
      ...validBet,
      roll: validRoll + 1, // Change the roll
    }
    expect(verifyBet(tamperedBet)).toBe(false)
  })

  it("should return false if the bet ID is missing", () => {
    const { id, ...betWithoutId } = validBet
    expect(verifyBet({ ...betWithoutId, id: "" })).toBe(false)
  })
})
