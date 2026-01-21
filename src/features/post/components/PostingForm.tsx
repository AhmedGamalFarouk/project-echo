"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { InputCard } from "./InputCard";
import { MoodButton } from "./MoodButton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

type MoodType = "Serene" | "Energetic" | "Melancholy" | "Anxious" | "Furious";

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
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const [locationState, setLocationState] = useState<{
        status: "idle" | "locating" | "success" | "error";
        city?: string;
        country?: string;
        lat?: number;
        lon?: number;
        error?: string;
    }>({ status: "idle" });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationPreference, setLocationPreference] = useState<StoredLocationPreference | null>(null);

    // Convex Hooks
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
        if (!content.trim() || !locationState.lat || !locationState.lon || !selectedMood) return;
        
        setIsSubmitting(true);
        try {
            await createPost({
                type: "text",
                content: content,
                mood: selectedMood,
                lat: locationState.lat,
                lon: locationState.lon,
                city: locationState.city || "Unknown",
                country: locationState.country || "XX",
            });
            
            // Reset Form
            setContent("");
            setSelectedMood(null);
        } catch (error) {
            console.error(error);
            alert("Failed to post. Please try again.");
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
                </div>

                {/* Textarea for Post Content */}
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What echoes through your mind tonight?"
                    className="min-h-30 rounded-none border-white/10 bg-white/5 focus:bg-white/10 font-mono text-sm resize-none transition-colors"
                    maxLength={500}
                />

                {/* Mood Selection */}
                <div className="mt-4 space-y-2">
                    <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        Select Your Mood
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(["Serene", "Energetic", "Melancholy", "Anxious", "Furious"] as MoodType[]).map((mood) => (
                            <MoodButton
                                key={mood}
                                mood={mood}
                                selected={selectedMood === mood}
                                onClick={() => setSelectedMood(mood)}
                            />
                        ))}
                    </div>
                </div>

                {/* Post Action */}
                <div className="flex justify-end mt-4">
                    <Button 
                        onClick={handleSubmit}
                        disabled={!content.trim() || !selectedMood || isSubmitting || locationState.status === 'locating' || !locationState.lat}
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
