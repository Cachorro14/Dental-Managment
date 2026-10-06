<?php

namespace App\Core\WhatsApp;

interface WhatsAppMessageSender
{
    /** @param array<int, string> $parameters */
    public function sendTemplate(string $recipientPhone, string $templateName, array $parameters): WhatsAppSendResult;
}
