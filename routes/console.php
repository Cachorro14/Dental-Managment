<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('app:send-appointment-reminders')
    ->everyMinute()
    ->withoutOverlapping(5)
    ->onOneServer();

Schedule::command('app:backup-database')
    ->dailyAt('03:00')
    ->timezone('America/Mexico_City')
    ->withoutOverlapping(60)
    ->onOneServer();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
