export type PostStatus = "draft" | "published";

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  contentHtml: string;
  excerpt?: string;
  coverImage?: string;
  status: PostStatus;
  pinned: boolean;
  authorId: number;
  categoryId?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostWithRelations extends Post {
  author: { id: number; displayName: string };
  category?: { id: number; name: string; slug: string };
  tags: { id: number; name: string; slug: string }[];
}

export interface CreatePostRequest {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: PostStatus;
  pinned?: boolean;
  categoryId?: number;
  tagIds?: number[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}
