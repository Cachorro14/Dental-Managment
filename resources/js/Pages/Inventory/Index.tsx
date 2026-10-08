import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Movement = { id: number; type: 'in' | 'out'; quantity: string; stock_after: string; reason: string; creator: { name: string } | null; created_at: string };
type Item = { id: number; name: string; sku: string | null; category: string | null; unit: string; current_stock: string; minimum_stock: string; unit_cost: string | null; movements: Movement[] };

export default function Index({ items, canCreate, canAdjust }: { items: Item[]; canCreate: boolean; canAdjust: boolean }) {
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const itemForm = useForm({ name: '', sku: '', category: '', unit: 'pieza', minimum_stock: '0', unit_cost: '' });
    const movementForm = useForm({ type: 'in' as 'in' | 'out', quantity: '', reason: '' });
    const submitItem = (event: FormEvent) => { event.preventDefault(); itemForm.post(route('inventory.store'), { onSuccess: () => itemForm.reset() }); };
    const submitMovement = (event: FormEvent) => { event.preventDefault(); if (selectedItem) movementForm.post(route('inventory.movements.store', selectedItem), { onSuccess: () => movementForm.reset() }); };

    return <AuthenticatedLayout header={<h1 className="text-xl font-semibold theme-content-secondary">Inventario</h1>}>
        <Head title="Inventario" />
        <div className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6">
            <header><p className="theme-accent text-sm font-semibold">Control de existencias</p><h2 className="mt-1 text-2xl font-bold theme-content">Materiales e insumos</h2><p className="mt-2 text-sm theme-content-secondary">Registra existencias y movimientos de entrada o salida para conocer cuándo reponer.</p></header>
            {canCreate && <form onSubmit={submitItem} className="theme-card grid gap-4 rounded-2xl border theme-outline p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2"><InputLabel htmlFor="name" value="Artículo" /><TextInput id="name" value={itemForm.data.name} onChange={(e) => itemForm.setData('name', e.target.value)} className="mt-1 w-full" required /><InputError message={itemForm.errors.name} /></div>
                {(['sku', 'category', 'unit', 'minimum_stock', 'unit_cost'] as const).map((field) => <div key={field}><InputLabel htmlFor={field} value={{ sku: 'SKU', category: 'Categoría', unit: 'Unidad', minimum_stock: 'Mínimo', unit_cost: 'Costo unitario' }[field]} /><TextInput id={field} type={field === 'minimum_stock' || field === 'unit_cost' ? 'number' : 'text'} step={field === 'minimum_stock' ? '0.001' : '0.01'} value={itemForm.data[field]} onChange={(e) => itemForm.setData(field, e.target.value)} className="mt-1 w-full" /><InputError message={itemForm.errors[field]} /></div>)}
                <div className="flex items-end"><PrimaryButton disabled={itemForm.processing}>Agregar artículo</PrimaryButton></div>
            </form>}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const low = Number(item.current_stock) <= Number(item.minimum_stock); return <article key={item.id} className={`theme-card rounded-2xl border p-5 shadow-sm ${low ? 'border-danger' : 'theme-outline'}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold theme-content">{item.name}</h3><p className="text-xs theme-content-muted">{item.sku ?? 'Sin SKU'}{item.category ? ` · ${item.category}` : ''}</p></div><span className={low ? 'theme-danger-foreground text-xs font-bold' : 'theme-success-foreground text-xs font-bold'}>{low ? 'Reponer' : 'Disponible'}</span></div><p className="mt-5 text-3xl font-bold theme-content">{Number(item.current_stock).toLocaleString('es-MX')} <span className="text-sm font-medium theme-content-muted">{item.unit}</span></p><p className="mt-1 text-xs theme-content-muted">Mínimo: {Number(item.minimum_stock).toLocaleString('es-MX')} · {item.movements.length} movimientos</p>{canAdjust && <button type="button" onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)} className="theme-accent-button mt-4 min-h-11 w-full rounded-xl px-4 text-sm font-semibold">Registrar movimiento</button>}{selectedItem === item.id && <form onSubmit={submitMovement} className="mt-4 space-y-3 border-t theme-outline pt-4"><select value={movementForm.data.type} onChange={(e) => movementForm.setData('type', e.target.value as 'in' | 'out')} className="theme-content min-h-11 w-full rounded-xl border-outline-strong bg-surface-raised"><option value="in">Entrada</option><option value="out">Salida</option></select><TextInput type="number" min="0.001" step="0.001" placeholder="Cantidad" value={movementForm.data.quantity} onChange={(e) => movementForm.setData('quantity', e.target.value)} className="w-full" required /><InputError message={movementForm.errors.quantity} /><textarea placeholder="Motivo" value={movementForm.data.reason} onChange={(e) => movementForm.setData('reason', e.target.value)} className="theme-content min-h-20 w-full rounded-xl border-outline-strong bg-surface-raised" required /><InputError message={movementForm.errors.reason} /><PrimaryButton disabled={movementForm.processing}>Guardar movimiento</PrimaryButton></form>}</article>; })}</section>
            {items.length === 0 && <p className="theme-card rounded-2xl p-6 text-sm theme-content-secondary">Aún no hay artículos registrados.</p>}
        </div></div>
    </AuthenticatedLayout>;
}
