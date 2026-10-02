<?php

namespace App\Models\Modules\Odontogram;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OdontogramAssessmentEntry extends Model
{
    protected $fillable = ['odontogram_assessment_id', 'tooth_number', 'status', 'notes'];

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(OdontogramAssessment::class, 'odontogram_assessment_id');
    }

    public function findings(): HasMany
    {
        return $this->hasMany(OdontogramFinding::class, 'assessment_entry_id');
    }
}
