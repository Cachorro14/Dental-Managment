<?php

namespace App\Observers\Modules\Inventory;

use App\Core\Audit\AuditLogger;
use App\Models\Modules\Inventory\InventoryItem;

class InventoryItemObserver
{
    public function __construct(private AuditLogger $auditLogger) {}

    public function created(InventoryItem $item): void
    {
        $this->auditLogger->record('created', $item, newValues: $item->getAttributes());
    }

    public function updated(InventoryItem $item): void
    {
        $this->auditLogger->record('updated', $item, $item->getPrevious(), $item->getChanges());
    }
}
