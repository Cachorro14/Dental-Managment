import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { ClinicStaffAssignableRole, RoleSummary } from '@/types';
import StaffForm from './StaffForm';

type ClinicStaffUser = { id: number; name: string; email: string; roles: RoleSummary[] };

export default function Edit({ user, assignableRoles }: { user: ClinicStaffUser; assignableRoles: ClinicStaffAssignableRole[] }) {
    return <AuthenticatedLayout header={<div><p className="text-sm font-medium text-teal-700">Personal de la clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Editar cuenta</h1></div>}><Head title={`Editar ${user.name}`} /><div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><StaffForm user={user} assignableRoles={assignableRoles} /></div></div></AuthenticatedLayout>;
}
