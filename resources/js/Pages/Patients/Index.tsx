import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { PageProps, Paginated, Patient } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function Index({ patients, filters }: PageProps<{ patients?: Paginated<Patient>; filters: { search: string } }>) {
    const { auth } = usePage<PageProps>().props;
    const canCreatePatients = auth.permissions.includes('patients.create');
    const canUpdatePatients = auth.permissions.includes('patients.update');
    const [search, setSearch] = useState(filters.search);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(route('patients.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-slate-900">Pacientes</h2>}>
            <Head title="Pacientes" />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <form onSubmit={submit} className="flex w-full gap-3 sm:max-w-xl">
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre" className="min-w-0 flex-1 rounded-xl border-slate-300 shadow-sm focus:border-blue-600 focus:ring-blue-500" />
                            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:bg-slate-900">Buscar</button>
                        </form>
                        {canCreatePatients && <Link href={route('patients.create')} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 active:bg-slate-900">Nuevo paciente</Link>}
                    </div>

                    {patients ? <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {patients.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">+</div>
                                <h3 className="mt-5 text-lg font-semibold text-slate-900">No hay pacientes para mostrar</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Crea el primer expediente o cambia el termino de busqueda para encontrar un paciente.</p>
                                {canCreatePatients && <Link href={route('patients.create')} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Crear paciente</Link>}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Paciente</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Telefono</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Correo</th>
                                                {canUpdatePatients && <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Acciones</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {patients.data.map((patient) => (
                                                <tr
                                                    key={patient.id}
                                                    className="cursor-pointer transition hover:bg-blue-50/40 focus:bg-blue-50/40 focus:outline-none"
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
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900"><Link href={route('patients.show', patient.id)} onClick={(event) => event.stopPropagation()} className="transition hover:text-blue-700">{patient.first_name} {patient.last_name}</Link></td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{patient.phone ?? '-'}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{patient.email ?? '-'}</td>
                                                    {canUpdatePatients && <td className="whitespace-nowrap px-6 py-4 text-right text-sm"><Link href={route('patients.edit', patient.id)} onClick={(event) => event.stopPropagation()} className="font-semibold text-blue-700 transition hover:text-blue-900">Editar</Link></td>}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination links={patients.links} />
                            </>
                        )}
                    </section> : <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><ToothLoader label="Cargando pacientes" compact /></section>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Pagination({ links }: { links: Paginated<Patient>['links'] }) {
    if (links.length <= 3) {
        return null;
    }

    return <nav aria-label="Paginacion" className="flex flex-wrap gap-2 border-t border-slate-200 p-4">{links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${link.active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg px-3 py-2 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>;
}
