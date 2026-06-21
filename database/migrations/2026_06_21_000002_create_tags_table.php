<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color')->default('#6366f1'); // indigo default
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('file_tag', function (Blueprint $table) {
            $table->id();
            $table->char('file_uuid', 36)->charset('utf8mb4')->collation('utf8mb4_unicode_ci');
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->unique(['file_uuid', 'tag_id']);
            $table->foreign('file_uuid')->references('uuid')->on('files')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_tag');
        Schema::dropIfExists('tags');
    }
};
