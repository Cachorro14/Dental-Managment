import ClinicMark from '@/Components/ClinicMark';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

type SidebarItem = {
    label: string;
    href: string;
    active: boolean;
    icon: 'dashboard' | 'patients' | 'appointments' | 'audit' | 'modules' | 'branding' | 'users' | 'staff';
};

export default function Sidebar({
    items,
    open,
    onClose,
}: PropsWithChildren<{ items: SidebarItem[]; open: boolean; onClose: () => void }>) {
    const { auth, branding } = usePage<PageProps>().props;

    return (
        <>
            {open && <button type="button" aria-label="Cerrar menu" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={onClose} />}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-blue-900/40 bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                    <Link href={route('dashboard')} className="flex min-w-0 items-center gap-3" onClick={onClose}>
                        {branding.logoUrl ? <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="h-10 w-10 shrink-0 text-blue-300" />}
                        <span className="truncate text-sm font-semibold text-white">{branding.name}</span>
                    </Link>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 lg:hidden" aria-label="Cerrar menu">
                        <CloseIcon />
                    </button>
                </div>

                <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6" aria-label="Navegacion principal">
                    <div>
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">Principal</p>
                        <div className="space-y-1">{items.filter((item) => ['dashboard', 'patients', 'appointments'].includes(item.icon)).map((item) => <SidebarLink key={item.href} item={item} onClick={onClose} />)}</div>
                    </div>
                    {items.some((item) => item.icon === 'staff') && <div>
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">Equipo de la clínica</p>
                        <div className="space-y-1">{items.filter((item) => item.icon === 'staff').map((item) => <SidebarLink key={item.href} item={item} onClick={onClose} />)}</div>
                    </div>}
                    {items.some((item) => ['audit', 'modules', 'branding', 'users'].includes(item.icon)) && <div>
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">Administracion</p>
                        <div className="space-y-1">{items.filter((item) => ['audit', 'modules', 'branding', 'users'].includes(item.icon)).map((item) => <SidebarLink key={item.href} item={item} onClick={onClose} />)}</div>
                    </div>}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{auth.user?.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{auth.user?.name}</p><p className="truncate text-xs text-slate-400">{auth.user?.email}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href={route('profile.edit')} onClick={onClose} className="rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300">Perfil</Link>
                        <Link href={route('logout')} method="post" as="button" onClick={onClose} className="rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300">Cerrar sesion</Link>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SidebarLink({ item, onClick }: { item: SidebarItem; onClick: () => void }) {
    return <Link href={item.href} onClick={onClick} aria-current={item.active ? 'page' : undefined} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-300 ${item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon name={item.icon} /><span>{item.label}</span>{item.active && <span className="ms-auto h-2 w-2 rounded-full bg-blue-200" />}</Link>;
}

function Icon({ name }: { name: SidebarItem['icon'] }) {
    const paths: Record<SidebarItem['icon'], ReactNode> = {
        dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
        patients: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
        appointments: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
        audit: <><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></>,
        modules: <><path d="M12 2 3 7l9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
        branding: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
        staff: <><path d="M15 19a6 6 0 0 0-12 0" /><circle cx="9" cy="8" r="4" /><path d="M19 8v6M16 11h6" /></>,
    };

    return <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CloseIcon() {
    return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>;
}
