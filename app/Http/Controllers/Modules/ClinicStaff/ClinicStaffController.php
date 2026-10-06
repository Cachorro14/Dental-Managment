<?php

namespace App\Http\Controllers\Modules\ClinicStaff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\ClinicStaff\StoreClinicStaffRequest;
use App\Http\Requests\Modules\ClinicStaff\UpdateClinicStaffRequest;
use App\Models\User;
use App\Policies\Modules\ClinicStaff\ClinicStaffPolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ClinicStaffController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);
        $search = $request->string('search')->trim()->toString();
        $assignableRoles = ClinicStaffPolicy::ASSIGNABLE_ROLES;

        return Inertia::render('ClinicStaff/Index', [
            'users' => User::query()
                ->select(['id', 'name', 'email', 'phone'])
                ->with('roles:id,name')
                ->whereHas('roles', fn ($query) => $query->whereIn('roles.name', $assignableRoles))
                ->whereDoesntHave('roles', fn ($query) => $query->whereNotIn('roles.name', $assignableRoles))
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
                ->orderBy('name')
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('ClinicStaff/Create', [
            'assignableRoles' => $this->assignableRoles(),
            'canManageWhatsAppConsent' => request()->user()->can('users.whatsapp_consent'),
        ]);
    }

    public function store(StoreClinicStaffRequest $request): RedirectResponse
    {
        $data = $request->validated();
        abort_unless(! array_key_exists('whatsapp_appointment_consent', $data) || $request->user()->can('users.whatsapp_consent'), 403);

        DB::transaction(function () use ($data, $request): void {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'license_number' => $data['license_number'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
            ]);

            if (array_key_exists('whatsapp_appointment_consent', $data)) {
                abort_unless($request->user()->can('users.whatsapp_consent'), 403);
                $this->recordWhatsAppConsent($user, $data, $request->user()->id);
            }

            $user->syncRoles($data['roles']);
        });

        return redirect()->route('clinic-staff.index')->with('success', 'Cuenta de personal creada.');
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);
        abort_unless($user->hasRole('DENTIST') || $user->hasRole('RECEPTIONIST'), 404);

        return Inertia::render('ClinicStaff/Edit', [
            'user' => $user->load('roles:id,name')->makeVisible('license_number')->makeHidden(['whatsapp_appointment_consent_recorded_by']),
            'canManageWhatsAppConsent' => request()->user()->can('users.whatsapp_consent'),
            'whatsappConsentRecordedBy' => request()->user()->can('users.whatsapp_consent')
                ? User::query()->whereKey($user->whatsapp_appointment_consent_recorded_by)->value('name')
                : null,
            'assignableRoles' => $this->assignableRoles(),
        ]);
    }

    public function update(UpdateClinicStaffRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        abort_unless(! array_key_exists('whatsapp_appointment_consent', $data) || $request->user()->can('manageWhatsAppConsent', $user), 403);

        DB::transaction(function () use ($data, $user, $request): void {
            $attributes = [
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'license_number' => $data['license_number'] ?? null,
                'phone' => $data['phone'] ?? null,
            ];

            if (($data['password'] ?? '') !== '') {
                $attributes['password'] = $data['password'];
            }

            if (array_key_exists('whatsapp_appointment_consent', $data)) {
                abort_unless($request->user()->can('manageWhatsAppConsent', $user), 403);
            }

            $user->update($attributes);
            if (array_key_exists('whatsapp_appointment_consent', $data)) {
                $this->recordWhatsAppConsent($user, $data, $request->user()->id);
            }
            $user->syncRoles($data['roles']);
        });

        return redirect()->route('clinic-staff.index')->with('success', 'Cuenta de personal actualizada.');
    }

    /** @return list<array{name: string, label: string}> */
    private function assignableRoles(): array
    {
        return [
            ['name' => 'RECEPTIONIST', 'label' => 'Recepción'],
            ['name' => 'DENTIST', 'label' => 'Dentista'],
        ];
    }

    /** @param array<string, mixed> $data */
    private function recordWhatsAppConsent(User $user, array $data, int $recordedBy): void
    {
        if (! array_key_exists('whatsapp_appointment_consent', $data)) {
            return;
        }

        $consentGiven = (bool) $data['whatsapp_appointment_consent'];

        DB::transaction(function () use ($user, $consentGiven, $recordedBy): void {
            $user->forceFill([
                'whatsapp_appointment_consent' => $consentGiven,
                'whatsapp_appointment_consent_recorded_by' => $consentGiven ? $recordedBy : null,
            ])->save();

            DB::table('whatsapp_consent_audits')->insert([
                'user_id' => $user->id,
                'recorded_by' => $recordedBy,
                'consent_given' => $consentGiven,
                'recorded_at' => now(),
            ]);
        });
    }
}
