import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

type Metrics = { patients: number; appointmentsThisMonth: number; completedTreatmentsThisMonth: number; inventoryLow: number; chargesThisMonth: string; paymentsThisMonth: string };

export default function Index({ metrics, period }: { metrics: Metrics; period: string }) {
    const cards = [['Pacientes registrados', metrics.patients], ['Citas del mes', metrics.appointmentsThisMonth], ['Tratamientos completados', metrics.completedTreatmentsThisMonth], ['Artículos por reponer', metrics.inventoryLow], ['Cargos del mes', `$${Number(metrics.chargesThisMonth).toFixed(2)}`], ['Pagos del mes', `$${Number(metrics.paymentsThisMonth).toFixed(2)}`]];
    return <AuthenticatedLayout header={<h1 className="text-xl font-semibold theme-content-secondary">Reportes</h1>}><Head title="Reportes" /><div className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6"><header><p className="theme-accent text-sm font-semibold">Resumen operativo</p><h2 className="mt-1 text-2xl font-bold theme-content">Indicadores de {period}</h2><p className="mt-2 text-sm theme-content-secondary">Consulta rápida del estado de la clínica. Los datos respetan la información registrada en cada módulo.</p></header><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, value]) => <article key={String(label)} className="theme-card rounded-2xl border theme-outline p-5 shadow-sm"><p className="text-sm theme-content-secondary">{label}</p><p className="mt-3 text-3xl font-bold theme-content">{value}</p></article>)}</section></div></div></AuthenticatedLayout>;
}
