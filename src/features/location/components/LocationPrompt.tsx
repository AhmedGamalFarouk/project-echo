"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { MapPin, Navigation, Loader2, Check } from "lucide-react";
import { searchCities, type CitySearchResult } from "@/lib/citySearch";
import { cn } from "@/lib/utils";

interface LocationPromptProps {
  open: boolean;
  onLocationMethodSelected: (
    method: "gps" | "manual", 
    cityData?: { cityName: string; lat: number; lon: number; city: string; country: string }
  ) => void;
  onClose?: () => void;
}

export default function LocationPrompt({ open, onLocationMethodSelected, onClose }: LocationPromptProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const [cityResults, setCityResults] = useState<CitySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsTimeout, setGpsTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleGPSChoice = () => {
    setIsProcessing(true);
    
    // Set a 15-second timeout for GPS
    const timeout = setTimeout(() => {
      setIsProcessing(false);
      alert("GPS location timed out. Please try manual entry or check your location permissions.");
    }, 15000);
    
    setGpsTimeout(timeout);
    onLocationMethodSelected("gps");
  };

  // Clear timeout if component unmounts
  useEffect(() => {
    return () => {
      if (gpsTimeout) {
        clearTimeout(gpsTimeout);
      }
    };
  }, [gpsTimeout]);

  // Reset state when opening the dialog
  const prevOpen = React.useRef(open);
  useEffect(() => {
    // Only reset when transitioning from closed to open or open to closed
    if (prevOpen.current !== open) {
      if (!open) {
        // Dialog closed - cleanup
        if (gpsTimeout) {
          clearTimeout(gpsTimeout);
        }
        // Use setTimeout to avoid cascading renders
        setTimeout(() => {
          setGpsTimeout(null);
          setIsProcessing(false);
          setShowManualInput(false);
          setCityInput("");
          setSelectedCity(null);
          setCityResults([]);
          setIsSearching(false);
        }, 0);
      }
      prevOpen.current = open;
    }
  }, [open, gpsTimeout]);

  const handleManualChoice = () => {
    setShowManualInput(true);
  };

  // Debounced city search
  useEffect(() => {
    if (!showManualInput || cityInput.length < 2) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(cityInput);
      setCityResults(results);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [cityInput, showManualInput]);

  const handleManualSubmit = () => {
    if (selectedCity) {
      setIsProcessing(true);
      onLocationMethodSelected("manual", {
        cityName: selectedCity.displayName,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        city: selectedCity.city,
        country: selectedCity.country
      });
    }
  };

  const handleCitySelect = (result: CitySearchResult) => {
    setSelectedCity(result);
    setCityInput(result.displayName);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-primary">Location Signal</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            Project ECHO requires your location to timestamp transmissions.
          </DialogDescription>
        </DialogHeader>

        {!showManualInput ? (
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleGPSChoice}
              disabled={isProcessing}
              className="w-full rounded-none border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-mono tracking-widest uppercase h-16"
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Acquiring Signal...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-5 w-5" />
                  Use GPS Signal
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-muted-foreground font-mono">OR</span>
              </div>
            </div>

            <Button
              onClick={handleManualChoice}
              disabled={isProcessing}
              className="w-full rounded-none border-2 border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-mono tracking-widest uppercase h-16"
              variant="outline"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Enter City Manually
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                Search for your city
              </label>
              <Command className="rounded-none border-2 border-white/10 bg-black">
                <CommandInput 
                  placeholder="Type city name (e.g., Tokyo, Paris)..." 
                  value={cityInput}
                  onValueChange={setCityInput}
                  disabled={isProcessing}
                />
                <CommandList>
                  {isSearching && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm font-mono text-muted-foreground">Searching...</span>
                    </div>
                  )}
                  {!isSearching && cityInput.length < 2 && (
                    <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                  )}
                  {!isSearching && cityInput.length >= 2 && cityResults.length === 0 && (
                    <CommandEmpty>No cities found. Try a different search.</CommandEmpty>
                  )}
                  {!isSearching && cityResults.length > 0 && (
                    <CommandGroup>
                      {cityResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.displayName}
                          onSelect={() => handleCitySelect(result)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity?.id === result.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">{result.displayName}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowManualInput(false);
                  setCityInput("");
                  setSelectedCity(null);
                  setCityResults([]);
                }}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 rounded-none border-white/10 bg-white/5 hover:bg-white/10 font-mono tracking-widest uppercase"
              >
                Back
              </Button>
              <Button
                onClick={handleManualSubmit}
                disabled={!selectedCity || isProcessing}
                className="flex-1 rounded-none bg-primary hover:bg-primary/90 text-black font-mono tracking-widest uppercase"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="text-[10px] font-mono text-muted-foreground/60 pt-2 border-t border-white/5">
          Your location is stored locally and used to enhance your transmissions. You can change this anytime in settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}
