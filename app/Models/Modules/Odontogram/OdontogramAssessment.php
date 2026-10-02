<?php

namespace App\Models\Modules\Odontogram;

use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OdontogramAssessment extends Model
{
    protected $fillable = ['patient_id', 'created_by', 'assessed_at', 'notes'];

    protected function casts(): array
    {
        return ['assessed_at' => 'datetime'];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function entries(): HasMany
    {
        return $this->hasMany(OdontogramAssessmentEntry::class);
    }
}
