<?php

namespace App\Models\Modules\Appointments;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentReminder extends Model
{
    protected $table = 'appointment_reminders';

    public const UPDATED_AT = null;

    protected $fillable = [
        'appointment_id',
        'triggered_by',
        'automatic',
        'recipient_type',
        'recipient_phone',
        'status',
        'provider_message_id',
        'failure_reason',
        'sent_at',
        'inbound_message_id',
        'reply_received_at',
        'reply_text',
        'confirmation_token',
        'confirmation_token_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'reply_received_at' => 'datetime',
            'confirmation_token_expires_at' => 'datetime',
            'automatic' => 'boolean',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }
}
