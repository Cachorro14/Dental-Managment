<?php

namespace App\Providers;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Observers\Modules\Patients\PatientObserver;
use App\Policies\Modules\Appointments\AppointmentPolicy;
use App\Policies\Modules\Patients\PatientPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Patient::observe(PatientObserver::class);
    }
}
