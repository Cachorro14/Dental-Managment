import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `theme-content-secondary inline-flex items-center rounded-md border border-outline-strong bg-surface-raised px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-sm transition duration-150 ease-in-out hover:border-accent hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-raised active:bg-surface-sunken disabled:cursor-not-allowed ${
                    disabled ? 'opacity-50' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
