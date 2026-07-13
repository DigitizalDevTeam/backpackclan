<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ApiPagination
{
    /**
     * @return array{currentPage: int, lastPage: int, perPage: int, total: int, from: int|null, to: int|null}
     */
    public static function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    public static function perPage(mixed $value, int $default = 12, int $max = 48): int
    {
        $perPage = (int) ($value ?: $default);

        return max(1, min($perPage, $max));
    }

    public static function page(mixed $value): int
    {
        $page = (int) ($value ?: 1);

        return max(1, $page);
    }
}
