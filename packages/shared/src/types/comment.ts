export type CommentStatus = "pending" | "approved" | "spam";

export interface Comment {
  id: number;
  postId: number;
  parentId?: number;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface CreateCommentRequest {
  postId: number;
  parentId?: number;
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
}
