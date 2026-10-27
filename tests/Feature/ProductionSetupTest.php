<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class ProductionSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_seeder_creates_catalogs_without_users_or_patients(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('roles', ['name' => 'SUPER_ADMIN']);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('patients', 0);
    }

    public function test_development_seeder_refuses_to_run_in_production(): void
    {
        App::detectEnvironment(fn () => 'production');

        $this->expectException(RuntimeException::class);

        $this->app->make(DevelopmentSeeder::class)->run();
    }

    public function test_create_admin_command_creates_a_verified_administrator(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->artisan('app:create-admin')
            ->expectsQuestion('Nombre completo', 'Dra. Ana Torres')
            ->expectsQuestion('Correo electrónico', 'ana@clinica.mx')
            ->expectsQuestion('Contraseña (mínimo 12 caracteres, letras y números)', 'ClaveSegura2026')
            ->assertSuccessful();

        $user = User::query()->where('email', 'ana@clinica.mx')->firstOrFail();
        $this->assertTrue($user->hasRole('SUPER_ADMIN'));
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue(Hash::check('ClaveSegura2026', $user->password));
    }

    public function test_create_admin_command_rejects_weak_passwords(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->artisan('app:create-admin')
            ->expectsQuestion('Nombre completo', 'Dra. Ana Torres')
            ->expectsQuestion('Correo electrónico', 'ana@clinica.mx')
            ->expectsQuestion('Contraseña (mínimo 12 caracteres, letras y números)', 'password')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'ana@clinica.mx']);
    }
}
