"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import NavBar from "@/core/layouts/NavBar";
import { PostingForm } from "@/features/post";
import { LocationPrompt } from "@/features/location";
import { Feed } from "@/features/feed";
import { MoodMap } from "@/features/map";

export default function Home() {
  const { isSignedIn } = useAuth();
  const [currentTab, setCurrentTab] = useState("feed");
  
  // Check if location prompt should be shown initially
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("echo_location_preference");
      return !stored; // Show prompt if no preference is stored
    }
    return false;
  });
  
  const [locationState, setLocationState] = useState({
    status: "idle",
    city: undefined
  });

  const handleLocationUpdate = useCallback((status, city) => {
    setLocationState({ status, city });
    // Close prompt when GPS succeeds
    if (status === "success") {
      setShowLocationPrompt(false);
    }
  }, []);

  const handleLocationClick = useCallback(() => {
    setShowLocationPrompt(true);
  }, []);

  const handleLocationPromptClose = useCallback(() => {
    setShowLocationPrompt(false);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
      
      {/* Location Prompt Dialog */}
      <LocationPrompt 
        open={showLocationPrompt}
        onLocationMethodSelected={(method, cityData) => {
          if (method === "manual" && cityData) {
            // Manual city selected - update immediately and close
            handleLocationUpdate("success", cityData.city);
            handleLocationPromptClose();
          } else if (method === "gps") {
            // GPS selected - keep dialog open while locating
            handleLocationUpdate("locating");
          }
        }}
        onClose={handleLocationPromptClose}
      />

      {/* Top Navigation */}
      <NavBar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        locationCity={locationState.city}
        locationStatus={locationState.status}
        onLocationClick={handleLocationClick}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full z-10 relative">
        
        {/* Conditional View */}
        {currentTab === "map" ? (
             <section className="w-full h-[calc(100vh-100px)] animate-fade-in relative container mx-auto px-4 max-w-6xl">
                 <div className="glass-panel border-white/10 h-full p-1">
                    <MoodMap />
                 </div>
             </section>
        ) : (
             <div className="relative w-full h-[calc(100vh-6rem)] animate-fade-in">
                {/* Sticky Access Terminal / Posting Form */}
                <div className="hidden lg:flex fixed top-24 right-8 z-50 w-80 flex-col">
                  {isSignedIn ? (
                      <PostingForm 
                        onLocationUpdate={handleLocationUpdate}
                        onLocationMethodSelected={(method, cityData) => {
                          if (method === "manual" && cityData) {
                            handleLocationUpdate("success", cityData.city);
                            handleLocationPromptClose();
                          } else if (method === "gps") {
                            handleLocationUpdate("locating");
                            // Dialog will close on GPS success via handleLocationUpdate
                          }
                        }}
                      />
                  ) : (
                     <div className="border border-white/5 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 space-y-4 shadow-2xl">
                          <span className="font-mono text-muted-foreground animate-pulse text-xs tracking-widest text-center">
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
                </div>
                
                {/* Mobile Post Button - Bottom Right FAB */}
                {isSignedIn && (
                  <button 
                    className="lg:hidden fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-primary text-background flex items-center justify-center shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 group"
                    onClick={() => window.alert("Mobile posting form - to be implemented with modal")}
                  >
                    <Send className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                )}
                
                {/* Feed - Full Screen Experience */}
                <Feed />
             </div>
        )}

      </div>
    </main>
  );
}
