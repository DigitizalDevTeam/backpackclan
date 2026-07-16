<?php

use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Admin\AuthController;
use App\Http\Controllers\Api\V1\Admin\BannerController;
use App\Http\Controllers\Api\V1\Admin\BlogController;
use App\Http\Controllers\Api\V1\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\V1\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\DestinationController;
use App\Http\Controllers\Api\V1\Admin\DepartureController;
use App\Http\Controllers\Api\V1\Admin\TripReviewController as AdminTripReviewController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\HomepageSectionController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\MenuController;
use App\Http\Controllers\Api\V1\Admin\MenuSyncController;
use App\Http\Controllers\Api\V1\Admin\PermissionController;
use App\Http\Controllers\Api\V1\Admin\PricingController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\SeoController;
use App\Http\Controllers\Api\V1\Admin\SettingsController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Customer\AuthController as CustomerAuthController;
use App\Http\Controllers\Api\V1\Customer\BookingController as CustomerBookingController;
use App\Http\Controllers\Api\V1\Customer\BookingPaymentController as CustomerBookingPaymentController;
use App\Http\Controllers\Api\V1\Customer\TripReviewController as CustomerTripReviewController;
use App\Http\Controllers\Api\V1\Webhooks\StripeWebhookController;
use App\Http\Controllers\Api\V1\Webhooks\RazorpayWebhookController;
use App\Http\Controllers\Api\V1\Public\BlogController as PublicBlogController;
use App\Http\Controllers\Api\V1\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\V1\Public\DestinationController as PublicDestinationController;
use App\Http\Controllers\Api\V1\Public\HomepageController as PublicHomepageController;
use App\Http\Controllers\Api\V1\Public\LeadController as PublicLeadController;
use App\Http\Controllers\Api\V1\Public\SiteController as PublicSiteController;
use App\Http\Controllers\Api\V1\Public\TripController as PublicTripController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/forgot-password', [PasswordResetController::class, 'forgotPassword'])
        ->middleware('throttle:5,1');
    Route::post('auth/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:5,1');

    Route::post('webhooks/stripe', [StripeWebhookController::class, 'handle']);
    Route::post('webhooks/razorpay', [RazorpayWebhookController::class, 'handle']);

    Route::get('blogs', [PublicBlogController::class, 'index']);
    Route::get('blogs/slugs', [PublicBlogController::class, 'slugs']);
    Route::get('blogs/{slug}', [PublicBlogController::class, 'show']);

    Route::get('site/layout', [PublicSiteController::class, 'layout']);
    Route::get('site/seo', [PublicSiteController::class, 'seoIndex']);
    Route::get('site/seo/{pageKey}', [PublicSiteController::class, 'seoShow']);

    Route::get('homepage', [PublicHomepageController::class, 'show']);

    Route::get('categories', [PublicCategoryController::class, 'index']);

    Route::get('destinations', [PublicDestinationController::class, 'index']);
    Route::get('destinations/slugs', [PublicDestinationController::class, 'slugs']);
    Route::get('destinations/{slug}', [PublicDestinationController::class, 'show']);

    Route::get('trips', [PublicTripController::class, 'index']);
    Route::get('trips/slugs', [PublicTripController::class, 'slugs']);
    Route::get('trips/{slug}', [PublicTripController::class, 'show']);

    Route::post('leads', [PublicLeadController::class, 'store'])->middleware('throttle:20,1');
});

Route::prefix('v1/admin')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');

    Route::middleware(['auth:sanctum', 'staff'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('profile/password', [AuthController::class, 'changePassword']);

        Route::get('dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('dashboard/low-seat-alerts', [DashboardController::class, 'lowSeatAlerts']);
        Route::get('dashboard/activity', [DashboardController::class, 'activity']);
        Route::get('dashboard/recent-bookings', [DashboardController::class, 'recentBookings']);

        Route::middleware('permission:bookings.view')->get('bookings/{booking}/documents/{document}/download', [AdminBookingController::class, 'downloadDocument']);
        Route::middleware('permission:bookings.view')->get('bookings', [AdminBookingController::class, 'index']);
        Route::middleware('permission:bookings.view')->get('bookings/{booking}', [AdminBookingController::class, 'show']);
        Route::middleware('permission:bookings.view')->get('bookings/{booking}/invoice', [AdminBookingController::class, 'invoice']);
        Route::middleware('permission:bookings.view')->get('bookings/{booking}/voucher', [AdminBookingController::class, 'voucher']);
        Route::middleware('permission:bookings.create')->post('bookings', [AdminBookingController::class, 'store']);
        Route::middleware('permission:bookings.update')->put('bookings/{booking}', [AdminBookingController::class, 'update']);
        Route::middleware('permission:bookings.delete')->delete('bookings/{booking}', [AdminBookingController::class, 'destroy']);

        Route::middleware('permission:bookings.view')->get('reviews', [AdminTripReviewController::class, 'index']);
        Route::middleware('permission:bookings.update')->patch('reviews/{review}', [AdminTripReviewController::class, 'update']);

        Route::middleware('permission:coupons.view')->get('coupons', [AdminCouponController::class, 'index']);
        Route::middleware('permission:coupons.view')->get('coupons/{coupon}', [AdminCouponController::class, 'show']);
        Route::middleware('permission:coupons.create')->post('coupons', [AdminCouponController::class, 'store']);
        Route::middleware('permission:coupons.update')->put('coupons/{coupon}', [AdminCouponController::class, 'update']);
        Route::middleware('permission:coupons.update')->patch('coupons/{coupon}', [AdminCouponController::class, 'patch']);
        Route::middleware('permission:coupons.delete')->delete('coupons/{coupon}', [AdminCouponController::class, 'destroy']);

        Route::middleware('permission:leads.view')->get('leads', [AdminLeadController::class, 'index']);
        Route::middleware('permission:leads.create')->post('leads', [AdminLeadController::class, 'store']);
        Route::middleware('permission:leads.view')->get('leads/{lead}', [AdminLeadController::class, 'show']);
        Route::middleware('permission:leads.view')->get('leads/{lead}/resume', [AdminLeadController::class, 'downloadResume']);
        Route::middleware('permission:leads.update')->put('leads/{lead}', [AdminLeadController::class, 'update']);
        Route::middleware('permission:leads.delete')->delete('leads/{lead}', [AdminLeadController::class, 'destroy']);

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
    Route::post('register', [CustomerAuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('login', [CustomerAuthController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'customer'])->group(function () {
        Route::post('logout', [CustomerAuthController::class, 'logout']);
        Route::get('me', [CustomerAuthController::class, 'me']);
        Route::put('profile', [CustomerAuthController::class, 'updateProfile']);
        Route::post('profile/password', [CustomerAuthController::class, 'changePassword']);

        Route::get('bookings', [CustomerBookingController::class, 'index']);
        Route::post('bookings', [CustomerBookingController::class, 'store']);
        Route::post('coupons/validate', [CustomerCouponController::class, 'validateCode']);
        Route::get('bookings/{booking}', [CustomerBookingController::class, 'show']);
        Route::post('bookings/{booking}/cancel', [CustomerBookingController::class, 'cancel']);
        Route::post('bookings/{booking}/pay', [CustomerBookingController::class, 'pay']);
        Route::get('bookings/{booking}/payment-options', [CustomerBookingPaymentController::class, 'options']);
        Route::post('bookings/{booking}/payments/intent', [CustomerBookingPaymentController::class, 'createIntent']);
        Route::post('bookings/{booking}/payments/confirm', [CustomerBookingPaymentController::class, 'confirm']);
        Route::post('bookings/{booking}/documents', [CustomerBookingController::class, 'uploadDocument']);
        Route::get('bookings/{booking}/invoice', [CustomerBookingController::class, 'invoice']);
        Route::get('bookings/{booking}/voucher', [CustomerBookingController::class, 'voucher']);
        Route::get('bookings/{booking}/review', [CustomerTripReviewController::class, 'show']);
        Route::post('bookings/{booking}/review', [CustomerTripReviewController::class, 'store'])->middleware('throttle:10,1');
    });
});
