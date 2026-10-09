<?php

namespace Database\Seeders;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Inventory\InventoryItem;
use App\Models\Modules\Inventory\InventoryMovement;
use App\Models\Modules\Odontogram\OdontogramAssessment;
use App\Models\Modules\Odontogram\OdontogramAssessmentEntry;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Odontogram\OdontogramFinding;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = $this->user('demo.admin@example.com', 'Demo Admin', 'CLINIC_ADMIN');
        $dentist = $this->user('demo.dentist@example.com', 'Dra. Demo Dental', 'DENTIST');
        $receptionist = $this->user('demo.reception@example.com', 'Recepción Demo', 'RECEPTIONIST');

        $patients = [
            $this->patient('Ana', 'García Demo', 'ana.demo@example.com', '555-0101'),
            $this->patient('Carlos', 'López Demo', 'carlos.demo@example.com', '555-0102'),
            $this->patient('María', 'Hernández Demo', 'maria.demo@example.com', '555-0103'),
        ];

        foreach ($patients as $patient) {
            $patient->dentists()->syncWithoutDetaching([$dentist->id]);
        }

        $this->clinicalHistory($patients[0], $dentist, $admin);
        $this->odontogram($patients[0], $dentist);
        $this->appointments($patients, $dentist);
        $treatment = $this->treatment($patients[0], $dentist, $admin);
        $this->billing($patients[0], $treatment, $admin);

        if (Schema::hasTable('inventory_items')) {
            $this->inventory($admin);
        }

        $this->command?->info('Datos demo listos. Usuarios: demo.admin@example.com, demo.dentist@example.com y demo.reception@example.com. Password: password');
    }

    private function user(string $email, string $name, string $role): User
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => '555-01'.str_pad((string) random_int(10, 99), 2, '0', STR_PAD_LEFT),
                'license_number' => $role === 'DENTIST' ? 'CED-DEMO-001' : null,
                'whatsapp_appointment_consent' => $role === 'DENTIST',
            ],
        );

        $user->assignRole($role);

        return $user;
    }

    private function patient(string $firstName, string $lastName, string $email, string $phone): Patient
    {
        return Patient::query()->updateOrCreate(
            ['email' => $email],
            [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'date_of_birth' => '1990-05-15',
                'gender' => 'female',
                'phone' => $phone,
                'mobile_phone' => $phone,
                'address' => 'Calle Demo 123, Colonia Centro',
                'emergency_contact_name' => 'Contacto Demo',
                'emergency_contact_phone' => '555-0199',
                'medical_notes' => 'Registro creado para demostración del portal.',
                'insurance_provider' => 'Seguro Demo',
                'insurance_member_number' => 'DEMO-'.substr(md5($email), 0, 8),
                'whatsapp_reminder_consent' => true,
            ],
        );
    }

    private function clinicalHistory(Patient $patient, User $dentist, User $admin): void
    {
        ClinicalHistory::query()->updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'allergies' => 'Alergia conocida a la penicilina.',
                'medical_conditions' => 'Sin condiciones relevantes.',
                'current_medications' => 'Ninguno.',
                'surgical_history' => 'Extracción de terceros molares.',
                'family_history' => 'Sin antecedentes relevantes.',
                'habits' => 'Cepillado dos veces al día.',
                'clinical_notes' => 'Paciente demo con información suficiente para probar el flujo clínico.',
                'intake_responses' => ['reason' => 'Revisión general y sensibilidad dental'],
                'assessment_data' => ['diagnosis' => 'Caries superficial en pieza 16', 'treatment_plan' => 'Restauración y seguimiento'],
                'intake_updated_by' => $admin->id,
                'assessment_updated_by' => $dentist->id,
                'responsible_dentist_id' => $dentist->id,
                'intake_updated_at' => now()->subDays(4),
                'assessment_updated_at' => now()->subDays(2),
                'reviewed_at' => now()->subDay(),
                'reviewed_by' => $dentist->id,
            ],
        );
    }

    private function odontogram(Patient $patient, User $dentist): void
    {
        foreach ([16 => 'caries', 21 => 'filled', 36 => 'healthy'] as $tooth => $status) {
            OdontogramEntry::query()->updateOrCreate(
                ['patient_id' => $patient->id, 'tooth_number' => $tooth],
                ['status' => $status, 'notes' => $status === 'caries' ? 'Lesión demo para revisión.' : null],
            );
        }

        $assessment = OdontogramAssessment::query()->firstOrCreate(
            ['patient_id' => $patient->id, 'assessed_at' => now()->subDays(2)->startOfDay()],
            ['created_by' => $dentist->id, 'notes' => 'Evaluación demo para mostrar historial de odontograma.'],
        );

        $entry = OdontogramAssessmentEntry::query()->updateOrCreate(
            ['odontogram_assessment_id' => $assessment->id, 'tooth_number' => 16],
            ['status' => 'caries', 'notes' => 'Caries oclusal demo.'],
        );

        OdontogramFinding::query()->firstOrCreate(
            ['assessment_entry_id' => $entry->id, 'surface' => 'occlusal'],
            ['condition' => 'caries', 'severity' => 'moderate', 'notes' => 'Hallazgo de demostración.'],
        );
    }

    /** @param array<int, Patient> $patients */
    private function appointments(array $patients, User $dentist): void
    {
        $appointments = [
            [$patients[0], now()->addDay()->setTime(9, 0), 'confirmed', 'Revisión general'],
            [$patients[1], now()->addDays(2)->setTime(11, 30), 'scheduled', 'Limpieza dental'],
            [$patients[2], now()->subDay()->setTime(15, 0), 'completed', 'Consulta de seguimiento'],
        ];

        foreach ($appointments as [$patient, $scheduledAt, $status, $reason]) {
            Appointment::query()->updateOrCreate(
                ['patient_id' => $patient->id, 'scheduled_at' => $scheduledAt],
                ['dentist_id' => $dentist->id, 'duration_minutes' => 45, 'status' => $status, 'reason' => $reason, 'notes' => 'Cita demo para probar detalle y recordatorios.'],
            );
        }
    }

    private function treatment(Patient $patient, User $dentist, User $admin): Treatment
    {
        return Treatment::query()->updateOrCreate(
            ['patient_id' => $patient->id, 'name' => 'Restauración demo'],
            [
                'dentist_id' => $dentist->id,
                'created_by' => $admin->id,
                'tooth_number' => 16,
                'description' => 'Restauración de pieza con caries superficial.',
                'cost' => 1250,
                'status' => 'planned',
                'scheduled_for' => now()->addDays(7)->toDateString(),
                'notes' => 'Tratamiento demo con cargo pendiente.',
            ],
        );
    }

    private function billing(Patient $patient, Treatment $treatment, User $admin): void
    {
        BillingEntry::query()->updateOrCreate(
            ['treatment_id' => $treatment->id],
            ['patient_id' => $patient->id, 'created_by' => $admin->id, 'type' => 'charge', 'amount' => 1250, 'description' => 'Tratamiento demo: Restauración demo', 'occurred_at' => now()->subDay()],
        );

        BillingEntry::query()->updateOrCreate(
            ['patient_id' => $patient->id, 'description' => 'Abono demo'],
            ['created_by' => $admin->id, 'type' => 'payment', 'amount' => 500, 'payment_method' => 'card', 'occurred_at' => now()],
        );
    }

    private function inventory(User $admin): void
    {
        $items = [
            ['name' => 'Guantes de nitrilo demo', 'sku' => 'DEMO-GUA-001', 'current_stock' => 42, 'minimum_stock' => 20, 'unit_cost' => 3.5],
            ['name' => 'Resina compuesta demo', 'sku' => 'DEMO-RES-001', 'current_stock' => 4, 'minimum_stock' => 8, 'unit_cost' => 280],
            ['name' => 'Cubrebocas demo', 'sku' => 'DEMO-CUB-001', 'current_stock' => 100, 'minimum_stock' => 30, 'unit_cost' => 1.25],
        ];

        foreach ($items as $data) {
            $item = InventoryItem::query()->updateOrCreate(
                ['sku' => $data['sku']],
                ['created_by' => $admin->id, 'name' => $data['name'], 'category' => 'Demo', 'unit' => 'pieza', 'current_stock' => $data['current_stock'], 'minimum_stock' => $data['minimum_stock'], 'unit_cost' => $data['unit_cost'], 'active' => true],
            );

            InventoryMovement::query()->updateOrCreate(
                ['inventory_item_id' => $item->id, 'reason' => 'Carga inicial demo'],
                ['created_by' => $admin->id, 'type' => 'in', 'quantity' => $data['current_stock'], 'stock_after' => $data['current_stock']],
            );
        }
    }
}
