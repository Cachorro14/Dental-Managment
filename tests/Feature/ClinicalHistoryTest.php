<?php

namespace Tests\Feature;

use App\Core\Modules\ModuleState;
use App\Models\Modules\ClinicalHistory\ClinicalHistory;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        ModuleState::query()->where('code', 'CLINICAL_HISTORY')->update(['enabled' => true]);
    }

    public function test_receptionist_can_view_patient_questionnaire(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        ClinicalHistory::factory()->for($patient)->create(['allergies' => 'Penicilina']);

        $response = $this->actingAs($user)->get(route('clinical-history.questionnaire', $patient));

        $response->assertInertia(fn ($page) => $page->component('ClinicalHistory/Questionnaire'));
    }

    public function test_dentist_can_create_and_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);

        $response = $this->actingAs($user)->patch(route('clinical-history.update', $patient), [
            'allergies' => 'Penicilina',
            'medical_conditions' => 'Diabetes tipo 2',
            'current_medications' => 'Metformina',
            'clinical_notes' => 'Requiere control periodontal.',
        ]);

        $response->assertRedirect(route('clinical-history.edit', $patient));
        $this->assertDatabaseHas('clinical_histories', [
            'patient_id' => $patient->id,
            'allergies' => 'Penicilina',
            'clinical_notes' => 'Requiere control periodontal.',
        ]);
    }

    public function test_dentist_can_save_professional_assessment_for_an_assigned_patient(): void
    {
        $dentist = User::factory()->create();
        $dentist->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($dentist);

        $this->actingAs($dentist)
            ->patch(route('clinical-history.update', $patient), [
                'assessment_data' => [
                    'responsible_dentist_id' => $dentist->id,
                    'diagnosis' => 'Caries dental',
                    'vital_signs' => ['blood_pressure' => '120/80'],
                ],
            ])
            ->assertRedirect(route('clinical-history.edit', $patient));

        $this->assertSame('Caries dental', $patient->clinicalHistory()->firstOrFail()->assessment_data['diagnosis']);
        $this->assertSame($dentist->id, $patient->clinicalHistory()->firstOrFail()->assessment_updated_by);
    }

    public function test_clinic_admin_can_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['clinical_notes' => 'Nota administrativa clinica'])
            ->assertRedirect(route('clinical-history.edit', $patient));

        $this->assertDatabaseHas('clinical_histories', [
            'patient_id' => $patient->id,
            'clinical_notes' => 'Nota administrativa clinica',
        ]);
    }

    public function test_dentist_cannot_view_or_update_an_unassigned_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('clinical-history.edit', $patient))
            ->assertForbidden();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['clinical_notes' => 'No autorizado'])
            ->assertForbidden();

        $this->assertDatabaseMissing('clinical_histories', ['patient_id' => $patient->id]);
    }

    public function test_receptionist_cannot_update_a_patient_clinical_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['allergies' => 'Penicilina'])
            ->assertForbidden();
    }

    public function test_users_without_clinical_history_permission_are_forbidden(): void
    {
        $user = User::factory()->create();
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->get(route('clinical-history.edit', $patient))
            ->assertForbidden();
    }

    public function test_clinical_history_fields_are_validated(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['allergies' => str_repeat('x', 5001)])
            ->assertSessionHasErrors(['allergies']);

    }

    public function test_receptionist_can_save_questionnaire_but_cannot_read_professional_assessment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        $patient->clinicalHistory()->create([
            'assessment_data' => ['diagnosis' => 'Confidential diagnosis'],
            'allergies' => 'Confidential allergy detail',
        ]);

        $response = $this->actingAs($user)->get(route('clinical-history.questionnaire', $patient));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->missing('clinicalHistory.assessment_data')
            ->missing('clinicalHistory.allergies'));
    }

    public function test_clinic_admin_can_view_professional_assessment_and_print_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        ClinicalHistory::factory()->for($patient)->create([
            'assessment_data' => ['diagnosis' => 'Caries'],
            'allergies' => 'Penicilina',
        ]);

        $this->actingAs($user)
            ->get(route('clinical-history.edit', $patient))
            ->assertInertia(fn ($page) => $page
                ->where('clinicalHistory.assessment_data.diagnosis', 'Caries')
                ->where('clinicalHistory.allergies', 'Penicilina'));

        $this->actingAs($user)->get(route('clinical-history.print', $patient))->assertOk();
    }

    public function test_receptionist_can_update_patient_intake_and_reset_review_status(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        $clinicalHistory = ClinicalHistory::factory()->for($patient)->create([
            'reviewed_by' => User::factory()->create()->id,
            'reviewed_at' => now(),
        ]);

        $response = $this->actingAs($user)->patch(route('clinical-history.intake.update', $patient), [
            'intake_responses' => [
                'family' => ['father_alive' => 'yes'],
                'health' => ['diabetes' => 'no'],
                'dental' => ['reason' => 'Dolor dental'],
                'oral' => ['daily_sugar_moments' => '2'],
                'declaration_accepted' => true,
                'privacy_acknowledged' => true,
            ],
        ]);

        $response->assertRedirect(route('clinical-history.questionnaire', $patient));
        $this->assertDatabaseHas('clinical_histories', [
            'id' => $clinicalHistory->id,
            'intake_updated_by' => $user->id,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
        $this->assertSame('Dolor dental', $clinicalHistory->fresh()->intake_responses['dental']['reason']);
    }

    public function test_receptionist_cannot_update_professional_assessment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), ['clinical_notes' => 'No autorizado'])
            ->assertForbidden();

        $this->assertDatabaseMissing('clinical_histories', ['patient_id' => $patient->id]);
    }

    public function test_assessment_must_assign_a_dentist_who_is_assigned_to_the_patient(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create();
        $patient->dentists()->attach($user);
        $otherDentist = User::factory()->create();
        $otherDentist->assignRole('DENTIST');

        $this->actingAs($user)
            ->patch(route('clinical-history.update', $patient), [
                'assessment_data' => ['responsible_dentist_id' => $otherDentist->id],
            ])
            ->assertSessionHasErrors('assessment_data.responsible_dentist_id');
    }

    public function test_intake_requires_explicit_declarations_and_rejects_invalid_answers(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();
        $payload = [
            'intake_responses' => [
                'family' => [],
                'health' => ['diabetes' => 'sometimes'],
                'dental' => [],
                'oral' => [],
                'declaration_accepted' => false,
                'privacy_acknowledged' => false,
            ],
        ];

        $this->actingAs($user)
            ->patch(route('clinical-history.intake.update', $patient), $payload)
            ->assertSessionHasErrors([
                'intake_responses.health.diabetes',
                'intake_responses.declaration_accepted',
                'intake_responses.privacy_acknowledged',
            ]);

        $this->assertDatabaseMissing('clinical_histories', ['patient_id' => $patient->id]);
    }

    public function test_receptionist_can_open_questionnaire_but_technical_history_requires_explicit_permission(): void
    {
        $receptionist = User::factory()->create();
        $receptionist->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create();

        $this->actingAs($receptionist)
            ->get(route('clinical-history.questionnaire', $patient))
            ->assertInertia(fn ($page) => $page->component('ClinicalHistory/Questionnaire'));

        $this->actingAs($receptionist)
            ->get(route('clinical-history.edit', $patient))
            ->assertForbidden();
    }

    public function test_clinic_admin_can_open_both_separate_history_pages(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($admin)->get(route('clinical-history.questionnaire', $patient))
            ->assertInertia(fn ($page) => $page->component('ClinicalHistory/Questionnaire'));
        $this->actingAs($admin)->get(route('clinical-history.edit', $patient))
            ->assertInertia(fn ($page) => $page->component('ClinicalHistory/Edit'));
    }

    public function test_super_admin_cannot_open_patient_questionnaire_or_technical_history(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('SUPER_ADMIN');
        $patient = Patient::factory()->create();

        $this->actingAs($admin)->get(route('clinical-history.questionnaire', $patient))->assertForbidden();
        $this->actingAs($admin)->get(route('clinical-history.edit', $patient))->assertForbidden();
    }
}
