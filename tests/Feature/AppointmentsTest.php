<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
