<?php

namespace App\Models\Modules\Patients;

use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Odontogram\OdontogramAssessment;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Database\Factories\Modules\Patients\PatientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    /** @use HasFactory<PatientFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_notes',
        'insurance_provider',
        'insurance_member_number',
        'marital_status',
        'nationality',
        'document_type',
        'document_number',
        'mobile_phone',
        'occupation',
        'insurance_holder',
        'workplace',
        'job_title',
        'whatsapp_reminder_consent',
        'whatsapp_reminder_consent_recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'whatsapp_reminder_consent' => 'boolean',
        ];
    }

    public function clinicalHistory(): HasOne
    {
        return $this->hasOne(ClinicalHistory::class);
    }

    public function whatsappConsentRecorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'whatsapp_reminder_consent_recorded_by');
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }

    public function odontogramEntries(): HasMany
    {
        return $this->hasMany(OdontogramEntry::class);
    }

    public function odontogramAssessments(): HasMany
    {
        return $this->hasMany(OdontogramAssessment::class);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(Treatment::class);
    }

    public function billingEntries(): HasMany
    {
        return $this->hasMany(BillingEntry::class);
    }

    public function dentists(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'dentist_patient', 'patient_id', 'dentist_id')
            ->withTimestamps();
    }

    public function isAssignedToDentist(User $dentist): bool
    {
        return $dentist->hasRole('DENTIST')
            && $this->dentists()->whereKey($dentist->getKey())->exists();
    }

    protected static function booted(): void
    {
        static::forceDeleting(function (Patient $patient): void {
            if ($patient->clinicalHistory()->exists()) {
                throw new \LogicException('Los pacientes con historia clínica no pueden eliminarse físicamente.');
            }
        });
    }
}
