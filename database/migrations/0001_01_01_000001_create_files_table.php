<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('folders')->nullOnDelete();
            $table->string('name', 255);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'parent_id']);
            $table->index('uuid');
            $table->index('deleted_at');
        });

        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->char('uuid', 36)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained()->nullOnDelete();
            $table->string('original_name', 255);
            $table->string('stored_name', 64);
            $table->string('mime_type', 127);
            $table->unsignedBigInteger('size');
            $table->string('path', 512);
            $table->boolean('is_encrypted')->default(false);
            $table->string('checksum_sha256', 64)->nullable();
            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('uploaded_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('uuid');
            $table->index('folder_id');
            $table->index('deleted_at');
            $table->index(['user_id', 'folder_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('files');
        Schema::dropIfExists('folders');
    }
};
