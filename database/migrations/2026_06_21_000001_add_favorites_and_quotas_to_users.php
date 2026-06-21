<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('storage_quota')->default(5368709120)->after('password'); // 5GB default
            $table->timestamp('last_activity_at')->nullable()->after('last_login_ip');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->boolean('is_favorited')->default(false)->after('checksum_sha256');
            $table->string('description')->nullable()->after('is_favorited');
            $table->timestamp('expires_at')->nullable()->after('description');
            $table->timestamp('last_accessed_at')->nullable()->after('download_count');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['storage_quota', 'last_activity_at']);
        });

        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['is_favorited', 'description', 'expires_at', 'last_accessed_at']);
        });
    }
};
