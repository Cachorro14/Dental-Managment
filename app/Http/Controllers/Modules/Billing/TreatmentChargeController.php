<?php

namespace App\Http\Controllers\Modules\Billing;

use App\Core\Billing\BillingLedger;
use App\Http\Controllers\Controller;
use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class TreatmentChargeController extends Controller
{
    public function store(Request $request, Patient $patient, Treatment $treatment, BillingLedger $ledger): RedirectResponse
    {
        Gate::authorize('charge', [BillingEntry::class, $patient]);

        if ($treatment->patient_id !== $patient->id) {
            abort(404);
        }

        if ($treatment->status === 'cancelled') {
            throw ValidationException::withMessages(['treatment' => 'No se puede generar un cargo por un tratamiento cancelado.']);
        }

        $ledger->createCharge(
            $patient,
            $request->user(),
            (string) $treatment->cost,
            'Tratamiento: '.$treatment->name,
            $treatment,
        );

        return back()->with('status', 'Cargo del tratamiento registrado correctamente.');
    }
}
