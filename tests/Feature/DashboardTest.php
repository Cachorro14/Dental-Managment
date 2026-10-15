<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
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

    public function test_authorized_user_can_open_a_nearby_appointment_from_the_dashboard(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $appointment = Appointment::factory()->for(Patient::factory())->create(['scheduled_at' => now()->addDay()]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('dashboard.upcoming', 1)
                    ->where('dashboard.upcoming.0.id', $appointment->id)));

        $this->actingAs($user)
            ->get(route('appointments.show', $appointment))
            ->assertOk();
    }

    public function test_dentist_dashboard_only_includes_appointments_for_assigned_patients(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, ModuleCatalogSeeder::class]);
        ModuleState::query()->where('code', 'APPOINTMENTS')->update(['enabled' => true]);
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $assignedPatient = Patient::factory()->create();
        $unassignedPatient = Patient::factory()->create();
        $assignedPatient->dentists()->attach($dentist);
        $assignedAppointment = Appointment::factory()->for($assignedPatient)->create(['scheduled_at' => now()->addDay()]);
        Appointment::factory()->for($unassignedPatient)->create(['scheduled_at' => now()->addDays(2)]);

        $this->actingAs($dentist)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->loadDeferredProps(fn (Assert $deferred) => $deferred
                    ->has('dashboard.upcoming', 1)
                    ->where('dashboard.upcoming.0.id', $assignedAppointment->id)));
    }
}
