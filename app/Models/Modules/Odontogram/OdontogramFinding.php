<?php

namespace App\Models\Modules\Odontogram;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdontogramFinding extends Model
{
    protected $fillable = ['assessment_entry_id', 'surface', 'condition', 'severity', 'notes'];

    public function entry(): BelongsTo
    {
        return $this->belongsTo(OdontogramAssessmentEntry::class, 'assessment_entry_id');
    }
}
