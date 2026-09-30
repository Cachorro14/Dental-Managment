import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-blue-600 text-blue-900 focus:border-blue-800'
                    : 'border-transparent text-gray-500 hover:border-blue-300 hover:text-blue-800 focus:border-blue-400 focus:text-blue-800') +
                className
            }
        >
            {children}
        </Link>
    );
}
