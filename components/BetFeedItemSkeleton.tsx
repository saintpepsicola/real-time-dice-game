"use client"

export default function BetFeedItemSkeleton() {
  return (
    <li className="flex justify-between items-center bg-background/50 p-2 rounded-md">
      <div className="flex-grow animate-pulse">
        <div className="h-4 bg-foreground/10 rounded w-3/4"></div>
      </div>
      <div className="w-10 animate-pulse">
        <div className="h-4 bg-foreground/10 rounded w-full"></div>
      </div>
    </li>
  )
}
