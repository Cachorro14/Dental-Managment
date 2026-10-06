<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'whatsapp' => [
        'enabled' => (bool) env('WHATSAPP_ENABLED', false),
        'automatic_reminders_enabled' => (bool) env('WHATSAPP_AUTOMATIC_REMINDERS_ENABLED', false),
        'mode' => env('WHATSAPP_MODE', 'log'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v23.0'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'app_secret' => env('WHATSAPP_APP_SECRET'),
        'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
        'template_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'es_MX'),
        'patient_reminder_template' => env('WHATSAPP_PATIENT_REMINDER_TEMPLATE', 'appointment_reminder'),
        'dentist_confirmation_template' => env('WHATSAPP_DENTIST_CONFIRMATION_TEMPLATE', 'appointment_confirmed_doctor'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
