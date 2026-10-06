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
                ->select(['id', 'name', 'email'])
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
        ]);
    }

    public function store(StoreClinicStaffRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'license_number' => $data['license_number'] ?? null,
                'password' => $data['password'],
            ]);

            $user->syncRoles($data['roles']);
        });

        return redirect()->route('clinic-staff.index')->with('success', 'Cuenta de personal creada.');
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('ClinicStaff/Edit', [
            'user' => $user->load('roles:id,name')->makeVisible('license_number'),
            'assignableRoles' => $this->assignableRoles(),
        ]);
    }

    public function update(UpdateClinicStaffRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $user): void {
            $attributes = [
                'name' => $data['name'],
                'email' => Str::lower($data['email']),
                'license_number' => $data['license_number'] ?? null,
            ];

            if (($data['password'] ?? '') !== '') {
                $attributes['password'] = $data['password'];
            }

            $user->update($attributes);
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
}
