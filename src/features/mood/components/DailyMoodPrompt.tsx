"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { MoodButton } from "@/features/post/components/MoodButton";
import { Loader2 } from "lucide-react";

type MoodType = "Serene" | "Energetic" | "Melancholy" | "Anxious" | "Furious";

interface DailyMoodPromptProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMoodLogged?: (mood: MoodType) => void;
  location?: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  } | null;
}

export function DailyMoodPrompt({
  open: controlledOpen,
  onOpenChange,
  onMoodLogged,
  location,
}: DailyMoodPromptProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [selectedMood, setSelectedMood] = React.useState<MoodType | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled or internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // Check if user has already logged mood today
  const hasLoggedToday = useQuery(
    api.moods.hasLoggedToday,
    isSignedIn ? {} : "skip"
  );

  // Mutation to log mood
  const logMood = useMutation(api.moods.logMood);

  // Auto-show prompt if user hasn't logged today (only for internal state)
  React.useEffect(() => {
    if (
      isLoaded &&
      isSignedIn &&
      hasLoggedToday === false &&
      controlledOpen === undefined
    ) {
      // Small delay for better UX
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, hasLoggedToday, controlledOpen, setOpen]);

  // Handle mood selection and submission
  const handleMoodSelect = async (mood: MoodType) => {
    if (!location) {
      console.error("Location not available for mood logging");
      return;
    }

    setSelectedMood(mood);
    setIsSubmitting(true);

    try {
      await logMood({
        mood,
        city: location.city,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      });

      onMoodLogged?.(mood);
      setOpen(false);
    } catch (error) {
      console.error("Failed to log mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not signed in or already logged today
  if (!isLoaded || !isSignedIn || hasLoggedToday === true) {
    return null;
  }

  const moods: MoodType[] = ["Serene", "Energetic", "Melancholy", "Anxious", "Furious"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md border-white/10 bg-black/95 backdrop-blur-xl"
        hideClose={isSubmitting}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-xl tracking-widest">
            :: DAILY_CHECK-IN ::
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            How are you feeling today?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {moods.map((mood) => (
            <MoodButton
              key={mood}
              mood={mood}
              selected={selectedMood === mood}
              disabled={isSubmitting}
              onClick={() => handleMoodSelect(mood)}
              className="w-full"
            />
          ))}
        </div>

        {isSubmitting && (
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs uppercase tracking-wider">
              Logging mood...
            </span>
          </div>
        )}

        {!location && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <span className="text-yellow-500">:: LOCATION_REQUIRED ::</span>
            <p className="mt-1">Please enable location to log your mood</p>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-white/20 to-transparent" />
          <div className="absolute top-0 left-0 w-px h-16 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="absolute bottom-0 right-0 w-16 h-px bg-gradient-to-l from-white/20 to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-16 bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      </DialogContent>
    </Dialog>
  );
}