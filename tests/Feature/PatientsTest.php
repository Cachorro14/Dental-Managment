<?php

namespace Tests\Feature;

use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
