import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ClinicStaffAssignableRole, RoleSummary } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type ClinicStaffUser = { id: number; name: string; email: string; license_number?: string | null; roles: RoleSummary[] };

export default function StaffForm({ user, assignableRoles }: { user?: ClinicStaffUser; assignableRoles: ClinicStaffAssignableRole[] }) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        license_number: user?.license_number ?? '',
        roles: user?.roles.map((role) => role.name) ?? [],
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        user ? form.patch(route('clinic-staff.update', user.id)) : form.post(route('clinic-staff.store'));
    };

    const toggleRole = (roleName: string) => {
        form.setData('roles', form.data.roles.includes(roleName)
            ? form.data.roles.filter((assignedRole) => assignedRole !== roleName)
            : [...form.data.roles, roleName]);
    };

    return (
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div><h2 className="text-lg font-semibold text-slate-900">Datos de la cuenta</h2><p className="mt-1 text-sm text-slate-500">Los permisos se heredan del rol asignado. Esta sección no administra cuentas de SUPER_ADMIN ni permisos del sistema.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div><InputLabel htmlFor="clinic_staff_name" value="Nombre" /><TextInput id="clinic_staff_name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" required /><InputError message={form.errors.name} className="mt-2" /></div>
                <div><InputLabel htmlFor="clinic_staff_email" value="Correo electrónico" /><TextInput id="clinic_staff_email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="mt-1 block w-full" required /><InputError message={form.errors.email} className="mt-2" /></div>
            </div>
            {form.data.roles.includes('DENTIST') && <div><InputLabel htmlFor="clinic_staff_license" value="Número de matrícula profesional" /><TextInput id="clinic_staff_license" value={form.data.license_number} onChange={(event) => form.setData('license_number', event.target.value)} className="mt-1 block w-full" /><InputError message={form.errors.license_number} className="mt-2" /></div>}
            <div className="grid gap-5 sm:grid-cols-2">
                <div><InputLabel htmlFor="clinic_staff_password" value={user ? 'Nueva contraseña (opcional)' : 'Contraseña'} /><TextInput id="clinic_staff_password" type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="mt-1 block w-full" required={!user} /><InputError message={form.errors.password} className="mt-2" /></div>
                <div><InputLabel htmlFor="clinic_staff_password_confirmation" value="Confirmar contraseña" /><TextInput id="clinic_staff_password_confirmation" type="password" value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} className="mt-1 block w-full" required={!user} /></div>
            </div>
            {form.data.roles.includes('DENTIST') && <div><InputLabel htmlFor="clinic_staff_license" value="Número de matrícula profesional" /><TextInput id="clinic_staff_license" value={form.data.license_number} onChange={(event) => form.setData('license_number', event.target.value)} className="mt-1 block w-full" /><InputError message={form.errors.license_number} className="mt-2" /></div>}
            <fieldset>
                <legend className="text-sm font-medium text-slate-700">Roles disponibles para el personal de la clínica</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {assignableRoles.map((role) => <label key={role.name} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-teal-300 hover:bg-teal-50">
                        <input type="checkbox" checked={form.data.roles.includes(role.name)} onChange={() => toggleRole(role.name)} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                        <span>{role.name === 'DENTIST' ? 'Dentista' : 'Recepción'}</span>
                    </label>)}
                </div>
                {form.data.roles.includes('DENTIST') && form.data.roles.includes('RECEPTIONIST') && <p className="mt-2 text-sm text-amber-800">Al combinar ambos roles, la cuenta también hereda el acceso general a los pacientes propio de recepción.</p>}
                <InputError message={form.errors.roles} className="mt-2" />
            </fieldset>
            <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton disabled={form.processing}>{user ? 'Guardar cambios' : 'Crear cuenta'}</PrimaryButton>
                <Link href={route('clinic-staff.index')} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-50">Cancelar</Link>
            </div>
        </form>
    );
}
