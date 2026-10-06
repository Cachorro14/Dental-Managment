<?php

namespace App\Core\WhatsApp;

use App\Core\Settings\ClinicSettings;
use App\Models\Modules\Appointments\Appointment;
use Illuminate\Support\Facades\DB;
use Throwable;

class AppointmentReminderScheduler
{
    public function __construct(private ManualAppointmentReminder $reminders, private ClinicSettings $settings) {}

    public function sendDueReminders(): int
    {
        if (! config('services.whatsapp.enabled') || ! config('services.whatsapp.automatic_reminders_enabled')) {
            return 0;
        }

        $clinicTimezone = $this->settings->get('clinic.timezone') ?? config('app.timezone', 'UTC');
        $windowStart = now($clinicTimezone)->addHours(23)->utc();
        $windowEnd = now($clinicTimezone)->addHours(25)->utc();

        $appointments = Appointment::query()
            ->with(['patient', 'dentist'])
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [$windowStart, $windowEnd])
            ->whereHas('patient', fn ($query) => $query->where('whatsapp_reminder_consent', true)->whereNotNull('phone'))
            ->whereDoesntHave('reminders', fn ($query) => $query->where('recipient_type', 'patient')->where('automatic', true))
            ->orderBy('scheduled_at')
            ->orderBy('id')
            ->get();

        $sent = 0;

        foreach ($appointments as $appointment) {
            try {
                DB::transaction(function () use ($appointment, &$sent): void {
                    $lockedAppointment = Appointment::query()->whereKey($appointment->id)->lockForUpdate()->first();

                    if ($lockedAppointment === null
                        || $lockedAppointment->status !== 'scheduled'
                        || $lockedAppointment->reminders()->where('recipient_type', 'patient')->where('automatic', true)->exists()) {
                        return;
                    }

                    $lockedAppointment->load(['patient', 'dentist']);

                    if (! $lockedAppointment->patient->whatsapp_reminder_consent || blank($lockedAppointment->patient->phone)) {
                        return;
                    }

                    $this->reminders->sendPatientReminder($lockedAppointment, null, automatic: true);
                    $sent++;
                });
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $sent;
    }
}
