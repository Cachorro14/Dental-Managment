import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { OdontogramAssessmentSummary, OdontogramEntry, OdontogramFinding, OdontogramStatus, OdontogramSurface, Patient } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

const statuses: Array<{ value: OdontogramStatus; label: string }> = [
    { value: 'not_assessed', label: 'Sin revisar' },
    { value: 'healthy', label: 'Sana' },
    { value: 'caries', label: 'Caries' },
    { value: 'filled', label: 'Restaurada' },
    { value: 'crown', label: 'Corona' },
    { value: 'missing', label: 'Ausente' },
    { value: 'extraction', label: 'Extracción indicada' },
    { value: 'other', label: 'Otro estado' },
];

const conditions: Array<{ value: OdontogramFinding['condition']; label: string }> = [
    { value: 'caries', label: 'Caries' },
    { value: 'restoration', label: 'Restauración' },
    { value: 'fracture', label: 'Fractura' },
    { value: 'wear', label: 'Desgaste' },
    { value: 'lesion', label: 'Lesión' },
    { value: 'sealant', label: 'Sellador' },
    { value: 'other', label: 'Otro hallazgo' },
];

const severities: Array<{ value: OdontogramFinding['severity']; label: string }> = [
    { value: 'mild', label: 'Leve' },
    { value: 'moderate', label: 'Moderada' },
    { value: 'severe', label: 'Severa' },
];

const surfaceLabels: Record<OdontogramSurface, string> = {
    mesial: 'Mesial',
    distal: 'Distal',
    vestibular: 'Vestibular',
    lingual: 'Lingual / palatina',
    occlusal: 'Oclusal',
    incisal: 'Incisal',
};

const quadrantLabels: Record<number, string> = {
    1: 'Superior derecho',
    2: 'Superior izquierdo',
    3: 'Inferior izquierdo',
    4: 'Inferior derecho',
};

type AssessmentDetails = { id: number; assessed_at: string; created_by: string; notes: string } | null;

type OdontogramPageProps = {
    patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    entries?: OdontogramEntry[];
    canEdit: boolean;
    assessment: AssessmentDetails;
    history?: OdontogramAssessmentSummary[];
};

export default function Edit(props: OdontogramPageProps) {
    if (!props.entries) {
        const { patient } = props;

        return <AuthenticatedLayout header={<div><p className="text-sm font-medium text-blue-600">Odontograma</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{patient.first_name} {patient.last_name}</h1></div>}><Head title={`Odontograma: ${patient.first_name} ${patient.last_name}`} /><div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white shadow-sm"><ToothLoader label="Cargando odontograma del paciente" /></div></div></AuthenticatedLayout>;
    }

    return <EditLoaded {...props} entries={props.entries} />;
}

function EditLoaded({
    patient,
    entries,
    canEdit,
    assessment,
    history,
}: {
    patient: Pick<Patient, 'id' | 'first_name' | 'last_name'>;
    entries: OdontogramEntry[];
    canEdit: boolean;
    assessment: AssessmentDetails;
    history?: OdontogramAssessmentSummary[];
}) {
    const { data, setData, post, processing, errors } = useForm({ entries, notes: assessment?.notes ?? '' });
    const [selectedTooth, setSelectedTooth] = useState(entries[0]?.tooth_number ?? 18);
    const [selectedSurface, setSelectedSurface] = useState<OdontogramSurface>('occlusal');
    const [condition, setCondition] = useState<OdontogramFinding['condition']>('caries');
    const [severity, setSeverity] = useState<OdontogramFinding['severity']>('mild');
    const [findingNotes, setFindingNotes] = useState('');
    const selectedIndex = data.entries.findIndex((entry) => entry.tooth_number === selectedTooth);
    const selectedEntry = data.entries[selectedIndex];
    const surfaces = useMemo(() => getSurfaces(selectedTooth), [selectedTooth]);
    const affectedSurfaces = new Set(selectedEntry?.findings.map((finding) => finding.surface) ?? []).size;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('odontogram.assessments.store', patient.id));
    };

    const updateEntry = (index: number, field: 'status' | 'notes', value: string) => {
        setData('entries', data.entries.map((entry, entryIndex) => (
            entryIndex === index ? { ...entry, [field]: value } : entry
        )));
    };

    const addFinding = () => {
        if (selectedIndex < 0) {
            return;
        }

        const finding: OdontogramFinding = { surface: selectedSurface, condition, severity, notes: findingNotes };
        setData('entries', data.entries.map((entry, index) => index === selectedIndex
            ? { ...entry, findings: [...entry.findings, finding] }
            : entry));
        setFindingNotes('');
    };

    const removeFinding = (findingIndex: number) => {
        setData('entries', data.entries.map((entry, index) => index === selectedIndex
            ? { ...entry, findings: entry.findings.filter((_, itemIndex) => itemIndex !== findingIndex) }
            : entry));
    };

    const teethByQuadrant = [1, 2, 3, 4].map((quadrant) => ({
        quadrant,
        entries: data.entries.filter((entry) => Math.floor(entry.tooth_number / 10) === quadrant),
    }));

    return (
        <AuthenticatedLayout header={<div><p className="text-sm font-medium text-blue-600">Odontograma</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{patient.first_name} {patient.last_name}</h1></div>}>
            <Head title={`Odontograma: ${patient.first_name} ${patient.last_name}`} />
            <div className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {assessment ? (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
                            Evaluación del {new Date(assessment.assessed_at).toLocaleString()} · Registrada por {assessment.created_by}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-950">
                            Registra lo observado en cada pieza y superficie. El color identifica los hallazgos registrados, no determina un diagnóstico global.
                        </div>
                    )}

                    {history === undefined ? <section className="rounded-2xl border border-slate-200 bg-white p-3"><ToothLoader label="Cargando evaluaciones anteriores" compact /></section> : history.length > 0 && (
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">Evaluaciones anteriores</h2>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {history.map((item) => <li key={item.id}><Link className="block rounded-xl border border-slate-200 p-3 text-sm hover:border-blue-300 hover:bg-blue-50" href={route('odontogram.assessments.show', [patient.id, item.id])}><span className="font-medium text-slate-900">{new Date(item.assessed_at).toLocaleString()}</span><span className="mt-1 block text-slate-500">Por {item.created_by}</span></Link></li>)}
                            </ul>
                        </section>
                    )}

                    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <section className="space-y-4">
                            <div><h2 className="text-lg font-semibold text-slate-900">Piezas dentales</h2><p className="mt-1 text-sm text-slate-500">Selecciona una pieza FDI para ver o registrar su detalle.</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Gris: sin revisar</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">Verde: sana</span><span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Amarillo: hallazgo leve</span><span className="rounded-full bg-orange-100 px-3 py-1 text-orange-800">Naranja: moderado</span><span className="rounded-full bg-red-100 px-3 py-1 text-red-800">Rojo: severo</span></div></div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                {teethByQuadrant.map(({ quadrant, entries: quadrantEntries }) => (
                                    <div key={quadrant} className="rounded-2xl border border-slate-200 p-4">
                                        <h3 className="mb-3 text-sm font-semibold text-slate-700">{quadrantLabels[quadrant]}</h3>
                                        <div className="grid grid-cols-4 gap-2">
                                            {quadrantEntries.map((entry) => <button key={entry.tooth_number} type="button" onClick={() => { setSelectedTooth(entry.tooth_number); setSelectedSurface(getSurfaces(entry.tooth_number)[0]); }} aria-pressed={selectedTooth === entry.tooth_number} className={`rounded-xl border p-2 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selectedTooth === entry.tooth_number ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}><ToothIcon toothNumber={entry.tooth_number} status={entry.status} severity={highestSeverity(entry.findings)} /><span className="mt-1 block text-xs font-bold text-slate-800">{entry.tooth_number}</span><span className="block text-[10px] text-slate-500">{new Set(entry.findings.map((finding) => finding.surface)).size} sup.</span></button>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {selectedEntry && <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Pieza seleccionada</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedTooth}</h3><p className="text-sm text-slate-600">{quadrantLabels[Math.floor(selectedTooth / 10)]}</p></div><span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700">{affectedSurfaces} hallazgo{affectedSurfaces === 1 ? '' : 's'} registrado{affectedSurfaces === 1 ? '' : 's'}</span></div>
                                <ToothReferenceImage toothNumber={selectedTooth} />
                                <SurfaceDiagram toothNumber={selectedTooth} surfaces={surfaces} findings={selectedEntry.findings} selectedSurface={selectedSurface} onSelect={setSelectedSurface} />
                                <label className="mt-5 block text-sm font-medium text-slate-700">Estado general de la pieza<select disabled={!canEdit} value={selectedEntry.status} onChange={(event) => updateEntry(selectedIndex, 'status', event.target.value)} className="mt-1 block w-full rounded-xl border-slate-300 bg-white text-sm">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
                                <label className="mt-3 block text-sm font-medium text-slate-700">Notas de la pieza<textarea disabled={!canEdit} value={selectedEntry.notes} onChange={(event) => updateEntry(selectedIndex, 'notes', event.target.value)} rows={3} maxLength={1000} className="mt-1 block w-full rounded-xl border-slate-300 bg-white text-sm" placeholder="Observaciones adicionales" /></label>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <h3 className="font-semibold text-slate-900">Hallazgo en {surfaceLabels[selectedSurface]}</h3>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <label className="text-sm font-medium text-slate-700">Tipo<select disabled={!canEdit} value={condition} onChange={(event) => setCondition(event.target.value as OdontogramFinding['condition'])} className="mt-1 block w-full rounded-xl border-slate-300 text-sm">{conditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                                        <label className="text-sm font-medium text-slate-700">Severidad registrada<select disabled={!canEdit} value={severity} onChange={(event) => setSeverity(event.target.value as OdontogramFinding['severity'])} className="mt-1 block w-full rounded-xl border-slate-300 text-sm">{severities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                                    </div>
                                    <label className="mt-3 block text-sm font-medium text-slate-700">Detalle<textarea disabled={!canEdit} value={findingNotes} onChange={(event) => setFindingNotes(event.target.value)} rows={2} maxLength={1000} className="mt-1 block w-full rounded-xl border-slate-300 text-sm" placeholder="Descripción clínica del hallazgo" /></label>
                                    {canEdit && <button type="button" onClick={addFinding} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">Agregar hallazgo</button>}
                                    <InputError message={errors[`entries.${selectedIndex}.findings` as keyof typeof errors]} />
                                </div>
                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <h3 className="font-semibold text-slate-900">Hallazgos de la pieza</h3>
                                    {selectedEntry.findings.length === 0 ? <p className="mt-3 text-sm text-slate-500">No hay hallazgos registrados para esta pieza.</p> : <ul className="mt-3 space-y-3">{selectedEntry.findings.map((finding, index) => <li key={`${finding.surface}-${finding.condition}-${index}`} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-sm font-semibold text-slate-900">{surfaceLabels[finding.surface]} · {findingConditionLabel(finding.condition)}</p><p className="text-xs text-slate-600">Severidad: {severities.find((item) => item.value === finding.severity)?.label}</p>{finding.notes && <p className="mt-1 text-sm text-slate-700">{finding.notes}</p>}</div>{canEdit && <button type="button" onClick={() => removeFinding(index)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50">Quitar</button>}</li>)}</ul>}
                                </div>
                            </div>
                        </section>}

                        <InputError message={errors.entries} />
                        <label className="block text-sm font-medium text-slate-700">Notas de la evaluación<textarea disabled={!canEdit} value={data.notes} onChange={(event) => setData('notes', event.target.value)} rows={3} maxLength={5000} className="mt-1 block w-full rounded-xl border-slate-300 text-sm" placeholder="Notas generales de esta evaluación" /></label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {canEdit && <PrimaryButton disabled={processing}>Guardar evaluación</PrimaryButton>}
                            <Link href={route('patients.show', patient.id)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50">Volver al paciente</Link>
                        </div>
                    </form>
                    <p className="text-xs text-slate-500">El diagrama es una referencia visual; el profesional registra e interpreta los hallazgos clínicos.</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function getSurfaces(toothNumber: number): OdontogramSurface[] {
    return toothNumber % 10 <= 3
        ? ['mesial', 'distal', 'vestibular', 'lingual', 'incisal']
        : ['mesial', 'distal', 'vestibular', 'lingual', 'occlusal'];
}

function highestSeverity(findings: OdontogramFinding[]): OdontogramFinding['severity'] | null {
    const levels: OdontogramFinding['severity'][] = ['mild', 'moderate', 'severe'];
    return findings.reduce<OdontogramFinding['severity'] | null>((highest, finding) => highest === null || levels.indexOf(finding.severity) > levels.indexOf(highest) ? finding.severity : highest, null);
}

function severityColor(severity: OdontogramFinding['severity']): string {
    return severity === 'mild' ? '#facc15' : severity === 'moderate' ? '#f97316' : '#ef4444';
}

function findingConditionLabel(condition: string): string {
    if (condition === 'crown') {
        return 'Corona';
    }

    return conditions.find((item) => item.value === condition)?.label ?? condition;
}

function ToothIcon({ toothNumber, status, severity }: { toothNumber: number; status: OdontogramStatus; severity: OdontogramFinding['severity'] | null }) {
    const markerColor = severity ? severityColor(severity) : status === 'healthy' ? '#059669' : status === 'not_assessed' ? '#94a3b8' : '#d97706';

    return <span className="relative mx-auto block h-12 w-10">
        <img src={toothImagePath(toothNumber)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="h-12 w-10 object-contain" />
        <span aria-hidden="true" className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: markerColor }} />
    </span>;
}

function toothImagePath(toothNumber: number): string {
    let fileNumber: number;

    if (toothNumber >= 11 && toothNumber <= 18) {
        fileNumber = 19 - toothNumber;
    } else if (toothNumber >= 21 && toothNumber <= 28) {
        fileNumber = toothNumber - 12;
    } else if (toothNumber >= 41 && toothNumber <= 48) {
        fileNumber = 65 - toothNumber;
    } else {
        fileNumber = toothNumber - 6;
    }

    return `/odontogram/dientes_32_segunda_imagen/${String(fileNumber).padStart(2, '0')}_diente_${toothNumber}.png`;
}

function ToothReferenceImage({ toothNumber }: { toothNumber: number }) {
    return <figure className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <figcaption className="text-sm font-semibold text-slate-800">Vistas de referencia de la pieza {toothNumber}</figcaption>
        <img src={toothImagePath(toothNumber)} alt={`Pieza dental ${toothNumber} mostrada desde varios ángulos`} loading="lazy" decoding="async" className="mx-auto mt-2 max-h-[28rem] w-full max-w-56 object-contain" />
    </figure>;
}

function SurfaceDiagram({ toothNumber, surfaces, findings, selectedSurface, onSelect }: { toothNumber: number; surfaces: OdontogramSurface[]; findings: OdontogramFinding[]; selectedSurface: OdontogramSurface; onSelect: (surface: OdontogramSurface) => void }) {
    return <div className="mt-4 rounded-2xl bg-white p-3"><p className="mb-2 text-center text-xs text-slate-500">Selecciona una superficie del esquema</p><svg role="group" aria-label={`Superficies de la pieza ${toothNumber}`} viewBox="0 0 200 140" className="mx-auto w-full max-w-sm">
        <path d="M68 12c17-10 47-10 64 0 16 10 22 29 16 44l-10 43c-5 21-13 31-20 27-8-4-7-21-18-21s-10 17-18 21c-7 4-15-6-20-27L52 56C46 41 52 22 68 12Z" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />
        {surfaces.map((surface) => {
            const surfaceSeverity = highestSeverity(findings.filter((finding) => finding.surface === surface));
            const active = selectedSurface === surface;
            const position = surface === 'mesial' ? { x: 134, y: 50, width: 40, height: 40 } : surface === 'distal' ? { x: 26, y: 50, width: 40, height: 40 } : surface === 'vestibular' ? { x: 66, y: 10, width: 68, height: 40 } : surface === 'lingual' ? { x: 66, y: 90, width: 68, height: 40 } : { x: 66, y: 50, width: 68, height: 40 };
            const textX = position.x + position.width / 2;
            const textY = position.y + 23;
            return <g key={surface} role="button" tabIndex={0} aria-label={`${surfaceLabels[surface]}${surfaceSeverity ? `, severidad ${severities.find((item) => item.value === surfaceSeverity)?.label.toLowerCase()}` : ', sin hallazgos'}`} onClick={() => onSelect(surface)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(surface); } }} className="cursor-pointer">
                <rect {...position} rx="7" fill={surfaceSeverity ? severityColor(surfaceSeverity) : active ? '#bfdbfe' : '#e2e8f0'} stroke={active ? '#1d4ed8' : '#94a3b8'} strokeWidth={active ? 3 : 1.5} />
                <text x={textX} y={textY} textAnchor="middle" fontSize="9" fill="#0f172a">{surfaceLabels[surface].split(' ')[0]}</text>
            </g>;
        })}
    </svg><div className="mt-2 flex flex-wrap justify-center gap-2">{surfaces.map((surface) => <button key={surface} type="button" onClick={() => onSelect(surface)} className={`min-h-10 rounded-full border px-3 text-xs font-medium ${selectedSurface === surface ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'}`}>{surfaceLabels[surface]}{findings.some((finding) => finding.surface === surface) ? ' •' : ''}</button>)}</div></div>;
}
