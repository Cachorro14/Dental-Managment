<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinic_admin_can_view_operational_report(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        ModuleState::query()->where('code', 'REPORTS')->update(['enabled' => true]);
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');

        $this->actingAs($user)->get(route('reports.index'))->assertInertia(fn (Assert $page) => $page->where('metrics.patients', 0)->has('period'));
    }
}
