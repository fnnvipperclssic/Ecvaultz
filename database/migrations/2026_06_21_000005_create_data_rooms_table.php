<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->string('primary_color', 10)->default('#4f46e5');
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('data_room_files', function (Blueprint $table) {
            $table->id();
            $table->uuid('data_room_id');
            $table->foreign('data_room_id')->references('id')->on('data_rooms')->onDelete('cascade');
            $table->string('file_uuid');
            $table->foreign('file_uuid')->references('uuid')->on('files')->onDelete('cascade');
            $table->timestamp('added_at')->useCurrent();
            $table->unique(['data_room_id', 'file_uuid']);
        });

        Schema::create('data_room_invites', function (Blueprint $table) {
            $table->id();
            $table->uuid('data_room_id');
            $table->foreign('data_room_id')->references('id')->on('data_rooms')->onDelete('cascade');
            $table->string('email', 255);
            $table->string('access_code', 64)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_accessed_at')->nullable();
            $table->unsignedInteger('access_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_room_invites');
        Schema::dropIfExists('data_room_files');
        Schema::dropIfExists('data_rooms');
    }
};
