<?php

use App\Http\Controllers\Api\V1\Admin\AuthController;
use App\Http\Controllers\Api\V1\Admin\BannerController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\HomepageSectionController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\MenuController;
use App\Http\Controllers\Api\V1\Admin\PermissionController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SeoController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile/password', [AuthController::class, 'changePassword']);

        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/activity', [DashboardController::class, 'activity']);

        Route::get('settings/maintenance-status', [SettingsController::class, 'maintenanceStatus']);
        Route::middleware('permission:settings.view')->get('settings', [SettingsController::class, 'index']);
        Route::middleware('permission:settings.view')->get('settings/{group}', [SettingsController::class, 'show']);
        Route::middleware('permission:settings.update')->put('settings/{group}', [SettingsController::class, 'update']);

        Route::middleware('permission:users.view')->group(function () {
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{user}', [UserController::class, 'show']);
        });
        Route::middleware('permission:users.create')->post('users', [UserController::class, 'store']);
        Route::middleware('permission:users.update')->put('users/{user}', [UserController::class, 'update']);
        Route::middleware('permission:users.delete')->delete('users/{user}', [UserController::class, 'destroy']);

        Route::middleware('permission:roles.view')->group(function () {
            Route::get('roles', [RoleController::class, 'index']);
            Route::get('roles/{role}', [RoleController::class, 'show']);
            Route::get('permissions', [PermissionController::class, 'index']);
        });
        Route::middleware('permission:roles.create')->post('roles', [RoleController::class, 'store']);
        Route::middleware('permission:roles.update')->put('roles/{role}', [RoleController::class, 'update']);
        Route::middleware('permission:roles.delete')->delete('roles/{role}', [RoleController::class, 'destroy']);

        Route::middleware('permission:media.view')->get('media', [MediaController::class, 'index']);
        Route::middleware('permission:media.view')->get('media/{medium}', [MediaController::class, 'show']);
        Route::middleware('permission:media.upload')->post('media', [MediaController::class, 'store']);
        Route::middleware('permission:media.update')->put('media/{medium}', [MediaController::class, 'update']);
        Route::middleware('permission:media.delete')->delete('media', [MediaController::class, 'bulkDestroy']);
        Route::middleware('permission:media.delete')->delete('media/{medium}', [MediaController::class, 'destroy']);

        Route::middleware('permission:banners.view')->get('banners', [BannerController::class, 'index']);
        Route::middleware('permission:banners.view')->get('banners/{banner}', [BannerController::class, 'show']);
        Route::middleware('permission:banners.create')->post('banners', [BannerController::class, 'store']);
        Route::middleware('permission:banners.update')->group(function () {
            Route::put('banners/{banner}', [BannerController::class, 'update']);
            Route::patch('banners/{banner}', [BannerController::class, 'patch']);
        });
        Route::middleware('permission:banners.delete')->delete('banners/{banner}', [BannerController::class, 'destroy']);

        Route::middleware('permission:seo.view')->get('seo', [SeoController::class, 'index']);
        Route::middleware('permission:seo.view')->get('seo/{pageKey}', [SeoController::class, 'show']);
        Route::middleware('permission:seo.update')->put('seo/{pageKey}', [SeoController::class, 'update']);
        Route::middleware('permission:seo.update')->delete('seo/{pageKey}', [SeoController::class, 'reset']);

        Route::middleware('permission:menus.view')->get('menus', [MenuController::class, 'index']);
        Route::middleware('permission:menus.view')->get('menus/{menu}', [MenuController::class, 'show']);
        Route::middleware('permission:menus.update')->group(function () {
            Route::post('menus/{menu}/items', [MenuController::class, 'storeItem']);
            Route::put('menus/{menu}/items', [MenuController::class, 'reorderItems']);
            Route::put('menus/{menu}/items/{item}', [MenuController::class, 'updateItem']);
            Route::delete('menus/{menu}/items/{item}', [MenuController::class, 'destroyItem']);
            Route::patch('menus/{menu}/items/{item}', [MenuController::class, 'toggleItem']);
        });

        Route::middleware('permission:homepage.view')->get('homepage/sections', [HomepageSectionController::class, 'index']);
        Route::middleware('permission:homepage.view')->get('homepage/sections/enabled', [HomepageSectionController::class, 'enabled']);
        Route::middleware('permission:homepage.view')->get('homepage/sections/{slug}', [HomepageSectionController::class, 'show']);
        Route::middleware('permission:homepage.update')->group(function () {
            Route::put('homepage/sections', [HomepageSectionController::class, 'reorder']);
            Route::put('homepage/sections/{slug}', [HomepageSectionController::class, 'update']);
            Route::patch('homepage/sections/{slug}', [HomepageSectionController::class, 'toggle']);
        });
    });
});
