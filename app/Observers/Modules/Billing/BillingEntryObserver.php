<?php

namespace App\Observers\Modules\Billing;

use App\Core\Audit\AuditLogger;
use App\Models\Modules\Billing\BillingEntry;

class BillingEntryObserver
{
    public function __construct(private AuditLogger $auditLogger) {}

    public function created(BillingEntry $billingEntry): void
    {
        $this->auditLogger->record('created', $billingEntry, newValues: $billingEntry->getAttributes());
    }

    public function updated(BillingEntry $billingEntry): void
    {
        $this->auditLogger->record('updated', $billingEntry, $billingEntry->getPrevious(), $billingEntry->getChanges());
    }
}
