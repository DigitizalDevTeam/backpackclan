<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (SettingsService::defaults() as $group => $data) {
            SiteSetting::query()->updateOrCreate(
                ['group' => $group],
                ['data' => $data]
            );
        }
    }
}
