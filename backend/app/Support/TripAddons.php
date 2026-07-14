<?php

namespace App\Support;

class TripAddons
{
    /**
     * @return list<array{id:string,name:string,description:string,price:int,pricingType:string}>
     */
    public static function defaults(): array
    {
        return [
            [
                'id' => 'travel_insurance',
                'name' => 'Travel insurance',
                'description' => 'Basic trip insurance covering medical & trip interruption',
                'price' => 999,
                'pricingType' => 'per_person',
            ],
            [
                'id' => 'gear_rental',
                'name' => 'Gear rental pack',
                'description' => 'Sleeping bag, trekking poles & daypack rental',
                'price' => 1499,
                'pricingType' => 'per_person',
            ],
            [
                'id' => 'private_room',
                'name' => 'Private room upgrade',
                'description' => 'Single occupancy rooms where available',
                'price' => 3999,
                'pricingType' => 'flat',
            ],
        ];
    }

    /**
     * @param  mixed  $raw
     * @return list<array{id:string,name:string,description:string,price:int,pricingType:string}>
     */
    public static function normalize(mixed $raw): array
    {
        if (! is_array($raw) || $raw === []) {
            return self::defaults();
        }

        $items = [];
        foreach ($raw as $row) {
            if (! is_array($row)) {
                continue;
            }
            $converted = \App\Support\CamelCase::convert($row);
            $id = (string) ($converted['id'] ?? '');
            $name = (string) ($converted['name'] ?? '');
            $price = (int) ($converted['price'] ?? 0);
            if ($id === '' || $name === '' || $price < 0) {
                continue;
            }
            $pricingType = (string) ($converted['pricingType'] ?? 'per_person');
            if (! in_array($pricingType, ['per_person', 'flat'], true)) {
                $pricingType = 'per_person';
            }
            $items[] = [
                'id' => $id,
                'name' => $name,
                'description' => (string) ($converted['description'] ?? ''),
                'price' => $price,
                'pricingType' => $pricingType,
            ];
        }

        return $items !== [] ? $items : self::defaults();
    }

    /**
     * @param  list<string>  $selectedIds
     * @param  list<array{id:string,name:string,description:string,price:int,pricingType:string}>  $catalog
     * @return array{total:int,items:list<array{id:string,name:string,price:int,pricingType:string,quantity:int,lineTotal:int}>}
     */
    public static function resolveSelection(array $selectedIds, array $catalog, int $pax): array
    {
        $byId = [];
        foreach ($catalog as $addon) {
            $byId[$addon['id']] = $addon;
        }

        $items = [];
        $total = 0;
        foreach (array_unique($selectedIds) as $id) {
            if (! isset($byId[$id])) {
                continue;
            }
            $addon = $byId[$id];
            $qty = $addon['pricingType'] === 'flat' ? 1 : max(1, $pax);
            $lineTotal = (int) $addon['price'] * $qty;
            $items[] = [
                'id' => $addon['id'],
                'name' => $addon['name'],
                'price' => (int) $addon['price'],
                'pricingType' => $addon['pricingType'],
                'quantity' => $qty,
                'lineTotal' => $lineTotal,
            ];
            $total += $lineTotal;
        }

        return ['total' => $total, 'items' => $items];
    }
}
