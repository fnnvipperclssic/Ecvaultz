<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class CleanupActivityLogs extends Command
{
    protected $signature = 'ecvaultz:cleanup-activity-logs {--days=90 : Retention period in days}';
    protected $description = 'Delete activity logs older than the retention period';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $count = ActivityLog::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted {$count} activity log entries older than {$days} days.");
        return Command::SUCCESS;
    }
}
