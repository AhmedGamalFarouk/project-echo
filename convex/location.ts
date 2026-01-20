"use action";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const identifyCity = action({
  args: { lat: v.number(), lon: v.number() },
  handler: async (ctx, args) => {
    // 1. Check for API environment variable
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // MOCK MODE: If no API key, return a "Ghost City" so development can continue
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY not set. Using Mock Location.");
      // Simulating network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        city: "Lost City",
        country: "Nowhere",
      };
    }

    // REAL MODE: Google Geocoding API
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${args.lat},${args.lon}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("Geocoding failed");
      }

      // Parse the address components to find City (Locality) and Country
      // Google Maps API results are complex, this is a simplified parser
      const result = data.results[0];
      let city = "Unknown";
      let country = "Unknown";

      for (const component of result.address_components) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.short_name;
        }
      }

      return { city, country };
    } catch (error) {
      console.error("Geocoding Error:", error);
      return { city: "Unknown", country: "Void" };
    }
  },
});
