<?php

namespace App\Observers\Modules\Patients;

use App\Core\Audit\AuditLogger;
use App\Models\Modules\Patients\Patient;

class PatientObserver
{
    private const SENSITIVE_ATTRIBUTES = [
        'medical_notes',
        'address',
        'phone',
        'mobile_phone',
        'email',
        'emergency_contact_name',
        'emergency_contact_phone',
        'insurance_provider',
        'insurance_member_number',
        'document_type',
        'document_number',
        'date_of_birth',
        'whatsapp_reminder_consent_recorded_by',
    ];

    public function __construct(private AuditLogger $auditLogger) {}

    /**
     * Handle the Patient "created" event.
     */
    public function created(Patient $patient): void
    {
        $this->auditLogger->record('created', $patient, newValues: $this->auditableAttributes($patient->getAttributes()));
    }

    /**
     * Handle the Patient "updated" event.
     */
    public function updated(Patient $patient): void
    {
        $this->auditLogger->record('updated', $patient, $this->auditableAttributes($patient->getPrevious()), $this->auditableAttributes($patient->getChanges()));
    }

    /**
     * Handle the Patient "deleted" event.
     */
    public function deleted(Patient $patient): void
    {
        $this->auditLogger->record('deleted', $patient, oldValues: $this->auditableAttributes($patient->getAttributes()));
    }

    /**
     * Handle the Patient "restored" event.
     */
    public function restored(Patient $patient): void
    {
        $this->auditLogger->record('restored', $patient, newValues: $this->auditableAttributes($patient->getAttributes()));
    }

    /**
     * Handle the Patient "force deleted" event.
     */
    public function forceDeleted(Patient $patient): void
    {
        $this->auditLogger->record('force_deleted', $patient, oldValues: $this->auditableAttributes($patient->getAttributes()));
    }

    /** @param array<string, mixed> $attributes
     * @return array<string, mixed>
     */
    private function auditableAttributes(array $attributes): array
    {
        return array_diff_key($attributes, array_flip(self::SENSITIVE_ATTRIBUTES));
    }
}
