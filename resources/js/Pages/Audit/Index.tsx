import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ToothLoader from '@/Components/ToothLoader';
import { AuditLog, PageProps, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auditLogs }: PageProps<{ auditLogs?: Paginated<AuditLog> }>) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight theme-content">Registro de auditoria</h2>}>
            <Head title="Registro de auditoria" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {auditLogs ? <div className="overflow-hidden theme-card shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-surface-sunken">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-content-muted">Evento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-content-muted">Recurso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-content-muted">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-content-muted">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 theme-card">
                                    {auditLogs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium theme-content">{log.event}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-muted">{log.auditable_type.split('\\').pop()} #{log.auditable_id}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-muted">{log.user?.name ?? 'Sistema'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm theme-content-muted">{new Date(log.created_at).toLocaleString('es-ES')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {auditLogs.links.length > 3 && <nav className="flex gap-2 border-t border-outline p-4">{auditLogs.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={'rounded px-3 py-1 text-sm ' + (link.active ? 'theme-accent-button theme-content-inverse' : 'theme-content-secondary hover:bg-surface-sunken')} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="px-3 py-1 text-sm theme-content-muted" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
                    </div> : <div className="rounded-2xl border theme-outline theme-card shadow-sm"><ToothLoader label="Cargando auditoría" compact /></div>}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
