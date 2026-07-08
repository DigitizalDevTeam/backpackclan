<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $categories->map->toApiArray()->values(),
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $category->toApiArray()]);
    }

    public function store(Request $request): JsonResponse
    {
        $category = Category::query()->create($this->validated($request));
        ActivityLogger::log("New category \"{$category->name}\" added", 'categories');

        return response()->json(['success' => true, 'data' => $category->toApiArray()], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $category->update($this->validated($request, $category));
        ActivityLogger::log("Category \"{$category->name}\" updated", 'categories');

        return response()->json(['success' => true, 'data' => $category->fresh()->toApiArray()]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json([
                'success' => false,
                'errors' => ['form' => 'Cannot delete a category that has child categories'],
            ], 400);
        }

        $name = $category->name;
        $category->delete();
        ActivityLogger::log("Category \"{$name}\" deleted", 'categories');

        return response()->json(['success' => true]);
    }

    public function patch(Request $request, Category $category): JsonResponse
    {
        if ($request->input('action') === 'toggle') {
            $category->update(['is_active' => ! $category->is_active]);
            ActivityLogger::log("Category \"{$category->name}\" updated", 'categories');

            return response()->json(['success' => true, 'data' => $category->fresh()->toApiArray()]);
        }

        return response()->json(['success' => false, 'errors' => ['form' => 'Invalid action']], 400);
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Category $category = null): array
    {
        $categoryId = $category?->id;

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'parentId' => ['nullable', 'integer', 'exists:categories,id', Rule::notIn([$categoryId])],
            'imageId' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        return [
            'name' => $data['name'],
            'slug' => Str::slug($data['slug']),
            'parent_id' => $data['parentId'] ?? null,
            'image_id' => $data['imageId'] ?? null,
            'description' => $data['description'] ?? '',
            'sort_order' => $data['sortOrder'] ?? 0,
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
