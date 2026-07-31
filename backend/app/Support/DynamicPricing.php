<?php

namespace App\Support;

class DynamicPricing
{
    /**
     * Normalize raw dynamic pricing input for JSON storage (camelCase keys).
     *
     * @param  array<string, mixed>|null  $raw
     * @return array<string, mixed>|null
     */
    public static function mapInput(?array $raw, int $basePrice = 0): ?array
    {
        if ($raw === null) {
            return null;
        }

        return self::normalize([
            'basePrice' => $basePrice,
            'dynamicPricing' => $raw,
        ]);
    }

    /**
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>
     */
    public static function normalize(array $pricing): array
    {
        $pricing = CamelCase::convert($pricing);
        $base = (int) ($pricing['basePrice'] ?? 0);
        $raw = is_array($pricing['dynamicPricing'] ?? null)
            ? CamelCase::convert($pricing['dynamicPricing'])
            : [];

        $num = static function ($value) {
            if ($value === null || $value === '') {
                return null;
            }
            $n = (int) $value;

            return $n > 0 ? $n : null;
        };

        $roomFrom = static function (array $obj) use ($num): array {
            return [
                'triple' => $num($obj['triple'] ?? null),
                'double' => $num($obj['double'] ?? null),
                'single' => $num($obj['single'] ?? null),
            ];
        };

        $matrix = is_array($raw['matrix'] ?? null) ? CamelCase::convert($raw['matrix']) : [];
        $riders = is_array($raw['riders'] ?? null) ? CamelCase::convert($raw['riders']) : [];
        $rooms = is_array($raw['rooms'] ?? null) ? CamelCase::convert($raw['rooms']) : [];
        $solo = $roomFrom(is_array($matrix['solo'] ?? null) ? $matrix['solo'] : []);
        $dual = $roomFrom(is_array($matrix['dual'] ?? null) ? $matrix['dual'] : []);

        $seed = $base > 0 ? $base : null;

        return [
            'enabled' => (bool) ($raw['enabled'] ?? false),
            'riderEnabled' => ($raw['riderEnabled'] ?? true) !== false,
            'roomEnabled' => ($raw['roomEnabled'] ?? true) !== false,
            'riders' => [
                'solo' => $num($riders['solo'] ?? null) ?? $solo['triple'] ?? $seed,
                'dual' => $num($riders['dual'] ?? null) ?? $dual['triple'] ?? $seed,
            ],
            'rooms' => [
                'triple' => $num($rooms['triple'] ?? null) ?? $solo['triple'],
                'double' => $num($rooms['double'] ?? null) ?? $solo['double'],
                'single' => $num($rooms['single'] ?? null) ?? $solo['single'],
            ],
            'matrix' => [
                'solo' => [
                    'triple' => $solo['triple'] ?? $num($riders['solo'] ?? null) ?? $seed,
                    'double' => $solo['double'] ?? $num($riders['solo'] ?? null) ?? $seed,
                    'single' => $solo['single'] ?? $num($riders['solo'] ?? null) ?? $seed,
                ],
                'dual' => [
                    'triple' => $dual['triple'] ?? $num($riders['dual'] ?? null) ?? $seed,
                    'double' => $dual['double'] ?? $num($riders['dual'] ?? null) ?? $seed,
                    'single' => $dual['single'] ?? $num($riders['dual'] ?? null) ?? $seed,
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $config
     */
    public static function resolveUnitPrice(array $config, ?string $rider, ?string $room): ?int
    {
        if (empty($config['enabled'])) {
            return null;
        }

        $riderEnabled = ($config['riderEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        if ($riderEnabled && $roomEnabled) {
            if (! $rider || ! $room) {
                return null;
            }
            $price = (int) ($config['matrix'][$rider][$room] ?? 0);

            return $price > 0 ? $price : null;
        }

        if ($riderEnabled) {
            if (! $rider) {
                return null;
            }
            $price = (int) ($config['riders'][$rider] ?? 0);

            return $price > 0 ? $price : null;
        }

        if ($roomEnabled) {
            if (! $room) {
                return null;
            }
            $price = (int) ($config['rooms'][$room] ?? 0);

            return $price > 0 ? $price : null;
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $config
     */
    public static function minPrice(array $config): ?int
    {
        if (empty($config['enabled'])) {
            return null;
        }

        $prices = [];
        $riderEnabled = ($config['riderEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        if ($riderEnabled && $roomEnabled) {
            foreach (['solo', 'dual'] as $rider) {
                foreach (['triple', 'double', 'single'] as $room) {
                    $p = (int) ($config['matrix'][$rider][$room] ?? 0);
                    if ($p > 0) {
                        $prices[] = $p;
                    }
                }
            }
        } elseif ($riderEnabled) {
            foreach (['solo', 'dual'] as $rider) {
                $p = (int) ($config['riders'][$rider] ?? 0);
                if ($p > 0) {
                    $prices[] = $p;
                }
            }
        } elseif ($roomEnabled) {
            foreach (['triple', 'double', 'single'] as $room) {
                $p = (int) ($config['rooms'][$room] ?? 0);
                if ($p > 0) {
                    $prices[] = $p;
                }
            }
        }

        return $prices === [] ? null : min($prices);
    }

    /**
     * @param  array<string, mixed>  $pricing
     */
    public static function resolveFromTripPricing(array $pricing, ?string $rider, ?string $room): int
    {
        $pricing = CamelCase::convert($pricing);
        $config = self::normalize($pricing);
        $option = self::resolveUnitPrice($config, $rider, $room);
        if ($option !== null) {
            return $option;
        }

        $min = self::minPrice($config);
        if (! empty($config['enabled']) && $min !== null) {
            return $min;
        }

        $base = (int) ($pricing['basePrice'] ?? 0);
        $sale = isset($pricing['salePrice']) ? (int) $pricing['salePrice'] : null;
        if ($sale !== null && $sale > 0 && $sale < $base) {
            return $sale;
        }

        return $base;
    }

    /**
     * Public payload for trip detail UI.
     *
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>|null
     */
    public static function toPublicOptions(array $pricing): ?array
    {
        $config = self::normalize($pricing);
        if (empty($config['enabled'])) {
            return null;
        }

        $riderEnabled = ($config['riderEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        $riders = [];
        $rooms = [];

        if ($riderEnabled && $roomEnabled) {
            foreach (['solo', 'dual'] as $rider) {
                $has = false;
                foreach (['triple', 'double', 'single'] as $room) {
                    if ((int) ($config['matrix'][$rider][$room] ?? 0) > 0) {
                        $has = true;
                        break;
                    }
                }
                if ($has) {
                    $riders[] = [
                        'id' => $rider,
                        'label' => $rider === 'solo' ? 'Solo Rider' : 'Dual Rider',
                    ];
                }
            }
            foreach (['triple', 'double', 'single'] as $room) {
                $has = false;
                foreach (['solo', 'dual'] as $rider) {
                    if ((int) ($config['matrix'][$rider][$room] ?? 0) > 0) {
                        $has = true;
                        break;
                    }
                }
                if ($has) {
                    $rooms[] = [
                        'id' => $room,
                        'label' => match ($room) {
                            'triple' => 'Triple Sharing',
                            'double' => 'Double Sharing',
                            default => 'Single Sharing',
                        },
                    ];
                }
            }
        } elseif ($riderEnabled) {
            foreach (['solo', 'dual'] as $rider) {
                $p = (int) ($config['riders'][$rider] ?? 0);
                if ($p > 0) {
                    $riders[] = [
                        'id' => $rider,
                        'label' => $rider === 'solo' ? 'Solo Rider' : 'Dual Rider',
                        'price' => $p,
                    ];
                }
            }
        } elseif ($roomEnabled) {
            foreach (['triple', 'double', 'single'] as $room) {
                $p = (int) ($config['rooms'][$room] ?? 0);
                if ($p > 0) {
                    $rooms[] = [
                        'id' => $room,
                        'label' => match ($room) {
                            'triple' => 'Triple Sharing',
                            'double' => 'Double Sharing',
                            default => 'Single Sharing',
                        },
                        'price' => $p,
                    ];
                }
            }
        }

        if ($riders === [] && $rooms === []) {
            return null;
        }

        return [
            'enabled' => true,
            'riderEnabled' => $riderEnabled && $riders !== [],
            'roomEnabled' => $roomEnabled && $rooms !== [],
            'riders' => $riders,
            'rooms' => $rooms,
            'matrix' => $config['matrix'],
            'riderPrices' => $config['riders'],
            'roomPrices' => $config['rooms'],
            'startingFrom' => self::minPrice($config),
        ];
    }
}
