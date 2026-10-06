<?php

namespace App\Core\WhatsApp;

class WhatsAppSendResult
{
    public readonly ?string $providerMessageId;

    public function __construct(?string $providerMessageId = null)
    {
        $this->providerMessageId = $providerMessageId;
    }
}
