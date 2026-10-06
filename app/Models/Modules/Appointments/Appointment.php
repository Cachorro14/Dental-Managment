<?php

namespace App\Models\Modules\Appointments;

use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Factories\Modules\Appointments\AppointmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory;

    protected $fillable = [
        'patient_id', 'dentist_id', 'scheduled_at', 'duration_minutes',
        'status', 'reason', 'notes',
    ];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime', 'duration_minutes' => 'integer'];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(AppointmentReminder::class);
    }
}
