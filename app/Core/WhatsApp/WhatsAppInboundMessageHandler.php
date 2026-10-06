<?php

namespace App\Core\WhatsApp;

use App\Models\Modules\Appointments\AppointmentReminder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WhatsAppInboundMessageHandler
{
    public function __construct(private ManualAppointmentReminder $reminders) {}

    /** @param array<string, mixed> $payload */
    public function handle(array $payload): void
    {
        foreach ($payload['entry'] ?? [] as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                foreach ($change['value']['messages'] ?? [] as $message) {
                    $this->handleMessage($message);
                }
            }
        }
    }

    /** @param array<string, mixed> $message */
    private function handleMessage(array $message): void
    {
        $messageId = $message['id'] ?? null;
        $senderPhone = $message['from'] ?? null;
        $text = Str::upper(trim((string) ($message['text']['body'] ?? '')));
        $contextId = data_get($message, 'context.id');
        $token = null;
        if (is_string($contextId)) {
            $token = AppointmentReminder::query()->where('provider_message_id', $contextId)->value('confirmation_token');
        }
        if (! is_string($token) || $token === '') {
            $token = data_get($message, 'button.payload');
        }
        if (! is_string($token) || $token === '') {
            $token = Str::after($text, ' ');
        }
        $reply = Str::before($text, ' ');

        if (is_string($messageId) && AppointmentReminder::query()->where('inbound_message_id', $messageId)->exists()) {
            return;
        }

        $reminder = AppointmentReminder::query()
            ->with('appointment.patient', 'appointment.dentist')
            ->where('recipient_type', 'patient')
            ->where('status', 'sent')
            ->where('recipient_phone', $senderPhone)
            ->where('confirmation_token', $token)
            ->where('confirmation_token_expires_at', '>', now())
            ->first();

        if ($reminder === null || ! in_array($reply, ['CONFIRMAR', 'SI', 'SÍ', 'YES'], true)) {
            return;
        }

        DB::transaction(function () use ($reminder, $messageId, $reply): void {
            $lockedReminder = AppointmentReminder::query()->whereKey($reminder->id)->lockForUpdate()->first();

            if ($lockedReminder === null || $lockedReminder->reply_received_at !== null || $lockedReminder->inbound_message_id !== null) {
                return;
            }

            $appointment = $lockedReminder->appointment()->lockForUpdate()->first();

            if ($appointment === null || $appointment->status !== 'scheduled') {
                return;
            }

            $lockedReminder->forceFill([
                'reply_text' => Str::limit($reply, 255),
                'reply_received_at' => now(),
                'inbound_message_id' => is_string($messageId) ? $messageId : null,
            ])->save();

            $appointment->update(['status' => 'confirmed']);

            DB::afterCommit(function () use ($appointment): void {
                $appointment->load('dentist', 'patient');
                $this->reminders->sendDentistConfirmationNotice($appointment, null);
            });
        });
    }
}
