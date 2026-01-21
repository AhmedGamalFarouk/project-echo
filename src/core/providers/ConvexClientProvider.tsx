"use client";

import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { dark } from "@clerk/themes";

// Initialize Convex Client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);



export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#ffffff", // High contrast white for primary actions
          colorBackground: "#0a0a0a", // Deep charcoal/black
          colorText: "#e5e5e5",
          fontFamily: "var(--font-geist-mono), monospace", // Force app font
          borderRadius: "0px", // Brutalist sharp corners
        },
        elements: {
          card: "rounded-none border-2 border-white/10 bg-black/90 backdrop-blur-md shadow-2xl",
          formButtonPrimary: "rounded-none text-black bg-white hover:bg-white/90 uppercase font-mono tracking-widest",
          footerActionLink: "text-primary hover:text-primary/90",
          formFieldInput: "rounded-none border-white/20 bg-white/5 focus:border-white/50 transition-colors font-mono",
          headerTitle: "font-mono tracking-tighter uppercase",
          headerSubtitle: "font-mono text-muted-foreground",
          navbarButton: "font-mono",
          userButtonPopoverCard: "rounded-none border border-white/10 bg-black",
          userButtonPopoverActionButton: "hover:bg-white/10 rounded-none font-mono",
          userButtonPopoverFooter: "hidden", // Minimize noise
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
