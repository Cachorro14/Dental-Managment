import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ClinicStaffAssignableRole, RoleSummary } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

type ClinicStaffUser = { id: number; name: string; email: string; phone?: string | null; whatsapp_appointment_consent?: boolean; whatsapp_appointment_consent_recorded_at?: string | null; license_number?: string | null; roles: RoleSummary[] };

export default function StaffForm({ user, assignableRoles, canManageWhatsAppConsent = false, whatsappConsentRecordedBy }: { user?: ClinicStaffUser; assignableRoles: ClinicStaffAssignableRole[]; canManageWhatsAppConsent?: boolean; whatsappConsentRecordedBy?: string | null }) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        whatsapp_appointment_consent: user?.whatsapp_appointment_consent ?? false,
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
        <form onSubmit={submit} className="space-y-6 rounded-2xl border theme-outline theme-card p-5 shadow-sm sm:p-7">
            <div><h2 className="text-lg font-semibold theme-content">Datos de la cuenta</h2><p className="mt-1 text-sm theme-content-muted">Los permisos se heredan del rol asignado. Esta sección no administra cuentas de SUPER_ADMIN ni permisos del sistema.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div><InputLabel htmlFor="clinic_staff_name" value="Nombre" /><TextInput id="clinic_staff_name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="mt-1 block w-full" required /><InputError message={form.errors.name} className="mt-2" /></div>
                <div><InputLabel htmlFor="clinic_staff_email" value="Correo electrónico" /><TextInput id="clinic_staff_email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} className="mt-1 block w-full" required /><InputError message={form.errors.email} className="mt-2" /></div>
            </div>
            <div><InputLabel htmlFor="clinic_staff_phone" value="Teléfono para WhatsApp" /><TextInput id="clinic_staff_phone" type="tel" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} className="mt-1 block w-full" /><InputError message={form.errors.phone} className="mt-2" /></div>
            {canManageWhatsAppConsent && <fieldset className="theme-success rounded-xl border p-4">
                <label className="flex min-h-11 items-start gap-3 text-sm theme-content"><input type="checkbox" checked={form.data.whatsapp_appointment_consent} onChange={(event) => form.setData('whatsapp_appointment_consent', event.target.checked)} className="mt-1 rounded border-emerald-400 theme-content focus:ring-emerald-500" /><span>Este usuario cuenta con consentimiento físico para recibir avisos operativos de citas por WhatsApp.</span></label>
                <InputError message={form.errors.whatsapp_appointment_consent as string | undefined} className="mt-2" />
                {user?.whatsapp_appointment_consent_recorded_at && <p className="mt-2 text-xs theme-content">Última autorización registrada el {new Date(user.whatsapp_appointment_consent_recorded_at).toLocaleString('es-MX')}{whatsappConsentRecordedBy ? ` por ${whatsappConsentRecordedBy}` : ''}.</p>}
            </fieldset>}
            {form.data.roles.includes('DENTIST') && <div><InputLabel htmlFor="clinic_staff_license" value="Número de matrícula profesional" /><TextInput id="clinic_staff_license" value={form.data.license_number} onChange={(event) => form.setData('license_number', event.target.value)} className="mt-1 block w-full" /><InputError message={form.errors.license_number} className="mt-2" /></div>}
            <div className="grid gap-5 sm:grid-cols-2">
                <div><InputLabel htmlFor="clinic_staff_password" value={user ? 'Nueva contraseña (opcional)' : 'Contraseña'} /><TextInput id="clinic_staff_password" type="password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} className="mt-1 block w-full" required={!user} /><InputError message={form.errors.password} className="mt-2" /></div>
                <div><InputLabel htmlFor="clinic_staff_password_confirmation" value="Confirmar contraseña" /><TextInput id="clinic_staff_password_confirmation" type="password" value={form.data.password_confirmation} onChange={(event) => form.setData('password_confirmation', event.target.value)} className="mt-1 block w-full" required={!user} /></div>
            </div>
            {form.data.roles.includes('DENTIST') && <div><InputLabel htmlFor="clinic_staff_license" value="Número de matrícula profesional" /><TextInput id="clinic_staff_license" value={form.data.license_number} onChange={(event) => form.setData('license_number', event.target.value)} className="mt-1 block w-full" /><InputError message={form.errors.license_number} className="mt-2" /></div>}
            <fieldset>
                <legend className="text-sm font-medium theme-content-secondary">Roles disponibles para el personal de la clínica</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {assignableRoles.map((role) => <label key={role.name} className="flex min-h-12 items-center gap-3 rounded-xl border theme-outline px-4 py-3 text-sm theme-content-secondary transition hover:border-accent hover:bg-surface-sunken">
                        <input type="checkbox" checked={form.data.roles.includes(role.name)} onChange={() => toggleRole(role.name)} className="rounded border-outline-strong text-accent focus:ring-accent" />
                        <span>{role.name === 'DENTIST' ? 'Dentista' : 'Recepción'}</span>
                    </label>)}
                </div>
                {form.data.roles.includes('DENTIST') && form.data.roles.includes('RECEPTIONIST') && <p className="mt-2 text-sm theme-content">Al combinar ambos roles, la cuenta también hereda el acceso general a los pacientes propio de recepción.</p>}
                <InputError message={form.errors.roles} className="mt-2" />
            </fieldset>
            <div className="flex flex-col gap-3 sm:flex-row">
                <PrimaryButton disabled={form.processing}>{user ? 'Guardar cambios' : 'Crear cuenta'}</PrimaryButton>
                <Link href={route('clinic-staff.index')} className="theme-content-secondary inline-flex min-h-11 items-center justify-center rounded-xl border theme-outline-strong bg-surface-raised px-4 py-2 text-sm font-semibold transition hover:bg-surface-sunken">Cancelar</Link>
            </div>
        </form>
    );
}
