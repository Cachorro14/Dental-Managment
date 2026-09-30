<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_has_system_permissions_without_clinical_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('SUPER_ADMIN');

        $this->assertTrue($user->hasRole('SUPER_ADMIN'));
        $this->assertTrue($user->can('users.view'));
        $this->assertFalse($user->can('patients.view'));
    }

    public function test_clinical_roles_receive_only_their_defined_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');

        $this->assertTrue($receptionist->can('patients.view'));
        $this->assertTrue($receptionist->can('patients.create'));
        $this->assertFalse($receptionist->can('users.delete'));
    }

    public function test_permission_middleware_restricts_protected_routes(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        Route::get('/test-system-users', fn () => response('ok'))
            ->middleware(['auth', 'permission:users.view'])
            ->name('test.system-users');

        $user = User::factory()->create();
        $this->actingAs($user)
            ->get('/test-system-users')
            ->assertForbidden();

        $user->assignRole('SUPER_ADMIN');

        $this->actingAs($user)
            ->get('/test-system-users')
            ->assertOk();
    }

    public function test_inertia_shares_authenticated_roles_and_permissions(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $user = User::factory()->create();
        $user->assignRole(Role::findByName('SUPER_ADMIN', 'web'));

        $request = Request::create('/dashboard');
        $request->setUserResolver(fn () => $user);

        $shared = app(HandleInertiaRequests::class)->share($request);

        $this->assertSame(['SUPER_ADMIN'], $shared['auth']['roles']);
        $this->assertContains('users.view', $shared['auth']['permissions']);
        $this->assertNotContains('patients.view', $shared['auth']['permissions']);
    }
}
