<?php

namespace App\Models\Modules\Treatments;

use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Factories\Modules\Treatments\TreatmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Treatment extends Model
{
    /** @use HasFactory<TreatmentFactory> */
    use HasFactory;

    protected $fillable = [
        'dentist_id',
        'created_by',
        'tooth_number',
        'name',
        'description',
        'cost',
        'status',
        'scheduled_for',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'scheduled_for' => 'date',
            'completed_at' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dentist_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
