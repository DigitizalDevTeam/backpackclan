<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('trip_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->foreignId('departure_id')->nullable()->after('trip_id')->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('adults')->default(1)->after('travelers');
            $table->unsignedSmallInteger('children')->default(0)->after('adults');
            $table->json('traveler_details')->nullable()->after('children');
            $table->string('contact_phone')->nullable()->after('traveler_details');
            $table->string('contact_email')->nullable()->after('contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('departure_id');
            $table->dropConstrainedForeignId('trip_id');
            $table->dropColumn([
                'adults',
                'children',
                'traveler_details',
                'contact_phone',
                'contact_email',
            ]);
        });
    }
};
