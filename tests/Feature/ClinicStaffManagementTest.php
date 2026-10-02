<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClinicStaffManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
    }

    public function test_clinic_admin_can_view_the_clinic_staff_module_with_only_staff_accounts(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');
        $dentist = User::factory()->create(['name' => 'Alice Dentist']);
        $dentist->assignRole('DENTIST');
        $receptionist = User::factory()->create(['name' => 'Bob Receptionist']);
        $receptionist->assignRole('RECEPTIONIST');
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('SUPER_ADMIN');

        $this->actingAs($clinicAdmin)
            ->get(route('clinic-staff.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('ClinicStaff/Index')
                ->has('users.data', 2)
                ->where('users.data.0.name', $dentist->name)
                ->where('users.data.1.name', $receptionist->name));

        $this->actingAs($clinicAdmin)->get(route('admin.users.index'))->assertForbidden();
        $this->actingAs($clinicAdmin)->get(route('admin.roles.index'))->assertForbidden();
        $this->actingAs($clinicAdmin)->get(route('admin.modules.index'))->assertForbidden();
        $this->actingAs($superAdmin)->get(route('clinic-staff.index'))->assertForbidden();
        $this->actingAs($superAdmin)->get(route('admin.users.index'))->assertOk();
    }

    public function test_clinic_admin_can_create_a_user_with_a_clinic_staff_role(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');

        $this->actingAs($clinicAdmin)
            ->post(route('clinic-staff.store'), [
                'name' => 'Dra. Staff',
                'email' => 'dentist.staff@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'roles' => ['DENTIST'],
            ])
            ->assertRedirect(route('clinic-staff.index'));

        $staffUser = User::query()->where('email', 'dentist.staff@example.com')->firstOrFail();
        $this->assertTrue($staffUser->hasRole('DENTIST'));
        $this->assertFalse($staffUser->hasRole('SUPER_ADMIN'));
        $this->assertFalse($staffUser->hasRole('CLINIC_ADMIN'));
        $this->assertTrue($staffUser->can('appointments.create'));
    }

    public function test_clinic_admin_cannot_assign_admin_roles_to_staff_users(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');

        foreach (['SUPER_ADMIN', 'CLINIC_ADMIN'] as $roleName) {
            $this->actingAs($clinicAdmin)
                ->post(route('clinic-staff.store'), [
                    'name' => 'Restricted '.$roleName,
                    'email' => strtolower($roleName).'@example.com',
                    'password' => 'password123',
                    'password_confirmation' => 'password123',
                    'roles' => [$roleName],
                ])
                ->assertSessionHasErrors(['roles.0']);
        }

        $this->assertDatabaseCount('users', 1);
    }

    public function test_clinic_admin_can_combine_assignable_staff_roles(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');

        $this->actingAs($clinicAdmin)
            ->post(route('clinic-staff.store'), [
                'name' => 'Reception Dentist',
                'email' => 'mixed.staff@example.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'roles' => ['DENTIST', 'RECEPTIONIST'],
            ])
            ->assertRedirect(route('clinic-staff.index'));

        $staffUser = User::query()->where('email', 'mixed.staff@example.test')->firstOrFail();
        $this->assertTrue($staffUser->hasRole('DENTIST'));
        $this->assertTrue($staffUser->hasRole('RECEPTIONIST'));
        $this->assertTrue($staffUser->can('patients.view_all'));
    }

    public function test_dentist_and_receptionist_cannot_access_clinic_staff_management(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');

        $this->actingAs($dentist)->get(route('clinic-staff.index'))->assertForbidden();
        $this->actingAs($receptionist)->get(route('clinic-staff.index'))->assertForbidden();
    }

    public function test_clinic_staff_create_form_only_offers_dentist_and_receptionist_roles(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');

        $this->actingAs($clinicAdmin)
            ->get(route('clinic-staff.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('ClinicStaff/Create')
                ->has('assignableRoles', 2)
                ->where('assignableRoles.0.name', 'RECEPTIONIST')
                ->where('assignableRoles.1.name', 'DENTIST'));
    }
}
