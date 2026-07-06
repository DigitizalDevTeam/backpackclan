<?php

namespace App\Support;

use App\Models\ActivityLog;

class ActivityLogger
{
    public static function log(string $action, string $module): void
    {
        ActivityLog::query()->create([
            'action' => $action,
            'module' => $module,
        ]);
    }
}
