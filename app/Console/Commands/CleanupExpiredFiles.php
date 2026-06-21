<?php

namespace App\Console\Commands;

use App\Models\File;
use App\Models\ActivityLog;
use App\Services\FileService;
use Illuminate\Console\Command;

class CleanupExpiredFiles extends Command
{
    protected $signature = 'ecvaultz:cleanup-expired-files';
    protected $description = 'Permanently delete soft-deleted files past retention period and soft-delete expired files';

    public function handle(FileService $fileService): int
    {
        $expiredCount = 0;
        $retentionCount = 0;

        // Soft-delete files where expires_at is in the past
        $expiredFiles = File::whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNull('deleted_at')
            ->get();

        foreach ($expiredFiles as $file) {
            ActivityLog::log($file->user_id, 'file_expired', request()->ip(), request()->userAgent(), [
                'file_uuid' => $file->uuid,
                'original_name' => $file->original_name,
                'expires_at' => $file->expires_at->toDateTimeString(),
            ]);

            $file->delete(); // soft delete
            $expiredCount++;
        }

        // Permanent delete soft-deleted files past retention period
        $retentionCount = $fileService->cleanupExpiredSoftDeletes();

        $total = $expiredCount + $retentionCount;
        $this->info("Expired files soft-deleted: {$expiredCount}");
        $this->info("Retention-purged files: {$retentionCount}");
        $this->info("Total cleaned up: {$total} files.");

        return Command::SUCCESS;
    }
}
