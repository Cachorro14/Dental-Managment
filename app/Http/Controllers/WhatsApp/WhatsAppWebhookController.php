<?php

namespace App\Http\Controllers\WhatsApp;

use App\Core\WhatsApp\WhatsAppInboundMessageHandler;
use App\Core\WhatsApp\WhatsAppWebhookVerifier;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request, WhatsAppWebhookVerifier $verifier): Response
    {
        abort_unless($verifier->verifySubscription($request), 403);

        return response((string) $request->query('hub_challenge'), 200)
            ->header('Content-Type', 'text/plain');
    }

    public function receive(
        Request $request,
        WhatsAppWebhookVerifier $verifier,
        WhatsAppInboundMessageHandler $handler,
    ): Response {
        abort_unless($verifier->verifySignature($request), 401);

        $handler->handle($request->json()->all());

        return response()->noContent();
    }
}
