<?php

namespace App\Models\Modules\ClinicalHistory;

use App\Models\Modules\Patients\Patient;
use Database\Factories\Modules\ClinicalHistory\ClinicalHistoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalHistory extends Model
{
    /** @use HasFactory<ClinicalHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'allergies',
        'medical_conditions',
        'current_medications',
        'surgical_history',
        'family_history',
        'habits',
        'clinical_notes',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
