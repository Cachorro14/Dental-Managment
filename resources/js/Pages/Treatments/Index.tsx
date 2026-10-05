import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Deferred, Head, Link } from '@inertiajs/react';

type PatientSummary = { id: number; first_name: string; last_name: string };
type TreatmentRecord = { id: number; name: string; tooth_number: number | null; cost: string; status: string; scheduled_for: string | null; completed_at: string | null; dentist: { name: string } | null };
type Paginated<T> = { data: T[]; current_page: number; last_page: number; links: Array<{ url: string | null; label: string; active: boolean }> };

const statuses: Record<string, string> = { planned: 'Planeado', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado' };

function paginationLabel(label: string): string {
    return label.replace(/<[^>]*>/g, '').replace('&laquo;', '«').replace('&raquo;', '»');
}

export default function Index({ patient, treatments, canCreate, canUpdate }: { patient: PatientSummary; treatments: Paginated<TreatmentRecord>; canCreate: boolean; canUpdate: boolean }) {
    const patientName = `${patient.first_name} ${patient.last_name}`;

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Tratamientos</h2>}>
            <Head title={`Tratamientos - ${patientName}`} />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                        <div><h1 className="text-xl font-semibold text-slate-900">{patientName}</h1><p className="text-sm text-slate-500">Plan e historial de tratamientos</p></div>
                        <div className="flex flex-wrap gap-3">
                            <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700">Paciente</Link>
                            {canCreate && <Link href={route('treatments.create', patient.id)} className="inline-flex min-h-11 items-center rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white">Registrar tratamiento</Link>}
                        </div>
                    </section>
                    <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Tratamientos registrados</h2></div>
                        <Deferred data="treatments" fallback={<p className="p-6 text-sm text-slate-500">Cargando tratamientos...</p>}>
                            {() => <>
                                {treatments.data.length === 0 ? <p className="p-6 text-sm text-slate-500">Aún no hay tratamientos registrados para este paciente.</p> : <div className="divide-y divide-slate-100">
                                    {treatments.data.map((treatment) => <article key={treatment.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-slate-900">{treatment.name}</h3>
                                            <p className="text-sm text-slate-600">{treatment.tooth_number ? `Pieza ${treatment.tooth_number} · ` : ''}{statuses[treatment.status] ?? treatment.status} · {Number(treatment.cost).toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">{treatment.completed_at ? `Finalizado: ${treatment.completed_at}` : treatment.scheduled_for ? `Programado: ${treatment.scheduled_for}` : 'Sin fecha programada'}{treatment.dentist ? ` · ${treatment.dentist.name}` : ''}</p>
                                        </div>
                                        {canUpdate && <Link href={route('treatments.edit', [patient.id, treatment.id])} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 px-4 text-sm font-semibold text-violet-800">Editar</Link>}
                                    </article>)}
                                </div>}
                                {treatments.last_page > 1 && <nav aria-label="Paginación de tratamientos" className="flex flex-wrap gap-2 border-t border-slate-100 p-4">{treatments.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{paginationLabel(link.label)}</Link> : <span key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-400">{paginationLabel(link.label)}</span>)}</nav>}
                            </>}
                        </Deferred>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
