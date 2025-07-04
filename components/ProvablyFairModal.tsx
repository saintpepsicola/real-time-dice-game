"use client"

import { memo, useState } from "react";
import { FullBetDetails } from "@/types";

const ProvablyFairModal = memo(function ProvablyFairModal({
  bet,
  onClose,
}: {
  bet: FullBetDetails;
  onClose: () => void;
}) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/verify-bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bet.id,
          roll: bet.roll,
          serverSeed: bet.serverSeed,
          serverSeedHash: bet.serverSeedHash,
          clientSeed: bet.clientSeed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify bet");
      }

      const data = await response.json();
      setIsVerified(data.isVerified);
    } catch (error) {
      console.error("Error verifying bet:", error);
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-2">
      <p className="text-xs font-mono text-foreground/60">{label}</p>
      <p className="p-2 text-sm font-mono break-all bg-background/50 rounded">
        {value}
      </p>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-lg bg-background border border-foreground/70"
      >
        <h3 className="text-xl font-bold mb-4">Bet Verification</h3>
        <Field label="Bet ID" value={bet.id} />
        <Field label="Server Seed Hash (pre-bet)" value={bet.serverSeedHash} />
        <Field label="Client Seed (your input)" value={bet.clientSeed} />
        <Field label="Server Seed (revealed post-bet)" value={bet.serverSeed} />
        <Field label="Final Dice Roll" value={String(bet.roll)} />

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? "Verifying..." : "Verify Bet"}
          </button>
          {isVerified === true && (
            <span className="font-bold text-sm text-[hsl(var(--accent-win))]">
              ✅ Verification Successful
            </span>
          )}
          {isVerified === false && (
            <span className="font-bold text-sm text-[hsl(var(--accent-loss))]">
              ❌ Verification Failed
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProvablyFairModal;