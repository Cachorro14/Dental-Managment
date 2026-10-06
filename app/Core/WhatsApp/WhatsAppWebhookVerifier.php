<?php

namespace App\Core\WhatsApp;

use Illuminate\Http\Request;

class WhatsAppWebhookVerifier
{
    public function verifySignature(Request $request): bool
    {
        $appSecret = config('services.whatsapp.app_secret');
        $signature = $request->header('X-Hub-Signature-256');

        if (! is_string($appSecret) || $appSecret === '' || ! is_string($signature) || ! str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $appSecret);

        return hash_equals($expected, $signature);
    }

    public function verifySubscription(Request $request): bool
    {
        $verifyToken = config('services.whatsapp.webhook_verify_token');

        return is_string($verifyToken) && $verifyToken !== ''
            && hash_equals($verifyToken, (string) $request->query('hub_verify_token'))
            && $request->query('hub_mode') === 'subscribe';
    }
}
