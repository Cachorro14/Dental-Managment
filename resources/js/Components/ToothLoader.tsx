import ClinicMark from '@/Components/ClinicMark';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';

export default function ToothLoader({ label = 'Cargando información', compact = false }: { label?: string; compact?: boolean }) {
    const { branding } = usePage<PageProps>().props;
    const loaderClassName = compact ? 'h-16 w-16 p-1.5' : 'h-20 w-20 p-2';
    const logoClassName = compact ? 'h-9 w-9' : 'h-12 w-12';

    return (
        <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-3 text-center ${compact ? 'py-8' : 'py-14'}`}>
            <span className={`theme-info relative flex shrink-0 items-center justify-center rounded-full border ${loaderClassName}`}>
                <svg aria-hidden="true" viewBox="0 0 48 48" className="theme-accent absolute inset-0 h-full w-full animate-spin motion-reduce:animate-none">
                    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeDasharray="82 50" strokeLinecap="round" strokeWidth="3" />
                </svg>
                {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="" className={`${logoClassName} relative rounded-full object-contain`} />
                ) : (
                    <ClinicMark className={`${logoClassName} theme-accent relative`} />
                )}
            </span>
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
    );
}
