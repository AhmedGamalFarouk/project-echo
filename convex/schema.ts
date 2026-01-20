import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk Subject ID
    email: v.optional(v.string()),
    username: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  posts: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("text"), v.literal("image")), 
    content: v.string(), // Text content or Storage ID
    mood: v.string(), // "Serene", "Melancholy", etc.
    location: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lon: v.number(),
    }),
    status: v.union(v.literal("Public"), v.literal("Archived")),
    privacy: v.union(v.literal("public"), v.literal("private")), // For user choice if implemented
    isHidden: v.boolean(), // report system
    flags: v.number(),
  })
    .index("by_status", ["status"]) // Critical for the Feed query
    .index("by_user", ["userId"]), // Critical for Journal
});
