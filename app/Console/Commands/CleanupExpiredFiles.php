<?php

namespace App\Console\Commands;

use App\Services\FileService;
use Illuminate\Console\Command;

class CleanupExpiredFiles extends Command
{
    protected $signature = 'ecvaultz:cleanup-expired-files';
    protected $description = 'Permanently delete soft-deleted files past retention period';

    public function handle(FileService $fileService): int
    {
        $count = $fileService->cleanupExpiredSoftDeletes();
        $this->info("Cleaned up {$count} expired files.");
        return Command::SUCCESS;
    }
}
