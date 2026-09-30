<?php

namespace App\Observers\Modules\Patients;

use App\Core\Audit\AuditLogger;
use App\Models\Modules\Patients\Patient;

class PatientObserver
{
    public function __construct(private AuditLogger $auditLogger) {}

    /**
     * Handle the Patient "created" event.
     */
    public function created(Patient $patient): void
    {
        $this->auditLogger->record('created', $patient, newValues: $patient->getAttributes());
    }

    /**
     * Handle the Patient "updated" event.
     */
    public function updated(Patient $patient): void
    {
        $this->auditLogger->record('updated', $patient, $patient->getPrevious(), $patient->getChanges());
    }

    /**
     * Handle the Patient "deleted" event.
     */
    public function deleted(Patient $patient): void
    {
        $this->auditLogger->record('deleted', $patient, oldValues: $patient->getAttributes());
    }

    /**
     * Handle the Patient "restored" event.
     */
    public function restored(Patient $patient): void
    {
        $this->auditLogger->record('restored', $patient, newValues: $patient->getAttributes());
    }

    /**
     * Handle the Patient "force deleted" event.
     */
    public function forceDeleted(Patient $patient): void
    {
        $this->auditLogger->record('force_deleted', $patient, oldValues: $patient->getAttributes());
    }
}
