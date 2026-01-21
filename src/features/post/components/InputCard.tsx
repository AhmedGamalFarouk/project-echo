import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface InputCardProps extends React.ComponentProps<typeof Card> {
  onSubmit?: () => void
}

const InputCard = React.forwardRef<HTMLDivElement, InputCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "w-full rounded-none border border-border bg-black/60 backdrop-blur-md p-6 shadow-2xl",
          className
        )}
        {...props}
      >
        <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
          <span className="font-mono text-xs uppercase text-muted-foreground">
            :: SYSTEM_INPUT
          </span>
          <div className="flex space-x-1">
             <div className="h-2 w-2 bg-muted-foreground/20 rounded-full" />
             <div className="h-2 w-2 bg-muted-foreground/20 rounded-full" />
             <div className="h-2 w-2 bg-muted-foreground/20 rounded-full" />
          </div>
        </div>
        <CardContent className="p-0 pt-4">
           {children}
        </CardContent>
      </Card>
    )
  }
)
InputCard.displayName = "InputCard"

export { InputCard }
