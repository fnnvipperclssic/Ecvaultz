<?php

namespace App\Console\Commands;

use App\Models\FileShare;
use Illuminate\Console\Command;

class CleanupExpiredShares extends Command
{
    protected $signature = 'ecvaultz:cleanup-expired-shares';
    protected $description = 'Delete expired file shares';

    public function handle(): int
    {
        $count = FileShare::whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->delete();

        $this->info("Deleted {$count} expired shares.");
        return Command::SUCCESS;
    }
}
