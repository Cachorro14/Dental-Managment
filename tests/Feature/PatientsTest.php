<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PatientsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
    }

    public function test_receptionist_can_create_a_patient(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');

        $response = $this->actingAs($user)->post(route('patients.store'), [
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
            'email' => 'ana@example.com',
        ]);

        $patient = Patient::query()->first();

        $response->assertRedirect(route('patients.show', $patient));
        $this->assertDatabaseHas('patients', [
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'created',
            'auditable_type' => Patient::class,
            'auditable_id' => $patient->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseCount('dentist_patient', 0);
    }

    public function test_dentist_can_create_a_patient_and_is_assigned_automatically(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $otherDentist = User::factory()->create();
        $otherDentist->assignRole('DENTIST');

        $response = $this->actingAs($dentist)->post(route('patients.store'), [
            'first_name' => 'María',
            'last_name' => 'Dentista',
            'dentists' => [$otherDentist->id],
        ]);

        $patient = Patient::query()->firstOrFail();
        $response->assertRedirect(route('patients.show', $patient));
        $this->assertDatabaseHas('dentist_patient', [
            'patient_id' => $patient->id,
            'dentist_id' => $dentist->id,
        ]);
        $this->assertDatabaseMissing('dentist_patient', [
            'patient_id' => $patient->id,
            'dentist_id' => $otherDentist->id,
        ]);
        $this->assertDatabaseCount('dentist_patient', 1);

        $this->actingAs($dentist)->get(route('patients.show', $patient))->assertOk();
    }

    public function test_patient_creation_requires_first_and_last_name(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');

        $this->actingAs($user)
            ->post(route('patients.store'), [])
            ->assertSessionHasErrors(['first_name', 'last_name']);
    }

    public function test_users_without_patient_permission_are_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.index'))
            ->assertForbidden();
    }

    public function test_patient_create_page_shows_a_friendly_forbidden_page_without_create_permission(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('patients.view');

        $this->actingAs($user)
            ->get(route('patients.create'))
            ->assertForbidden()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Errors/Http')
                ->where('status', 403))
            ->assertDontSee('User does not have the right permissions.');
    }

    public function test_patient_index_loads_patient_results_after_rendering_the_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('patients.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('patients')
                ->has('filters.search')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('patients.data', 1)));
    }

    public function test_receptionist_can_search_patients_by_assigned_dentist_and_see_their_names(): void
    {
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $dentist = User::factory()->create(['name' => 'Dr. Laura Martinez']);
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);
        Patient::factory()->create();

        $this->actingAs($receptionist)
            ->get(route('patients.index', ['search' => 'Laura']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('showAssignedDentists', true)
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('patients.data', 1)
                    ->where('patients.data.0.id', $assignedPatient->id)
                    ->where('patients.data.0.dentists.0.name', 'Dr. Laura Martinez')));
    }

    public function test_dentist_does_not_receive_assigned_dentists_in_patient_index(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($dentist);

        $this->actingAs($dentist)
            ->get(route('patients.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('showAssignedDentists', false)
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('patients.data', 1)
                    ->missing('patients.data.0.dentists')));
    }

    public function test_clinic_admin_can_assign_multiple_dentists_to_a_patient(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('CLINIC_ADMIN');
        $firstDentist = User::factory()->create();
        $firstDentist->assignRole('DENTIST');
        $secondDentist = User::factory()->create();
        $secondDentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($admin)
            ->put(route('patients.dentists.update', $patient), ['dentists' => [$firstDentist->id, $secondDentist->id]])
            ->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('dentist_patient', ['patient_id' => $patient->id, 'dentist_id' => $firstDentist->id]);
        $this->assertDatabaseHas('dentist_patient', ['patient_id' => $patient->id, 'dentist_id' => $secondDentist->id]);
        $this->assertDatabaseCount('dentist_patient', 2);
    }

    public function test_patient_dentist_assignment_rejects_users_without_the_dentist_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('CLINIC_ADMIN');
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($admin)
            ->put(route('patients.dentists.update', $patient), ['dentists' => [$receptionist->id]])
            ->assertSessionHasErrors(['dentists']);

        $this->assertDatabaseCount('dentist_patient', 0);
    }

    public function test_receptionist_cannot_change_dentist_assignments(): void
    {
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($receptionist)
            ->put(route('patients.dentists.update', $patient), ['dentists' => []])
            ->assertForbidden();

        $this->assertDatabaseCount('dentist_patient', 0);
    }

    public function test_dentist_only_sees_and_opens_patients_assigned_to_them(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        $unassignedPatient = Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);

        $this->actingAs($dentist)
            ->get(route('patients.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('patients')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('patients.data', 1)
                    ->where('patients.data.0.id', $assignedPatient->id)));

        $this->actingAs($dentist)->get(route('patients.show', $assignedPatient))->assertOk();
        $this->actingAs($dentist)->get(route('patients.show', $unassignedPatient))->assertForbidden();
    }

    public function test_clinic_admin_keeps_access_to_patients_when_also_a_dentist(): void
    {
        $adminDentist = User::factory()->create();
        $adminDentist->assignRole(['CLINIC_ADMIN', 'DENTIST']);
        $unassignedPatient = Patient::factory()->create();

        $this->actingAs($adminDentist)
            ->get(route('patients.index'))
            ->assertInertia(fn (Assert $page) => $page->where('showAssignedDentists', true));

        $this->actingAs($adminDentist)
            ->get(route('patients.show', $unassignedPatient))
            ->assertOk();
    }

    public function test_authorized_user_can_soft_delete_a_patient(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $user->givePermissionTo(['patients.view', 'patients.delete']);
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->delete(route('patients.destroy', $patient))
            ->assertRedirect(route('patients.index'));

        $this->assertSoftDeleted('patients', ['id' => $patient->id]);
        $this->assertDatabaseHas('audit_logs', [
            'event' => 'deleted',
            'auditable_type' => Patient::class,
            'auditable_id' => $patient->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_dentist_cannot_edit_patient_demographics(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($dentist);

        $this->actingAs($dentist)
            ->patch(route('patients.update', $patient), [
                'first_name' => 'Nuevo nombre',
                'last_name' => $patient->last_name,
            ])
            ->assertForbidden();

        $this->assertSame($patient->first_name, $patient->fresh()->first_name);
    }

    public function test_patient_profile_shows_only_actions_the_current_user_can_access(): void
    {
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($receptionist)
            ->get(route('patients.show', $patient))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Patients/Show')
                ->where('patientActions.questionnaire', true)
                ->where('patientActions.clinicalHistory', false));
    }

    public function test_patient_profile_hides_questionnaire_and_technical_actions_without_permissions(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();
        $user->assignRole('DENTIST');
        $patient->dentists()->attach($user);
        $user->revokePermissionTo(['clinical_history.view_intake', 'clinical_history.view_assessment']);
        $user->removeRole('DENTIST');
        $user->givePermissionTo('patients.view');
        $user->givePermissionTo('patients.view_all');

        $this->actingAs($user)
            ->get(route('patients.show', $patient))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->missing('patientActions.questionnaire')
                ->missing('patientActions.clinicalHistory'));
    }

    public function test_receptionist_patient_audit_does_not_include_sensitive_contact_fields(): void
    {
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');

        $this->actingAs($receptionist)->post(route('patients.store'), [
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
            'email' => 'audit-test@example.com',
            'phone' => '5551234567',
            'insurance_provider' => 'Cobertura privada',
        ]);

        $audit = AuditLog::query()->where('auditable_type', Patient::class)->firstOrFail();
        $this->assertArrayNotHasKey('phone', $audit->new_values);
        $this->assertArrayNotHasKey('email', $audit->new_values);
        $this->assertArrayNotHasKey('insurance_provider', $audit->new_values);
    }
}
