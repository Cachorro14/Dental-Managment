<?php

namespace App\Observers\Modules\Treatments;

use App\Core\Audit\AuditLogger;
use App\Models\Modules\Treatments\Treatment;

class TreatmentObserver
{
    public function __construct(private AuditLogger $auditLogger) {}

    public function created(Treatment $treatment): void
    {
        $this->auditLogger->record('created', $treatment, newValues: $treatment->getAttributes());
    }

    public function updated(Treatment $treatment): void
    {
        $this->auditLogger->record('updated', $treatment, $treatment->getPrevious(), $treatment->getChanges());
    }
}
