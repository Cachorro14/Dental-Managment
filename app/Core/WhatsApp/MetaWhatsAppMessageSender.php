<?php

namespace App\Core\WhatsApp;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class MetaWhatsAppMessageSender implements WhatsAppMessageSender
{
    public function sendTemplate(string $recipientPhone, string $templateName, array $parameters): WhatsAppSendResult
    {
        $phoneNumberId = config('services.whatsapp.phone_number_id');
        $accessToken = config('services.whatsapp.access_token');

        if (! $phoneNumberId || ! $accessToken) {
            throw new RuntimeException('La integración de WhatsApp no está configurada.');
        }

        $components = $parameters === [] ? [] : [[
            'type' => 'body',
            'parameters' => array_map(
                fn (string $value): array => ['type' => 'text', 'text' => $value],
                array_slice(array_values($parameters), 0, 3),
            ),
        ]];

        if (count($parameters) > 3) {
            $components[] = [
                'type' => 'button',
                'sub_type' => 'url',
                'index' => '0',
                'parameters' => [['type' => 'text', 'text' => array_values($parameters)[3]]],
            ];
        }

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(15)
            ->post('https://graph.facebook.com/'.config('services.whatsapp.api_version', 'v23.0')."/{$phoneNumberId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $recipientPhone,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => config('services.whatsapp.template_language', 'es_MX')],
                    'components' => $components,
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Meta rechazó el mensaje de WhatsApp: '.$response->json('error.message', 'error desconocido'));
        }

        return new WhatsAppSendResult($response->json('messages.0.id'));
    }
}
