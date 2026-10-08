import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionLink from '@/Components/ActionLink';
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold theme-content-secondary">Tratamientos</h2>}>
            <Head title={`Tratamientos - ${patientName}`} />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 rounded-2xl theme-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                        <div><h1 className="text-xl font-semibold theme-content">{patientName}</h1><p className="text-sm theme-content-muted">Plan e historial de tratamientos</p></div>
                        <div className="flex flex-wrap gap-3">
                            <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center rounded-xl border theme-outline-strong px-4 text-sm font-semibold theme-content-secondary">Paciente</Link>
                            {canCreate && <Link href={route('treatments.create', patient.id)} className="inline-flex min-h-11 items-center rounded-xl theme-accent-button px-4 text-sm font-semibold theme-content-inverse">Registrar tratamiento</Link>}
                        </div>
                    </section>
                    <section className="overflow-hidden rounded-2xl theme-card shadow-sm">
                        <div className="border-b theme-outline px-5 py-4"><h2 className="font-semibold theme-content">Tratamientos registrados</h2></div>
                        <Deferred data="treatments" fallback={<p className="p-6 text-sm theme-content-muted">Cargando tratamientos...</p>}>
                            {() => <>
                                {treatments.data.length === 0 ? <p className="p-6 text-sm theme-content-muted">Aún no hay tratamientos registrados para este paciente.</p> : <div className="divide-y divide-outline">
                                    {treatments.data.map((treatment) => <article key={treatment.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold theme-content">{treatment.name}</h3>
                                            <p className="text-sm theme-content-secondary">{treatment.tooth_number ? `Pieza ${treatment.tooth_number} · ` : ''}{statuses[treatment.status] ?? treatment.status} · {Number(treatment.cost).toFixed(2)}</p>
                                            <p className="text-xs theme-content-muted">{treatment.completed_at ? `Finalizado: ${treatment.completed_at}` : treatment.scheduled_for ? `Programado: ${treatment.scheduled_for}` : 'Sin fecha programada'}{treatment.dentist ? ` · ${treatment.dentist.name}` : ''}</p>
                                        </div>
                                         {canUpdate && <ActionLink href={route('treatments.edit', [patient.id, treatment.id])} icon="edit" variant="accent">Editar</ActionLink>}
                                    </article>)}
                                </div>}
                                {treatments.last_page > 1 && <nav aria-label="Paginación de tratamientos" className="flex flex-wrap gap-2 border-t theme-outline p-4">{treatments.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'theme-accent-button' : 'theme-muted-surface theme-content-secondary'}`}>{paginationLabel(link.label)}</Link> : <span key={index} className="theme-content-muted rounded-lg theme-page px-3 py-2 text-sm">{paginationLabel(link.label)}</span>)}</nav>}
                            </>}
                        </Deferred>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
