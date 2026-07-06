<?php

namespace App\Support;

class CamelCase
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function convert(array $data): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $camelKey = lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', (string) $key))));

            if (is_array($value) && array_is_list($value)) {
                $result[$camelKey] = array_map(
                    fn ($item) => is_array($item) ? self::convert($item) : $item,
                    $value
                );
            } elseif (is_array($value)) {
                $result[$camelKey] = self::convert($value);
            } else {
                $result[$camelKey] = $value;
            }
        }

        return $result;
    }
}
