<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SettingsService
{
    public const GROUPS = [
        'general',
        'social',
        'branding',
        'footer',
        'integrations',
        'maintenance',
    ];

  /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'general' => [
                'siteName' => 'Backpackclan',
                'tagline' => 'Adventure Tours in the Himalayas',
                'logoId' => null,
                'faviconId' => null,
                'contactEmail' => 'hello@backpackclan.com',
                'contactPhone' => '+91 98765 43210',
                'address' => 'Mumbai, Maharashtra, India',
            ],
            'social' => [
                'facebook' => 'https://facebook.com/backpackclan',
                'instagram' => 'https://instagram.com/backpackclan',
                'youtube' => 'https://youtube.com/@backpackclan',
                'whatsapp' => '+919876543210',
                'linkedin' => 'https://linkedin.com/company/backpackclan',
            ],
            'branding' => [
                'primaryColor' => '#F58220',
                'secondaryColor' => '#FFD200',
                'fontPreset' => 'default',
            ],
            'footer' => [
                'copyright' => '© 2026 Backpackclan. All rights reserved.',
                'description' => 'Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal.',
                'showPaymentIcons' => true,
            ],
            'integrations' => [
                'whatsappWidget' => false,
                'tawkToEnabled' => false,
                'tawkToId' => '',
                'gtmId' => '',
            ],
            'maintenance' => [
                'enabled' => false,
                'message' => "We're currently performing scheduled maintenance. Please check back soon!",
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        $defaults = self::defaults();
        $stored = SiteSetting::query()->get()->keyBy('group');
        $result = [];

        foreach (self::GROUPS as $group) {
            $result[$group] = $stored->has($group)
                ? array_merge($defaults[$group], $stored[$group]->data)
                : $defaults[$group];
        }

        $latest = $stored->max('updated_at');

        return [
            ...$result,
            'updatedAt' => $latest?->toISOString() ?? now()->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function group(string $group): array
    {
        $this->assertValidGroup($group);
        $all = $this->all();

        return $all[$group];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateGroup(string $group, array $data): array
    {
        $this->assertValidGroup($group);
        $validated = $this->validateGroup($group, $data);

        SiteSetting::query()->updateOrCreate(
            ['group' => $group],
            ['data' => $validated]
        );

        return $this->all();
    }

    public function isMaintenanceMode(): bool
    {
        $maintenance = $this->group('maintenance');

        return (bool) ($maintenance['enabled'] ?? false);
    }

    private function assertValidGroup(string $group): void
    {
        if (! in_array($group, self::GROUPS, true)) {
            throw ValidationException::withMessages([
                'form' => 'Invalid settings group',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function validateGroup(string $group, array $data): array
    {
        $rules = match ($group) {
            'general' => [
                'siteName' => ['required', 'string', 'max:255'],
                'tagline' => ['nullable', 'string', 'max:500'],
                'logoId' => ['nullable', 'string', 'max:255'],
                'faviconId' => ['nullable', 'string', 'max:255'],
                'contactEmail' => ['required', 'email', 'max:255'],
                'contactPhone' => ['required', 'string', 'regex:/^[+\d\s()-]{7,20}$/'],
                'address' => ['nullable', 'string', 'max:500'],
            ],
            'social' => [
                'facebook' => ['nullable', 'string', 'max:500'],
                'instagram' => ['nullable', 'string', 'max:500'],
                'youtube' => ['nullable', 'string', 'max:500'],
                'whatsapp' => ['nullable', 'string', 'max:50'],
                'linkedin' => ['nullable', 'string', 'max:500'],
            ],
            'branding' => [
                'primaryColor' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
                'secondaryColor' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
                'fontPreset' => ['required', Rule::in(['default', 'modern', 'classic'])],
            ],
            'footer' => [
                'copyright' => ['required', 'string', 'max:500'],
                'description' => ['nullable', 'string', 'max:2000'],
                'showPaymentIcons' => ['required', 'boolean'],
            ],
            'integrations' => [
                'whatsappWidget' => ['required', 'boolean'],
                'tawkToEnabled' => ['required', 'boolean'],
                'tawkToId' => ['nullable', 'string', 'max:255'],
                'gtmId' => ['nullable', 'string', 'max:255'],
            ],
            'maintenance' => [
                'enabled' => ['required', 'boolean'],
                'message' => ['nullable', 'string', 'max:2000'],
            ],
            default => [],
        };

        $validator = Validator::make($data, $rules);

        if ($group === 'maintenance' && ($data['enabled'] ?? false) && empty($data['message'])) {
            $validator->after(function ($v) {
                $v->errors()->add('message', 'Maintenance message is required');
            });
        }

        return $validator->validate();
    }
}
