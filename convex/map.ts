import { query } from "./_generated/server";

// Get post activity by city (legacy, for post counts)
export const getMoods = query({
  args: {},
  handler: async (ctx) => {
    // Fetch ALL public posts to show activity by city
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "Public"))
      .collect();

    // Aggregate by City to show post activity
    const cityMap = new Map<string, {
      lat: number;
      lon: number;
      total: number;
    }>();

    for (const post of posts) {
      const cityKey = `${post.location.city}, ${post.location.country}`;
      
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          lat: post.location.lat,
          lon: post.location.lon,
          total: 0,
        });
      }

      const entry = cityMap.get(cityKey)!;
      entry.total++;
    }

    // Return cities with activity
    const results = [];
    for (const [name, data] of cityMap.entries()) {
      // Threshold: Ignore cities with very few posts to prevent noise
      if (data.total < 3) continue;

      results.push({
        city: name,
        lat: data.lat,
        lon: data.lon,
        count: data.total,
      });
    }

    return results;
  },
});

// Get mood data aggregated by city for the map
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
