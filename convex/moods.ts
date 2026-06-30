import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mood type literal
const MoodType = v.union(
  v.literal("Serene"),
  v.literal("Energetic"),
  v.literal("Melancholy"),
  v.literal("Anxious"),
  v.literal("Furious")
);

// Check if user has logged mood in the last 24 hours
export const hasLoggedToday = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return false;
    }

    // Check for mood log in the last 24 hours
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ONE_DAY_MS;

    const recentMoodLog = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
      .first();

    return !!recentMoodLog;
  },
});

// Get user's most recent mood log
export const getLatestMood = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return null;
    }

    const latestMood = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    return latestMood;
  },
});

// Log a new mood
export const logMood = mutation({
  args: {
    mood: MoodType,
    city: v.string(),
    country: v.string(),
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      user = await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        username: "Anonymous",
      }).then(id => ctx.db.get(id));

      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();
    }

    if (!user) throw new Error("User creation failed");

    // Check if already logged today (prevent duplicates)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ONE_DAY_MS;

    const recentMoodLog = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
      .first();

    if (recentMoodLog) {
      // Update existing mood log instead of creating new one
      await ctx.db.patch(recentMoodLog._id, {
        mood: args.mood,
        location: {
          city: args.city,
          country: args.country,
          lat: args.lat,
          lon: args.lon,
        },
      });
      return { updated: true, id: recentMoodLog._id };
    }

    // Create new mood log
    const moodLogId = await ctx.db.insert("moodLogs", {
      userId: user._id,
      mood: args.mood,
      location: {
        city: args.city,
        country: args.country,
        lat: args.lat,
        lon: args.lon,
      },
    });

    return { updated: false, id: moodLogId };
  },
});

// Get aggregated mood data for the map (public)
export const getMoodMapData = query({
  args: {},
  handler: async (ctx) => {
    // Get mood logs from the last 24 hours
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ONE_DAY_MS;

    const moodLogs = await ctx.db
      .query("moodLogs")
      .filter((q) => q.gte(q.field("_creationTime"), cutoff))
      .collect();

    // Aggregate by city with mood breakdown
    const cityMap = new Map<string, {
      lat: number;
      lon: number;
      moods: Record<string, number>;
      total: number;
      dominantMood: string;
    }>();

    for (const log of moodLogs) {
      const cityKey = `${log.location.city}, ${log.location.country}`;
      
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          lat: log.location.lat,
          lon: log.location.lon,
          moods: {
            Serene: 0,
            Energetic: 0,
            Melancholy: 0,
            Anxious: 0,
            Furious: 0,
          },
          total: 0,
          dominantMood: "Serene",
        });
      }

      const entry = cityMap.get(cityKey)!;
      entry.moods[log.mood]++;
      entry.total++;
    }

    // Calculate dominant mood for each city
    const results = [];
    for (const [name, data] of cityMap.entries()) {
      let dominantMood = "Serene";
      let maxCount = 0;
      
      for (const [mood, count] of Object.entries(data.moods)) {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
        }
      }

      results.push({
        city: name,
        lat: data.lat,
        lon: data.lon,
        count: data.total,
        dominantMood,
        moodBreakdown: data.moods,
      });
    }

    return results;
  },
});

// Get user's mood history for journal
export const getMoodHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      return [];
    }

    const limit = args.limit ?? 30;

    const moodHistory = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return moodHistory;
  },
});
