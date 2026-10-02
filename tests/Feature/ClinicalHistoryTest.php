<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        ModuleState::query()->where('code', 'CLINICAL_HISTORY')->update(['enabled' => true]);
    }

    public function test_receptionist_can_view_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        ClinicalHistory::factory()->for($patient)->create(['allergies' => 'Penicilina']);

        $response = $this->actingAs($user)->get(route('clinical-history.edit', $patient));

        $response->assertOk();
    }

    public function test_dentist_can_create_and_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);

        $response = $this->actingAs($user)->patch(route('clinical-history.update', $patient), [
            'allergies' => 'Penicilina',
            'medical_conditions' => 'Diabetes tipo 2',
            'current_medications' => 'Metformina',
            'clinical_notes' => 'Requiere control periodontal.',
        ]);

        $response->assertRedirect(route('clinical-history.edit', $patient));
        $this->assertDatabaseHas('clinical_histories', [
            'patient_id' => $patient->id,
            'allergies' => 'Penicilina',
            'clinical_notes' => 'Requiere control periodontal.',
        ]);
    }

    public function test_clinic_admin_can_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['clinical_notes' => 'Nota administrativa clinica'])
            ->assertRedirect(route('clinical-history.edit', $patient));

        $this->assertDatabaseHas('clinical_histories', [
            'patient_id' => $patient->id,
            'clinical_notes' => 'Nota administrativa clinica',
        ]);
    }

    public function test_dentist_cannot_view_or_update_an_unassigned_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('clinical-history.edit', $patient))
            ->assertForbidden();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['clinical_notes' => 'No autorizado'])
            ->assertForbidden();

        $this->assertDatabaseMissing('clinical_histories', ['patient_id' => $patient->id]);
    }

    public function test_receptionist_cannot_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['allergies' => 'Penicilina'])
            ->assertForbidden();
    }

    public function test_users_without_clinical_history_permission_are_forbidden(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('clinical-history.edit', $patient))
            ->assertForbidden();
    }

    public function test_clinical_history_fields_are_validated(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['allergies' => str_repeat('x', 5001)])
            ->assertSessionHasErrors(['allergies']);

    }
}
