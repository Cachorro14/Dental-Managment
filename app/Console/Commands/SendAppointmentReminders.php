<?php

namespace App\Console\Commands;

use App\Core\WhatsApp\AppointmentReminderScheduler;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:send-appointment-reminders')]
#[Description('Envía recordatorios de WhatsApp para citas próximas.')]
class SendAppointmentReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(AppointmentReminderScheduler $scheduler): int
    {
        $sent = $scheduler->sendDueReminders();
        $this->info("Recordatorios enviados: {$sent}.");

        return self::SUCCESS;
    }
}
