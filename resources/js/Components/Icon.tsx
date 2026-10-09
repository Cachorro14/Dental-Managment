import { ReactNode } from 'react';

export type IconName = 'add' | 'archive' | 'arrow-left' | 'arrow-right' | 'calendar' | 'close' | 'edit' | 'file' | 'filter' | 'inventory' | 'lock' | 'logout' | 'payment' | 'print' | 'save' | 'search' | 'send' | 'settings' | 'tooth' | 'trash' | 'users';

export default function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
    const paths: Record<IconName, ReactNode> = {
        add: <path d="M12 5v14M5 12h14" />, archive: <><path d="M3 6h18M5 6v14h14V6M9 10h6M8 6l1-3h6l1 3" /></>,
        'arrow-left': <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>, 'arrow-right': <><path d="m9 18 6-6-6-6" /><path d="M5 12h10" /></>,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>,
        edit: <><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>, file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
        filter: <path d="M4 5h16M7 12h10M10 19h4" />, inventory: <><path d="m3 7 9-4 9 4-9 4-9-4ZM3 12l9 4 9-4M3 17l9 4 9-4" /></>, lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
        logout: <><path d="m10 17 5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></>, payment: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h2" /></>, print: <><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z" /></>,
        save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>, search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>, settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-3v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06L6.6 16.64l.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.56-1.04H5.3v-3h.08A1.7 1.7 0 0 0 6.94 9.6 1.7 1.7 0 0 0 6.6 7.72l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.6 5.94 1.7 1.7 0 0 0 11.64 4.4v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04H21v3h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
        tooth: <path d="M8 3C5 3 3 5 3 8c0 4 2 5 2 9 0 2 1 4 3 4 2 0 2-3 4-3s2 3 4 3 3-2 3-4c0-4 2-5 2-9 0-3-2-5-5-5-2 0-3 1-4 1S10 3 8 3Z" />, trash: <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />, users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 0 0 7.75" /></>,
    };

    return <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
