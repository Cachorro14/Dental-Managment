<?php

namespace App\Core\WhatsApp;

use Illuminate\Support\Facades\Log;

class LogWhatsAppMessageSender implements WhatsAppMessageSender
{
    public function sendTemplate(string $recipientPhone, string $templateName, array $parameters): WhatsAppSendResult
    {
        Log::info('Simulated WhatsApp appointment reminder.', [
            'recipient_phone' => $recipientPhone,
            'template_name' => $templateName,
            'parameters' => $parameters,
        ]);

        return new WhatsAppSendResult('simulated-'.str()->uuid());
    }
}
