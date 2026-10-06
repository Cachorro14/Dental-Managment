<?php

namespace App\Models;

use App\Models\Modules\Patients\Patient;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'license_number', 'phone', 'whatsapp_appointment_consent', 'whatsapp_appointment_consent_recorded_by'])]
#[Hidden(['password', 'remember_token', 'license_number', 'whatsapp_appointment_consent_recorded_by'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'whatsapp_appointment_consent' => 'boolean',
            'whatsapp_appointment_consent_recorded_by' => 'integer',
        ];
    }

    public function assignedPatients(): BelongsToMany
    {
        return $this->belongsToMany(Patient::class, 'dentist_patient', 'dentist_id', 'patient_id')
            ->withTimestamps();
    }
}
