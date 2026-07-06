<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('filename');
            $table->text('url');
            $table->string('mime_type');
            $table->string('media_type');
            $table->unsignedBigInteger('size')->default(0);
            $table->string('alt_text')->default('');
            $table->string('title')->default('');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('placement');
            $table->string('media_type');
            $table->string('media_id')->nullable();
            $table->string('headline')->default('');
            $table->string('subheadline')->default('');
            $table->string('link_url')->default('');
            $table->json('cta_buttons')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('seo_meta', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique();
            $table->string('meta_title');
            $table->text('meta_description');
            $table->string('og_image_id')->nullable();
            $table->string('canonical_url')->default('');
            $table->string('robots')->default('index, follow');
            $table->text('schema_json')->nullable();
            $table->timestamps();
        });

        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('location');
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('label');
            $table->string('url');
            $table->string('target')->default('_self');
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('menu_items')->cascadeOnDelete();
        });

        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('type');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_enabled')->default(true);
            $table->json('content');
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('module');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('homepage_sections');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('seo_meta');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('media');
    }
};
