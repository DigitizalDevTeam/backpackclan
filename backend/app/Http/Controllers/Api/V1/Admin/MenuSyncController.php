<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\MenuItem;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuSyncController extends Controller
{
    public function syncDestinations(Request $request, string $menuId): JsonResponse
    {
        $data = $request->validate([
            'parentItemId' => ['required', 'string'],
        ]);

        $parent = MenuItem::query()
            ->where('menu_id', $menuId)
            ->where('id', $data['parentItemId'])
            ->firstOrFail();

        MenuItem::query()
            ->where('menu_id', $menuId)
            ->where('parent_id', $parent->id)
            ->delete();

        $destinations = Destination::query()
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();

        foreach ($destinations as $index => $destination) {
            MenuItem::query()->create([
                'menu_id' => $menuId,
                'parent_id' => $parent->id,
                'label' => $destination->name,
                'url' => '/destinations/'.$destination->slug,
                'target' => '_self',
                'icon' => null,
                'sort_order' => $index,
                'is_active' => true,
            ]);
        }

        ActivityLogger::log(
            'Synced '.$destinations->count().' destination links in menu',
            'menus'
        );

        $items = MenuItem::query()
            ->where('menu_id', $menuId)
            ->orderBy('sort_order')
            ->get();

        return response()->json(['success' => true, 'data' => $items]);
    }
}
