import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Public: Get the global feed (Recent Public Posts)
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Return the last 50 public posts
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "Public"))
      .order("desc") // Newest first
      .take(50);
      
    // Create a map to fetch user usernames for privacy (optional, if we want to show 'Anonymous' vs specific alias later)
    // For now, project specs say "Pseudonymous", so we just return the post content.
    
    return posts;
  },
});

// Public: Create a post
export const create = mutation({
  args: {
    type: v.union(v.literal("text"), v.literal("image")),
    content: v.string(),
    lat: v.number(),
    lon: v.number(),
    city: v.string(),    // In a real flow, this comes from a secure internal action
    country: v.string(), // In a real flow, this comes from a secure internal action
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find or create user locally
    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      user = await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        email: identity.email,
        username: "Anonymous", // Default for now
      }).then(id => ctx.db.get(id));
      
      // Re-fetch to satisfy type checker if needed, or just use the ID
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();
    }

    if(!user) throw new Error("User creation failed");

    // Create the post
    await ctx.db.insert("posts", {
      userId: user._id,
      type: args.type,
      content: args.content,
      location: {
        city: args.city,
        country: args.country,
        lat: args.lat,
        lon: args.lon,
      },
      status: "Public",
      privacy: "public",
      isHidden: false,
      flags: 0,
    });
  },
});

// Internal: The Soft Wipe
// This is called by the Cron job to archive posts older than 24 hours
export const archiveOldPosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const cutoff = now - ONE_DAY_MS;

    // Query for Public posts. 
    // In a production app, we would likely index by _creationTime to make this faster
    // For now, we scan 'by_status' which filters to only Public posts, then check time.
    const publicPosts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "Public"))
      .collect();

    let archivedCount = 0;

    for (const post of publicPosts) {
      if (post._creationTime < cutoff) {
        await ctx.db.patch(post._id, { status: "Archived" });
        archivedCount++;
      }
    }

    console.log(`Soft Wipe Complete: Archived ${archivedCount} posts.`);
  },
});
