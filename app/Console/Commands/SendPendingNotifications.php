<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class SendPendingNotifications extends Command
{
    protected $signature = 'ecvaultz:send-pending-notifications';
    protected $description = 'Send any pending/unprocessed notifications';

    public function handle(): int
    {
        $count = Notification::whereNull('read_at')
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $this->info("{$count} pending notifications found (awaiting user read).");
        return Command::SUCCESS;
    }
}
