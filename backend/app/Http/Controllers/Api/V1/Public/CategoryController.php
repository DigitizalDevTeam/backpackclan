<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Category $category) {
                $data = $category->toApiArray();
                $data['tripCount'] = Trip::query()
                    ->where('status', 'published')
                    ->whereHas('categories', fn ($q) => $q->where('categories.id', $category->id))
                    ->count();

                return $data;
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
