"use client";

export default function BetHistorySkeleton() {
  return (
    <div className="space-y-3">
      <div className="sm:hidden space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-foreground/5 rounded-lg p-4 space-y-2 border border-foreground/10 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-24"></div>
                <div className="h-3 bg-foreground/10 rounded w-32"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 bg-foreground/10 rounded w-16"></div>
                <div className="h-3 bg-foreground/10 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm font-mono">
          <thead className="bg-foreground/5">
            <tr>
              <th className="p-3 text-xs text-foreground/60 font-normal">Amount</th>
              <th className="p-3 text-xs text-foreground/60 font-normal">Result</th>
              <th className="p-3 text-xs text-foreground/60 font-normal">Payout</th>
              <th className="p-3 text-xs text-foreground/60 font-normal hidden md:table-cell">Date</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-foreground/5 animate-pulse">
                <td className="p-3">
                  <div className="h-4 bg-foreground/10 rounded w-20"></div>
                </td>
                <td className="p-3">
                  <div className="h-4 bg-foreground/10 rounded w-16"></div>
                  <div className="h-3 bg-foreground/10 rounded w-24 mt-1"></div>
                </td>
                <td className="p-3">
                  <div className="h-4 bg-foreground/10 rounded w-16"></div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <div className="h-4 bg-foreground/10 rounded w-32"></div>
                </td>
                <td className="p-3">
                  <div className="h-6 w-6 bg-foreground/10 rounded-full"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}