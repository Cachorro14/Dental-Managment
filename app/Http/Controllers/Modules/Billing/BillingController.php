<?php

namespace App\Http\Controllers\Modules\Billing;

use App\Core\Billing\BillingLedger;
use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Billing\StoreChargeRequest;
use App\Http\Requests\Modules\Billing\StorePaymentRequest;
use App\Http\Requests\Modules\Billing\VoidBillingEntryRequest;
use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Patients\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $patients = Patient::query()
            ->select('patients.id', 'patients.first_name', 'patients.last_name')
            ->selectSub(function ($query): void {
                $query->from('billing_entries')
                    ->selectRaw('COALESCE(SUM(amount), 0)')
                    ->whereColumn('billing_entries.patient_id', 'patients.id')
                    ->where('type', 'charge')
                    ->whereNull('voided_at');
            }, 'charges_total')
            ->selectSub(function ($query): void {
                $query->from('billing_entries')
                    ->selectRaw('COALESCE(SUM(amount), 0)')
                    ->whereColumn('billing_entries.patient_id', 'patients.id')
                    ->where('type', 'payment')
                    ->whereNull('voided_at');
            }, 'payments_total')
            ->when(! $user->can('patients.view_all'), fn ($query) => $query->whereHas('dentists', fn ($dentists) => $dentists->whereKey($user->id)))
            ->whereRaw('(SELECT COALESCE(SUM(charges.amount), 0) FROM billing_entries AS charges WHERE charges.patient_id = patients.id AND charges.type = ? AND charges.voided_at IS NULL) > (SELECT COALESCE(SUM(payments.amount), 0) FROM billing_entries AS payments WHERE payments.patient_id = patients.id AND payments.type = ? AND payments.voided_at IS NULL)', ['charge', 'payment'])
            ->get(['id', 'first_name', 'last_name'])
            ->map(function (Patient $patient): array {
                $balance = bcsub((string) ($patient->charges_total ?? '0.00'), (string) ($patient->payments_total ?? '0.00'), 2);

                return [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'balance' => $balance,
                ];
            })
            ->filter(fn (array $patient): bool => bccomp($patient['balance'], '0.00', 2) > 0)
            ->sortByDesc('balance')
            ->values();

        return Inertia::render('Billing/Index', [
            'patients' => $patients,
            'canViewAllPatients' => $user->can('patients.view_all'),
        ]);
    }

    public function show(Patient $patient, BillingLedger $ledger): Response
    {
        Gate::authorize('viewAny', [BillingEntry::class, $patient]);

        $entries = $patient->billingEntries()
            ->with(['creator:id,name', 'voider:id,name', 'treatment:id,name'])
            ->latest('occurred_at')
            ->latest('id')
            ->get();
        $chargesTotal = $entries->where('type', 'charge')->whereNull('voided_at')->sum(fn (BillingEntry $entry): float => (float) $entry->amount);
        $paymentsTotal = $entries->where('type', 'payment')->whereNull('voided_at')->sum(fn (BillingEntry $entry): float => (float) $entry->amount);

        return Inertia::render('Billing/Show', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'entries' => $entries,
            'balance' => $ledger->balanceFor($patient),
            'chargesTotal' => number_format($chargesTotal, 2, '.', ''),
            'paymentsTotal' => number_format($paymentsTotal, 2, '.', ''),
            'canCharge' => request()->user()->can('charge', [BillingEntry::class, $patient]),
            'canRegisterPayment' => request()->user()->can('payment', [BillingEntry::class, $patient]),
            'canVoid' => request()->user()->can('billing.void') && request()->user()->hasRole('CLINIC_ADMIN'),
            'treatments' => $patient->treatments()
                ->when(request()->user()->hasRole('DENTIST'), fn ($query) => $query->where('dentist_id', request()->user()->id))
                ->whereDoesntHave('billingEntry')
                ->whereIn('status', ['planned', 'in_progress', 'completed'])
                ->orderBy('name')
                ->get(['id', 'name', 'cost', 'status']),
        ]);
    }

    public function storeCharge(StoreChargeRequest $request, Patient $patient, BillingLedger $ledger): RedirectResponse
    {
        $data = $request->validated();
        $ledger->createCharge($patient, $request->user(), $data['amount'], $data['description'], occurredAt: $data['occurred_at']);

        return back()->with('status', 'Cargo registrado correctamente.');
    }

    public function storePayment(StorePaymentRequest $request, Patient $patient, BillingLedger $ledger): RedirectResponse
    {
        $data = $request->validated();
        $ledger->createPayment($patient, $request->user(), $data['amount'], $data['description'], $data['payment_method'], $data['occurred_at']);

        return back()->with('status', 'Pago registrado correctamente.');
    }

    public function void(VoidBillingEntryRequest $request, BillingEntry $billingEntry, BillingLedger $ledger): RedirectResponse
    {
        Gate::authorize('void', $billingEntry);
        $ledger->void($billingEntry, $request->user(), $request->validated('void_reason'));

        return back()->with('status', 'Movimiento anulado; se conservó en el historial.');
    }
}
