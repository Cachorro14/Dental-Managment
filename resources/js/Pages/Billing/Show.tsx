import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ReactNode, useState } from 'react';

type Entry = {
    id: number;
    type: 'charge' | 'payment';
    amount: string;
    description: string;
    payment_method: string | null;
    occurred_at: string;
    voided_at: string | null;
    void_reason: string | null;
    creator: { name: string } | null;
    voider: { name: string } | null;
    treatment: { id: number; name: string } | null;
};
type TreatmentOption = { id: number; name: string; cost: string; status: string };

export default function Show(props: {
    patient: { id: number; first_name: string; last_name: string };
    entries: Entry[];
    balance: string;
    chargesTotal: number;
    paymentsTotal: number;
    canCharge: boolean;
    canRegisterPayment: boolean;
    canVoid: boolean;
    treatments: TreatmentOption[];
}) {
    const { clinic } = usePage().props;
    const currency = clinic['clinic.currency'];
    const chargeForm = useForm({ amount: '', description: '', occurred_at: today() });
    const paymentForm = useForm({ amount: '', description: '', payment_method: 'cash', occurred_at: today() });
    const patientName = `${props.patient.first_name} ${props.patient.last_name}`;
    const formatAmount = (amount: string | number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(Number(amount));

    const submitCharge = (event: FormEvent) => {
        event.preventDefault();
        chargeForm.post(route('billing.charges.store', props.patient.id), { onSuccess: () => chargeForm.reset('amount', 'description') });
    };
    const submitPayment = (event: FormEvent) => {
        event.preventDefault();
        paymentForm.post(route('billing.payments.store', props.patient.id), { onSuccess: () => paymentForm.reset('amount', 'description') });
    };
    const voidForm = useForm({ void_reason: '' });
    const voidEntry = (entry: Entry) => {
        const reason = window.prompt('Motivo de anulación (el movimiento permanecerá en el historial):');
        if (reason?.trim()) {
            voidForm.setData('void_reason', reason.trim());
            voidForm.post(route('billing.entries.void', entry.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Estado de cuenta - ${patientName}`} />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <header className="flex flex-wrap items-end justify-between gap-4"><div><Link href={route('billing.index')} className="theme-accent text-sm font-semibold hover:underline">← Pacientes con adeudo</Link><h1 className="theme-content mt-2 text-2xl font-bold">Estado de cuenta</h1><p className="theme-content-secondary mt-1">{patientName} · #{props.patient.id}</p></div><div className="theme-danger rounded-2xl border px-5 py-4"><p className="text-sm font-semibold">Saldo pendiente</p><p className="mt-1 text-2xl font-bold tabular-nums">{formatAmount(props.balance)}</p></div></header>

                    <section className="grid gap-4 sm:grid-cols-2"><Summary label="Cargos vigentes" value={formatAmount(props.chargesTotal)} /><Summary label="Pagos registrados" value={formatAmount(props.paymentsTotal)} /></section>

                    {(props.canCharge || props.canRegisterPayment) && <section className="grid gap-6 lg:grid-cols-2">
                        {props.canCharge && <form onSubmit={submitCharge} className="space-y-4 rounded-2xl border theme-outline theme-card p-5 shadow-sm"><h2 className="text-lg font-bold theme-content">Registrar cargo manual</h2><Field label="Concepto"><input required maxLength={255} value={chargeForm.data.description} onChange={(event) => chargeForm.setData('description', event.target.value)} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Importe"><input required type="number" min="0.01" step="0.01" value={chargeForm.data.amount} onChange={(event) => chargeForm.setData('amount', event.target.value)} className={inputClass} /></Field><Field label="Fecha"><input required type="date" max={today()} value={chargeForm.data.occurred_at} onChange={(event) => chargeForm.setData('occurred_at', event.target.value)} className={inputClass} /></Field></div>{chargeForm.errors.amount && <p className="text-sm font-medium theme-content">{chargeForm.errors.amount}</p>}<button disabled={chargeForm.processing} className={buttonClass}>Registrar cargo</button></form>}
                        {props.canRegisterPayment && <form onSubmit={submitPayment} className="space-y-4 rounded-2xl border theme-outline theme-card p-5 shadow-sm"><h2 className="text-lg font-bold theme-content">Registrar pago</h2><Field label="Concepto"><input required maxLength={255} value={paymentForm.data.description} onChange={(event) => paymentForm.setData('description', event.target.value)} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Importe"><input required type="number" min="0.01" step="0.01" max={props.balance} value={paymentForm.data.amount} onChange={(event) => paymentForm.setData('amount', event.target.value)} className={inputClass} /></Field><Field label="Método"><select value={paymentForm.data.payment_method} onChange={(event) => paymentForm.setData('payment_method', event.target.value)} className={inputClass}><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="transfer">Transferencia</option><option value="other">Otro</option></select></Field></div><Field label="Fecha"><input required type="date" max={today()} value={paymentForm.data.occurred_at} onChange={(event) => paymentForm.setData('occurred_at', event.target.value)} className={inputClass} /></Field>{paymentForm.errors.amount && <p className="text-sm font-medium theme-content">{paymentForm.errors.amount}</p>}<button disabled={paymentForm.processing || Number(props.balance) <= 0} className={buttonClass}>Registrar pago</button></form>}
                    </section>}

                    {props.canCharge && props.treatments.length > 0 && <section className="theme-info rounded-2xl border p-5"><h2 className="text-lg font-bold">Cargos de tratamientos</h2><p className="mt-1 text-sm">Confirma explícitamente cuando el cargo deba aparecer en el estado de cuenta.</p><ul className="mt-4 divide-y divide-current/20">{props.treatments.map((treatment) => <li key={treatment.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="text-sm font-semibold">{treatment.name} · {formatAmount(treatment.cost)}</span><Link as="button" method="post" href={route('billing.treatments.charge', [props.patient.id, treatment.id])} className="theme-accent-button inline-flex min-h-10 items-center rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent">Generar cargo</Link></li>)}</ul></section>}

                    <section className="theme-card overflow-hidden rounded-2xl border theme-outline shadow-sm"><div className="border-b theme-outline px-5 py-4"><h2 className="text-lg font-bold theme-content">Historial de movimientos</h2></div>{props.entries.length === 0 ? <p className="theme-content-secondary p-5 text-sm">Aún no hay movimientos registrados.</p> : <ul className="divide-y divide-outline">{props.entries.map((entry) => <li key={entry.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md px-2 py-1 font-bold ${entry.voided_at ? 'theme-muted-surface theme-content-muted' : entry.type === 'charge' ? 'theme-danger' : 'theme-success'}`}>{entry.type === 'charge' ? 'Cargo' : 'Pago'}</span><span className="text-sm font-semibold theme-content">{entry.description}</span>{entry.voided_at && <span className="rounded-full theme-muted-surface px-2 py-1 text-xs font-bold theme-content-secondary">Anulado</span>}</div><p className="mt-1 text-sm theme-content-muted">{new Date(entry.occurred_at).toLocaleString('es-MX')} · Registró {entry.creator?.name ?? 'Usuario'}</p>{entry.payment_method && <p className="mt-1 text-sm theme-content-secondary">Método: {paymentMethodLabel(entry.payment_method)}</p>}{entry.voided_at && <p className="mt-1 text-sm theme-content-secondary">Anulado por {entry.voider?.name ?? 'Usuario'}: {entry.void_reason}</p>}</div><div className="flex items-center gap-3"><span className={`whitespace-nowrap rounded-md px-2 py-1 font-bold tabular-nums ${entry.voided_at ? 'theme-content-muted line-through' : entry.type === 'charge' ? 'theme-danger' : 'theme-success'}`}>{entry.type === 'charge' ? '+' : '−'}{formatAmount(entry.amount)}</span>{props.canVoid && !entry.voided_at && <button type="button" onClick={() => voidEntry(entry)} className="theme-content-secondary min-h-10 rounded-xl border theme-outline-strong px-3 text-sm font-semibold transition hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-accent">Anular</button>}</div></li>)}</ul>}</section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border theme-outline theme-card p-5 shadow-sm"><p className="text-sm font-medium theme-content-muted">{label}</p><p className="mt-1 text-xl font-bold tabular-nums theme-content">{value}</p></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block space-y-1.5 text-sm font-semibold theme-content-secondary"><span>{label}</span>{children}</label>; }
function today() { return new Date().toLocaleDateString('en-CA'); }
function paymentMethodLabel(method: string) { return ({ cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro' } as Record<string, string>)[method] ?? method; }
const inputClass = 'min-h-11 w-full rounded-xl border theme-outline-strong px-3 py-2 text-sm theme-content focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent';
const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-xl theme-accent-button px-4 py-2 text-sm font-semibold theme-content-inverse hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50';
