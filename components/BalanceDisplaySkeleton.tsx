export default function BalanceDisplaySkeleton() {
  return (
    <div className="p-6 bg-mint-500 text-center animate-pulse">
      <h3 className="text-lg text-foreground/60 font-mono uppercase tracking-widest mb-2">
        Your Balance
      </h3>
      <div className="h-12 bg-foreground/20 rounded w-3/4 mx-auto"></div>
    </div>
  )
}