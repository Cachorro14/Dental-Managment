<?php

namespace App\Models\Modules\Odontogram;

use App\Models\Modules\Patients\Patient;
use Database\Factories\Modules\Odontogram\OdontogramEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdontogramEntry extends Model
{
    /** @use HasFactory<OdontogramEntryFactory> */
    use HasFactory;

    protected $fillable = ['patient_id', 'tooth_number', 'status', 'notes'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
