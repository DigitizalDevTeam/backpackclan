<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('total_seats');
            $table->unsignedSmallInteger('booked_seats')->default(0);
            $table->boolean('is_guaranteed')->default(false);
            $table->boolean('is_booking_closed_manual')->default(false);
            $table->dateTime('booking_closed_at')->nullable();
            $table->boolean('is_cancelled')->default(false);
            $table->date('cancellation_deadline')->nullable();
            $table->json('pricing_override')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('status_override')->nullable();
            $table->string('status_override_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departures');
    }
};
