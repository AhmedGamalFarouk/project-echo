"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface CommentFormProps {
  postId: Id<"posts">;
  parentId?: Id<"comments">;
  depth?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const MAX_DEPTH = 3;

export function CommentForm({
  postId,
  parentId,
  depth = 0,
  onSuccess,
  onCancel,
  placeholder = "Share your thoughts...",
  autoFocus = false,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createComment = useMutation(api.comments.create);

  const canReply = depth < MAX_DEPTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createComment({
        postId,
        parentId,
        content: content.trim(),
      });
      setContent("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canReply && parentId) {
    return (
      <div className="text-xs text-muted-foreground/60 font-mono py-2">
        Maximum reply depth reached
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-2", className)}>
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          maxLength={500}
          className={cn(
            "min-h-[60px] max-h-[120px] resize-none font-mono text-xs",
            "bg-black/40 border-white/10 focus:border-primary/50",
            "placeholder:text-muted-foreground/40",
            parentId && "min-h-[50px]"
          )}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/40 font-mono">
          {content.length}/500
        </div>
      </div>
      
      {error && (
        <div className="text-xs text-red-400 font-mono">{error}</div>
      )}
      
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-7 text-xs font-mono"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
          className="h-7 text-xs font-mono gap-1"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          {parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
