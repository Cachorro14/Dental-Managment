import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

type BillingPatient = { id: number; first_name: string; last_name: string; balance: string };

export default function Index({ patients }: { patients: BillingPatient[] }) {
    const currency = usePage().props.clinic['clinic.currency'];

    return (
        <AuthenticatedLayout>
            <Head title="Estado financiero" />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <header className="flex flex-wrap items-end justify-between gap-4">
                        <div><p className="text-sm font-semibold text-teal-700">Módulo financiero</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Pacientes con adeudo</h1><p className="mt-2 text-sm text-slate-600">Registro histórico de cargos y pagos; no se procesan transacciones.</p></div>
                    </header>
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {patients.length === 0 ? <p className="p-6 text-sm text-slate-600">No hay pacientes con adeudos pendientes.</p> : (
                            <ul className="divide-y divide-slate-100">
                                {patients.map((patient) => <li key={patient.id}><Link href={route('billing.show', patient.id)} className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-red-50 focus:bg-red-50 focus:outline-none"><span className="font-bold text-red-700">{patient.first_name} {patient.last_name}</span><span className="font-bold tabular-nums text-red-700">{new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(patient.balance))}</span></Link></li>)}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
