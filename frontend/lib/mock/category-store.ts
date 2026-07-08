import type { Category, CategoryInput } from "@/types/category";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";
import { slugify } from "@/lib/utils/slug";

const SEED_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Bike Tours",
    slug: "bike-tours",
    parentId: null,
    imageId: "2",
    description:
      "<p>Epic motorcycle expeditions across the Himalayas — Ladakh, Spiti, and beyond.</p>",
    sortOrder: 0,
    isActive: true,
    tripCount: 0,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "2",
    name: "Treks",
    slug: "treks",
    parentId: null,
    imageId: "3",
    description:
      "<p>Guided trekking adventures from easy day hikes to challenging high-altitude trails.</p>",
    sortOrder: 1,
    isActive: true,
    tripCount: 0,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "3",
    name: "Group Tours",
    slug: "group-tours",
    parentId: null,
    imageId: "1",
    description:
      "<p>Fixed-departure group tours with like-minded travellers and expert guides.</p>",
    sortOrder: 2,
    isActive: true,
    tripCount: 0,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "4",
    name: "Custom Trips",
    slug: "custom-trips",
    parentId: null,
    imageId: null,
    description:
      "<p>Tailor-made itineraries designed around your dates, budget, and interests.</p>",
    sortOrder: 3,
    isActive: true,
    tripCount: 0,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "5",
    name: "Weekend Getaways",
    slug: "weekend-getaways",
    parentId: null,
    imageId: null,
    description:
      "<p>Short escapes perfect for a long weekend — no extended leave required.</p>",
    sortOrder: 4,
    isActive: true,
    tripCount: 0,
    createdAt: "2026-01-10T10:00:00.000Z",
    updatedAt: "2026-01-10T10:00:00.000Z",
  },
];

const categoryStore = createPersistedStore("categories", SEED_CATEGORIES);

function generateId(): string {
  return String(Date.now() + Math.random()).replace(".", "");
}

export function getAllCategories(): Category[] {
  return [...categoryStore.get()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(id: string): Category | null {
  return categoryStore.get().find((c) => c.id === id) ?? null;
}

export function getCategoryBySlug(slug: string): Category | null {
  return categoryStore.get().find((c) => c.slug === slug) ?? null;
}

export function getActiveCategories(): Category[] {
  return getAllCategories().filter((c) => c.isActive);
}

function assertUniqueSlug(slug: string, excludeId?: string): void {
  const existing = categoryStore.get().find(
    (c) => c.slug === slug && c.id !== excludeId
  );
  if (existing) {
    throw new Error(`Slug "${slug}" is already in use`);
  }
}

function assertValidParent(parentId: string | null, categoryId?: string): void {
  if (!parentId) return;
  if (categoryId && parentId === categoryId) {
    throw new Error("A category cannot be its own parent");
  }
  const parent = getCategoryById(parentId);
  if (!parent) {
    throw new Error("Parent category not found");
  }
}

export function createCategory(data: CategoryInput): Category {
  assertUniqueSlug(data.slug);
  assertValidParent(data.parentId);

  const now = new Date().toISOString();
  const category: Category = {
    id: generateId(),
    ...data,
    slug: slugify(data.slug),
    tripCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  categoryStore.set([...categoryStore.get(), category]);
  logActivity(`New category "${category.name}" added`, "categories");
  return category;
}

export function updateCategory(id: string, data: CategoryInput): Category {
  const categories = categoryStore.get();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found");

  assertUniqueSlug(data.slug, id);
  assertValidParent(data.parentId, id);

  const updated: Category = {
    ...categories[index],
    ...data,
    slug: slugify(data.slug),
    updatedAt: new Date().toISOString(),
  };
  categoryStore.set([
    ...categories.slice(0, index),
    updated,
    ...categories.slice(index + 1),
  ]);
  logActivity(`Category "${updated.name}" updated`, "categories");
  return updated;
}

export function deleteCategory(id: string): void {
  const categories = categoryStore.get();
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error("Category not found");

  const hasChildren = categories.some((c) => c.parentId === id);
  if (hasChildren) {
    throw new Error("Cannot delete a category that has child categories");
  }

  categoryStore.set(categories.filter((c) => c.id !== id));
  logActivity(`Category "${category.name}" deleted`, "categories");
}

export function toggleCategoryActive(id: string): Category {
  const category = getCategoryById(id);
  if (!category) throw new Error("Category not found");
  return updateCategory(id, {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    imageId: category.imageId,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: !category.isActive,
  });
}
