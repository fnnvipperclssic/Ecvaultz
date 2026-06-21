<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('ecvaultz:cleanup-expired-files')->daily();
        $schedule->command('ecvaultz:cleanup-expired-shares')->daily();
        $schedule->command('ecvaultz:cleanup-activity-logs --days=90')->daily();
        $schedule->command('ecvaultz:send-pending-notifications')->hourly();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
