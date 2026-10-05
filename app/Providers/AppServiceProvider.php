<?php

namespace App\Providers;

use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use App\Models\User;
use App\Observers\Modules\Patients\PatientObserver;
use App\Observers\Modules\Treatments\TreatmentObserver;
use App\Policies\Modules\Appointments\AppointmentPolicy;
use App\Policies\Modules\ClinicalHistory\ClinicalHistoryPolicy;
use App\Policies\Modules\ClinicStaff\ClinicStaffPolicy;
use App\Policies\Modules\Odontogram\OdontogramEntryPolicy;
use App\Policies\Modules\Patients\PatientPolicy;
use App\Policies\Modules\Treatments\TreatmentPolicy;
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
        Gate::policy(User::class, ClinicStaffPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);
        Gate::policy(ClinicalHistory::class, ClinicalHistoryPolicy::class);
        Gate::policy(OdontogramEntry::class, OdontogramEntryPolicy::class);
        Gate::policy(Treatment::class, TreatmentPolicy::class);
        Patient::observe(PatientObserver::class);
        Treatment::observe(TreatmentObserver::class);
    }
}
