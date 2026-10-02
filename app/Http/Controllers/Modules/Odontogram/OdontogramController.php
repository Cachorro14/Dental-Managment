<?php

namespace App\Http\Controllers\Modules\Odontogram;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Odontogram\StoreOdontogramAssessmentRequest;
use App\Http\Requests\Modules\Odontogram\UpdateOdontogramRequest;
use App\Models\Modules\Odontogram\OdontogramAssessment;
use App\Models\Modules\Odontogram\OdontogramAssessmentEntry;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Patients\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OdontogramController extends Controller
{
    public function edit(Patient $patient): Response
    {
        Gate::authorize('view', $patient);

        $odontogram = new OdontogramEntry(['patient_id' => $patient->id]);
        Gate::authorize('view', $odontogram);

        return $this->renderAssessmentForm($patient, null, true);
    }

    public function show(Patient $patient, OdontogramAssessment $odontogramAssessment): Response
    {
        Gate::authorize('view', $patient);
        Gate::authorize('view', new OdontogramEntry(['patient_id' => $patient->id]));

        $odontogramAssessment->load('creator:id,name');

        return Inertia::render('Odontogram/Edit', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'entries' => Inertia::defer(fn (): array => $this->assessmentEntries(
                $odontogramAssessment->entries()->with('findings')->get()->keyBy('tooth_number'),
            )),
            'canEdit' => false,
            'assessment' => [
                'id' => $odontogramAssessment->id,
                'assessed_at' => $odontogramAssessment->assessed_at->toIso8601String(),
                'created_by' => $odontogramAssessment->creator?->name ?? 'Usuario desconocido',
                'notes' => $odontogramAssessment->notes ?? '',
            ],
            'history' => Inertia::defer(fn (): array => $this->history($patient, $odontogramAssessment->id)),
        ]);
    }

    public function store(StoreOdontogramAssessmentRequest $request, Patient $patient): RedirectResponse
    {
        $assessment = DB::transaction(function () use ($request, $patient): OdontogramAssessment {
            $assessment = $patient->odontogramAssessments()->create([
                'created_by' => $request->user()->id,
                'assessed_at' => now(),
                'notes' => $request->validated('notes'),
            ]);

            foreach ($request->validated('entries') as $entryData) {
                $entry = $assessment->entries()->create([
                    'tooth_number' => $entryData['tooth_number'],
                    'status' => $entryData['status'],
                    'notes' => $entryData['notes'] ?? null,
                ]);

                $entry->findings()->createMany($entryData['findings']);
            }

            return $assessment;
        });

        return redirect()->route('odontogram.assessments.show', [$patient, $assessment])
            ->with('status', 'Evaluación del odontograma guardada.');
    }

    private function renderAssessmentForm(Patient $patient, ?OdontogramAssessment $assessment, bool $canEdit): Response
    {
        $entries = $assessment?->entries()->with('findings')->get()->keyBy('tooth_number');

        return Inertia::render('Odontogram/Edit', [
            'patient' => $patient->only(['id', 'first_name', 'last_name']),
            'entries' => $this->assessmentEntries($entries ?? collect()),
            'canEdit' => $canEdit && (auth()->user()?->can('odontogram.update') ?? false),
            'assessment' => null,
            'history' => Inertia::defer(fn (): array => $this->history($patient)),
        ]);
    }

    /** @param Collection<int, OdontogramAssessmentEntry> $savedEntries
     * @return list<array{tooth_number: int, status: string, notes: string, findings: array<int, array{surface: string, condition: string, severity: string, notes: string}>}>
     */
    private function assessmentEntries(Collection $savedEntries): array
    {
        return collect($this->toothNumbers())
            ->map(fn (int $toothNumber): array => $this->entryData($toothNumber, $savedEntries->get($toothNumber)))
            ->all();
    }

    private function entryData(int $toothNumber, ?OdontogramAssessmentEntry $entry): array
    {
        return [
            'tooth_number' => $toothNumber,
            'status' => $entry?->status ?? 'not_assessed',
            'notes' => $entry?->notes ?? '',
            'findings' => $entry?->findings?->map(fn ($finding): array => [
                'surface' => $finding->surface,
                'condition' => $finding->condition,
                'severity' => $finding->severity,
                'notes' => $finding->notes ?? '',
            ])->values()->all() ?? [],
        ];
    }

    private function history(Patient $patient, ?int $exceptId = null): array
    {
        return $patient->odontogramAssessments()
            ->with('creator:id,name')
            ->when($exceptId, fn ($query) => $query->where('id', '!=', $exceptId))
            ->latest('assessed_at')
            ->get(['id', 'patient_id', 'created_by', 'assessed_at'])
            ->map(fn (OdontogramAssessment $assessment): array => [
                'id' => $assessment->id,
                'assessed_at' => $assessment->assessed_at->toIso8601String(),
                'created_by' => $assessment->creator?->name ?? 'Usuario desconocido',
            ])->all();
    }

    public function update(UpdateOdontogramRequest $request, Patient $patient): RedirectResponse
    {
        $odontogram = new OdontogramEntry(['patient_id' => $patient->id]);
        Gate::authorize('update', $odontogram);

        $timestamp = now();
        $entries = collect($request->validated('entries'))
            ->map(fn (array $entry): array => [
                'patient_id' => $patient->id,
                'tooth_number' => $entry['tooth_number'],
                'status' => $entry['status'],
                'notes' => $entry['notes'] ?? null,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])->all();

        OdontogramEntry::query()->upsert(
            $entries,
            ['patient_id', 'tooth_number'],
            ['status', 'notes', 'updated_at'],
        );

        return redirect()->route('odontogram.edit', $patient)
            ->with('status', 'Odontograma actualizado.');
    }

    /** @return list<int> */
    private function toothNumbers(): array
    {
        return [
            18, 17, 16, 15, 14, 13, 12, 11,
            21, 22, 23, 24, 25, 26, 27, 28,
            38, 37, 36, 35, 34, 33, 32, 31,
            41, 42, 43, 44, 45, 46, 47, 48,
        ];
    }
}
