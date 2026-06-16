<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('file_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('original_name', 255);
            $table->string('stored_name', 255);
            $table->string('mime_type', 127);
            $table->unsignedBigInteger('size');
            $table->string('path', 512);
            $table->string('checksum_sha256', 64);
            $table->json('changes')->nullable();
            $table->timestamps();
            $table->index('file_id');
            $table->unique(['file_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_versions');
    }
};
