import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        placeholder,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            placeholder={placeholder ?? ' '}
            className={
                'rounded-full border-slate-300 bg-white px-5 py-3 shadow-sm transition placeholder:text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 focus:border-blue-600 focus:ring-blue-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
