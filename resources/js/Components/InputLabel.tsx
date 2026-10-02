import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    const isFieldLabel = Boolean(props.htmlFor);

    return (
        <label
            {...props}
            className={
                `${isFieldLabel ? 'floating-input-label ' : ''}block text-sm font-semibold tracking-tight text-slate-700 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
