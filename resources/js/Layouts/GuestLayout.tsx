import ClinicMark from '@/Components/ClinicMark';
import { Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { branding } = usePage<PageProps>().props;

    return (
        <div data-variant={branding.variant} data-theme={branding.theme} className="guest-portal flex min-h-screen flex-col items-center px-4 pt-6 sm:justify-center sm:pt-0">
            <div className="guest-card w-full overflow-hidden px-6 py-6 shadow-md sm:max-w-md sm:rounded-lg">
                <div className="mb-6 text-center">
                    <Link href="/">
                        {branding.logoUrl ? <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white"><img src={branding.logoUrl} alt={branding.name} className="h-full w-full object-cover" /></span> : <ClinicMark className="mx-auto h-20 w-20 text-blue-300" />}
                    </Link>
                    <p className="guest-brand-name mt-3 text-sm font-medium">{branding.name}</p>
                </div>

                {children}
            </div>
        </div>
    );
}
