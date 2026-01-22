import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CommentSection } from "@/features/comments"
import { Id } from "../../../../convex/_generated/dataModel"

interface FeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  postId: Id<"posts">
  city: string
  country: string
  content: string
  timestamp: number
  isPrivate?: boolean
  index?: number
}

const FeedCard = React.forwardRef<HTMLDivElement, FeedCardProps>(
  ({ className, postId, city, country, content, timestamp, isPrivate, index, ...props }, ref) => {
    const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
    
    return (
      <div className="h-screen w-full snap-start snap-always flex items-center justify-center px-4 relative">
        {/* Post Number Indicator */}
        <div className="absolute top-8 left-8 font-mono text-xs text-muted-foreground/40 tracking-widest">
          {index !== undefined && `ECHO_${String(index + 1).padStart(3, '0')}`}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <div className="font-mono text-[10px] text-muted-foreground/60 tracking-widest animate-pulse">
            SCROLL
          </div>
          <div className="h-6 w-px bg-linear-to-b from-muted-foreground/60 to-transparent" />
        </div>

        <Card
          ref={ref}
          className={cn(
            "group relative max-w-2xl w-full overflow-hidden rounded-none border-l-4 border-y border-r border-primary/20 bg-black/60 backdrop-blur-md transition-all duration-500 hover:bg-black/70 hover:border-l-8 hover:shadow-2xl hover:border-primary/40",
            className
          )}
          {...props}
        >
          <CardHeader className="flex flex-row items-baseline justify-between py-6 pb-4 border-b border-white/5">
            <div className="font-mono text-sm uppercase tracking-widest text-muted-foreground space-y-2">
              <div className="flex items-center gap-3">
                <div 
                  className="h-2 w-2 rounded-full animate-pulse bg-primary" 
                />
                <span className="text-foreground text-base">{city}, {country}</span>
              </div>
              <div className="flex items-center gap-2 pl-5">
                <span className="text-[10px] opacity-50">{timeAgo}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-8 px-6">
            <p className="font-mono text-base leading-loose whitespace-pre-wrap text-foreground/95">
              {content}
            </p>
            {isPrivate && (
               <div className="absolute top-4 right-4 h-2 w-2 animate-pulse rounded-full bg-white/20" />
            )}
          </CardContent>

          {/* Comments Section */}
          <CommentSection postId={postId} />
          
          {/* Enhanced Scanline effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] opacity-5 bg-size-[100%_4px,3px_100%] z-20" />
          
          {/* Corner Accent */}
          <div 
            className="absolute bottom-0 right-0 h-12 w-12 opacity-20 bg-linear-to-br from-transparent via-transparent to-primary/30"
          />
        </Card>
      </div>
    )
  }
)
FeedCard.displayName = "FeedCard"

export { FeedCard }
