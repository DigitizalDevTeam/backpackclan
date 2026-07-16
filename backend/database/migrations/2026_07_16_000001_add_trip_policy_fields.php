<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->string('max_altitude')->nullable()->after('min_age');
            $table->json('things_to_carry')->nullable()->after('exclusions');
            $table->json('cancellation_policy')->nullable()->after('things_to_carry');
            $table->json('refund_policy')->nullable()->after('cancellation_policy');
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn([
                'max_altitude',
                'things_to_carry',
                'cancellation_policy',
                'refund_policy',
            ]);
        });
    }
};
