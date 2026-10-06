<?php

namespace App\Core\WhatsApp;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Appointments\AppointmentReminder;
use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class ManualAppointmentReminder
{
    public function __construct(private WhatsAppMessageSender $sender) {}

    public function sendPatientReminder(Appointment $appointment, ?User $actor = null, bool $automatic = false): AppointmentReminder
    {
        $appointment->loadMissing('patient', 'dentist');
        $patient = $appointment->patient;

        if ($appointment->status === 'confirmed') {
            throw new DomainException('La cita ya está confirmada.');
        }

        if ($appointment->status !== 'scheduled' || ! $appointment->scheduled_at->isFuture()) {
            throw new DomainException('Solo se pueden enviar recordatorios para citas futuras vigentes.');
        }

        if (! $patient->whatsapp_reminder_consent) {
            throw new DomainException('El paciente no tiene registrado consentimiento para recibir recordatorios por WhatsApp.');
        }

        if (blank($patient->phone)) {
            throw new DomainException('El paciente no tiene teléfono registrado.');
        }

        if ($automatic && ! $appointment->scheduled_at->betweenIncluded(now()->addHours(23), now()->addHours(25))) {
            throw new DomainException('La cita ya no está dentro de la ventana del recordatorio automático.');
        }

        return $this->send($appointment, $actor, 'patient', $patient->phone, [
            $patient->first_name,
            $appointment->scheduled_at->format('d/m/Y'),
            $appointment->scheduled_at->format('H:i'),
        ], automatic: $automatic);
    }

    public function sendDentistConfirmationNotice(Appointment $appointment, ?User $actor): ?AppointmentReminder
    {
        $appointment->loadMissing('dentist', 'patient');
        $dentist = $appointment->dentist;

        if ($dentist === null || ! $dentist->whatsapp_appointment_consent || blank($dentist->phone)) {
            return null;
        }

        return $this->send($appointment, $actor, 'dentist', $dentist->phone, [
            $dentist->name,
            $appointment->patient->first_name.' '.$appointment->patient->last_name,
            $appointment->scheduled_at->format('d/m/Y'),
            $appointment->scheduled_at->format('H:i'),
        ]);
    }

    /** @param array<int, string> $parameters */
    private function send(Appointment $appointment, ?User $actor, string $recipientType, string $phone, array $parameters, bool $automatic = false): AppointmentReminder
    {
        $confirmationToken = $recipientType === 'patient' ? Str::random(48) : null;
        $record = DB::transaction(function () use ($appointment, $actor, $recipientType, $phone, $automatic, $confirmationToken): AppointmentReminder {
            $lockedAppointment = Appointment::query()->whereKey($appointment->id)->lockForUpdate()->firstOrFail();

            if ($automatic && $lockedAppointment->reminders()->where('recipient_type', 'patient')->where('automatic', true)->exists()) {
                throw new DomainException('Ya hay un intento automático de recordatorio para esta cita.');
            }

            return $lockedAppointment->reminders()->create([
                'triggered_by' => $actor?->id,
                'automatic' => $automatic,
                'recipient_type' => $recipientType,
                'recipient_phone' => $phone,
                'status' => 'queued',
                'confirmation_token' => $confirmationToken,
                'confirmation_token_expires_at' => $recipientType === 'patient' ? $appointment->scheduled_at : null,
            ]);
        });

        try {
            $templateName = $recipientType === 'patient'
                ? config('services.whatsapp.patient_reminder_template', 'appointment_reminder')
                : config('services.whatsapp.dentist_confirmation_template', 'appointment_confirmed_doctor');

            if ($recipientType === 'patient') {
                $parameters[] = route('whatsapp.appointments.reply', ['token' => $record->confirmation_token]);
            }

            $result = $this->sender->sendTemplate($phone, $templateName, $parameters);

            $record->forceFill([
                'status' => 'sent',
                'provider_message_id' => $result->providerMessageId ?? null,
                'sent_at' => now(),
            ])->save();
        } catch (Throwable $exception) {
            $record->forceFill([
                'status' => 'failed',
                'failure_reason' => Str::limit($exception->getMessage(), 2000),
            ])->save();

            throw $exception;
        }

        return $record;
    }
}
