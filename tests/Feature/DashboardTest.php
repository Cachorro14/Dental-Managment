<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_loads_metrics_after_rendering_the_page(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('dashboard')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('dashboard.upcoming', 0)));
    }
}
