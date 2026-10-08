<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        ModuleState::query()->where('code', 'APPOINTMENTS')->update(['enabled' => true]);
    }

    public function test_receptionist_can_create_an_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'scheduled_at' => '2030-01-01 10:00',
            'duration_minutes' => 30,
            'status' => 'scheduled',
        ]);

        $appointment = Appointment::query()->first();

        $response->assertRedirect(route('appointments.show', $appointment));
        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_appointment_creation_requires_a_patient_and_valid_duration(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');

        $this->actingAs($user)
            ->post(route('appointments.store'), ['duration_minutes' => 5])
            ->assertSessionHasErrors(['patient_id', 'scheduled_at', 'duration_minutes', 'status']);
    }

    public function test_users_without_appointment_permission_are_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('appointments.index'))
            ->assertForbidden();
    }

    public function test_appointment_index_loads_appointments_after_rendering_the_page(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');

        $this->actingAs($user)
            ->get(route('appointments.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('appointments')
                ->has('filters.date')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('appointments.data', 0)));
    }

    public function test_appointment_form_loads_patient_and_dentist_options_after_rendering(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');

        $this->actingAs($user)
            ->get(route('appointments.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('formOptions')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('formOptions.patients', 0)
                    ->has('formOptions.dentists', 0)));
    }

    public function test_dentist_appointment_options_only_include_assigned_patients(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);

        $this->actingAs($dentist)
            ->get(route('appointments.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('formOptions')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('formOptions.patients', 1)
                    ->where('formOptions.patients.0.id', $assignedPatient->id)));
    }

    public function test_dentist_appointment_index_only_lists_appointments_for_assigned_patients(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        $unassignedPatient = Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);
        $assignedAppointment = Appointment::factory()->for($assignedPatient, 'patient')->create();
        Appointment::factory()->for($unassignedPatient, 'patient')->create();

        $this->actingAs($dentist)
            ->get(route('appointments.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('appointments')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('appointments.data', 1)
                    ->where('appointments.data.0.id', $assignedAppointment->id)));
    }

    public function test_dentist_cannot_create_an_appointment_for_an_unassigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($dentist)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'scheduled_at' => '2030-01-01 10:00',
                'duration_minutes' => 30,
                'status' => 'scheduled',
            ])
            ->assertSessionHasErrors(['patient_id']);

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_dentist_cannot_view_an_appointment_for_an_unassigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $appointment = Appointment::factory()->create();

        $this->actingAs($dentist)
            ->get(route('appointments.show', $appointment))
            ->assertForbidden();
    }

    public function test_dentist_cannot_change_an_appointment_to_an_unassigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        $unassignedPatient = Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);
        $appointment = Appointment::factory()->for($assignedPatient, 'patient')->create(['dentist_id' => $dentist->id]);

        $this->actingAs($dentist)
            ->patch(route('appointments.update', $appointment), [
                'patient_id' => $unassignedPatient->id,
                'dentist_id' => $dentist->id,
                'scheduled_at' => '2030-01-01 10:00',
                'duration_minutes' => 30,
                'status' => 'scheduled',
            ])
            ->assertSessionHasErrors(['patient_id']);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'patient_id' => $assignedPatient->id,
        ]);
    }

    public function test_dentist_creating_an_appointment_is_set_as_its_dentist(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $otherDentist = User::factory()->create();
        $otherDentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($dentist);

        $response = $this->actingAs($dentist)
            ->post(route('appointments.store'), [
                'patient_id' => $patient->id,
                'dentist_id' => $otherDentist->id,
                'scheduled_at' => '2030-01-01 10:00',
                'duration_minutes' => 30,
                'status' => 'scheduled',
            ]);

        $appointment = Appointment::query()->firstOrFail();
        $response->assertRedirect(route('appointments.show', $appointment));

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $patient->id,
            'dentist_id' => $dentist->id,
        ]);
    }

    public function test_clinic_admin_dentist_can_choose_the_dentist_for_an_appointment(): void
    {
        $adminDentist = User::factory()->create();
        $adminDentist->assignRole(['CLINIC_ADMIN', 'DENTIST']);
        $otherDentist = User::factory()->create();
        $otherDentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $response = $this->actingAs($adminDentist)->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'dentist_id' => $otherDentist->id,
            'scheduled_at' => '2030-01-01 10:00',
            'duration_minutes' => 30,
            'status' => 'scheduled',
        ]);

        $appointment = Appointment::query()->firstOrFail();
        $response->assertRedirect(route('appointments.show', $appointment));
        $this->assertSame($otherDentist->id, $appointment->dentist_id);
    }

    public function test_authorized_user_can_delete_an_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $user->givePermissionTo(['appointments.view', 'appointments.delete']);
        $appointment = Appointment::factory()->create();

        $this->actingAs($user)
            ->delete(route('appointments.destroy', $appointment))
            ->assertRedirect(route('appointments.index'));

        $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
    }
}
