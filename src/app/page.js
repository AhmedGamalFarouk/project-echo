"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import PostingForm from "@/components/PostingForm";
import Feed from "@/components/Feed";
import MoodMap from "@/components/MoodMap";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [currentTab, setCurrentTab] = useState("feed");

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
      
      {/* Top Navigation */}
      <NavBar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 pt-24 pb-12 w-full z-10">
        
        {/* Conditional View */}
        {currentTab === "map" ? (
             <section className="w-full h-[calc(100vh-100px)] animate-fade-in relative container mx-auto px-4 max-w-6xl">
                 <div className="glass-panel border-white/10 h-full p-1">
                    <MoodMap />
                 </div>
             </section>
        ) : (
             <div className="flex flex-col items-center space-y-12 animate-fade-in px-4 max-w-2xl mx-auto">
                {/* Posting Form - Only if Signed In */}
                {isSignedIn ? (
                    <PostingForm />
                ) : (
                   <div className="w-full h-64 border border-white/5 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm space-y-6">
                        <span className="font-mono text-muted-foreground animate-pulse text-sm">
                            :: SECURE_CHANNEL_LOCKED ::
                        </span>
                        <SignInButton mode="modal">
                            <Button 
                                variant="outline" 
                                className="group relative h-10 px-6 overflow-hidden rounded-none border-primary/50 bg-background/50 text-primary font-mono text-xs uppercase tracking-widest hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
                            >
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-500">
                                    <span className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                                </span>
                                <span className="relative flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                    Access_Terminal
                                </span>
                            </Button>
                        </SignInButton>
                    </div>
                )}
                
                {/* Feed - Always Visible */}
                <Feed />
             </div>
        )}

      </div>
    </main>
  );
}
