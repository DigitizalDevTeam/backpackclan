<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('country');
            $table->string('region');
            $table->string('tagline')->default('');
            $table->string('hero_image_id')->nullable();
            $table->json('overview')->nullable();
            $table->json('banner')->nullable();
            $table->json('linked_trip_ids')->nullable();
            $table->json('faqs')->nullable();
            $table->json('best_time')->nullable();
            $table->json('weather')->nullable();
            $table->json('map')->nullable();
            $table->json('seo')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('status')->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
