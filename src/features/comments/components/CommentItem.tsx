"use client";

import * as React from "react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CommentWithReplies } from "@/shared/types";
import { CommentForm } from "./CommentForm";
import { cn } from "@/shared/lib/utils";
import { 
  MessageSquare, 
  Trash2, 
  Flag, 
  MoreHorizontal,
  ChevronDown,
  ChevronRight 
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface CommentItemProps {
  comment: CommentWithReplies;
  currentUserId?: string;
  className?: string;
}

const MAX_DEPTH = 3;
const DEPTH_COLORS = [
  "border-l-primary/40",
  "border-l-blue-400/40",
  "border-l-purple-400/40",
  "border-l-pink-400/40",
];

export function CommentItem({ comment, currentUserId, className }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const deleteComment = useMutation(api.comments.remove);
  const reportComment = useMutation(api.comments.report);

  const timeAgo = formatDistanceToNow(comment._creationTime, { addSuffix: true });
  const canReply = comment.depth < MAX_DEPTH;
  const hasReplies = comment.replies.length > 0;
  const isOwnComment = currentUserId === comment.userId;
  const depthColor = DEPTH_COLORS[comment.depth] || DEPTH_COLORS[DEPTH_COLORS.length - 1];

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    setIsDeleting(true);
    try {
      await deleteComment({ commentId: comment._id });
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    try {
      await reportComment({ commentId: comment._id });
      alert("Comment reported. Thank you.");
    } catch (err) {
      console.error("Failed to report comment:", err);
    }
  };

  return (
    <div className={cn("group", className)}>
      <div
        className={cn(
          "relative pl-3 py-2 border-l-2 transition-colors",
          depthColor,
          "hover:bg-white/[0.02]"
        )}
      >
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70">
            <span className="text-foreground/80">{comment.username}</span>
            <span className="opacity-40">•</span>
            <span>{timeAgo}</span>
            {comment.depth > 0 && (
              <>
                <span className="opacity-40">•</span>
                <span className="text-primary/60">depth {comment.depth}</span>
              </>
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Actions Dropdown */}
        {showActions && (
          <div className="absolute right-0 top-8 z-10 bg-black/90 border border-white/10 rounded-sm p-1 flex flex-col gap-1 min-w-[100px]">
            {isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-mono justify-start gap-2 text-red-400 hover:text-red-300"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            )}
            {!isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] font-mono justify-start gap-2"
                onClick={handleReport}
              >
                <Flag className="h-3 w-3" />
                Report
              </Button>
            )}
          </div>
        )}

        {/* Comment Content */}
        <p className="text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center gap-3 mt-2">
          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-primary transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              Reply
            </button>
          )}
          {hasReplies && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {showReplies ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 ml-2">
            <CommentForm
              postId={comment.postId}
              parentId={comment._id}
              depth={comment.depth + 1}
              placeholder={`Reply to ${comment.username}...`}
              autoFocus
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="ml-3 mt-1 space-y-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
