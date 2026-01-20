import { query } from "./_generated/server";

export const getMoods = query({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch ALL public posts (Optimization: In prod, this should be a specialized optimized query or aggregate table)
    // For this conceptual version, fetching ~1000 posts is fine.
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "Public"))
      .collect();

    // 2. Aggregate by City
    const cityMap = new Map<string, {
      lat: number;
      lon: number;
      moodCounts: Record<string, number>;
      total: number;
    }>();

    for (const post of posts) {
      const cityKey = `${post.location.city}, ${post.location.country}`;
      
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          lat: post.location.lat,
          lon: post.location.lon,
          moodCounts: {},
          total: 0,
        });
      }

      const entry = cityMap.get(cityKey)!;
      entry.moodCounts[post.mood] = (entry.moodCounts[post.mood] || 0) + 1;
      entry.total++;
    }

    // 3. Determine Dominant Mood
    const results = [];
    for (const [name, data] of cityMap.entries()) {
      // Threshold: Ignore cities with very few posts to prevent noise? 
      // Spec says < 5 ignored.
      if (data.total < 5) continue;

      let dominantMood = "Neutral";
      let maxCount = 0;

      for (const [mood, count] of Object.entries(data.moodCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
        }
      }

      results.push({
        city: name,
        lat: data.lat,
        lon: data.lon,
        mood: dominantMood,
        count: data.total,
      });
    }

    return results;
  },
});
