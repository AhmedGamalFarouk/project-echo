"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { buildCommentTree, Comment } from "@/shared/types";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CommentSectionProps {
  postId: Id<"posts">;
  className?: string;
}

export function CommentSection({ postId, className }: CommentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { userId } = useAuth();

  // Only fetch comments when expanded
  const comments = useQuery(
    api.comments.listByPost,
    isExpanded ? { postId } : "skip"
  );
  
  const commentCount = useQuery(api.comments.countByPost, { postId });

  const commentTree = comments ? buildCommentTree(comments as Comment[]) : [];
  const isLoading = isExpanded && comments === undefined;

  return (
    <div className={cn("border-t border-white/5", className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "text-xs font-mono text-muted-foreground/70",
          "hover:bg-white/[0.02] transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>
            {commentCount === undefined ? (
              "Comments"
            ) : commentCount === 0 ? (
              "No comments yet"
            ) : (
              `${commentCount} comment${commentCount !== 1 ? "s" : ""}`
            )}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Comment Form */}
          {userId ? (
            <CommentForm 
              postId={postId} 
              placeholder="Add a comment..."
            />
          ) : (
            <div className="text-xs font-mono text-muted-foreground/60 text-center py-3 bg-white/[0.02] border border-white/5">
              Sign in to comment
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/40" />
              </div>
            ) : commentTree.length === 0 ? (
              <div className="text-xs font-mono text-muted-foreground/40 text-center py-4">
                Be the first to comment
              </div>
            ) : (
              commentTree.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUserId={userId || undefined}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
