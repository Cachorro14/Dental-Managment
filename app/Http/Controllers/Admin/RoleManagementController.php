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
        return Inertia::render('Admin/Roles/Create', ['permissionGroups' => $this->permissionGroups()]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $role = Role::query()->create(['name' => $data['name'], 'guard_name' => 'web']);
        $role->syncPermissions($this->clinicalPermissionIds($data['permissions'] ?? []));

        return redirect()->route('admin.roles.index')->with('success', 'Rol creado.');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('Admin/Roles/Edit', [
            'role' => $role->load('permissions:id,name'),
            'permissionGroups' => $this->permissionGroups(),
            'systemRole' => in_array($role->name, $this->systemRoles(), true),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $data = $request->validated();
        abort_if(in_array($role->name, $this->systemRoles(), true) && $data['name'] !== $role->name, 422, 'Los roles del sistema no pueden renombrarse.');

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($this->clinicalPermissionIds($data['permissions'] ?? []));

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
     * @return list<array{code: string, label: string, description: string, capabilities: list<array{code: string, label: string, description: string, permissions: list<array{id: int, name: string, label: string}>}>}>
     */
    private function permissionGroups(): array
    {
        return $this->permissionAreas();
    }

    /**
     * @return list<int>
     */
    private function clinicalPermissionIds(array $permissionIds): array
    {
        return array_values(array_intersect($permissionIds, $this->clinicalPermissionIdsByName()));
    }

    /**
     * @return list<int>
     */
    private function clinicalPermissionIdsByName(): array
    {
        $names = collect($this->permissionAreas())
            ->flatMap(fn (array $area) => $area['capabilities'])
            ->flatMap(fn (array $capability) => $capability['permissions'])
            ->pluck('id')
            ->all();

        return $names;
    }

    /**
     * @return list<array{code: string, label: string, description: string, capabilities: list<array{code: string, label: string, description: string, permissions: list<array{id: int, name: string, label: string}>}>}>
     */
    private function permissionAreas(): array
    {
        $permissionIds = Permission::query()
            ->where('guard_name', 'web')
            ->pluck('id', 'name');

        $permission = fn (string $name, string $label): array => [
            'id' => $permissionIds[$name],
            'name' => $name,
            'label' => $label,
        ];

        return [
            [
                'code' => 'CLINIC_ADMINISTRATION',
                'label' => 'Administración de la clínica',
                'description' => 'Define quién puede operar la configuración, el personal y los consentimientos de la clínica.',
                'capabilities' => [
                    ['code' => 'CLINIC_SETTINGS', 'label' => 'Configuración de la clínica', 'description' => 'Horarios, datos operativos y ajustes generales.', 'permissions' => [$permission('settings.view', 'Consultar configuración'), $permission('settings.update', 'Modificar configuración')]],
                    ['code' => 'CLINIC_STAFF', 'label' => 'Personal de la clínica', 'description' => 'Equipo clínico y administrativo disponible en la instalación.', 'permissions' => [$permission('clinic_staff.view', 'Consultar personal'), $permission('clinic_staff.create', 'Registrar personal'), $permission('clinic_staff.update', 'Editar personal')]],
                    ['code' => 'WHATSAPP_CONSENT', 'label' => 'Consentimientos de WhatsApp', 'description' => 'Autorización para comunicaciones y recordatorios por WhatsApp.', 'permissions' => [$permission('patients.whatsapp_consent', 'Registrar consentimiento de pacientes'), $permission('users.whatsapp_consent', 'Registrar consentimiento del personal')]],
                ],
            ],
            [
                'code' => 'PATIENT_CARE',
                'label' => 'Atención a pacientes',
                'description' => 'Define qué información clínica y operativa puede consultar o gestionar el rol.',
                'capabilities' => [
                    ['code' => 'PATIENTS', 'label' => 'Pacientes', 'description' => 'Expedientes, datos de contacto y asignación de responsables clínicos.', 'permissions' => [$permission('patients.view', 'Consultar pacientes asignados'), $permission('patients.view_all', 'Consultar todos los pacientes'), $permission('patients.create', 'Registrar pacientes'), $permission('patients.update', 'Editar información general'), $permission('patients.demographics.update', 'Editar datos demográficos'), $permission('patients.assign_dentists', 'Asignar dentistas'), $permission('patients.delete', 'Eliminar pacientes')]],
                    ['code' => 'APPOINTMENTS', 'label' => 'Agenda y citas', 'description' => 'Programación, cambios y comunicación de las citas.', 'permissions' => [$permission('appointments.view', 'Consultar agenda'), $permission('appointments.create', 'Registrar citas'), $permission('appointments.update', 'Modificar citas'), $permission('appointments.delete', 'Cancelar o eliminar citas'), $permission('appointments.reminders.send', 'Enviar recordatorios')]],
                    ['code' => 'CLINICAL_HISTORY', 'label' => 'Historia clínica', 'description' => 'Cuestionario médico, evaluación profesional e impresión del expediente.', 'permissions' => [$permission('clinical_history.view_intake', 'Ver cuestionario'), $permission('clinical_history.update_intake', 'Editar cuestionario'), $permission('clinical_history.view_assessment', 'Ver evaluación clínica'), $permission('clinical_history.update_assessment', 'Editar evaluación clínica'), $permission('clinical_history.print', 'Imprimir historia clínica')]],
                    ['code' => 'ODONTOGRAM', 'label' => 'Odontograma', 'description' => 'Registro visual de la condición dental del paciente.', 'permissions' => [$permission('odontogram.view', 'Consultar odontograma'), $permission('odontogram.update', 'Actualizar odontograma')]],
                    ['code' => 'TREATMENTS', 'label' => 'Tratamientos', 'description' => 'Planificación y seguimiento de tratamientos odontológicos.', 'permissions' => [$permission('treatments.view', 'Consultar tratamientos'), $permission('treatments.create', 'Registrar tratamientos'), $permission('treatments.update', 'Editar tratamientos'), $permission('treatments.delete', 'Eliminar tratamientos')]],
                    ['code' => 'BILLING', 'label' => 'Cobranza', 'description' => 'Cargos, pagos y anulaciones del historial financiero del paciente.', 'permissions' => [$permission('billing.view', 'Consultar movimientos'), $permission('billing.charge', 'Registrar cargos'), $permission('billing.payment', 'Registrar pagos'), $permission('billing.void', 'Anular movimientos')]],
                    ['code' => 'INVENTORY', 'label' => 'Inventario', 'description' => 'Artículos, existencias y ajustes de stock.', 'permissions' => [$permission('inventory.view', 'Consultar inventario'), $permission('inventory.create', 'Registrar artículos'), $permission('inventory.update', 'Editar artículos'), $permission('inventory.adjust', 'Ajustar existencias')]],
                    ['code' => 'REPORTS', 'label' => 'Reportes', 'description' => 'Información operativa para seguimiento de la clínica.', 'permissions' => [$permission('reports.view', 'Consultar reportes')]],
                ],
            ],
        ];
    }

    /** @return list<string> */
    private function systemRoles(): array
    {
        return ['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST', 'DENTIST'];
    }
}
