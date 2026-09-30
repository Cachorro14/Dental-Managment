import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AuditLog, PageProps, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auditLogs }: PageProps<{ auditLogs: Paginated<AuditLog> }>) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Registro de auditoria</h2>}>
            <Head title="Registro de auditoria" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Evento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Recurso</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {auditLogs.data.map((log) => (
                                        <tr key={log.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{log.event}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{log.auditable_type.split('\\').pop()} #{log.auditable_id}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{log.user?.name ?? 'Sistema'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString('es-ES')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {auditLogs.links.length > 3 && <nav className="flex gap-2 border-t border-gray-200 p-4">{auditLogs.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={'rounded px-3 py-1 text-sm ' + (link.active ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100')} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="px-3 py-1 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
