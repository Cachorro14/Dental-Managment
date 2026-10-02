<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\Odontogram\OdontogramAssessment;
use App\Models\Modules\Odontogram\OdontogramEntry;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OdontogramTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        ModuleState::query()->whereIn('code', ['CLINICAL_HISTORY', 'ODONTOGRAM'])->update(['enabled' => true]);
    }

    public function test_receptionist_can_view_a_patient_odontogram(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $response = $this->actingAs($user)->get(route('odontogram.edit', $patient));

        $response->assertInertia(fn (Assert $page) => $page
            ->missing('history')
            ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('history', 0)));
    }

    public function test_dentist_can_save_all_tooth_states(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);
        $toothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];

        $response = $this->actingAs($user)->patch(route('odontogram.update', $patient), [
            'entries' => array_map(fn (int $toothNumber): array => [
                'tooth_number' => $toothNumber,
                'status' => $toothNumber === 18 ? 'caries' : 'healthy',
                'notes' => $toothNumber === 18 ? 'Revisar en consulta.' : null,
            ], $toothNumbers),
        ]);

        $response->assertRedirect(route('odontogram.edit', $patient));
        $this->assertDatabaseHas('odontogram_entries', [
            'patient_id' => $patient->id,
            'tooth_number' => 18,
            'status' => 'caries',
            'notes' => 'Revisar en consulta.',
        ]);
        $this->assertSame(32, OdontogramEntry::query()->where('patient_id', $patient->id)->count());
    }

    public function test_receptionist_cannot_update_a_patient_odontogram(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('odontogram.update', $patient), ['entries' => []])
            ->assertForbidden();
    }

    public function test_dentist_cannot_view_or_update_an_unassigned_patient_odontogram(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('odontogram.edit', $patient))
            ->assertForbidden();

        $this->actingAs($user)
            ->patch(route('odontogram.update', $patient), ['entries' => []])
            ->assertForbidden();

        $this->assertDatabaseCount('odontogram_entries', 0);
    }

    public function test_odontogram_requires_all_thirty_two_teeth(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);

        $this->actingAs($user)
            ->patch(route('odontogram.update', $patient), ['entries' => []])
            ->assertSessionHasErrors(['entries']);

    }

    public function test_dentist_can_create_an_assessment_with_findings_by_surface(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);
        $toothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];

        $response = $this->actingAs($user)->post(route('odontogram.assessments.store', $patient), [
            'notes' => 'Evaluación inicial.',
            'entries' => array_map(fn (int $toothNumber): array => [
                'tooth_number' => $toothNumber,
                'status' => $toothNumber === 18 ? 'caries' : 'healthy',
                'notes' => null,
                'findings' => $toothNumber === 18 ? [[
                    'surface' => 'occlusal',
                    'condition' => 'caries',
                    'severity' => 'moderate',
                    'notes' => 'Hallazgo en superficie oclusal.',
                ]] : [],
            ], $toothNumbers),
        ]);

        $assessmentId = (int) OdontogramAssessment::query()->value('id');
        $response->assertRedirect(route('odontogram.assessments.show', [$patient, $assessmentId]));
        $this->assertDatabaseHas('odontogram_assessments', [
            'id' => $assessmentId,
            'patient_id' => $patient->id,
            'created_by' => $user->id,
            'notes' => 'Evaluación inicial.',
        ]);
        $this->assertDatabaseCount('odontogram_assessment_entries', 32);
        $this->assertDatabaseHas('odontogram_findings', [
            'assessment_entry_id' => $this->app['db']->table('odontogram_assessment_entries')->where('odontogram_assessment_id', $assessmentId)->where('tooth_number', 18)->value('id'),
            'surface' => 'occlusal',
            'condition' => 'caries',
            'severity' => 'moderate',
        ]);

        $this->actingAs($user)
            ->get(route('odontogram.assessments.show', [$patient, $assessmentId]))
            ->assertInertia(fn (Assert $page) => $page
                ->missing('entries')
                ->missing('history')
                ->loadDeferredProps(fn (Assert $deferred) => $deferred->has('entries', 32)->has('history', 0)));
    }

    public function test_assessment_rejects_a_surface_not_available_for_the_tooth(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);
        $toothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];
        $entries = array_map(fn (int $toothNumber): array => [
            'tooth_number' => $toothNumber,
            'status' => 'healthy',
            'notes' => null,
            'findings' => [],
        ], $toothNumbers);
        $entries[0]['findings'] = [[
            'surface' => 'incisal',
            'condition' => 'caries',
            'severity' => 'mild',
            'notes' => null,
        ]];

        $this->actingAs($user)
            ->post(route('odontogram.assessments.store', $patient), ['entries' => $entries])
            ->assertSessionHasErrors(['entries.0.findings.0.surface']);

        $this->assertDatabaseCount('odontogram_assessments', 0);
    }

    public function test_assessment_rejects_crown_as_a_surface_finding(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);
        $toothNumbers = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48];
        $entries = array_map(fn (int $toothNumber): array => [
            'tooth_number' => $toothNumber,
            'status' => 'healthy',
            'notes' => null,
            'findings' => [],
        ], $toothNumbers);
        $entries[0]['findings'] = [[
            'surface' => 'vestibular',
            'condition' => 'crown',
            'severity' => 'moderate',
            'notes' => null,
        ]];

        $this->actingAs($user)
            ->post(route('odontogram.assessments.store', $patient), ['entries' => $entries])
            ->assertSessionHasErrors(['entries.0.findings.0.condition']);

        $this->assertDatabaseCount('odontogram_assessments', 0);
    }

    public function test_receptionist_cannot_create_an_odontogram_assessment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->post(route('odontogram.assessments.store', $patient), ['entries' => []])
            ->assertForbidden();

        $this->assertDatabaseCount('odontogram_assessments', 0);
    }
}
