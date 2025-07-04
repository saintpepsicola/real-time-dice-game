import { NextResponse } from "next/server";
import { verifyBet } from "@/lib/game";
import { ApiError, withApiErrorHandling } from "@/lib/api-error";
import { z } from "zod";

const betVerificationSchema = z.object({
  id: z.string(),
  roll: z.number(),
  serverSeed: z.string(),
  serverSeedHash: z.string(),
  clientSeed: z.string(),
});

export const POST = withApiErrorHandling(async (req: Request) => {
  const body = await req.json();
  const validation = betVerificationSchema.safeParse(body);

  if (!validation.success) {
    throw new ApiError("Invalid bet data for verification", 400);
  }

  const isVerified = verifyBet(validation.data);

  return NextResponse.json({ isVerified });
});