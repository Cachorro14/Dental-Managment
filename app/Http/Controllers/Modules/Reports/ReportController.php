<?php

namespace App\Http\Controllers\Modules\Reports;

use App\Http\Controllers\Controller;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Billing\BillingEntry;
use App\Models\Modules\Inventory\InventoryItem;
use App\Models\Modules\Patients\Patient;
use App\Models\Modules\Treatments\Treatment;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();

        return Inertia::render('Reports/Index', [
            'metrics' => [
                'patients' => Patient::query()->count(),
                'appointmentsThisMonth' => Appointment::query()->whereBetween('scheduled_at', [$start, $end])->count(),
                'completedTreatmentsThisMonth' => Treatment::query()->where('status', 'completed')->whereBetween('completed_at', [$start, $end])->count(),
                'inventoryLow' => InventoryItem::query()->whereColumn('current_stock', '<=', 'minimum_stock')->where('active', true)->count(),
                'chargesThisMonth' => BillingEntry::query()->where('type', 'charge')->whereNull('voided_at')->whereBetween('occurred_at', [$start, $end])->sum('amount'),
                'paymentsThisMonth' => BillingEntry::query()->where('type', 'payment')->whereNull('voided_at')->whereBetween('occurred_at', [$start, $end])->sum('amount'),
            ],
            'period' => $start->translatedFormat('F Y'),
        ]);
    }
}
