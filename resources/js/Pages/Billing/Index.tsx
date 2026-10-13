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
                        <div><p className="theme-accent text-sm font-semibold">Módulo financiero</p><h1 className="mt-1 text-2xl font-bold theme-content">Estados de cuenta</h1><p className="theme-content-secondary mt-2 text-sm">Registro histórico de cargos y pagos; no se procesan transacciones.</p></div>
                    </header>
                    <section className="overflow-hidden rounded-2xl border theme-outline theme-card shadow-sm">
                        {patients.length === 0 ? <p className="p-6 text-sm theme-content-secondary">No hay estados de cuenta registrados.</p> : (
                            <ul className="divide-y divide-outline">
                                {patients.map((patient) => {
                                    const hasNegativeBalance = Number(patient.balance) < 0;

                                    return <li key={patient.id}><Link href={route('billing.show', patient.id)} className={`flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 py-4 transition focus:outline-none ${hasNegativeBalance ? 'hover:theme-danger focus:theme-danger' : 'hover:theme-success focus:theme-success'}`}><span className={`font-bold ${hasNegativeBalance ? 'theme-danger-foreground' : 'theme-success-foreground'}`}>{patient.first_name} {patient.last_name}</span><span className={`font-bold tabular-nums ${hasNegativeBalance ? 'theme-danger-foreground' : 'theme-success-foreground'}`}>{new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(patient.balance))}</span></Link></li>;
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
