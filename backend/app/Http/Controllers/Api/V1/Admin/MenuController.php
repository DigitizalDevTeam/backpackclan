<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Support\ActivityLogger;
use App\Support\MenuTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        $menus = Menu::query()->withCount([
            'items',
            'items as active_count' => fn ($q) => $q->where('is_active', true),
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $menus->map(fn (Menu $m) => $m->toApiArray($m->items_count, $m->active_count))->values(),
        ]);
    }

    public function show(Menu $menu): JsonResponse
    {
        $items = MenuItem::query()
            ->where('menu_id', $menu->id)
            ->orderBy('sort_order')
            ->get()
            ->map->toApiArray()
            ->values()
            ->all();

        $tree = MenuTree::build($items);
        $flat = MenuTree::flatten($tree);

        return response()->json([
            'success' => true,
            'data' => [
                'menu' => $menu->toApiArray(count($items), collect($items)->where('isActive', true)->count()),
                'items' => $items,
                'tree' => $tree,
                'flat' => $flat,
            ],
        ]);
    }

    public function storeItem(Request $request, Menu $menu): JsonResponse
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:500'],
            'target' => ['required', Rule::in(['_self', '_blank'])],
            'icon' => ['nullable', 'string', 'max:100'],
            'parentId' => ['nullable', 'string'],
            'isActive' => ['boolean'],
        ]);

        $siblings = MenuItem::query()
            ->where('menu_id', $menu->id)
            ->where('parent_id', $data['parentId'] ?? null)
            ->count();

        $item = MenuItem::query()->create([
            'menu_id' => $menu->id,
            'parent_id' => $data['parentId'] ?? null,
            'label' => $data['label'],
            'url' => $data['url'],
            'target' => $data['target'],
            'icon' => $data['icon'] ?? null,
            'sort_order' => $siblings,
            'is_active' => $data['isActive'] ?? true,
        ]);

        ActivityLogger::log("Menu item \"{$item->label}\" added", 'menus');

        return response()->json(['success' => true, 'data' => $item->toApiArray()], 201);
    }

    public function reorderItems(Request $request, Menu $menu): JsonResponse
    {
        $data = $request->validate([
            'parentId' => ['nullable'],
            'orderedIds' => ['required', 'array'],
            'orderedIds.*' => ['integer'],
        ]);

        foreach ($data['orderedIds'] as $index => $id) {
            MenuItem::query()
                ->where('id', $id)
                ->where('menu_id', $menu->id)
                ->update([
                    'sort_order' => $index,
                    'parent_id' => $data['parentId'] ?? null,
                ]);
        }

        ActivityLogger::log('Menu items reordered', 'menus');

        $items = MenuItem::query()->where('menu_id', $menu->id)->orderBy('sort_order')->get();

        return response()->json([
            'success' => true,
            'data' => $items->map->toApiArray()->values(),
        ]);
    }

    public function updateItem(Request $request, Menu $menu, MenuItem $item): JsonResponse
    {
        if ($item->menu_id !== $menu->id) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Item not found']], 404);
        }

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255'],
            'url' => ['sometimes', 'string', 'max:500'],
            'target' => ['sometimes', Rule::in(['_self', '_blank'])],
            'icon' => ['nullable', 'string', 'max:100'],
            'parentId' => ['nullable'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $item->update([
            'label' => $data['label'] ?? $item->label,
            'url' => $data['url'] ?? $item->url,
            'target' => $data['target'] ?? $item->target,
            'icon' => array_key_exists('icon', $data) ? $data['icon'] : $item->icon,
            'parent_id' => array_key_exists('parentId', $data) ? $data['parentId'] : $item->parent_id,
            'is_active' => $data['isActive'] ?? $item->is_active,
        ]);

        ActivityLogger::log("Menu item \"{$item->label}\" updated", 'menus');

        return response()->json(['success' => true, 'data' => $item->fresh()->toApiArray()]);
    }

    public function destroyItem(Menu $menu, MenuItem $item): JsonResponse
    {
        if ($item->menu_id !== $menu->id) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Item not found']], 404);
        }

        $childCount = $this->descendantCount($item);
        $label = $item->label;
        $this->deleteWithDescendants($item);
        ActivityLogger::log("Menu item \"{$label}\" deleted", 'menus');

        return response()->json(['success' => true, 'data' => ['deletedChildren' => $childCount]]);
    }

    public function toggleItem(Menu $menu, MenuItem $item): JsonResponse
    {
        if ($item->menu_id !== $menu->id) {
            return response()->json(['success' => false, 'errors' => ['form' => 'Item not found']], 404);
        }

        $item->update(['is_active' => ! $item->is_active]);

        return response()->json(['success' => true, 'data' => $item->fresh()->toApiArray()]);
    }

    private function descendantCount(MenuItem $item): int
    {
        $children = MenuItem::query()->where('parent_id', $item->id)->get();
        $count = $children->count();
        foreach ($children as $child) {
            $count += $this->descendantCount($child);
        }

        return $count;
    }

    private function deleteWithDescendants(MenuItem $item): void
    {
        $children = MenuItem::query()->where('parent_id', $item->id)->get();
        foreach ($children as $child) {
            $this->deleteWithDescendants($child);
        }
        $item->delete();
    }
}
