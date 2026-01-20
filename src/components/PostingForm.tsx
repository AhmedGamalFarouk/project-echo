"use client";

import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MoodButton } from "@/components/MoodButton";
import { InputCard } from "@/components/InputCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MoodType = "Serene" | "Energetic" | "Melancholy" | "Anxious" | "Furious";
const MOODS: MoodType[] = ["Serene", "Energetic", "Melancholy", "Anxious", "Furious"];

export default function PostingForm() {
    const [mood, setMood] = useState<MoodType | null>(null);
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

    // Convex Hooks
    const identifyCity = useAction(api.location.identifyCity);
    const createPost = useMutation(api.posts.create);

    // 1. Auto-Locate on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationState({ status: "error", error: "Geolocation not supported" });
            return;
        }

        setLocationState({ status: "locating" });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Call Backend Action to resolve City Name
                    const loc = await identifyCity({ lat: latitude, lon: longitude });
                    
                    setLocationState({
                        status: "success",
                        lat: latitude,
                        lon: longitude,
                        city: loc.city,
                        country: loc.country
                    });
                } catch (err) {
                    setLocationState({ 
                        status: "error", 
                        error: "Failed to identify city",
                        lat: latitude, // Still save coords even if name fails
                        lon: longitude,
                        city: "Unknown",
                        country: "XX" 
                    });
                }
            },
            (error) => {
                setLocationState({ status: "error", error: error.message });
            }
        );
    }, [identifyCity]);

    const handleSubmit = async () => {
        if (!mood || !content.trim() || !locationState.lat || !locationState.lon) return;
        
        setIsSubmitting(true);
        try {
            await createPost({
                type: "text",
                content: content,
                mood: mood,
                lat: locationState.lat,
                lon: locationState.lon,
                city: locationState.city || "Unknown",
                country: locationState.country || "XX",
            });
            
            // Reset Form
            setContent("");
            setMood(null);
        } catch (error) {
            console.error(error);
            alert("Transmission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="w-full max-w-xl mx-auto space-y-6">
            <InputCard className="border-t-4 border-t-primary/20">
                {/* Location Status Line */}
                <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground mb-4 pl-1">
                    {locationState.status === "locating" && (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>TRIANGULATING SIGNAL...</span>
                        </>
                    )}
                    {locationState.status === "success" && (
                        <>
                            <MapPin className="w-3 h-3 text-primary" />
                            <span className="text-primary uppercase tracking-wider">
                                {locationState.city}, {locationState.country}
                            </span>
                        </>
                    )}
                    {locationState.status === "error" && (
                         <>
                            <AlertCircle className="w-3 h-3 text-destructive" />
                            <span className="text-destructive">SIGNAL LOST: {locationState.error}</span>
                         </>
                    )}
                </div>

                {/* Mood Selection */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {MOODS.map((m) => (
                        <MoodButton 
                            key={m} 
                            mood={m} 
                            selected={mood === m} 
                            onClick={() => setMood(m)}
                            type="button"
                            className="flex-1 min-w-[100px]"
                        />
                    ))}
                </div>

                {/* Text Generation */}
                <Textarea 
                    placeholder="Reflect on the silence..."
                    className="terminal-input min-h-[120px] text-lg mb-6 resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                />

                {/* Transmit Action */}
                <div className="flex justify-end">
                    <Button 
                        onClick={handleSubmit}
                        disabled={!mood || !content.trim() || isSubmitting || locationState.status === 'locating'}
                        className="rounded-none px-8 font-mono tracking-widest uppercase hover:bg-primary/90"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Transmit
                    </Button>
                </div>
            </InputCard>
        </section>
    );
}
