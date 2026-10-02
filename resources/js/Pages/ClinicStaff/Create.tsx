import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClinicStaffAssignableRole } from '@/types';
import { Head } from '@inertiajs/react';
import StaffForm from './StaffForm';

export default function Create({ assignableRoles }: { assignableRoles: ClinicStaffAssignableRole[] }) {
    return <AuthenticatedLayout header={<div><p className="text-sm font-medium text-teal-700">Personal de la clínica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Crear cuenta</h1></div>}><Head title="Crear cuenta de personal" /><div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><StaffForm assignableRoles={assignableRoles} /></div></div></AuthenticatedLayout>;
}
