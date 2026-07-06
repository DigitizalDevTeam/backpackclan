<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Banner;
use App\Models\HomepageSection;
use App\Models\Media;
use App\Models\MenuItem;
use App\Support\CamelCase;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $sections = HomepageSection::query()->get();

        return response()->json([
            'success' => true,
            'data' => [
                'mediaCount' => Media::query()->count(),
                'activeBanners' => Banner::query()->where('is_active', true)->count(),
                'enabledSections' => $sections->where('is_enabled', true)->count(),
                'totalSections' => $sections->count(),
                'menuItemCount' => MenuItem::query()->count(),
            ],
        ]);
    }

    public function activity(): JsonResponse
    {
        $logs = ActivityLog::query()->orderByDesc('created_at')->limit(6)->get();

        return response()->json([
            'success' => true,
            'data' => $logs->map(fn ($log) => CamelCase::convert([
                'id' => (string) $log->id,
                'action' => $log->action,
                'module' => $log->module,
                'time_ago' => Carbon::parse($log->created_at)->diffForHumans(),
            ]))->values(),
        ]);
    }
}
