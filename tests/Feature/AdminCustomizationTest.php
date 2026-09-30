<?php

namespace Tests\Feature;

use App\Core\Settings\ClinicSettings;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminCustomizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
    }

    public function test_super_admin_can_assign_modules_to_a_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $role = Role::query()->where('name', 'RECEPTIONIST')->firstOrFail();

        $this->actingAs($admin)
            ->put(route('admin.modules.roles.update'), [
                'role_id' => $role->id,
                'modules' => ['PATIENTS', 'APPOINTMENTS'],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('module_role', [
            'role_id' => $role->id,
            'module_code' => 'APPOINTMENTS',
        ]);
    }

    public function test_users_without_module_management_permission_are_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.modules.index'))
            ->assertForbidden();
    }

    public function test_super_admin_can_update_branding_settings(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');

        $this->actingAs($admin)
            ->patch(route('admin.branding.update'), [
                'name' => 'Clinica Aurora',
                'variant' => 'modern',
                'theme' => 'dark',
            ])
            ->assertRedirect();

        $settings = new ClinicSettings;
        $this->assertSame('Clinica Aurora', $settings->get('branding.name'));
        $this->assertSame('modern', $settings->get('branding.variant'));
        $this->assertSame('dark', $settings->get('branding.theme'));
    }
}
