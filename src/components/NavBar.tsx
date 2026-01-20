"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioTower, Globe } from "lucide-react";

interface NavBarProps {
    currentTab: "feed" | "map";
    onTabChange: (tab: "feed" | "map") => void;
}

export default function NavBar({ currentTab, onTabChange }: NavBarProps) {
    const { isSignedIn } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 px-4 h-16 flex items-center justify-between bg-black/80 backdrop-blur-xl">
           {/* Logo / Title */}
           <div className="flex items-center">
                <span className="font-mono font-bold text-lg tracking-tighter text-foreground cursor-pointer" onClick={() => onTabChange("feed")}>
                    PROJECT_ECHO
                </span>
           </div>

           {/* Central Tabs */}
           <div className="absolute left-1/2 -translate-x-1/2 flex space-x-1 bg-white/5 p-1 rounded-none border border-white/5">
                <Button
                    variant="ghost" 
                    onClick={() => onTabChange("feed")}
                    className={cn(
                        "rounded-none font-mono text-xs uppercase tracking-widest transition-all h-8 px-4",
                        currentTab === "feed" 
                            ? "bg-white/10 text-primary shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <RadioTower className="w-3 h-3 mr-2" />
                    Feed
                </Button>
                <Button
                    variant="ghost" 
                    onClick={() => onTabChange("map")}
                    className={cn(
                        "rounded-none font-mono text-xs uppercase tracking-widest transition-all h-8 px-4",
                        currentTab === "map" 
                            ? "bg-white/10 text-primary shadow-[0_0_10px_rgba(255,255,255,0.05)] border border-white/10" 
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <Globe className="w-3 h-3 mr-2" />
                    Map
                </Button>
           </div>

           {/* Auth */}
           <div className="flex items-center">
                {!isSignedIn ? (
                    <SignInButton mode="modal">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="font-mono text-xs uppercase tracking-widest hover:bg-white/10 hover:text-primary rounded-none border border-transparent hover:border-white/10"
                        >
                            [ Log_In ]
                        </Button>
                    </SignInButton>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse hidden sm:block" />
                        <UserButton 
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8 rounded-none border border-white/20"
                                }
                            }}
                        />
                    </div>
                )}
           </div>
        </nav>
    )
}
