<?php

use App\Http\Controllers\Admin\BrandingController;
use App\Http\Controllers\Admin\ModuleManagementController;
use App\Http\Controllers\Admin\RoleManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Modules\Appointments\AppointmentController;
use App\Http\Controllers\Modules\ClinicalHistory\ClinicalHistoryController;
use App\Http\Controllers\Modules\ClinicStaff\ClinicStaffController;
use App\Http\Controllers\Modules\Odontogram\OdontogramController;
use App\Http\Controllers\Modules\Patients\PatientController;
use App\Http\Controllers\Modules\Patients\PatientDentistAssignmentController;
use App\Http\Controllers\Modules\Treatments\TreatmentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/dashboard', DashboardController::class)->middleware('auth')->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/audit-log', [AuditLogController::class, 'index'])
        ->middleware('permission:audit.view')->name('audit.index');
});

Route::middleware(['auth', 'permission:modules.view'])->prefix('admin/modules')->name('admin.modules.')->group(function () {
    Route::get('/', [ModuleManagementController::class, 'index'])->name('index');
    Route::patch('/{module}', [ModuleManagementController::class, 'update'])->middleware('permission:modules.update')->name('update');
    Route::put('/roles', [ModuleManagementController::class, 'updateRoleModules'])->middleware('permission:modules.update')->name('roles.update');
});

Route::middleware(['auth', 'permission:branding.view'])->prefix('admin/branding')->name('admin.branding.')->group(function () {
    Route::get('/', [BrandingController::class, 'edit'])->name('edit');
    Route::patch('/', [BrandingController::class, 'update'])->middleware('permission:branding.update')->name('update');
});

Route::middleware(['auth', 'module:USER_MANAGEMENT', 'role:SUPER_ADMIN', 'permission:users.view'])->prefix('admin/users')->name('admin.users.')->group(function () {
    Route::get('/', [UserManagementController::class, 'index'])->name('index');
    Route::get('/create', [UserManagementController::class, 'create'])->middleware('permission:users.create')->name('create');
    Route::post('/', [UserManagementController::class, 'store'])->middleware('permission:users.create')->name('store');
    Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->middleware('permission:users.update')->name('edit');
    Route::patch('/{user}', [UserManagementController::class, 'update'])->middleware('permission:users.update')->name('update');
    Route::delete('/{user}', [UserManagementController::class, 'destroy'])->middleware('permission:users.delete')->name('destroy');
});

Route::middleware(['auth', 'module:USER_MANAGEMENT', 'role:SUPER_ADMIN', 'permission:roles.view'])->prefix('admin/roles')->name('admin.roles.')->group(function () {
    Route::get('/', [RoleManagementController::class, 'index'])->name('index');
    Route::get('/create', [RoleManagementController::class, 'create'])->middleware('permission:roles.create')->name('create');
    Route::post('/', [RoleManagementController::class, 'store'])->middleware('permission:roles.create')->name('store');
    Route::get('/{role}/edit', [RoleManagementController::class, 'edit'])->middleware('permission:roles.update')->name('edit');
    Route::patch('/{role}', [RoleManagementController::class, 'update'])->middleware('permission:roles.update')->name('update');
    Route::delete('/{role}', [RoleManagementController::class, 'destroy'])->middleware('permission:roles.delete')->name('destroy');
});

Route::middleware(['auth', 'module:CLINIC_STAFF', 'role:CLINIC_ADMIN', 'permission:clinic_staff.view'])
    ->prefix('clinic/staff')
    ->name('clinic-staff.')
    ->group(function () {
        Route::get('/', [ClinicStaffController::class, 'index'])->name('index');
        Route::get('/create', [ClinicStaffController::class, 'create'])->middleware('permission:clinic_staff.create')->name('create');
        Route::post('/', [ClinicStaffController::class, 'store'])->middleware('permission:clinic_staff.create')->name('store');
        Route::get('/{user}/edit', [ClinicStaffController::class, 'edit'])->middleware('permission:clinic_staff.update')->name('edit');
        Route::patch('/{user}', [ClinicStaffController::class, 'update'])->middleware('permission:clinic_staff.update')->name('update');
    });

Route::middleware(['auth', 'module:PATIENTS'])->prefix('patients')->name('patients.')->group(function () {
    Route::get('/', [PatientController::class, 'index'])
        ->middleware('permission:patients.view')->name('index');
    Route::get('/create', [PatientController::class, 'create'])
        ->middleware('permission:patients.create')->name('create');
    Route::get('/{patient}/dentists', [PatientDentistAssignmentController::class, 'edit'])
        ->middleware('permission:patients.assign_dentists')->name('dentists.edit');
    Route::put('/{patient}/dentists', [PatientDentistAssignmentController::class, 'update'])
        ->middleware('permission:patients.assign_dentists')->name('dentists.update');
    Route::post('/', [PatientController::class, 'store'])
        ->middleware('permission:patients.create')->name('store');
    Route::get('/{patient}', [PatientController::class, 'show'])
        ->middleware('permission:patients.view')->name('show');
    Route::get('/{patient}/edit', [PatientController::class, 'edit'])
        ->middleware('permission:patients.update')->name('edit');
    Route::patch('/{patient}', [PatientController::class, 'update'])
        ->middleware('permission:patients.update')->name('update');
    Route::delete('/{patient}', [PatientController::class, 'destroy'])
        ->middleware('permission:patients.delete')->name('destroy');
});

Route::middleware(['auth', 'module:APPOINTMENTS'])->prefix('appointments')->name('appointments.')->group(function () {
    Route::get('/', [AppointmentController::class, 'index'])->middleware('permission:appointments.view')->name('index');
    Route::get('/create', [AppointmentController::class, 'create'])->middleware('permission:appointments.create')->name('create');
    Route::post('/', [AppointmentController::class, 'store'])->middleware('permission:appointments.create')->name('store');
    Route::get('/{appointment}', [AppointmentController::class, 'show'])->middleware('permission:appointments.view')->name('show');
    Route::get('/{appointment}/edit', [AppointmentController::class, 'edit'])->middleware('permission:appointments.update')->name('edit');
    Route::patch('/{appointment}', [AppointmentController::class, 'update'])->middleware('permission:appointments.update')->name('update');
    Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->middleware('permission:appointments.delete')->name('destroy');
});

Route::middleware(['auth', 'module:CLINICAL_HISTORY'])
    ->prefix('patients/{patient}/clinical-history')
    ->name('clinical-history.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [ClinicalHistoryController::class, 'edit'])
            ->middleware('permission:clinical_history.view')->name('edit');
        Route::patch('/', [ClinicalHistoryController::class, 'update'])
            ->middleware('permission:clinical_history.update')->name('update');
    });

Route::middleware(['auth', 'module:ODONTOGRAM'])
    ->prefix('patients/{patient}/odontogram')
    ->name('odontogram.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [OdontogramController::class, 'edit'])
            ->middleware('permission:odontogram.view')->name('edit');
        Route::post('/', [OdontogramController::class, 'store'])
            ->middleware('permission:odontogram.update')->name('assessments.store');
        Route::get('/assessments/{odontogramAssessment}', [OdontogramController::class, 'show'])
            ->middleware('permission:odontogram.view')->name('assessments.show');
        Route::patch('/', [OdontogramController::class, 'update'])
            ->middleware('permission:odontogram.update')->name('update');
    });

Route::middleware(['auth', 'module:TREATMENTS'])
    ->prefix('patients/{patient}/treatments')
    ->name('treatments.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [TreatmentController::class, 'index'])
            ->middleware('permission:treatments.view')->name('index');
        Route::get('/create', [TreatmentController::class, 'create'])
            ->middleware('permission:treatments.create')->name('create');
        Route::post('/', [TreatmentController::class, 'store'])
            ->middleware('permission:treatments.create')->name('store');
        Route::get('/{treatment}/edit', [TreatmentController::class, 'edit'])
            ->middleware('permission:treatments.view')->name('edit');
        Route::patch('/{treatment}', [TreatmentController::class, 'update'])
            ->middleware('permission:treatments.update')->name('update');
    });

require __DIR__.'/auth.php';
