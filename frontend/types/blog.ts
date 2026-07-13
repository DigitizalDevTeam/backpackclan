export type BlogPostStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  imageId: string | null;
  /** Resolved media URL from Laravel when available */
  imageUrl?: string | null;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  status: BlogPostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  imageId: string | null;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime?: number;
  tags: string[];
  status: BlogPostStatus;
}
