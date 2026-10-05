<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        ModuleState::query()->where('code', 'BILLING')->update(['enabled' => true]);
        ModuleState::query()->where('code', 'TREATMENTS')->update(['enabled' => true]);
    }

    public function test_receptionist_can_register_charge_and_partial_payment_for_patient(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)->post(route('billing.charges.store', $patient), [
            'amount' => '900.00',
            'description' => 'Consulta y valoración',
            'occurred_at' => today()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post(route('billing.payments.store', $patient), [
            'amount' => '300.00',
            'description' => 'Abono en caja',
            'payment_method' => 'cash',
            'occurred_at' => today()->toDateString(),
        ])->assertRedirect();

        $this->assertDatabaseCount('billing_entries', 2);
        $this->assertDatabaseHas('billing_entries', [
            'patient_id' => $patient->id,
            'type' => 'payment',
            'amount' => '300.00',
            'payment_method' => 'cash',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => BillingEntry::class,
            'event' => 'created',
        ]);

        $this->actingAs($user)->get(route('billing.show', $patient))
            ->assertInertia(fn (Assert $page) => $page
                ->where('balance', '600.00')
                ->where('chargesTotal', '900.00')
                ->where('paymentsTotal', '300.00'));
    }

    public function test_payment_cannot_exceed_patient_balance(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        BillingEntry::factory()->create(['patient_id' => $patient->id, 'created_by' => $user->id, 'amount' => '500.00']);

        $this->actingAs($user)->post(route('billing.payments.store', $patient), [
            'amount' => '500.01',
            'description' => 'Pago de más',
            'payment_method' => 'card',
            'occurred_at' => today()->toDateString(),
        ])->assertSessionHasErrors('amount');

        $this->assertDatabaseCount('billing_entries', 1);
    }

    public function test_voided_movements_are_excluded_from_patient_balance(): void
    {
        $administrator = User::factory()->create();
        $administrator->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        BillingEntry::factory()->create(['patient_id' => $patient->id, 'created_by' => $administrator->id, 'amount' => '500.00']);
        BillingEntry::factory()->create([
            'patient_id' => $patient->id,
            'created_by' => $administrator->id,
            'amount' => '100.00',
            'voided_by' => $administrator->id,
            'voided_at' => now(),
            'void_reason' => 'Duplicado',
        ]);

        $this->actingAs($administrator)->get(route('billing.show', $patient))
            ->assertInertia(fn (Assert $page) => $page
                ->where('balance', '500.00')
                ->where('chargesTotal', '500.00')
                ->has('entries', 2));
    }

    public function test_treatment_charge_can_only_be_created_once(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        $treatment = Treatment::factory()->for($patient)->create(['created_by' => $user->id, 'cost' => '750.00']);

        $this->actingAs($user)->post(route('billing.treatments.charge', [$patient, $treatment]))->assertRedirect();
        $this->actingAs($user)->post(route('billing.treatments.charge', [$patient, $treatment]))->assertSessionHasErrors('treatment');

        $this->assertDatabaseCount('billing_entries', 1);
        $this->assertDatabaseHas('billing_entries', [
            'treatment_id' => $treatment->id,
            'type' => 'charge',
            'amount' => '750.00',
        ]);
    }

    public function test_only_clinic_admin_can_void_entry_and_void_preserves_history(): void
    {
        $administrator = User::factory()->create();
        $administrator->assignRole('CLINIC_ADMIN');
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        $entry = BillingEntry::factory()->create(['patient_id' => $patient->id, 'created_by' => $administrator->id]);

        $this->actingAs($receptionist)->post(route('billing.entries.void', $entry), ['void_reason' => 'Error de captura'])
            ->assertForbidden();
        $this->actingAs($administrator)->post(route('billing.entries.void', $entry), ['void_reason' => 'Error de captura'])
            ->assertRedirect();

        $this->assertDatabaseHas('billing_entries', [
            'id' => $entry->id,
            'voided_by' => $administrator->id,
            'void_reason' => 'Error de captura',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => BillingEntry::class,
            'auditable_id' => $entry->id,
            'event' => 'updated',
        ]);
    }

    public function test_dentist_can_only_view_finances_for_assigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();
        $patient->dentists()->attach($dentist);

        $this->actingAs($dentist)->get(route('billing.show', $patient))->assertOk();
        $this->actingAs($dentist)->get(route('billing.show', $otherPatient))->assertForbidden();
    }

    public function test_dashboard_shows_ten_highest_debts_only_to_finance_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        ModuleState::query()->where('code', 'BILLING')->update(['enabled' => false]);
        foreach (range(1, 12) as $index) {
            $patient = Patient::factory()->create();
            BillingEntry::factory()->create([
                'patient_id' => $patient->id,
                'created_by' => $user->id,
                'amount' => (string) ($index * 100),
            ]);
        }

        ModuleState::query()->where('code', 'BILLING')->update(['enabled' => true]);
        $this->actingAs($user)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('dashboard.debtors', 10)
                    ->where('dashboard.debtors.0.balance', '1200.00')));

        $unauthorizedUser = User::factory()->create();
        $unauthorizedUser->assignRole('SUPER_ADMIN');
        $this->actingAs($unauthorizedUser)->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->where('dashboard.debtors', null)));
    }

    public function test_voiding_a_charge_that_would_leave_payments_greater_than_charges_is_rejected(): void
    {
        $administrator = User::factory()->create();
        $administrator->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        $charge = BillingEntry::factory()->create(['patient_id' => $patient->id, 'created_by' => $administrator->id, 'amount' => '500.00']);
        BillingEntry::factory()->payment()->create(['patient_id' => $patient->id, 'created_by' => $administrator->id, 'amount' => '400.00']);

        $this->actingAs($administrator)->post(route('billing.entries.void', $charge), ['void_reason' => 'Captura incorrecta'])
            ->assertSessionHasErrors('billingEntry');

        $this->assertDatabaseHas('billing_entries', ['id' => $charge->id, 'voided_at' => null]);
    }
}
