<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_index_loads_events_after_rendering_the_page(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $user = User::factory()->create();
        $user->givePermissionTo('audit.view');

        $this->actingAs($user)
            ->get(route('audit.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('auditLogs')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('auditLogs.data', 0)));
    }
}
