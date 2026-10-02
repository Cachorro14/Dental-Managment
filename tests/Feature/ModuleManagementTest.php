<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleCatalog;
use App\Core\Modules\ModuleManager;
use App\Core\Modules\ModuleState;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ModuleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_declares_stable_modules_and_dependencies(): void
    {
        $catalog = new ModuleCatalog;

        $this->assertSame(['PATIENTS'], $catalog->module('APPOINTMENTS')['dependencies']);
        $this->assertSame(['PATIENTS', 'CLINICAL_HISTORY'], $catalog->module('ODONTOGRAM')['dependencies']);
        $this->assertSame('APPOINTMENTS', $catalog->feature('APPOINTMENTS_REMINDERS')['module']);
    }

    public function test_a_module_cannot_be_enabled_without_its_dependencies(): void
    {
        $this->seed(ModuleCatalogSeeder::class);

        $manager = app(ModuleManager::class);
        ModuleState::query()->where('code', 'APPOINTMENTS')->update(['enabled' => false]);
        $manager->disable('PATIENTS');

        $this->expectException(\LogicException::class);
        $manager->enable('APPOINTMENTS');
    }

    public function test_a_module_cannot_be_disabled_while_a_dependent_module_is_enabled(): void
    {
        $this->seed(ModuleCatalogSeeder::class);

        $manager = app(ModuleManager::class);
        $this->expectException(\LogicException::class);
        $manager->disable('PATIENTS');
    }

    public function test_disabled_modules_are_blocked_by_middleware(): void
    {
        $this->seed(ModuleCatalogSeeder::class);

        Route::get('/test-patients', fn () => response('ok'))
            ->middleware('module:PATIENTS')
            ->name('test.patients');

        ModuleState::query()->where('code', 'PATIENTS')->update(['enabled' => false]);

        $this->get('/test-patients')->assertNotFound();

        ModuleState::query()->where('code', 'PATIENTS')->update(['enabled' => true]);

        $this->get('/test-patients')->assertOk();
    }

    public function test_module_manager_reports_enabled_state(): void
    {
        $this->seed(ModuleCatalogSeeder::class);

        $this->assertTrue(app(ModuleManager::class)->isEnabled('PATIENTS'));
        $this->assertTrue(app(ModuleManager::class)->isEnabled('APPOINTMENTS'));
    }

    public function test_super_admin_can_toggle_the_clinic_staff_module(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('SUPER_ADMIN');

        $this->actingAs($superAdmin)
            ->from(route('admin.modules.index'))
            ->patch(route('admin.modules.update', 'CLINIC_STAFF'), ['enabled' => false])
            ->assertRedirect(route('admin.modules.index'));

        $this->assertDatabaseHas('module_states', ['code' => 'CLINIC_STAFF', 'enabled' => false]);

        $this->actingAs($superAdmin)
            ->from(route('admin.modules.index'))
            ->patch(route('admin.modules.update', 'CLINIC_STAFF'), ['enabled' => true])
            ->assertRedirect(route('admin.modules.index'));

        $this->assertDatabaseHas('module_states', ['code' => 'CLINIC_STAFF', 'enabled' => true]);
    }
}
