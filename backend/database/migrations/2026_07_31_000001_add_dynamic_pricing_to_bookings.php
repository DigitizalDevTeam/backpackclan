<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('rider_option', 20)->nullable()->after('children');
            $table->string('room_option', 20)->nullable()->after('rider_option');
            $table->unsignedInteger('unit_price')->nullable()->after('room_option');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['rider_option', 'room_option', 'unit_price']);
        });
    }
};
