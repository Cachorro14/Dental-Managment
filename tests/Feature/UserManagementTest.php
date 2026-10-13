<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_super_admin_can_access_user_management(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');

        $this->actingAs($receptionist)
            ->get(route('admin.users.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_create_user_with_roles(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $receptionist = Role::findByName('RECEPTIONIST', 'web');

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('users')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('users.data', 1)));

        $this->actingAs($admin)
            ->get(route('admin.roles.index'))
            ->assertOk();

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Front Desk',
                'email' => 'frontdesk@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'roles' => [$receptionist->id],
            ])
            ->assertRedirect(route('admin.users.index'));

        $user = User::query()->where('email', 'frontdesk@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('RECEPTIONIST'));
    }

    public function test_last_super_admin_cannot_be_deleted(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $admin))
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_super_admin_can_create_custom_role_with_clinical_permissions(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $permission = Permission::findByName('appointments.view', 'web');

        $this->actingAs($admin)
            ->post(route('admin.roles.store'), [
                'name' => 'Support',
                'permissions' => [$permission->id],
            ])
            ->assertRedirect(route('admin.roles.index'));

        $role = Role::findByName('Support', 'web');

        $this->assertTrue($role->hasPermissionTo('appointments.view'));
    }

    public function test_role_forms_show_only_detailed_clinical_permission_areas(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $role = Role::findByName('RECEPTIONIST', 'web');
        $this->actingAs($admin)
            ->get(route('admin.roles.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Roles/Create')
                ->has('permissionGroups', 2)
                ->where('permissionGroups.0.code', 'CLINIC_ADMINISTRATION')
                ->where('permissionGroups.1.code', 'PATIENT_CARE')
                ->has('permissionGroups.1.capabilities', 8, fn (Assert $capability) => $capability
                    ->where('code', 'PATIENTS')
                    ->etc()));

        $this->actingAs($admin)
            ->get(route('admin.roles.edit', $role))
            ->assertInertia(fn (Assert $page) => $page
                ->has('permissionGroups')
                ->has('role.permissions'));
    }

    public function test_role_management_discards_portal_permissions_from_manipulated_requests(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);

        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $portalPermission = Permission::findByName('users.view', 'web');
        $clinicalPermission = Permission::findByName('appointments.view', 'web');

        $this->actingAs($admin)
            ->post(route('admin.roles.store'), [
                'name' => 'Agenda',
                'permissions' => [$portalPermission->id, $clinicalPermission->id],
            ])
            ->assertRedirect(route('admin.roles.index'));

        $role = Role::findByName('Agenda', 'web');

        $this->assertFalse($role->hasPermissionTo('users.view'));
        $this->assertTrue($role->hasPermissionTo('appointments.view'));
    }
}
