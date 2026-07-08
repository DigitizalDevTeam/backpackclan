<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('trip_type');
            $table->unsignedSmallInteger('duration_days');
            $table->unsignedSmallInteger('duration_nights');
            $table->string('difficulty');
            $table->unsignedSmallInteger('max_group_size');
            $table->unsignedSmallInteger('min_age')->nullable();
            $table->text('summary')->nullable();
            $table->string('cover_image_id')->nullable();
            $table->json('gallery')->nullable();
            $table->json('overview')->nullable();
            $table->json('itinerary')->nullable();
            $table->json('inclusions')->nullable();
            $table->json('exclusions')->nullable();
            $table->json('faqs')->nullable();
            $table->json('testimonials')->nullable();
            $table->json('pricing')->nullable();
            $table->json('seo')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('status')->default('draft');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('trip_category', function (Blueprint $table) {
            $table->foreignId('trip_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['trip_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_category');
        Schema::dropIfExists('trips');
    }
};
