<?php

namespace Tests\Feature;

use App\Core\Modules\FeatureState;
use App\Core\WhatsApp\AppointmentReminderScheduler;
use App\Core\WhatsApp\MetaWhatsAppMessageSender;
use App\Core\WhatsApp\WhatsAppMessageSender;
use App\Core\WhatsApp\WhatsAppSendResult;
use App\Models\Modules\Appointments\Appointment;
use App\Models\Modules\Patients\Patient;
use App\Models\User;
use Database\Seeders\ModuleCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WhatsAppAppointmentReminderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(ModuleCatalogSeeder::class);
        FeatureState::query()->where('code', 'APPOINTMENTS_REMINDERS')->update(['enabled' => true]);
        config(['services.whatsapp.enabled' => true]);
    }

    public function test_authorized_user_can_send_manual_reminder_only_after_patient_consent(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $user->givePermissionTo('patients.whatsapp_consent');
        $patient = Patient::factory()->create([
            'phone' => '+5215555550101',
            'whatsapp_reminder_consent' => true,
            'whatsapp_reminder_consent_recorded_by' => $user->id,
        ]);
        $appointment = Appointment::factory()->for($patient)->create([
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
        ]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldReceive('sendTemplate')
            ->once()
            ->withArgs(fn (string $phone, string $template, array $parameters): bool => $phone === '+5215555550101'
                && $template === 'appointment_reminder'
                && $parameters[0] === $patient->first_name
                && $parameters[1] === $appointment->scheduled_at->format('d/m/Y')
                && $parameters[2] === $appointment->scheduled_at->format('H:i')
                && str_contains($parameters[3], '/whatsapp/appointments/'))
            ->andReturn(new WhatsAppSendResult('wamid.test123'));

        $response = $this->actingAs($user)->post(route('appointments.reminders.whatsapp.store', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseHas('appointment_reminders', [
            'appointment_id' => $appointment->id,
            'recipient_type' => 'patient',
            'recipient_phone' => '+5215555550101',
            'status' => 'sent',
            'provider_message_id' => 'wamid.test123',
        ]);

        $this->assertDatabaseHas('appointment_reminders', [
            'appointment_id' => $appointment->id,
            'automatic' => false,
        ]);
    }

    public function test_reminder_is_refused_without_patient_consent(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create(['phone' => '+5215555550101']);
        $appointment = Appointment::factory()->for($patient)->create(['scheduled_at' => now()->addDay()]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldNotReceive('sendTemplate');

        $this->actingAs($user)
            ->post(route('appointments.reminders.whatsapp.store', $appointment))
            ->assertSessionHasErrors(['whatsapp' => 'El paciente no tiene registrado consentimiento para recibir recordatorios por WhatsApp.']);

        $this->assertDatabaseCount('appointment_reminders', 0);
    }

    public function test_reminder_is_refused_when_feature_or_permission_is_disabled(): void
    {
        $user = User::factory()->create();
        $user->assignRole('DENTIST');
        $patient = Patient::factory()->create([
            'phone' => '+5215555550101',
            'whatsapp_reminder_consent' => true,
        ]);
        $appointment = Appointment::factory()->for($patient)->create(['scheduled_at' => now()->addDay()]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldNotReceive('sendTemplate');

        $this->actingAs($user)
            ->post(route('appointments.reminders.whatsapp.store', $appointment))
            ->assertForbidden();

        FeatureState::query()->where('code', 'APPOINTMENTS_REMINDERS')->update(['enabled' => false]);
        $user->givePermissionTo('appointments.reminders.send');

        $this->actingAs($user)
            ->post(route('appointments.reminders.whatsapp.store', $appointment))
            ->assertNotFound();
    }

    public function test_manual_reminder_requires_a_future_scheduled_appointment_and_phone(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $patient = Patient::factory()->create([
            'phone' => '+5215555550101',
            'whatsapp_reminder_consent' => true,
        ]);
        $appointment = Appointment::factory()->for($patient)->create(['scheduled_at' => now()->addDays(-2)]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldNotReceive('sendTemplate');

        $this->actingAs($user)
            ->post(route('appointments.reminders.whatsapp.store', $appointment))
            ->assertSessionHasErrors(['whatsapp' => 'Solo se pueden enviar recordatorios para citas futuras vigentes.']);

        $appointment->update(['status' => 'cancelled']);

        $this->actingAs($user)
            ->post(route('appointments.reminders.whatsapp.store', $appointment))
            ->assertSessionHasErrors(['whatsapp' => 'Solo se pueden enviar recordatorios para citas futuras vigentes.']);
    }

    public function test_clinic_user_can_record_and_revoke_patient_and_staff_consent(): void
    {
        $clinicAdmin = User::factory()->create();
        $clinicAdmin->assignRole('CLINIC_ADMIN');
        $patient = Patient::factory()->create();
        $staff = User::factory()->create();
        $staff->assignRole('DENTIST');
        $roleId = $staff->roles()->firstOrFail()->id;
        $clinicAdmin->givePermissionTo(['users.view', 'users.update', 'users.whatsapp_consent']);

        $this->actingAs($clinicAdmin)->patch(route('patients.update', $patient), [
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'whatsapp_reminder_consent' => true,
        ])->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'whatsapp_reminder_consent' => true,
            'whatsapp_reminder_consent_recorded_by' => $clinicAdmin->id,
        ]);
        $this->assertDatabaseHas('whatsapp_consent_audits', [
            'patient_id' => $patient->id,
            'recorded_by' => $clinicAdmin->id,
            'consent_given' => true,
        ]);

        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('SUPER_ADMIN');

        $this->actingAs($superAdmin)->patch(route('admin.users.update', $staff), [
            'name' => $staff->name,
            'email' => $staff->email,
            'phone' => '+5215555550111',
            'whatsapp_appointment_consent' => true,
            'roles' => [$roleId],
        ])->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'phone' => '+5215555550111',
            'whatsapp_appointment_consent' => true,
            'whatsapp_appointment_consent_recorded_by' => $superAdmin->id,
        ]);

        $this->actingAs($clinicAdmin)->patch(route('patients.update', $patient), [
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'whatsapp_reminder_consent' => false,
        ])->assertRedirect(route('patients.show', $patient));

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'whatsapp_reminder_consent' => false,
            'whatsapp_reminder_consent_recorded_by' => null,
        ]);
        $this->assertDatabaseHas('whatsapp_consent_audits', [
            'patient_id' => $patient->id,
            'recorded_by' => $clinicAdmin->id,
            'consent_given' => false,
        ]);
    }

    public function test_meta_sender_submits_an_approved_template_to_the_cloud_api(): void
    {
        config([
            'services.whatsapp.phone_number_id' => 'phone-id',
            'services.whatsapp.access_token' => 'secret-token',
            'services.whatsapp.api_version' => 'v23.0',
        ]);
        Http::preventStrayRequests();
        Http::fake([
            'graph.facebook.com/v23.0/phone-id/messages' => Http::response(['messages' => [['id' => 'wamid.api123']]]),
        ]);

        $result = app(MetaWhatsAppMessageSender::class)
            ->sendTemplate('+5215555550101', 'appointment_reminder', ['María', '07/10/2026', '10:00', '35']);

        $this->assertSame('wamid.api123', $result->providerMessageId);
        Http::assertSent(fn ($request): bool => $request->url() === 'https://graph.facebook.com/v23.0/phone-id/messages'
            && $request->hasHeader('Authorization', 'Bearer secret-token')
            && $request['template']['name'] === 'appointment_reminder'
            && $request['template']['components'][0]['parameters'][0]['text'] === 'María');
    }

    public function test_automatic_reminder_is_off_by_default_and_sends_only_within_the_24_hour_window(): void
    {
        $this->travelTo(now()->setTime(10, 0));
        $patient = Patient::factory()->create([
            'phone' => '+5215555550101',
            'whatsapp_reminder_consent' => true,
        ]);
        $dueAppointment = Appointment::factory()->for($patient)->create([
            'scheduled_at' => now()->addHours(24),
            'status' => 'scheduled',
        ]);
        Appointment::factory()->for($patient)->create([
            'scheduled_at' => now()->addDays(3),
            'status' => 'scheduled',
        ]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldNotReceive('sendTemplate');

        $this->assertSame(0, app(AppointmentReminderScheduler::class)->sendDueReminders());
        $this->assertDatabaseCount('appointment_reminders', 0);

        config(['services.whatsapp.automatic_reminders_enabled' => true]);
        $sender->shouldReceive('sendTemplate')->once()->andReturn(new WhatsAppSendResult('wamid.auto'));

        $this->assertSame(1, app(AppointmentReminderScheduler::class)->sendDueReminders());
        $this->assertDatabaseHas('appointment_reminders', [
            'appointment_id' => $dueAppointment->id,
            'automatic' => true,
            'status' => 'sent',
        ]);

        $this->assertSame(0, app(AppointmentReminderScheduler::class)->sendDueReminders());
    }

    public function test_meta_webhook_verification_and_inbound_confirmation_update_appointment_and_notify_consented_dentist(): void
    {
        config([
            'services.whatsapp.app_secret' => 'test-app-secret',
            'services.whatsapp.webhook_verify_token' => 'verify-me',
        ]);
        $this->get(route('whatsapp.webhook.verify', [
            'hub_mode' => 'subscribe',
            'hub_verify_token' => 'verify-me',
            'hub_challenge' => 'challenge-123',
        ]))->assertOk()->assertSeeText('challenge-123');

        $admin = User::factory()->create();
        $dentist = User::factory()->create([
            'phone' => '5215555550202',
            'whatsapp_appointment_consent' => true,
        ]);
        $patient = Patient::factory()->create([
            'phone' => '5215555550101',
            'whatsapp_reminder_consent' => true,
        ]);
        $appointment = Appointment::factory()->for($patient)->for($dentist, 'dentist')->create([
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
        ]);
        $reminder = $appointment->reminders()->create([
            'triggered_by' => $admin->id,
            'recipient_type' => 'patient',
            'recipient_phone' => '5215555550101',
            'status' => 'sent',
            'sent_at' => now(),
            'confirmation_token' => 'secure-confirm-token',
            'confirmation_token_expires_at' => now()->addDay(),
            'provider_message_id' => 'wamid.outbound',
        ]);
        $sender = $this->mock(WhatsAppMessageSender::class);
        $sender->shouldReceive('sendTemplate')->once()->with(
            '5215555550202',
            'appointment_confirmed_doctor',
            [$dentist->name, $patient->first_name.' '.$patient->last_name, $appointment->scheduled_at->format('d/m/Y'), $appointment->scheduled_at->format('H:i')],
        )->andReturn(new WhatsAppSendResult('wamid.doctor'));

        $payload = ['entry' => [[
            'changes' => [[
                'value' => ['messages' => [[
                    'id' => 'wamid.inbound',
                    'from' => '5215555550101',
                    'text' => ['body' => 'CONFIRMAR'],
                    'context' => ['id' => 'wamid.outbound'],
                ]]],
            ]],
        ]]];
        $body = json_encode($payload, JSON_THROW_ON_ERROR);
        $signature = 'sha256='.hash_hmac('sha256', $body, 'test-app-secret');

        $this->call('POST', route('whatsapp.webhook.receive'), [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => $signature,
        ], $body)->assertNoContent();

        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'confirmed']);
        $this->assertDatabaseHas('appointment_reminders', [
            'id' => $reminder->id,
            'inbound_message_id' => 'wamid.inbound',
            'reply_text' => 'CONFIRMAR',
        ]);
        $this->assertDatabaseHas('appointment_reminders', [
            'appointment_id' => $appointment->id,
            'recipient_type' => 'dentist',
            'status' => 'sent',
        ]);
    }

    public function test_invalid_meta_webhook_signature_is_rejected(): void
    {
        config(['services.whatsapp.app_secret' => 'test-app-secret']);
        $body = json_encode(['entry' => []], JSON_THROW_ON_ERROR);

        $this->call('POST', route('whatsapp.webhook.receive'), [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalid',
        ], $body)->assertUnauthorized();
    }

    public function test_appointment_screen_exposes_consent_and_reminder_history_to_authorized_staff(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $user->givePermissionTo('patients.whatsapp_consent');
        $patient = Patient::factory()->create([
            'phone' => '+5215555550101',
            'whatsapp_reminder_consent' => true,
        ]);
        $appointment = Appointment::factory()->for($patient)->create([
            'scheduled_at' => now()->addDay(),
            'status' => 'scheduled',
        ]);

        $this->actingAs($user)
            ->get(route('appointments.show', $appointment))
            ->assertInertia(fn (Assert $page) => $page
                ->where('canSendWhatsAppReminder', true)
                ->where('appointment.patient.whatsapp_reminder_consent', true)
                ->has('appointment.reminders', 0));
    }

    public function test_consent_can_be_updated_from_appointment_notification_section_with_audit_history(): void
    {
        $user = User::factory()->create();
        $user->assignRole('RECEPTIONIST');
        $user->givePermissionTo('patients.whatsapp_consent');
        $patient = Patient::factory()->create(['phone' => '+5215555550101']);
        $appointment = Appointment::factory()->for($patient)->create(['scheduled_at' => now()->addDay()]);

        $this->actingAs($user)
            ->patch(route('appointments.reminders.whatsapp.consent.update', $appointment), ['consent_given' => true])
            ->assertRedirect();

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'whatsapp_reminder_consent' => true,
            'whatsapp_reminder_consent_recorded_by' => $user->id,
        ]);
        $this->assertDatabaseHas('whatsapp_consent_audits', [
            'patient_id' => $patient->id,
            'consent_given' => true,
        ]);
    }
}
