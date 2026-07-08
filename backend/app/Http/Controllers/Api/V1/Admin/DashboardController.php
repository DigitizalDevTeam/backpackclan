<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Banner;
use App\Models\Departure;
use App\Models\HomepageSection;
use App\Models\Media;
use App\Models\MenuItem;
use App\Models\Trip;
use App\Support\CamelCase;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $sections = HomepageSection::query()->get();
        $today = now()->toDateString();

        $lowSeatCount = Departure::query()
            ->where('is_cancelled', false)
            ->whereDate('start_date', '>=', $today)
            ->whereRaw('(total_seats - booked_seats) > 0')
            ->whereRaw('(total_seats - booked_seats) <= 5')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'mediaCount' => Media::query()->count(),
                'activeBanners' => Banner::query()->where('is_active', true)->count(),
                'enabledSections' => $sections->where('is_enabled', true)->count(),
                'totalSections' => $sections->count(),
                'menuItemCount' => MenuItem::query()->count(),
                'totalTrips' => Trip::query()->where('status', 'published')->count(),
                'upcomingDepartures' => Departure::query()
                    ->where('is_cancelled', false)
                    ->whereDate('start_date', '>=', $today)
                    ->count(),
                'lowSeatAlerts' => $lowSeatCount,
            ],
        ]);
    }

    public function lowSeatAlerts(): JsonResponse
    {
        $today = now()->toDateString();

        $alerts = Departure::query()
            ->with('trip')
            ->where('is_cancelled', false)
            ->whereDate('start_date', '>=', $today)
            ->whereRaw('(total_seats - booked_seats) > 0')
            ->whereRaw('(total_seats - booked_seats) <= 5')
            ->orderByRaw('(total_seats - booked_seats) asc')
            ->limit(10)
            ->get()
            ->map(fn (Departure $departure) => CamelCase::convert([
                'id' => (string) $departure->id,
                'trip_id' => (string) $departure->trip_id,
                'trip_title' => $departure->trip?->title ?? '',
                'start_date' => $departure->start_date?->format('Y-m-d'),
                'available_seats' => max(0, $departure->total_seats - $departure->booked_seats),
                'total_seats' => $departure->total_seats,
            ]))
            ->values();

        return response()->json(['success' => true, 'data' => $alerts]);
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
