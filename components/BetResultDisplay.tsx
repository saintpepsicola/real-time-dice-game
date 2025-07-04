import { memo } from 'react';

interface BetResult {
  win: boolean
  roll: number
  payout: number
}

export const BetResultDisplay = memo(function BetResultDisplay({ result }: { result: BetResult }) {
  const isWin = result.win
  return (
    <div
      className={`mt-6 p-4 rounded-lg animate-roll-in ${
        isWin
          ? "bg-accent-win/20 border border-accent-win"
          : "bg-accent-loss/20 border border-accent-loss"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="font-mono">
          <p className="text-sm text-foreground/60">Dice Roll</p>
          <p className="text-4xl font-bold text-foreground">{result.roll}</p>
        </div>
        <div className="text-right">
          <p
            className={`text-2xl font-bold ${
              isWin ? "text-accent-win" : "text-accent-loss"
            }`}
          >
            {isWin ? "You Won!" : "You Lost"}
          </p>
          {isWin && (
            <p className="font-mono text-accent-win">
              +${result.payout.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
});