import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { Category } from "@/types/category";
import { getActiveCategories } from "@/lib/mock/category-store";

type LaravelListResponse = {
  success?: boolean;
  data?: Category[];
};

export async function getActiveCategoriesAsync(): Promise<Category[]> {
  if (useLaravelApi()) {
    try {
      const { res, data } = await laravelFetch<LaravelListResponse>("/v1/categories");
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data;
      }
    } catch {
      // fall through
    }
  }
  return getActiveCategories().sort((a, b) => a.sortOrder - b.sortOrder);
}
