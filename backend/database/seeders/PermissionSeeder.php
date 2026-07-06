<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Permissions::definitions() as $definition) {
            Permission::query()->updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'name' => $definition['name'],
                    'group' => $definition['group'],
                    'description' => $definition['description'],
                ]
            );
        }
    }
}
