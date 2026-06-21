<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Schedule commands — MOVED to bootstrap/app.php (Laravel 11 pattern).
     * This method is kept empty; scheduling is configured via
     * Application::configure()->withSchedule() in bootstrap/app.php.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Scheduling is now configured in bootstrap/app.php
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
