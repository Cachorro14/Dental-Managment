import { SVGAttributes } from 'react';

export default function ClinicMark(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M24 5.5C14.6 5.5 9 12.15 9 20.1C9 27.5 12.3 31.45 14.25 38.3C15.1 41.3 16.7 43 19 43C21.4 43 21.9 40.25 24 40.25C26.1 40.25 26.6 43 29 43C31.3 43 32.9 41.3 33.75 38.3C35.7 31.45 39 27.5 39 20.1C39 12.15 33.4 5.5 24 5.5Z" fill="currentColor" />
            <path d="M24 12.5C20.15 12.5 17 15.65 17 19.5C17 23.35 20.15 26.5 24 26.5C27.85 26.5 31 23.35 31 19.5C31 15.65 27.85 12.5 24 12.5Z" fill="white" fillOpacity="0.95" />
            <path d="M24 15.5V23.5M20 19.5H28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}
