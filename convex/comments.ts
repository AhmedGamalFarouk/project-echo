import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const MAX_COMMENT_DEPTH = 3;

// Get all comments for a post (structured as a tree)
export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // Filter out hidden comments and return with user info
    const visibleComments = comments.filter((c) => !c.isHidden);

    // Fetch usernames for all comments
    const commentsWithUsers = await Promise.all(
      visibleComments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          username: user?.username || "Anonymous",
        };
      })
    );

    return commentsWithUsers;
  },
});

// Get comment count for a post
export const countByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    return comments.filter((c) => !c.isHidden).length;
  },
});

// Create a new comment or reply
export const create = mutation({
  args: {
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Must be logged in to comment");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the post exists and is public
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.status !== "Public") {
      throw new Error("Cannot comment on archived posts");
    }

    // Calculate depth
    let depth = 0;
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.postId !== args.postId) {
        throw new Error("Parent comment does not belong to this post");
      }
      depth = parentComment.depth + 1;

      // Enforce max depth of 3 replies
      if (depth > MAX_COMMENT_DEPTH) {
        throw new Error(`Maximum reply depth of ${MAX_COMMENT_DEPTH} reached`);
      }
    }

    // Validate content
    const trimmedContent = args.content.trim();
    if (trimmedContent.length === 0) {
      throw new Error("Comment cannot be empty");
    }
    if (trimmedContent.length > 500) {
      throw new Error("Comment must be 500 characters or less");
    }

    // Create the comment
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: user._id,
      parentId: args.parentId,
      content: trimmedContent,
      depth,
      isHidden: false,
      flags: 0,
    });

    return commentId;
  },
});

// Delete a comment (only by the author)
export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== user._id) {
      throw new Error("You can only delete your own comments");
    }

    // Delete the comment and all its replies recursively
    await deleteCommentAndReplies(ctx, args.commentId);
  },
});

// Helper function to delete a comment and all its replies
async function deleteCommentAndReplies(
  ctx: { db: any },
  commentId: Id<"comments">
) {
  // Find all replies to this comment
  const replies = await ctx.db
    .query("comments")
    .withIndex("by_parent", (q: any) => q.eq("parentId", commentId))
    .collect();

  // Recursively delete all replies
  for (const reply of replies) {
    await deleteCommentAndReplies(ctx, reply._id);
  }

  // Delete the comment itself
  await ctx.db.delete(commentId);
}

// Report a comment
export const report = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const newFlags = comment.flags + 1;
    const shouldHide = newFlags >= 3; // Auto-hide after 3 reports

    await ctx.db.patch(args.commentId, {
      flags: newFlags,
      isHidden: shouldHide,
    });

    return { flagged: true, hidden: shouldHide };
  },
});
