"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { InputCard } from "./InputCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface StoredLocationPreference {
  method: "gps" | "manual";
  cityData?: {
    cityName: string;
    lat: number;
    lon: number;
    city: string;
    country: string;
  };
  timestamp: number;
}

interface PostingFormProps {
  onLocationUpdate?: (status: "idle" | "locating" | "success" | "error", city?: string) => void;
  onLocationMethodSelected?: (
    method: "gps" | "manual", 
    cityData?: { cityName: string; lat: number; lon: number; city: string; country: string }
  ) => void;
}

export default function PostingForm({ onLocationUpdate, onLocationMethodSelected }: PostingFormProps) {
    const [content, setContent] = useState("");
    const [locationState, setLocationState] = useState<{
        status: "idle" | "locating" | "success" | "error";
        city?: string;
        country?: string;
        lat?: number;
        lon?: number;
        error?: string;
    }>({ status: "idle" });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [locationPreference, setLocationPreference] = useState<StoredLocationPreference | null>(null);

    // Convex Hooks
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
    const identifyCity = useAction(api.location.identifyCity);
    const createPost = useMutation(api.posts.create);

    // Check for stored location preference on mount
    useEffect(() => {
        const stored = localStorage.getItem("echo_location_preference");
        if (stored) {
            try {
                const preference: StoredLocationPreference = JSON.parse(stored);
                setLocationPreference(preference);
                
                // Auto-fetch location based on stored preference
                if (preference.method === "gps") {
                    fetchGPSLocation();
                } else if (preference.method === "manual" && preference.cityData) {
                    // Use stored coordinates directly
                    const newState = {
                        status: "success" as const,
                        lat: preference.cityData.lat,
                        lon: preference.cityData.lon,
                        city: preference.cityData.city,
                        country: preference.cityData.country
                    };
                    setLocationState(newState);
                    onLocationUpdate?.("success", preference.cityData.city);
                }
            } catch (error) {
                console.error("Failed to parse location preference:", error);
            }
        } else {
            // No preference stored, don't show prompt here - it's managed at page level
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchGPSLocation = async () => {
        if (!navigator.geolocation) {
            const errorState = { status: "error" as const, error: "Geolocation not supported" };
            setLocationState(errorState);
            onLocationUpdate?.("error");
            return;
        }

        setLocationState({ status: "locating" });
        onLocationUpdate?.("locating");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const loc = await identifyCity({ lat: latitude, lon: longitude });
                    
                    const newState = {
                        status: "success" as const,
                        lat: latitude,
                        lon: longitude,
                        city: loc.city,
                        country: loc.country
                    };
                    setLocationState(newState);
                    onLocationUpdate?.("success", loc.city);
                } catch (err) {
                    const errorState = { 
                        status: "error" as const, 
                        error: "Failed to identify city",
                        lat: latitude,
                        lon: longitude,
                        city: "Unknown",
                        country: "XX" 
                    };
                    setLocationState(errorState);
                    onLocationUpdate?.("error", "Unknown");
                }
            },
            (error) => {
                console.error("GPS Error:", error);
                const errorState = { status: "error" as const, error: error.message };
                setLocationState(errorState);
                onLocationUpdate?.("error");
            },
            {
                timeout: 10000, // 10 second timeout
                enableHighAccuracy: false,
                maximumAge: 300000 // Accept cached position up to 5 minutes old
            }
        );
    };



    const handleLocationMethodSelected = async (
        method: "gps" | "manual", 
        cityData?: { cityName: string; lat: number; lon: number; city: string; country: string }
    ) => {
        const preference: StoredLocationPreference = {
            method,
            cityData,
            timestamp: Date.now()
        };
        
        // Store preference in localStorage
        localStorage.setItem("echo_location_preference", JSON.stringify(preference));
        setLocationPreference(preference);
        
        // Notify parent component
        onLocationMethodSelected?.(method, cityData);
        
        // Fetch location based on selected method
        if (method === "gps") {
            await fetchGPSLocation();
        } else if (method === "manual" && cityData) {
            // Use provided coordinates directly
            const newState = {
                status: "success" as const,
                lat: cityData.lat,
                lon: cityData.lon,
                city: cityData.city,
                country: cityData.country
            };
            setLocationState(newState);
            onLocationUpdate?.("success", cityData.city);
        }
    };

    const handleSubmit = async () => {
        // Clear previous error
        setSubmitError(null);
        
        console.log("Submit clicked - validating...");
        console.log("Content:", content.trim() ? "valid" : "empty");
        console.log("Location state:", locationState);
        console.log("Auth state:", { isAuthenticated, isAuthLoading });
        
        // Check authentication first
        if (isAuthLoading) {
            setSubmitError("Authentication is loading. Please wait.");
            return;
        }
        
        if (!isAuthenticated) {
            setSubmitError("You must be signed in to post. Please sign in and try again.");
            return;
        }
        
        if (!content.trim()) {
            setSubmitError("Please write something before posting.");
            return;
        }
        
        if (!locationState.lat || !locationState.lon) {
            setSubmitError("Location is required. Please allow location access or select a city.");
            return;
        }
        
        setIsSubmitting(true);
        console.log("Submitting post...");
        
        try {
            await createPost({
                type: "text",
                content: content,
                lat: locationState.lat,
                lon: locationState.lon,
                city: locationState.city || "Unknown",
                country: locationState.country || "XX",
            });
            
            console.log("Post created successfully!");
            
            // Reset Form
            setContent("");
            setSubmitError(null);
        } catch (error: unknown) {
            console.error("Post creation error:", error);
            
            // Extract error message
            let errorMessage = "Unknown error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "object" && error !== null && "message" in error) {
                errorMessage = String((error as { message: unknown }).message);
            }
            
            // Provide user-friendly error messages
            if (errorMessage.includes("Unauthorized") || errorMessage.includes("Not authenticated")) {
                setSubmitError("Authentication error. Please sign out and sign back in.");
            } else if (errorMessage.includes("rate limit")) {
                setSubmitError("Too many requests. Please wait a moment and try again.");
            } else {
                setSubmitError(`Failed to post: ${errorMessage}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="w-full space-y-4">
            <InputCard className="border-t-4 border-t-primary/20 bg-black/90 backdrop-blur-lg shadow-2xl">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                    <h3 className="font-mono text-xs tracking-widest text-primary uppercase">
                        New Echo
                    </h3>
                    {/* Location Status Indicator */}
                    <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-2">
                        {locationState.status === "locating" && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Locating...</span>
                            </>
                        )}
                        {locationState.status === "success" && locationState.city && (
                            <>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <span>{locationState.city}, {locationState.country}</span>
                            </>
                        )}
                        {locationState.status === "error" && (
                            <>
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span>Location Error</span>
                            </>
                        )}
                        {locationState.status === "idle" && (
                            <>
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span>No Location</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Textarea for Post Content */}
                <Textarea
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        if (submitError) setSubmitError(null); // Clear error on typing
                    }}
                    placeholder="What echoes through your mind tonight?"
                    className="min-h-30 rounded-none border-white/10 bg-white/5 focus:bg-white/10 font-mono text-sm resize-none transition-colors"
                    maxLength={500}
                />

                {/* Error Display */}
                {submitError && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-none">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="font-mono text-xs text-red-400">{submitError}</p>
                    </div>
                )}

                {/* Auth Loading Warning */}
                {isAuthLoading && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-none">
                        <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                        <p className="font-mono text-xs text-yellow-400">Authenticating...</p>
                    </div>
                )}

                {/* Post Action */}
                <div className="flex justify-end mt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSubmitting || locationState.status === 'locating' || !locationState.lat || isAuthLoading}
                        className="rounded-none px-6 font-mono tracking-widest uppercase hover:bg-primary/90 text-xs"
                        size="sm"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : (
                            <Send className="mr-1.5 h-3 w-3" />
                        )}
                        Echo
                    </Button>
                </div>
            </InputCard>
        </section>
    );
}
