<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('razorpay_order_id')->nullable()->after('stripe_payment_intent_id');
            $table->string('razorpay_payment_id')->nullable()->after('razorpay_order_id');
            $table->index('razorpay_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['razorpay_order_id']);
            $table->dropColumn(['razorpay_order_id', 'razorpay_payment_id']);
        });
    }
};
