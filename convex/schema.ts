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
    mood: v.optional(v.union(
      v.literal("Serene"),
      v.literal("Energetic"),
      v.literal("Melancholy"),
      v.literal("Anxious"),
      v.literal("Furious")
    )), // Optional mood field for existing data
  })
    .index("by_status", ["status"]) // Critical for the Feed query
    .index("by_user", ["userId"]), // Critical for Journal

  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    parentId: v.optional(v.id("comments")), // For nested replies (null = top-level comment)
    content: v.string(),
    depth: v.number(), // 0 = top-level, max 3 for replies
    isHidden: v.boolean(), // report system
    flags: v.number(),
  })
    .index("by_post", ["postId"]) // Get all comments for a post
    .index("by_parent", ["parentId"]) // Get replies to a comment
    .index("by_user", ["userId"]), // Get user's comments

  moodLogs: defineTable({
    userId: v.id("users"),
    mood: v.union(
      v.literal("Serene"),
      v.literal("Energetic"),
      v.literal("Melancholy"),
      v.literal("Anxious"),
      v.literal("Furious")
    ),
    location: v.object({
      city: v.string(),
      country: v.string(),
      lat: v.number(),
      lon: v.number(),
    }),
  })
    .index("by_user", ["userId"]),
});
