<?php

namespace App\Models\Modules\ClinicalHistory;

use App\Models\Modules\Patients\Patient;
use App\Models\User;
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
        'intake_responses',
        'assessment_data',
        'intake_updated_by',
        'assessment_updated_by',
        'responsible_dentist_id',
        'intake_updated_at',
        'assessment_updated_at',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'intake_responses' => 'array',
            'assessment_data' => 'array',
            'intake_updated_at' => 'datetime',
            'assessment_updated_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function responsibleDentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_dentist_id');
    }
}
