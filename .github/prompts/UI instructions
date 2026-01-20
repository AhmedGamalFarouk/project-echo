Here is a precise, architect-level prompt designed to generate a sophisticated design system for **Project ECHO**. It enforces the "Avant-Garde" aesthetic while strictly adhering to library discipline.

---

### The Prompt

**Context:**
You are a Senior UI Engineer building the design system for **Project ECHO** (An ephemeral, anonymous social network). The aesthetic is **"Digital Brutalism meets Bioluminescence."** It must feel raw, terminal-like, yet emotional.

**Tech Stack:**

- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS.
- **Library:** Shadcn UI (Radix Primitives). **DO NOT** build primitives from scratch. Customise the existing Shadcn components via `className` or `cva` variants.

**Task 1: Tailwind Configuration (`tailwind.config.ts`)**
Extend the theme to create a "Dark Mode Only" system.

- **Colors:**
  - Background: Pure OLED Black (`#000000`) and Deep Charcoal (`#0a0a0a`).
  - Foreground: Off-white/Gray (`#e5e5e5`) for text (never pure white).
  - **Mood Palette (Neon/Pastel):**
    - Serene: Mint Green (`#6EE7B7`)
    - Energetic: Electric Yellow (`#FDE047`)
    - Melancholy: Deep Cobalt (`#3B82F6`)
    - Anxious: Ultraviolet (`#8B5CF6`)
    - Furious: Crimson (`#EF4444`)
- **Typography:** Force a Monospaced stack (Inter, Courier, or Geist Mono) for _everything_.
- **Border Radius:** `0px` (Sharp/Brutalist).
- **Animations:** Add a custom `pulse-slow` and `fade-in` for the map markers.

**Task 2: UI Component Styling**
Create/Style the following using Shadcn components as the base:

1.  **The Input Card:** A `Card` component that looks like a terminal entry. Minimal borders, heavy padding.
2.  **Mood Button:** A `Button` variant that is outlined, mono-text, and glows with the specific mood color on hover (using Tailwind's `shadow-[color]` utilities).
3.  **The Feed Item:** A `Card` that uses `CardHeader` for the city/time and `CardContent` for the text. It should feel like a "transmission."
4.  **The Glass Overlay:** A utility class for the Map UI (absolute positioning, backdrop-blur-md, thin borders).

**Constraint:**
Maintain **Intentional Minimalism**. Use whitespace aggressively. If an element does not aid the user in "Posting" or "Reflecting," remove it.

**Output:**
Provide the full `tailwind.config.ts` content and the React code for the `MoodButton` and `FeedCard` components.
