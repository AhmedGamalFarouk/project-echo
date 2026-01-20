import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface FeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  city: string
  country: string
  mood: string // "Serene" | ...
  content: string
  timestamp: number
  isPrivate?: boolean
}

const moodBorderMap: Record<string, string> = {
  Serene: "border-[var(--mood-serene)]",
  Energetic: "border-[var(--mood-energetic)]",
  Melancholy: "border-[var(--mood-melancholy)]",
  Anxious: "border-[var(--mood-anxious)]",
  Furious: "border-[var(--mood-furious)]",
}

const FeedCard = React.forwardRef<HTMLDivElement, FeedCardProps>(
  ({ className, city, country, mood, content, timestamp, isPrivate, ...props }, ref) => {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
    
    // Default to 'border-l-2' with the mood color to give that "transmission" feel
    // Using inline style for border color to ensure it matches mood exact
    
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative mb-4 overflow-hidden rounded-none border-l-2 border-y-0 border-r-0 bg-transparent transition-colors hover:bg-white/5",
          className
        )}
        style={{ borderColor: `var(--mood-${mood.toLowerCase()})` }}
        {...props}
      >
        <CardHeader className="flex flex-row items-baseline justify-between py-3 pb-2">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <span className="text-foreground">{city}, {country}</span>
            <span className="mx-2 opacity-50">/</span>
            <span className={cn("font-bold")} style={{ color: `var(--mood-${mood.toLowerCase()})` }}>
              {mood}
            </span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/60">
            {timeAgo}
          </div>
        </CardHeader>
        <CardContent className="py-2 pb-4">
          <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
            {content}
          </p>
          {isPrivate && (
             <div className="absolute top-2 right-2 h-1.5 w-1.5 animate-pulse rounded-full bg-white/20" />
          )}
        </CardContent>
        {/* Scanline effect optional */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] opacity-10 bg-size-[100%_4px,3px_100%] z-20" />
      </Card>
    )
  }
)
FeedCard.displayName = "FeedCard"

export { FeedCard }
