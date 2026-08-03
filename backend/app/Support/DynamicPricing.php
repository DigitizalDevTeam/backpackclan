<?php

namespace App\Support;

class DynamicPricing
{
    public const TRAVEL_KEYS = ['own_bike', 'solo', 'dual', 'coach'];

    public const ROOM_KEYS = ['single', 'double', 'triple'];

    public const TRAVEL_LABELS = [
        'own_bike' => 'Own Bike',
        'solo' => 'Solo Rider',
        'dual' => 'Dual Rider',
        'coach' => 'Seat in Coach',
    ];

    public const ROOM_LABELS = [
        'single' => 'Single Sharing',
        'double' => 'Double Sharing',
        'triple' => 'Triple Sharing',
    ];

    /**
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
                'single' => $num($obj['single'] ?? null),
                'double' => $num($obj['double'] ?? null),
                'triple' => $num($obj['triple'] ?? null),
            ];
        };

        $matrixRaw = is_array($raw['matrix'] ?? null) ? CamelCase::convert($raw['matrix']) : [];
        $travelRaw = is_array($raw['travel'] ?? null)
            ? CamelCase::convert($raw['travel'])
            : (is_array($raw['riders'] ?? null) ? CamelCase::convert($raw['riders']) : []);
        $roomsRaw = is_array($raw['rooms'] ?? null) ? CamelCase::convert($raw['rooms']) : [];

        $matrix = [];
        foreach (self::TRAVEL_KEYS as $travel) {
            $row = is_array($matrixRaw[$travel] ?? null) ? $matrixRaw[$travel] : [];
            $matrix[$travel] = $roomFrom($row);
        }

        $seed = $base > 0 ? $base : null;
        $travelEnabled = array_key_exists('travelEnabled', $raw)
            ? (bool) $raw['travelEnabled']
            : (($raw['riderEnabled'] ?? true) !== false);

        $travel = [];
        foreach (self::TRAVEL_KEYS as $key) {
            $travel[$key] = $num($travelRaw[$key] ?? null)
                ?? $matrix[$key]['triple']
                ?? $seed;
        }

        return [
            'enabled' => (bool) ($raw['enabled'] ?? false),
            'travelEnabled' => $travelEnabled,
            'roomEnabled' => ($raw['roomEnabled'] ?? true) !== false,
            'travel' => $travel,
            'rooms' => [
                'single' => $num($roomsRaw['single'] ?? null) ?? $matrix['solo']['single'],
                'double' => $num($roomsRaw['double'] ?? null) ?? $matrix['solo']['double'],
                'triple' => $num($roomsRaw['triple'] ?? null) ?? $matrix['solo']['triple'],
            ],
            'matrix' => $matrix,
        ];
    }

    /**
     * @param  array<string, mixed>  $config
     */
    public static function resolveUnitPrice(array $config, ?string $travel, ?string $room): ?int
    {
        if (empty($config['enabled'])) {
            return null;
        }

        $travelEnabled = ($config['travelEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        if ($travelEnabled && $roomEnabled) {
            if (! $travel || ! $room) {
                return null;
            }
            $price = (int) ($config['matrix'][$travel][$room] ?? 0);

            return $price > 0 ? $price : null;
        }

        if ($travelEnabled) {
            if (! $travel) {
                return null;
            }
            $price = (int) ($config['travel'][$travel] ?? 0);

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
        $travelEnabled = ($config['travelEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        if ($travelEnabled && $roomEnabled) {
            foreach (self::TRAVEL_KEYS as $travel) {
                foreach (self::ROOM_KEYS as $room) {
                    $p = (int) ($config['matrix'][$travel][$room] ?? 0);
                    if ($p > 0) {
                        $prices[] = $p;
                    }
                }
            }
        } elseif ($travelEnabled) {
            foreach (self::TRAVEL_KEYS as $travel) {
                $p = (int) ($config['travel'][$travel] ?? 0);
                if ($p > 0) {
                    $prices[] = $p;
                }
            }
        } elseif ($roomEnabled) {
            foreach (self::ROOM_KEYS as $room) {
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
    public static function resolveFromTripPricing(array $pricing, ?string $travel, ?string $room): int
    {
        $pricing = CamelCase::convert($pricing);
        $config = self::normalize($pricing);
        $option = self::resolveUnitPrice($config, $travel, $room);
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
     * @param  array<string, mixed>  $pricing
     * @return array<string, mixed>|null
     */
    public static function toPublicOptions(array $pricing): ?array
    {
        $config = self::normalize($pricing);
        if (empty($config['enabled'])) {
            return null;
        }

        $travelEnabled = ($config['travelEnabled'] ?? true) !== false;
        $roomEnabled = ($config['roomEnabled'] ?? true) !== false;

        $travels = [];
        $rooms = [];

        if ($travelEnabled && $roomEnabled) {
            foreach (self::TRAVEL_KEYS as $travel) {
                $has = false;
                foreach (self::ROOM_KEYS as $room) {
                    if ((int) ($config['matrix'][$travel][$room] ?? 0) > 0) {
                        $has = true;
                        break;
                    }
                }
                if ($has) {
                    $travels[] = [
                        'id' => $travel,
                        'label' => self::TRAVEL_LABELS[$travel],
                    ];
                }
            }
            foreach (self::ROOM_KEYS as $room) {
                $has = false;
                foreach (self::TRAVEL_KEYS as $travel) {
                    if ((int) ($config['matrix'][$travel][$room] ?? 0) > 0) {
                        $has = true;
                        break;
                    }
                }
                if ($has) {
                    $rooms[] = [
                        'id' => $room,
                        'label' => self::ROOM_LABELS[$room],
                    ];
                }
            }
        } elseif ($travelEnabled) {
            foreach (self::TRAVEL_KEYS as $travel) {
                $p = (int) ($config['travel'][$travel] ?? 0);
                if ($p > 0) {
                    $travels[] = [
                        'id' => $travel,
                        'label' => self::TRAVEL_LABELS[$travel],
                        'price' => $p,
                    ];
                }
            }
        } elseif ($roomEnabled) {
            foreach (self::ROOM_KEYS as $room) {
                $p = (int) ($config['rooms'][$room] ?? 0);
                if ($p > 0) {
                    $rooms[] = [
                        'id' => $room,
                        'label' => self::ROOM_LABELS[$room],
                        'price' => $p,
                    ];
                }
            }
        }

        if ($travels === [] && $rooms === []) {
            return null;
        }

        return [
            'enabled' => true,
            'travelEnabled' => $travelEnabled && $travels !== [],
            'roomEnabled' => $roomEnabled && $rooms !== [],
            'travels' => $travels,
            'rooms' => $rooms,
            /** legacy aliases for older frontend builds */
            'riderEnabled' => $travelEnabled && $travels !== [],
            'riders' => $travels,
            'matrix' => $config['matrix'],
            'travelPrices' => $config['travel'],
            'riderPrices' => $config['travel'],
            'roomPrices' => $config['rooms'],
            'startingFrom' => self::minPrice($config),
        ];
    }
}
