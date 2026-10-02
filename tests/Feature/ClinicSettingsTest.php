<?php

namespace Tests\Feature;

use App\Core\Settings\ClinicSettings;
use App\Http\Middleware\HandleInertiaRequests;
use Database\Seeders\ClinicSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ClinicSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinic_settings_have_installation_defaults(): void
    {
        $settings = new ClinicSettings;

        $this->assertSame('Clinica Dental', $settings->get('clinic.name'));
        $this->assertSame('UTC', $settings->get('clinic.timezone'));
        $this->assertSame('es', $settings->get('clinic.locale'));
        $this->assertSame('USD', $settings->get('clinic.currency'));
    }

    public function test_clinic_settings_can_be_persisted_without_overwriting_existing_values(): void
    {
        $this->seed(ClinicSettingsSeeder::class);

        $settings = new ClinicSettings;
        $settings->set('clinic.name', 'Clinica Sonrisa');

        $this->seed(ClinicSettingsSeeder::class);

        $this->assertSame('Clinica Sonrisa', $settings->get('clinic.name'));
        $this->assertDatabaseHas('clinic_settings', [
            'key' => 'clinic.name',
            'value' => 'Clinica Sonrisa',
        ]);
    }

    public function test_clinic_settings_are_shared_as_inertia_props(): void
    {
        $this->seed(ClinicSettingsSeeder::class);

        $request = Request::create('/');
        $request->setUserResolver(fn () => null);

        $shared = app(HandleInertiaRequests::class)->share($request);

        $this->assertSame('Clinica Dental', $shared['clinic']['clinic.name']);
        $this->assertSame('USD', $shared['clinic']['clinic.currency']);
    }
}
