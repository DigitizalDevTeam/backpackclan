<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Config;
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
        'mail',
        'payments',
        'notifications',
    ];

    /** Groups safe to expose on the public site layout API. */
    public const PUBLIC_GROUPS = [
        'general',
        'social',
        'branding',
        'footer',
        'integrations',
        'maintenance',
    ];

    /** @var list<string> */
    private const SECRET_FIELDS = [
        'mail.password',
        'payments.stripeSecret',
        'payments.stripeWebhookSecret',
        'payments.razorpayKeySecret',
        'payments.razorpayWebhookSecret',
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
            'mail' => [
                'mailer' => 'smtp',
                'host' => '',
                'port' => 587,
                'username' => '',
                'password' => '',
                'encryption' => 'tls',
                'fromAddress' => 'hello@backpackclan.com',
                'fromName' => 'Backpackclan',
            ],
            'payments' => [
                'stripeEnabled' => false,
                'stripeKey' => '',
                'stripeSecret' => '',
                'stripeWebhookSecret' => '',
                'stripeCurrency' => 'inr',
                'depositPercent' => 30,
                'razorpayEnabled' => false,
                'razorpayKeyId' => '',
                'razorpayKeySecret' => '',
                'razorpayWebhookSecret' => '',
                'razorpayCurrency' => 'INR',
            ],
            'notifications' => [
                'bookingCreated' => true,
                'paymentReceived' => true,
                'attachInvoice' => true,
                'leadConfirmation' => true,
                'leadOpsNotify' => true,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function all(bool $maskSecrets = true): array
    {
        $defaults = self::defaults();
        $stored = SiteSetting::query()->get()->keyBy('group');
        $result = [];

        foreach (self::GROUPS as $group) {
            $data = $stored->has($group)
                ? array_merge($defaults[$group], $stored[$group]->data)
                : $defaults[$group];

            if ($maskSecrets) {
                $data = $this->maskGroupSecrets($group, $data);
            }

            $result[$group] = $data;
        }

        $latest = $stored->max('updated_at');

        return [
            ...$result,
            'updatedAt' => $latest?->toISOString() ?? now()->toISOString(),
        ];
    }

    /**
     * Public-safe settings for the website layout.
     *
     * @return array<string, mixed>
     */
    public function publicAll(): array
    {
        $all = $this->all(maskSecrets: true);
        $result = [];
        foreach (self::PUBLIC_GROUPS as $group) {
            $result[$group] = $all[$group];
        }
        $result['updatedAt'] = $all['updatedAt'];

        return $result;
    }

    /**
     * @return array<string, mixed>
     */
    public function group(string $group, bool $maskSecrets = true): array
    {
        $this->assertValidGroup($group);
        $all = $this->all($maskSecrets);

        return $all[$group];
    }

    /**
     * Raw group data without masking (for applying config / keep-secret merges).
     *
     * @return array<string, mixed>
     */
    public function groupRaw(string $group): array
    {
        return $this->group($group, maskSecrets: false);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateGroup(string $group, array $data): array
    {
        $this->assertValidGroup($group);
        $data = $this->mergeKeptSecrets($group, $data);
        $validated = $this->validateGroup($group, $data);

        SiteSetting::query()->updateOrCreate(
            ['group' => $group],
            ['data' => $validated]
        );

        if (in_array($group, ['mail', 'payments'], true)) {
            $this->applyToRuntime();
        }

        return $this->all(maskSecrets: true);
    }

    public function isMaintenanceMode(): bool
    {
        $maintenance = $this->groupRaw('maintenance');

        return (bool) ($maintenance['enabled'] ?? false);
    }

    /**
     * Apply mail + payment settings to Laravel config.
     * Stored settings override .env only when admin has saved those groups.
     */
    public function applyToRuntime(): void
    {
        try {
            if (SiteSetting::query()->where('group', 'mail')->exists()) {
                $mail = $this->groupRaw('mail');
                if (! empty($mail['mailer'])) {
                    Config::set('mail.default', $mail['mailer']);
                }
                if (! empty($mail['host'])) {
                    Config::set('mail.mailers.smtp.host', $mail['host']);
                }
                if (isset($mail['port']) && $mail['port'] !== '' && $mail['port'] !== null) {
                    Config::set('mail.mailers.smtp.port', (int) $mail['port']);
                }
                if (array_key_exists('username', $mail)) {
                    Config::set('mail.mailers.smtp.username', $mail['username'] ?: null);
                }
                if (! empty($mail['password'])) {
                    Config::set('mail.mailers.smtp.password', $mail['password']);
                }
                $encryption = $mail['encryption'] ?? 'tls';
                if ($encryption === 'ssl') {
                    Config::set('mail.mailers.smtp.scheme', 'smtps');
                } else {
                    Config::set('mail.mailers.smtp.scheme', null);
                }
                if (! empty($mail['fromAddress'])) {
                    Config::set('mail.from.address', $mail['fromAddress']);
                }
                if (! empty($mail['fromName'])) {
                    Config::set('mail.from.name', $mail['fromName']);
                }
            }

            if (! SiteSetting::query()->where('group', 'payments')->exists()) {
                return;
            }

            $payments = $this->groupRaw('payments');

            if (($payments['stripeEnabled'] ?? false) === true) {
                if (! empty($payments['stripeKey'])) {
                    Config::set('stripe.key', $payments['stripeKey']);
                }
                if (! empty($payments['stripeSecret'])) {
                    Config::set('stripe.secret', $payments['stripeSecret']);
                }
                if (! empty($payments['stripeWebhookSecret'])) {
                    Config::set('stripe.webhook_secret', $payments['stripeWebhookSecret']);
                }
                if (! empty($payments['stripeCurrency'])) {
                    Config::set('stripe.currency', strtolower((string) $payments['stripeCurrency']));
                }
                if (isset($payments['depositPercent'])) {
                    Config::set('stripe.deposit_percent', (int) $payments['depositPercent']);
                }
            } else {
                Config::set('stripe.secret', '');
                Config::set('stripe.key', '');
            }

            if (($payments['razorpayEnabled'] ?? false) === true) {
                if (! empty($payments['razorpayKeyId'])) {
                    Config::set('razorpay.key_id', $payments['razorpayKeyId']);
                }
                if (! empty($payments['razorpayKeySecret'])) {
                    Config::set('razorpay.key_secret', $payments['razorpayKeySecret']);
                }
                if (! empty($payments['razorpayWebhookSecret'])) {
                    Config::set('razorpay.webhook_secret', $payments['razorpayWebhookSecret']);
                }
                if (! empty($payments['razorpayCurrency'])) {
                    Config::set('razorpay.currency', strtoupper((string) $payments['razorpayCurrency']));
                }
            } else {
                Config::set('razorpay.key_secret', '');
                Config::set('razorpay.key_id', '');
            }
        } catch (\Throwable) {
            // Database may be unavailable during early bootstrap / migrations.
        }
    }

    public function opsEmail(): ?string
    {
        try {
            $general = $this->groupRaw('general');
            $mail = $this->groupRaw('mail');
            $email = $general['contactEmail'] ?? $mail['fromAddress'] ?? config('mail.from.address');

            return is_string($email) && $email !== '' ? $email : null;
        } catch (\Throwable) {
            $fallback = config('mail.from.address');

            return is_string($fallback) && $fallback !== '' ? $fallback : null;
        }
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
    private function mergeKeptSecrets(string $group, array $data): array
    {
        $existing = SiteSetting::query()->where('group', $group)->value('data');
        $existing = is_array($existing) ? $existing : [];

        foreach ($this->secretKeysForGroup($group) as $key) {
            $incoming = $data[$key] ?? null;
            if ($incoming === null || $incoming === '' || $incoming === '••••••••') {
                if (array_key_exists($key, $existing) && $existing[$key] !== '') {
                    $data[$key] = $existing[$key];
                } else {
                    $data[$key] = $data[$key] ?? '';
                }
            }
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function maskGroupSecrets(string $group, array $data): array
    {
        foreach ($this->secretKeysForGroup($group) as $key) {
            if (! empty($data[$key])) {
                $data[$key] = '';
                $data[$key.'Set'] = true;
            } else {
                $data[$key.'Set'] = false;
            }
        }

        return $data;
    }

    /**
     * @return list<string>
     */
    private function secretKeysForGroup(string $group): array
    {
        $keys = [];
        foreach (self::SECRET_FIELDS as $path) {
            [$g, $field] = explode('.', $path, 2);
            if ($g === $group) {
                $keys[] = $field;
            }
        }

        return $keys;
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
            'mail' => [
                'mailer' => ['required', Rule::in(['smtp', 'log', 'sendmail', 'array'])],
                'host' => ['nullable', 'string', 'max:255'],
                'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
                'username' => ['nullable', 'string', 'max:255'],
                'password' => ['nullable', 'string', 'max:500'],
                'encryption' => ['nullable', Rule::in(['tls', 'ssl', 'null', ''])],
                'fromAddress' => ['required', 'email', 'max:255'],
                'fromName' => ['required', 'string', 'max:255'],
            ],
            'payments' => [
                'stripeEnabled' => ['required', 'boolean'],
                'stripeKey' => ['nullable', 'string', 'max:255'],
                'stripeSecret' => ['nullable', 'string', 'max:255'],
                'stripeWebhookSecret' => ['nullable', 'string', 'max:255'],
                'stripeCurrency' => ['required', 'string', 'max:10'],
                'depositPercent' => ['required', 'integer', 'min:1', 'max:100'],
                'razorpayEnabled' => ['required', 'boolean'],
                'razorpayKeyId' => ['nullable', 'string', 'max:255'],
                'razorpayKeySecret' => ['nullable', 'string', 'max:255'],
                'razorpayWebhookSecret' => ['nullable', 'string', 'max:255'],
                'razorpayCurrency' => ['required', 'string', 'max:10'],
            ],
            'notifications' => [
                'bookingCreated' => ['required', 'boolean'],
                'paymentReceived' => ['required', 'boolean'],
                'attachInvoice' => ['required', 'boolean'],
                'leadConfirmation' => ['required', 'boolean'],
                'leadOpsNotify' => ['required', 'boolean'],
            ],
            default => [],
        };

        $validator = Validator::make($data, $rules);

        if ($group === 'maintenance' && ($data['enabled'] ?? false) && empty($data['message'])) {
            $validator->after(function ($v) {
                $v->errors()->add('message', 'Maintenance message is required');
            });
        }

        $validated = $validator->validate();

        // Strip ephemeral *Set flags if present
        foreach (array_keys($validated) as $key) {
            if (str_ends_with($key, 'Set')) {
                unset($validated[$key]);
            }
        }

        return $validated;
    }
}
