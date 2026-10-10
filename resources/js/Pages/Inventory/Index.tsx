import ActionButton from "@/Components/ActionButton";
import Icon from "@/Components/Icon";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { FormEvent, useEffect, useState } from "react";

type InventoryItem = {
    id: number;
    name: string;
    sku: string | null;
    category: string | null;
    description: string | null;
    image_path: string | null;
    unit: string;
    current_stock: string;
    minimum_stock: string;
    unit_cost: string | null;
    supplier: string | null;
    lot: string | null;
    expires_at: string | null;
    notes: string | null;
    movements_count: number;
};

type PaginatedItems = {
    data: InventoryItem[];
    links: { url: string | null; label: string; active: boolean }[];
};
type ItemFormData = {
    name: string;
    sku: string;
    category: string;
    description: string;
    image: File | null;
    initial_stock: string;
    unit: string;
    minimum_stock: string;
    unit_cost: string;
    supplier: string;
    lot: string;
    expires_at: string;
    notes: string;
};

const initialItemForm: ItemFormData = {
    name: "",
    sku: "",
    category: "",
    description: "",
    image: null,
    initial_stock: "0",
    unit: "pieza",
    minimum_stock: "0",
    unit_cost: "",
    supplier: "",
    lot: "",
    expires_at: "",
    notes: "",
};
const statusCopy = {
    available: ["Disponible", "theme-success"],
    low: ["Stock bajo", "theme-warning"],
    reorder: ["Reponer", "theme-danger"],
    out_of_stock: ["Agotado", "theme-danger"],
} as const;

export default function Index({
    items,
    summary,
    categories,
    filters,
    canCreate,
    canUpdate,
    canAdjust,
}: {
    items: PaginatedItems;
    summary: {
        totalItems: number;
        lowStock: number;
        reorder: number;
        estimatedValue: number;
    };
    categories: string[];
    filters: { search: string; category: string; status: string };
    canCreate: boolean;
    canUpdate: boolean;
    canAdjust: boolean;
}) {
    const [itemModal, setItemModal] = useState<"create" | "edit" | null>(null);
    const [movementItem, setMovementItem] = useState<InventoryItem | null>(
        null,
    );
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [category, setCategory] = useState(filters.category);
    const [status, setStatus] = useState(filters.status);
    const itemForm = useForm<ItemFormData>(initialItemForm);
    const movementForm = useForm({ type: "in", quantity: "", reason: "" });

    const openCreate = () => {
        setEditingItem(null);
        itemForm.reset();
        itemForm.clearErrors();
        setItemModal("create");
    };
    const openEdit = (item: InventoryItem) => {
        setEditingItem(item);
        itemForm.setData({
            name: item.name,
            sku: item.sku ?? "",
            category: item.category ?? "",
            description: item.description ?? "",
            image: null,
            initial_stock: "0",
            unit: item.unit,
            minimum_stock: item.minimum_stock,
            unit_cost: item.unit_cost ?? "",
            supplier: item.supplier ?? "",
            lot: item.lot ?? "",
            expires_at: item.expires_at ?? "",
            notes: item.notes ?? "",
        });
        itemForm.clearErrors();
        setItemModal("edit");
    };
    const closeItemModal = () => {
        if (!itemForm.processing) setItemModal(null);
    };
    const submitItem = (event: FormEvent) => {
        event.preventDefault();
        if (itemModal === "edit" && editingItem) {
            itemForm.transform((data) => ({ ...data, _method: "patch" }));
            itemForm.post(route("inventory.update", editingItem.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setItemModal(null),
            });
            return;
        }
        itemForm.post(route("inventory.store"), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                itemForm.reset();
                setItemModal(null);
            },
        });
    };
    const submitMovement = (event: FormEvent) => {
        event.preventDefault();
        if (!movementItem) return;
        movementForm.post(route("inventory.movements.store", movementItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                movementForm.reset();
                setMovementItem(null);
            },
        });
    };
    useEffect(() => {
        if (search === filters.search && category === filters.category && status === filters.status) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                route("inventory.index"),
                { search, category, status },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [category, filters.category, filters.search, filters.status, search, status]);

    const preventSubmit = (event: FormEvent) => {
        event.preventDefault();
    };

    return (
        <AuthenticatedLayout
            header={
                <h1 className="text-xl font-semibold theme-content">
                    Inventario
                </h1>
            }
        >
            <Head title="Inventario" />
            <main className="min-h-[calc(100vh-5rem)] theme-page px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="theme-accent text-sm font-semibold">
                                Control de existencias
                            </p>
                            <h2 className="mt-1 text-2xl font-bold theme-content sm:text-3xl">
                                Insumos clínicos al alcance
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm theme-content-secondary">
                                Consulta disponibilidad, identifica faltantes y
                                registra movimientos sin perder el contexto del
                                artículo.
                            </p>
                        </div>
                        {canCreate && (
                            <PrimaryButton
                                type="button"
                                onClick={openCreate}
                                icon="add"
                                className="min-h-11 justify-center rounded-xl normal-case tracking-normal"
                            >
                                Agregar artículo
                            </PrimaryButton>
                        )}
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            label="Total de artículos"
                            value={summary.totalItems.toLocaleString("es-MX")}
                            tone="theme-info"
                        />
                        <Metric
                            label="Con stock bajo"
                            value={summary.lowStock.toLocaleString("es-MX")}
                            tone="theme-warning"
                        />
                        <Metric
                            label="Por reponer"
                            value={summary.reorder.toLocaleString("es-MX")}
                            tone="theme-danger"
                        />
                        <Metric
                            label="Valor estimado"
                            value={new Intl.NumberFormat("es-MX", {
                                style: "currency",
                                currency: "MXN",
                                maximumFractionDigits: 0,
                            }).format(summary.estimatedValue)}
                            tone="theme-success"
                        />
                    </section>

                    <section className="theme-card rounded-2xl border theme-outline p-4 shadow-sm">
                        <form
                            onSubmit={preventSubmit}
                            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]"
                        >
                            <label className="relative block ">
                                <span className="sr-only">
                                    Buscar artículos
                                </span>
                                <Icon
                                    name="search"
                                    className={`pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 theme-content-muted mx-2 transition-opacity ${search ? 'opacity-0' : 'opacity-100'}`}
                                />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por nombre o SKU"
                                    className="theme-content min-h-11 w-full rounded-xl border-outline-strong bg-surface-raised pl-10 pr-3 text-sm shadow-sm placeholder:translate-x-7 focus:border-accent focus:ring-accent"
                                />
                            </label>
                            <select
                                value={filters.category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                className="theme-content min-h-11 rounded-xl border-outline-strong bg-surface-raised text-sm shadow-sm focus:border-accent focus:ring-accent"
                            >
                                <option value="">Todas las categorías</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="theme-content min-h-11 rounded-xl border-outline-strong bg-surface-raised text-sm shadow-sm focus:border-accent focus:ring-accent"
                            >
                                <option value="">Todos los estados</option>
                                <option value="available">Disponible</option>
                                <option value="low">Stock bajo</option>
                                <option value="reorder">Reponer</option>
                                <option value="out_of_stock">Agotado</option>
                            </select>
                        </form>
                    </section>

                    {items.data.length > 0 ? (
                        <>
                            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {items.data.map((item) => (
                                    <InventoryCard
                                        key={item.id}
                                        item={item}
                                        canAdjust={canAdjust}
                                        canUpdate={canUpdate}
                                        onMove={() => {
                                            movementForm.reset();
                                            movementForm.clearErrors();
                                            setMovementItem(item);
                                        }}
                                        onEdit={() => openEdit(item)}
                                    />
                                ))}
                            </section>
                            <Pagination links={items.links} />
                        </>
                    ) : (
                        <section className="theme-card rounded-2xl border theme-outline px-6 py-16 text-center shadow-sm">
                            <div className="theme-info mx-auto grid h-14 w-14 place-items-center rounded-2xl border">
                                <Icon name="inventory" className="h-7 w-7" />
                            </div>
                            <h3 className="mt-5 text-lg font-semibold theme-content">
                                No hay artículos para mostrar
                            </h3>
                            <p className="mt-2 text-sm theme-content-muted">
                                {filters.search ||
                                filters.category ||
                                filters.status
                                    ? "Prueba ajustando los filtros."
                                    : "Registra el primer insumo para iniciar el control de existencias."}
                            </p>
                            {canCreate &&
                                !filters.search &&
                                !filters.category &&
                                !filters.status && (
                                    <PrimaryButton
                                        type="button"
                                        icon="add"
                                        onClick={openCreate}
                                        className="mt-6 normal-case tracking-normal"
                                    >
                                        Agregar artículo
                                    </PrimaryButton>
                                )}
                        </section>
                    )}
                </div>
            </main>
            <ItemModal
                show={itemModal !== null}
                editing={itemModal === "edit"}
                form={itemForm}
                onClose={closeItemModal}
                onSubmit={submitItem}
            />
            <MovementModal
                item={movementItem}
                form={movementForm}
                onClose={() =>
                    !movementForm.processing && setMovementItem(null)
                }
                onSubmit={submitMovement}
            />
        </AuthenticatedLayout>
    );
}

function Metric({
    label,
    value,
    tone,
}: {
    label: string;
    value: string;
    tone: string;
}) {
    return (
        <article className="theme-card rounded-2xl border theme-outline p-5 shadow-sm">
            <div className={`mb-4 h-2 w-12 rounded-full ${tone}`} />
            <p className="text-sm theme-content-secondary">{label}</p>
            <p className="mt-1 text-2xl font-bold theme-content">{value}</p>
        </article>
    );
}

function InventoryCard({
    item,
    canAdjust,
    canUpdate,
    onMove,
    onEdit,
}: {
    item: InventoryItem;
    canAdjust: boolean;
    canUpdate: boolean;
    onMove: () => void;
    onEdit: () => void;
}) {
    const stock = Number(item.current_stock);
    const minimum = Number(item.minimum_stock);
    const status =
        stock === 0
            ? "out_of_stock"
            : stock < minimum
              ? "reorder"
              : stock === minimum
                ? "low"
                : "available";
    const [label, tone] = statusCopy[status];
    return (
        <article className="theme-card overflow-hidden rounded-2xl border theme-outline shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="relative aspect-[16/8] overflow-hidden theme-muted-surface">
                {item.image_path ? (
                    <img
                        src={`/storage/${item.image_path}`}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="grid h-full place-items-center">
                        <Icon
                            name="inventory"
                            className="h-12 w-12 theme-content-muted"
                        />
                    </div>
                )}
                <span
                    className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}
                >
                    {label}
                </span>
            </div>
            <div className="space-y-4 p-5">
                <div>
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 font-semibold theme-content">
                            {item.name}
                        </h3>
                        {canUpdate && (
                            <button
                                type="button"
                                onClick={onEdit}
                                className="theme-content-muted rounded-lg p-2 transition hover:bg-surface-sunken hover:theme-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                aria-label={`Editar ${item.name}`}
                            >
                                <Icon name="edit" />
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-xs theme-content-muted">
                        {item.sku || "Sin SKU"}
                        {item.category ? ` · ${item.category}` : ""}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 rounded-xl theme-muted-surface p-3">
                    <div>
                        <p className="text-xs theme-content-muted">
                            Disponible
                        </p>
                        <p className="mt-1 text-xl font-bold theme-content">
                            {stock.toLocaleString("es-MX")}{" "}
                            <span className="text-xs font-medium theme-content-muted">
                                {item.unit}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs theme-content-muted">
                            Stock mínimo
                        </p>
                        <p className="mt-1 font-semibold theme-content-secondary">
                            {minimum.toLocaleString("es-MX")} {item.unit}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs theme-content-muted">
                    <span>
                        {item.supplier
                            ? `Proveedor: ${item.supplier}`
                            : "Sin proveedor"}
                    </span>
                    <span>{item.movements_count} movimientos</span>
                </div>
                {canAdjust && (
                    <ActionButton
                        type="button"
                        icon="inventory"
                        variant="accent"
                        onClick={onMove}
                        className="w-full"
                    >
                        Registrar movimiento
                    </ActionButton>
                )}
            </div>
        </article>
    );
}

function ItemModal({
    show,
    editing,
    form,
    onClose,
    onSubmit,
}: {
    show: boolean;
    editing: boolean;
    form: ReturnType<typeof useForm<ItemFormData>>;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <form onSubmit={onSubmit}>
                <div className="flex items-center justify-between border-b theme-outline px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold theme-content">
                            {editing ? "Editar artículo" : "Agregar artículo"}
                        </h2>
                        <p className="mt-1 text-sm theme-content-muted">
                            Completa la información para mantener trazabilidad
                            clínica.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="theme-content-muted rounded-lg p-2 hover:bg-surface-sunken"
                        aria-label="Cerrar"
                    >
                        <Icon name="close" />
                    </button>
                </div>
                <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nombre" error={form.errors.name}>
                            <TextInput
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </Field>
                        <Field label="SKU" error={form.errors.sku}>
                            <TextInput
                                value={form.data.sku}
                                onChange={(e) =>
                                    form.setData("sku", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                        <Field label="Categoría" error={form.errors.category}>
                            <TextInput
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData("category", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                        <Field label="Unidad" error={form.errors.unit}>
                            <TextInput
                                value={form.data.unit}
                                onChange={(e) =>
                                    form.setData("unit", e.target.value)
                                }
                                className="w-full"
                                required
                            />
                        </Field>
                        {!editing && (
                            <Field
                                label="Existencia inicial"
                                error={form.errors.initial_stock}
                            >
                                <TextInput
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={form.data.initial_stock}
                                    onChange={(e) =>
                                        form.setData(
                                            "initial_stock",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full"
                                    required
                                />
                            </Field>
                        )}
                        <Field
                            label="Stock mínimo"
                            error={form.errors.minimum_stock}
                        >
                            <TextInput
                                type="number"
                                min="0"
                                step="0.001"
                                value={form.data.minimum_stock}
                                onChange={(e) =>
                                    form.setData(
                                        "minimum_stock",
                                        e.target.value,
                                    )
                                }
                                className="w-full"
                                required
                            />
                        </Field>
                        <Field
                            label="Costo unitario"
                            error={form.errors.unit_cost}
                        >
                            <TextInput
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.unit_cost}
                                onChange={(e) =>
                                    form.setData("unit_cost", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                        <Field label="Proveedor" error={form.errors.supplier}>
                            <TextInput
                                value={form.data.supplier}
                                onChange={(e) =>
                                    form.setData("supplier", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                        <Field label="Lote" error={form.errors.lot}>
                            <TextInput
                                value={form.data.lot}
                                onChange={(e) =>
                                    form.setData("lot", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                        <Field
                            label="Fecha de caducidad"
                            error={form.errors.expires_at}
                        >
                            <TextInput
                                type="date"
                                value={form.data.expires_at}
                                onChange={(e) =>
                                    form.setData("expires_at", e.target.value)
                                }
                                className="w-full"
                            />
                        </Field>
                    </div>
                    <Field label="Descripción" error={form.errors.description}>
                        <textarea
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                            className="theme-content min-h-20 w-full rounded-xl border-outline-strong bg-surface-raised text-sm focus:border-accent focus:ring-accent"
                        />
                    </Field>
                    <Field
                        label="Imagen del producto"
                        error={form.errors.image}
                    >
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                                form.setData(
                                    "image",
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="theme-content block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-surface-sunken file:px-3 file:py-2 file:font-semibold file:theme-content"
                        />
                    </Field>
                    <Field label="Observaciones" error={form.errors.notes}>
                        <textarea
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData("notes", e.target.value)
                            }
                            className="theme-content min-h-20 w-full rounded-xl border-outline-strong bg-surface-raised text-sm focus:border-accent focus:ring-accent"
                        />
                    </Field>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t theme-outline px-6 py-4 sm:flex-row sm:justify-end">
                    <ActionButton type="button" icon="close" onClick={onClose}>
                        Cancelar
                    </ActionButton>
                    <PrimaryButton
                        disabled={form.processing}
                        icon="save"
                        className="justify-center normal-case tracking-normal"
                    >
                        {editing ? "Guardar cambios" : "Crear artículo"}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function MovementModal({
    item,
    form,
    onClose,
    onSubmit,
}: {
    item: InventoryItem | null;
    form: ReturnType<
        typeof useForm<{ type: string; quantity: string; reason: string }>
    >;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}) {
    const adjustment = form.data.type === "adjustment";
    return (
        <Modal show={item !== null} onClose={onClose} maxWidth="md">
            <form onSubmit={onSubmit}>
                <div className="flex items-center justify-between border-b theme-outline px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold theme-content">
                            Registrar movimiento
                        </h2>
                        <p className="mt-1 text-sm theme-content-muted">
                            {item?.name} · Disponible:{" "}
                            {Number(item?.current_stock ?? 0).toLocaleString(
                                "es-MX",
                            )}{" "}
                            {item?.unit}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="theme-content-muted rounded-lg p-2 hover:bg-surface-sunken"
                        aria-label="Cerrar"
                    >
                        <Icon name="close" />
                    </button>
                </div>
                <div className="space-y-4 px-6 py-5">
                    <Field label="Tipo" error={form.errors.type}>
                        <select
                            value={form.data.type}
                            onChange={(e) =>
                                form.setData("type", e.target.value)
                            }
                            className="theme-content min-h-11 w-full rounded-xl border-outline-strong bg-surface-raised text-sm focus:border-accent focus:ring-accent"
                        >
                            <option value="in">Entrada</option>
                            <option value="out">Salida</option>
                            <option value="adjustment">
                                Ajuste de inventario
                            </option>
                            <option value="waste">Merma</option>
                            <option value="restock">Reposición</option>
                        </select>
                    </Field>
                    <Field
                        label={
                            adjustment ? "Existencia física final" : "Cantidad"
                        }
                        error={form.errors.quantity}
                    >
                        <TextInput
                            type="number"
                            min={adjustment ? "0.001" : "0.001"}
                            step="0.001"
                            value={form.data.quantity}
                            onChange={(e) =>
                                form.setData("quantity", e.target.value)
                            }
                            className="w-full"
                            required
                        />
                    </Field>
                    {adjustment && (
                        <p className="rounded-xl theme-info border p-3 text-sm">
                            El ajuste establecerá la existencia final del
                            artículo.
                        </p>
                    )}
                    <Field label="Motivo" error={form.errors.reason}>
                        <textarea
                            value={form.data.reason}
                            onChange={(e) =>
                                form.setData("reason", e.target.value)
                            }
                            className="theme-content min-h-24 w-full rounded-xl border-outline-strong bg-surface-raised text-sm focus:border-accent focus:ring-accent"
                            required
                        />
                    </Field>
                </div>
                <div className="flex flex-col-reverse gap-3 border-t theme-outline px-6 py-4 sm:flex-row sm:justify-end">
                    <ActionButton type="button" icon="close" onClick={onClose}>
                        Cancelar
                    </ActionButton>
                    <PrimaryButton
                        disabled={form.processing}
                        icon="save"
                        className="justify-center normal-case tracking-normal"
                    >
                        Guardar movimiento
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <InputLabel value={label} />
            <div className="mt-1">{children}</div>
            <InputError message={error} className="mt-1" />
        </div>
    );
}
function Pagination({ links }: { links: PaginatedItems["links"] }) {
    if (links.length <= 3) return null;
    return (
        <nav className="flex flex-wrap gap-2" aria-label="Paginación">
            {links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        className={`rounded-lg px-3 py-2 text-sm font-medium ${link.active ? "theme-accent-button" : "theme-card border theme-outline theme-content-secondary hover:bg-surface-sunken"}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ) : (
                    <span
                        key={index}
                        className="rounded-lg px-3 py-2 text-sm theme-content-muted"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
