import type { MoodType } from "../types/post";

export const MOODS: readonly MoodType[] = [
  "Serene",
  "Melancholy",
  "Excited",
  "Anxious",
  "Content",
  "Frustrated",
] as const;

export const MOOD_COLORS: Record<MoodType, string> = {
  Serene: "#4A90E2",      // Calm blue
  Melancholy: "#6B5B95",  // Muted purple
  Excited: "#F7B731",     // Vibrant yellow
  Anxious: "#E74C3C",     // Alert red
  Content: "#26DE81",     // Peaceful green
  Frustrated: "#FD7272",  // Intense orange-red
} as const;

export const APP_NAME = "Project ECHO";
export const APP_DESCRIPTION = "The social network that forgets.";
