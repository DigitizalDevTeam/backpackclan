<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('excerpt', 500);
            $table->json('content');
            $table->string('image_id')->nullable();
            $table->string('category');
            $table->string('author');
            $table->string('author_role');
            $table->date('published_at');
            $table->unsignedSmallInteger('read_time')->default(5);
            $table->json('tags')->nullable();
            $table->string('status')->default('draft');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
