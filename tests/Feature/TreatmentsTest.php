<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TreatmentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        ModuleState::query()->where('code', 'TREATMENTS')->update(['enabled' => true]);
    }

    public function test_clinic_admin_can_create_a_treatment_for_a_patient(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)->post(route('treatments.store', $patient), [
            'name' => 'Restauración dental',
            'tooth_number' => 16,
            'cost' => '850.00',
            'status' => 'planned',
            'scheduled_for' => '2030-05-10',
            'description' => 'Resina compuesta',
            'notes' => 'Revisar sensibilidad en control.',
        ]);

        $treatment = Treatment::query()->firstOrFail();
        $response->assertRedirect(route('treatments.index', $patient));
        $this->assertDatabaseHas('treatments', [
            'id' => $treatment->id,
            'patient_id' => $patient->id,
            'created_by' => $user->id,
            'tooth_number' => 16,
            'name' => 'Restauración dental',
            'cost' => '850.00',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => Treatment::class,
            'auditable_id' => $treatment->id,
            'event' => 'created',
        ]);
    }

    public function test_completed_treatment_is_recorded_with_completion_date(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($user)->post(route('treatments.store', $patient), [
            'name' => 'Limpieza dental',
            'cost' => '500',
            'status' => 'completed',
        ])->assertRedirect(route('treatments.index', $patient));

        $treatment = Treatment::query()->whereBelongsTo($patient)->firstOrFail();

        $this->assertSame('completed', $treatment->status);
        $this->assertSame(today()->toDateString(), $treatment->completed_at->toDateString());
    }

    public function test_clinic_admin_can_update_a_treatment_and_its_audit_log(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $treatment = Treatment::factory()->create([
            'created_by' => $user->id,
            'status' => 'planned',
            'name' => 'Limpieza dental',
        ]);

        $this->actingAs($user)->patch(route('treatments.update', [$treatment->patient, $treatment]), [
            'name' => 'Limpieza dental completa',
            'tooth_number' => null,
            'description' => null,
            'cost' => '600.00',
            'status' => 'completed',
            'scheduled_for' => null,
            'completed_at' => today()->toDateString(),
            'notes' => 'Sin complicaciones.',
        ])->assertRedirect(route('treatments.index', $treatment->patient));

        $this->assertDatabaseHas('treatments', [
            'id' => $treatment->id,
            'name' => 'Limpieza dental completa',
            'status' => 'completed',
            'cost' => '600.00',
            'notes' => 'Sin complicaciones.',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => Treatment::class,
            'auditable_id' => $treatment->id,
            'event' => 'updated',
        ]);
    }

    public function test_treatment_creation_rejects_a_nonexistent_fdi_tooth_number(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($user)->post(route('treatments.store', $patient), [
            'name' => 'Restauración dental',
            'tooth_number' => 19,
            'cost' => '250.00',
            'status' => 'planned',
        ])->assertSessionHasErrors('tooth_number');

        $this->assertDatabaseCount('treatments', 0);
    }

    public function test_dentist_cannot_view_or_create_treatments_for_an_unassigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($dentist)
            ->get(route('treatments.index', $patient))
            ->assertForbidden();

        $this->actingAs($dentist)->post(route('treatments.store', $patient), [
            'name' => 'Limpieza dental',
            'cost' => '500',
            'status' => 'planned',
        ])->assertForbidden();

        $this->assertDatabaseCount('treatments', 0);
    }

    public function test_treatment_index_loads_treatments_after_rendering(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        Treatment::factory()->for($patient)->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->get(route('treatments.index', $patient))
            ->assertInertia(fn (Assert $page) => $page
                ->where('patient.id', $patient->id)
                ->missing('treatments')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('treatments.data', 1)));
    }

    public function test_treatment_must_belong_to_the_patient_in_the_route(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        $otherPatient = Patient::factory()->create();
        $treatment = Treatment::factory()->for($otherPatient)->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->get(route('treatments.edit', [$patient, $treatment]))
            ->assertNotFound();
    }
}
