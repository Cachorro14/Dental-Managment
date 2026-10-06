import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import RoleForm from './RoleForm';

type Permission = { id: number; name: string };
type Role = { id: number; name: string; permissions: Permission[] };
export default function Edit({ role, permissions, systemRole }: { role: Role; permissions: Permission[]; systemRole: boolean }) { return <AuthenticatedLayout header={<div><p className="theme-accent text-sm font-medium">Administración</p><h1 className="mt-1 text-2xl font-semibold tracking-tight theme-content">Editar rol</h1></div>}><Head title={`Editar ${role.name}`} /><div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><RoleForm role={role} permissions={permissions} systemRole={systemRole} /></div></div></AuthenticatedLayout>; }
