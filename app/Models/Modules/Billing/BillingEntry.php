<?php

namespace App\Models\Modules\Billing;

use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Database\Factories\Modules\Billing\BillingEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillingEntry extends Model
{
    /** @use HasFactory<BillingEntryFactory> */
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'treatment_id',
        'created_by',
        'type',
        'amount',
        'description',
        'payment_method',
        'occurred_at',
        'voided_by',
        'voided_at',
        'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'occurred_at' => 'datetime',
            'voided_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function treatment(): BelongsTo
    {
        return $this->belongsTo(Treatment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function voider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }
}
