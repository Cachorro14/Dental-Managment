import ClinicMark from '@/Components/ClinicMark';
import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { branding } = usePage<PageProps>().props;

    return (
        <div data-variant={branding.variant} data-theme={branding.theme} className="flex min-h-screen flex-col items-center bg-slate-950 px-4 pt-6 sm:justify-center sm:pt-0">
            <div className="text-center">
                <Link href="/">
                    {branding.logoUrl ? <img src={branding.logoUrl} alt={branding.name} className="mx-auto h-20 max-w-56 object-contain" /> : <ClinicMark className="mx-auto h-20 w-20 text-blue-300" />}
                </Link>
                <p className="mt-4 text-sm font-medium text-slate-400">{branding.name}</p>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
