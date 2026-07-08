<?php

use App\Http\Controllers\Api\V1\Admin\AuthController;
use App\Http\Controllers\Api\V1\Admin\BannerController;
use App\Http\Controllers\Api\V1\Admin\BlogController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\DestinationController;
use App\Http\Controllers\Api\V1\Admin\DepartureController;
use App\Http\Controllers\Api\V1\Admin\TripController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\HomepageSectionController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\MenuController;
use App\Http\Controllers\Api\V1\Admin\MenuSyncController;
use App\Http\Controllers\Api\V1\Admin\PricingController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SeoController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\V1\Customer\BookingController as CustomerBookingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile/password', [AuthController::class, 'changePassword']);

        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/low-seat-alerts', [DashboardController::class, 'lowSeatAlerts']);
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

        Route::middleware('permission:categories.view')->get('categories', [CategoryController::class, 'index']);
        Route::middleware('permission:categories.view')->get('categories/{category}', [CategoryController::class, 'show']);
        Route::middleware('permission:categories.create')->post('categories', [CategoryController::class, 'store']);
        Route::middleware('permission:categories.update')->group(function () {
            Route::put('categories/{category}', [CategoryController::class, 'update']);
            Route::patch('categories/{category}', [CategoryController::class, 'patch']);
        });
        Route::middleware('permission:categories.delete')->delete('categories/{category}', [CategoryController::class, 'destroy']);

        Route::middleware('permission:destinations.view')->get('destinations', [DestinationController::class, 'index']);
        Route::middleware('permission:destinations.view')->get('destinations/{destination}', [DestinationController::class, 'show']);
        Route::middleware('permission:destinations.create')->post('destinations', [DestinationController::class, 'store']);
        Route::middleware('permission:destinations.update')->group(function () {
            Route::put('destinations/{destination}', [DestinationController::class, 'update']);
            Route::patch('destinations/{destination}', [DestinationController::class, 'patch']);
        });
        Route::middleware('permission:destinations.delete')->delete('destinations/{destination}', [DestinationController::class, 'destroy']);

        Route::middleware('permission:trips.view')->get('trips', [TripController::class, 'index']);
        Route::middleware('permission:trips.view')->get('trips/{trip}', [TripController::class, 'show']);
        Route::middleware('permission:trips.create')->post('trips', [TripController::class, 'store']);
        Route::middleware('permission:trips.update')->group(function () {
            Route::put('trips/{trip}', [TripController::class, 'update']);
            Route::patch('trips/{trip}', [TripController::class, 'patch']);
        });
        Route::middleware('permission:trips.delete')->delete('trips/{trip}', [TripController::class, 'destroy']);

        Route::middleware('permission:departures.view')->get('departures/calendar', [DepartureController::class, 'calendar']);
        Route::middleware('permission:departures.view')->get('departures', [DepartureController::class, 'index']);
        Route::middleware('permission:departures.view')->get('departures/{departure}', [DepartureController::class, 'show']);
        Route::middleware('permission:departures.create')->post('departures/bulk', [DepartureController::class, 'bulk']);
        Route::middleware('permission:departures.create')->post('departures', [DepartureController::class, 'store']);
        Route::middleware('permission:departures.update')->put('departures/{departure}', [DepartureController::class, 'update']);
        Route::middleware('permission:departures.delete')->delete('departures/{departure}', [DepartureController::class, 'destroy']);

        Route::middleware('permission:pricing.view')->get('pricing', [PricingController::class, 'index']);
        Route::middleware('permission:pricing.update')->put('pricing/trips/{trip}', [PricingController::class, 'updateTrip']);

        Route::middleware('permission:blogs.view')->get('blogs', [BlogController::class, 'index']);
        Route::middleware('permission:blogs.view')->get('blogs/{blog}', [BlogController::class, 'show']);
        Route::middleware('permission:blogs.create')->post('blogs', [BlogController::class, 'store']);
        Route::middleware('permission:blogs.update')->group(function () {
            Route::put('blogs/{blog}', [BlogController::class, 'update']);
            Route::patch('blogs/{blog}', [BlogController::class, 'patch']);
        });
        Route::middleware('permission:blogs.delete')->delete('blogs/{blog}', [BlogController::class, 'destroy']);

        Route::middleware('permission:seo.view')->get('seo', [SeoController::class, 'index']);
        Route::middleware('permission:seo.view')->get('seo/{pageKey}', [SeoController::class, 'show']);
        Route::middleware('permission:seo.update')->put('seo/{pageKey}', [SeoController::class, 'update']);
        Route::middleware('permission:seo.update')->delete('seo/{pageKey}', [SeoController::class, 'reset']);

        Route::middleware('permission:menus.view')->get('menus', [MenuController::class, 'index']);
        Route::middleware('permission:menus.view')->get('menus/{menu}', [MenuController::class, 'show']);
        Route::middleware('permission:menus.update')->group(function () {
            Route::post('menus/{menu}/sync-destinations', [MenuSyncController::class, 'syncDestinations']);
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

Route::prefix('v1/customer')->group(function () {
    Route::post('register', [CustomerAuthController::class, 'register']);
    Route::post('login', [CustomerAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'customer'])->group(function () {
        Route::post('logout', [CustomerAuthController::class, 'logout']);
        Route::get('me', [CustomerAuthController::class, 'me']);

        Route::get('bookings', [CustomerBookingController::class, 'index']);
        Route::get('bookings/{booking}', [CustomerBookingController::class, 'show']);
        Route::post('bookings/{booking}/pay', [CustomerBookingController::class, 'pay']);
        Route::post('bookings/{booking}/documents', [CustomerBookingController::class, 'uploadDocument']);
        Route::get('bookings/{booking}/invoice', [CustomerBookingController::class, 'invoice']);
        Route::get('bookings/{booking}/voucher', [CustomerBookingController::class, 'voucher']);
    });
});
