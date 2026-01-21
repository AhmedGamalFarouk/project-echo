import { query } from "./_generated/server";

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
