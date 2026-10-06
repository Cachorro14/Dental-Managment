<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        $search = request()->string('search')->trim()->toString();

        return Inertia::render('Admin/Users/Index', [
            'users' => Inertia::defer(fn () => User::query()
                ->select(['id', 'name', 'email', 'phone'])
                ->with('roles:id,name')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
                ->latest()
                ->paginate(15)
                ->withQueryString()),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', [
            'roles' => $this->roles(),
            'canManageWhatsAppConsent' => request()->user()->can('users.whatsapp_consent'),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        abort_unless(! array_key_exists('whatsapp_appointment_consent', $data) || $request->user()->can('users.whatsapp_consent'), 403);
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => Str::lower($data['email']),
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
        ]);

        $user->syncRoles($data['roles']);

        return redirect()->route('admin.users.index')->with('success', 'Usuario creado.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles:id,name')->makeVisible(['license_number'])->makeHidden([
                'whatsapp_appointment_consent_recorded_by',
            ]),
            'canManageWhatsAppConsent' => request()->user()->can('users.whatsapp_consent'),
            'whatsappConsentRecordedBy' => request()->user()->can('users.whatsapp_consent')
                ? User::query()->whereKey($user->whatsapp_appointment_consent_recorded_by)->value('name')
                : null,
            'roles' => $this->roles(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $attributes = ['name' => $data['name'], 'email' => Str::lower($data['email']), 'phone' => $data['phone'] ?? null];

        if (array_key_exists('whatsapp_appointment_consent', $data)) {
            abort_unless($request->user()->can('users.whatsapp_consent'), 403);
        }

        if ($data['password'] ?? false) {
            $attributes['password'] = $data['password'];
        }

        DB::transaction(function () use ($user, $attributes, $data, $request): void {
            $user->update($attributes);
            if (array_key_exists('whatsapp_appointment_consent', $data)) {
                $this->recordWhatsAppConsent($user, $data, $request->user()->id);
            }
            $user->syncRoles($data['roles']);
        });

        return redirect()->route('admin.users.index')->with('success', 'Usuario actualizado.');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if(request()->user()->is($user), 422, 'No puedes eliminar tu propio usuario.');
        abort_if($user->hasRole('SUPER_ADMIN') && User::role('SUPER_ADMIN')->count() <= 1, 422, 'Debe existir al menos un SUPER_ADMIN.');

        $user->delete();

        return back()->with('success', 'Usuario eliminado.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function roles(): array
    {
        return Role::query()->orderBy('name')->get(['id', 'name'])->map(fn (Role $role): array => ['id' => $role->id, 'name' => $role->name])->all();
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
