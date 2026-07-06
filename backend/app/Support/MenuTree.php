<?php

namespace App\Support;

class MenuTree
{
    /**
     * @param  list<array<string, mixed>>  $items
     * @return list<array<string, mixed>>
     */
    public static function build(array $items): array
    {
        $map = [];
        foreach ($items as $item) {
            $map[$item['id']] = array_merge($item, ['children' => []]);
        }

        $roots = [];
        foreach ($map as $id => $node) {
            $parentId = $node['parentId'] ?? null;
            if ($parentId && isset($map[$parentId])) {
                $map[$parentId]['children'][] = &$map[$id];
            } else {
                $roots[] = &$map[$id];
            }
        }

        self::sortNodes($roots);

        return $roots;
    }

    /**
     * @param  list<array<string, mixed>>  $nodes
     * @return list<array<string, mixed>>
     */
    public static function flatten(array $nodes, int $depth = 0): array
    {
        $result = [];
        foreach ($nodes as $node) {
            $children = $node['children'] ?? [];
            unset($node['children']);
            $result[] = array_merge($node, ['depth' => $depth]);
            $result = array_merge($result, self::flatten($children, $depth + 1));
        }

        return $result;
    }

    /**
     * @param  list<array<string, mixed>>  $nodes
     */
    private static function sortNodes(array &$nodes): void
    {
        usort($nodes, fn ($a, $b) => ($a['sortOrder'] ?? 0) <=> ($b['sortOrder'] ?? 0));
        foreach ($nodes as &$node) {
            if (! empty($node['children'])) {
                self::sortNodes($node['children']);
            }
        }
    }
}
