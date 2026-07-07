<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('booking_ref')->unique();
            $table->string('trip_slug');
            $table->string('trip_title');
            $table->string('destination');
            $table->date('batch_date');
            $table->unsignedSmallInteger('travelers')->default(1);
            $table->string('status', 20)->default('pending');
            $table->unsignedInteger('total_amount');
            $table->unsignedInteger('paid_amount')->default(0);
            $table->unsignedInteger('balance_due')->default(0);
            $table->string('invoice_number')->unique();
            $table->string('voucher_code')->unique();
            $table->timestamps();
        });

        Schema::create('booking_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('mime_type');
            $table->string('category', 30);
            $table->string('file_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_documents');
        Schema::dropIfExists('bookings');
    }
};
