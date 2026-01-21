"use action";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const identifyCity = action({
  args: { lat: v.number(), lon: v.number() },
  handler: async (ctx, args) => {
    // Use OpenStreetMap Nominatim API (free, no key required)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${args.lat}&lon=${args.lon}&format=json&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ProjectEcho/1.0'
        }
      });

      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }

      const data = await response.json();

      // Parse the address to get city and country
      let city = "Unknown";
      let country = "Unknown";

      if (data.address) {
        city = data.address.city || 
               data.address.town || 
               data.address.village || 
               data.address.county ||
               data.address.state ||
               "Unknown";
        country = data.address.country || "Unknown";
      }

      return { city, country };
    } catch (error) {
      console.error("Geocoding Error:", error);
      return { city: "Unknown", country: "Unknown" };
    }
  },
});

export const geocodeCity = action({
  args: { cityName: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // MOCK MODE: If no API key, return mock coordinates
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY not set. Using Mock Geocoding.");
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        city: args.cityName,
        country: "XX",
        lat: 0,
        lon: 0,
      };
    }

    // REAL MODE: Google Geocoding API for address to coordinates
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(args.cityName)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("City not found");
      }

      const result = data.results[0];
      const location = result.geometry.location;
      
      let city = args.cityName;
      let country = "Unknown";

      // Parse for better city/country names
      for (const component of result.address_components) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.short_name;
        }
      }

      return {
        city,
        country,
        lat: location.lat,
        lon: location.lng,
      };
    } catch (error) {
      console.error("Geocoding Error:", error);
      throw new Error("Failed to geocode city");
    }
  },
});
