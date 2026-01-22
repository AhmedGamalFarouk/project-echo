import { Id } from "../../../convex/_generated/dataModel";

export interface Comment {
  _id: Id<"comments">;
  _creationTime: number;
  postId: Id<"posts">;
  userId: Id<"users">;
  parentId?: Id<"comments">;
  content: string;
  depth: number;
  isHidden: boolean;
  flags: number;
  username: string;
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

// Helper to build a comment tree from flat list
export function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const commentMap = new Map<string, CommentWithReplies>();
  const rootComments: CommentWithReplies[] = [];

  // First pass: create all comment nodes with empty replies
  comments.forEach((comment) => {
    commentMap.set(comment._id, { ...comment, replies: [] });
  });

  // Second pass: build the tree structure
  comments.forEach((comment) => {
    const node = commentMap.get(comment._id)!;
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      rootComments.push(node);
    }
  });

  // Sort by creation time (newest first for top-level, oldest first for replies)
  const sortByTime = (a: CommentWithReplies, b: CommentWithReplies) => 
    a._creationTime - b._creationTime;

  const sortTree = (nodes: CommentWithReplies[]): CommentWithReplies[] => {
    nodes.sort(sortByTime);
    nodes.forEach((node) => {
      if (node.replies.length > 0) {
        sortTree(node.replies);
      }
    });
    return nodes;
  };

  return sortTree(rootComments);
}
