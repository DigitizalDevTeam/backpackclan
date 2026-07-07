export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  imageId: string;
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
}
