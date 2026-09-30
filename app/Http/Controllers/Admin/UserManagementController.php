<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
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
            'users' => User::query()
                ->with('roles:id,name')
                ->when($search !== '', fn ($query) => $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create', ['roles' => $this->roles()]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = User::query()->create([
            'name' => $data['name'],
            'email' => Str::lower($data['email']),
            'password' => $data['password'],
        ]);
        $user->syncRoles($data['roles']);

        return redirect()->route('admin.users.index')->with('success', 'Usuario creado.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles:id,name'),
            'roles' => $this->roles(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();
        $attributes = ['name' => $data['name'], 'email' => Str::lower($data['email'])];

        if ($data['password'] ?? false) {
            $attributes['password'] = $data['password'];
        }

        $user->update($attributes);
        $user->syncRoles($data['roles']);

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
}
