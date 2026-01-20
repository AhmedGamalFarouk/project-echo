import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type MoodType = "Serene" | "Energetic" | "Melancholy" | "Anxious" | "Furious"

interface MoodButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  mood: MoodType
  selected?: boolean
}

// Map mood to Tailwind shadow classes (mapped in globals.css)
// Since dynamic classes can be tricky, we map to specific utility classes or style objects.
// However, Tailwind v4 allows dynamic values if we set them up.
// Let's use the --color-mood-* variables we defined.

const moodColorMap: Record<MoodType, string> = {
  Serene: "var(--mood-serene)",
  Energetic: "var(--mood-energetic)",
  Melancholy: "var(--mood-melancholy)",
  Anxious: "var(--mood-anxious)",
  Furious: "var(--mood-furious)",
}

const MoodButton = React.forwardRef<HTMLButtonElement, MoodButtonProps>(
  ({ className, mood, selected, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "h-12 w-full justify-start rounded-none border-muted-foreground/30 bg-background transition-all duration-300",
          "hover:border-transparent hover:text-black hover:shadow-[0_0_15px_var(--mood-color)] hover:bg-[var(--mood-color)]",
          selected && "border-transparent text-black shadow-[0_0_15px_var(--mood-color)] bg-[var(--mood-color)]",
          className
        )}
        style={
          {
            "--mood-color": moodColorMap[mood],
          } as React.CSSProperties
        }
        {...props}
      >
        <span className="mr-2 text-base">
          {mood === "Serene" && "●"}
          {mood === "Energetic" && "▲"}
          {mood === "Melancholy" && "■"}
          {mood === "Anxious" && "◆"}
          {mood === "Furious" && "✖"}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider truncate">{mood}</span>
      </Button>
    )
  }
)
MoodButton.displayName = "MoodButton"

export { MoodButton }
