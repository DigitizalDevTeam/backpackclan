<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type', 20); // percent | fixed
            $table->unsignedInteger('value');
            $table->unsignedInteger('min_amount')->default(0);
            $table->unsignedInteger('max_discount')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->string('trip_slug')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('coupon_code')->nullable()->after('voucher_code');
            $table->unsignedInteger('discount_amount')->default(0)->after('coupon_code');
            $table->unsignedInteger('addons_total')->default(0)->after('discount_amount');
            $table->unsignedInteger('subtotal_amount')->default(0)->after('addons_total');
            $table->json('selected_addons')->nullable()->after('subtotal_amount');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->json('addons')->nullable()->after('pricing');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn('addons');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'coupon_code',
                'discount_amount',
                'addons_total',
                'subtotal_amount',
                'selected_addons',
            ]);
        });

        Schema::dropIfExists('coupons');
    }
};
