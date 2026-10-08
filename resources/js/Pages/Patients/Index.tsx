import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
import ToothLoader from '@/Components/ToothLoader';
import { PageProps, Paginated, Patient } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Index({ patients, filters, showAssignedDentists }: PageProps<{ patients?: Paginated<Patient>; filters: { search: string }; showAssignedDentists: boolean }>) {
    const { auth } = usePage<PageProps>().props;
    const canCreatePatients = auth.permissions.includes('patients.create');
    const canUpdatePatients = auth.permissions.includes('patients.update');
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(route('patients.index'), { search }, { preserveState: true, replace: true });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Pacientes</h2>}>
            <Head title="Pacientes" />
            <div className="min-h-[calc(100vh-5rem)] theme-page px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={showAssignedDentists ? 'Buscar por nombre, correo o doctor' : 'Buscar por nombre o correo'} className="w-full rounded-xl theme-outline-strong shadow-sm focus:border-accent focus:ring-accent sm:max-w-xl" />
                        {canCreatePatients && <ActionLink href={route('patients.create')} icon="users" variant="accent">Nuevo paciente</ActionLink>}
                    </div>

                    {patients ? <section className="overflow-hidden rounded-2xl border theme-outline theme-card shadow-sm">
                        {patients.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="theme-info mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl">+</div>
                                <h3 className="mt-5 text-lg font-semibold theme-content">No hay pacientes para mostrar</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 theme-content-muted">Crea el primer expediente o cambia el termino de busqueda para encontrar un paciente.</p>
                                {canCreatePatients && <Link href={route('patients.create')} className="mt-6 inline-flex min-h-11 items-center rounded-xl theme-accent-button px-4 py-2 text-sm font-semibold theme-content-inverse transition hover:text-accent-button focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Crear paciente</Link>}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="theme-page">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Paciente</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Telefono</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Correo</th>
                                                {showAssignedDentists && <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider theme-content-muted">Doctor</th>}
                                                {canUpdatePatients && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider theme-content-muted">Acciones</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline theme-card">
                                            {patients.data.map((patient) => (
                                                <tr
                                                    key={patient.id}
                                                    className="cursor-pointer transition hover:bg-surface-sunken focus:bg-surface-sunken focus:outline-none"
                                                    onClick={() => router.visit(route('patients.show', patient.id))}
                                                    onKeyDown={(event) => {
                                                        if (event.key === 'Enter' || event.key === ' ') {
                                                            event.preventDefault();
                                                            router.visit(route('patients.show', patient.id));
                                                        }
                                                    }}
                                                    role="link"
                                                    tabIndex={0}
                                                    aria-label={`Ver paciente ${patient.first_name} ${patient.last_name}`}
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold theme-content"><Link href={route('patients.show', patient.id)} onClick={(event) => event.stopPropagation()} className="theme-accent transition hover:underline">{patient.first_name} {patient.last_name}</Link></td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{patient.phone ?? '-'}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-secondary">{patient.email ?? '-'}</td>
                                                    {showAssignedDentists && <td className="px-6 py-4 text-sm theme-content-secondary">{patient.dentists?.map((dentist) => dentist.name).join(', ') || '-'}</td>}
                                                     {canUpdatePatients && <td className="whitespace-nowrap px-6 py-4 text-right text-sm"><Link href={route('patients.edit', patient.id)} onClick={(event) => event.stopPropagation()} className="table-action-button">Editar</Link></td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={patients.links} />
                            </>
                        )}
                    </section> : <section className="rounded-2xl border theme-outline theme-card shadow-sm"><ToothLoader label="Cargando pacientes" compact /></section>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Pagination({ links }: { links: Paginated<Patient>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginación" className="flex flex-wrap gap-2 border-t theme-outline p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'theme-accent-button' : 'theme-content-secondary hover:bg-info-surface hover:text-info-content'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="theme-content-muted rounded-lg px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
