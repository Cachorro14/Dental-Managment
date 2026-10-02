<?php

namespace App\Models\Modules\Patients;

use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Odontogram\OdontogramAssessment;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\User;
use Database\Factories\Modules\Patients\PatientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
    ];

    protected function casts(): array
    {
        return ['date_of_birth' => 'date'];
    }

    public function clinicalHistory(): HasOne
    {
        return $this->hasOne(ClinicalHistory::class);
    }

    public function odontogramEntries(): HasMany
    {
        return $this->hasMany(OdontogramEntry::class);
    }

    public function odontogramAssessments(): HasMany
    {
        return $this->hasMany(OdontogramAssessment::class);
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
}
