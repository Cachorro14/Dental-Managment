<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Roles/Index', [
            'roles' => Role::query()->withCount('users')->with('permissions:id,name')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Roles/Create', ['permissions' => $this->permissions()]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $role = Role::query()->create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('admin.roles.index')->with('success', 'Rol creado.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role->load('permissions:id,name'),
            'permissions' => $this->permissions(),
            'systemRole' => in_array($role->name, $this->systemRoles(), true),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $data = $request->validated();
        abort_if(in_array($role->name, $this->systemRoles(), true) && $data['name'] !== $role->name, 422, 'Los roles del sistema no pueden renombrarse.');

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions'] ?? []);

        return redirect()->route('admin.roles.index')->with('success', 'Rol actualizado.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if(in_array($role->name, $this->systemRoles(), true), 422, 'Los roles del sistema no pueden eliminarse.');
        abort_if($role->users()->exists(), 422, 'No puedes eliminar un rol asignado a usuarios.');

        $role->delete();

        return back()->with('success', 'Rol eliminado.');
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function permissions(): array
    {
        return Permission::query()->where('guard_name', 'web')->orderBy('name')->get(['id', 'name'])->map(fn (Permission $permission): array => ['id' => $permission->id, 'name' => $permission->name])->all();
    }

    /** @return list<string> */
    private function systemRoles(): array
    {
        return ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DENTIST'];
    }
}
