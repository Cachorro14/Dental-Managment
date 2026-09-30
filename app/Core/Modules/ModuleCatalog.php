<?php

namespace App\Core\Modules;

use InvalidArgumentException;

final class ModuleCatalog
{
    /**
     * @return array<string, array{label: string, dependencies: list<string>}>
     */
    public function modules(): array
    {
        return [
            'USER_MANAGEMENT' => ['label' => 'Gestion de usuarios', 'dependencies' => []],
            'PATIENTS' => ['label' => 'Patients', 'dependencies' => []],
            'APPOINTMENTS' => ['label' => 'Appointments', 'dependencies' => ['PATIENTS']],
            'CLINICAL_HISTORY' => ['label' => 'Clinical History', 'dependencies' => ['PATIENTS']],
            'ODONTOGRAM' => ['label' => 'Odontogram', 'dependencies' => ['PATIENTS', 'CLINICAL_HISTORY']],
            'TREATMENTS' => ['label' => 'Treatments', 'dependencies' => ['PATIENTS']],
            'INVENTORY' => ['label' => 'Inventory', 'dependencies' => []],
            'BILLING' => ['label' => 'Billing', 'dependencies' => []],
        ];
    }

    /**
     * @return array<string, array{label: string, module: string}>
     */
    public function features(): array
    {
        return [
            'APPOINTMENTS_REMINDERS' => [
                'label' => 'Appointment reminders',
                'module' => 'APPOINTMENTS',
            ],
        ];
    }

    /**
     * @return array{label: string, dependencies: list<string>}
     */
    public function module(string $code): array
    {
        return $this->modules()[$code]
            ?? throw new InvalidArgumentException("Unknown module [{$code}].");
    }

    /**
     * @return array{label: string, module: string}
     */
    public function feature(string $code): array
    {
        return $this->features()[$code]
            ?? throw new InvalidArgumentException("Unknown feature [{$code}].");
    }
}
