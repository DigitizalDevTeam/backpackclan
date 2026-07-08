export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageId: string | null;
  description: string;
  sortOrder: number;
  isActive: boolean;
  tripCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryInput = Omit<
  Category,
  "id" | "createdAt" | "updatedAt" | "tripCount"
>;
