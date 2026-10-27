import { PropsWithChildren } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
    return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

// Announces the loading state once to assistive tech while the visual placeholders stay hidden from it.
function SkeletonRegion({ label, className = '', children }: PropsWithChildren<{ label: string; className?: string }>) {
    return <div role="status" aria-live="polite" aria-busy="true" className={className}><span className="sr-only">{label}</span>{children}</div>;
}

// Mirrors the list pages: stacked cards on phones/tablets, table rows from lg up.
export function SkeletonList({ label, rows = 6, columns = 4 }: { label: string; rows?: number; columns?: number }) {
    return <SkeletonRegion label={label}>
        <ul className="divide-y divide-outline lg:hidden">{Array.from({ length: rows }, (_, row) => <li key={row} className="space-y-3 p-4"><div className="flex items-center justify-between gap-3"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-6 w-20 rounded-full" /></div><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-1/4" /></li>)}</ul>
        <div className="hidden lg:block">
            <div className="flex gap-6 border-b theme-outline px-6 py-4">{Array.from({ length: columns }, (_, column) => <Skeleton key={column} className="h-3 flex-1" />)}<Skeleton className="h-3 w-24" /></div>
            <div className="divide-y divide-outline">{Array.from({ length: rows }, (_, row) => <div key={row} className="flex items-center gap-6 px-6 py-5">{Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={`h-4 flex-1 ${column === 0 ? 'max-w-48' : 'max-w-36'}`} />)}<div className="flex w-24 justify-end gap-2"><Skeleton className="h-9 w-16 rounded-xl" /></div></div>)}</div>
        </div>
    </SkeletonRegion>;
}

export function SkeletonMetrics({ label, count = 4 }: { label: string; count?: number }) {
    return <SkeletonRegion label={label} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-2xl border theme-outline theme-card p-5 shadow-sm"><Skeleton className="h-1.5 w-10 rounded-full" /><Skeleton className="mt-5 h-3 w-2/3" /><Skeleton className="mt-3 h-7 w-1/3" /><Skeleton className="mt-3 h-3 w-1/2" /></div>)}
    </SkeletonRegion>;
}

export function SkeletonLines({ label, lines = 3 }: { label: string; lines?: number }) {
    return <SkeletonRegion label={label} className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, index) => <div key={index} className="flex items-center gap-3 rounded-xl theme-page p-4"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>)}
    </SkeletonRegion>;
}

export function SkeletonFields({ label, fields = 2 }: { label: string; fields?: number }) {
    return <SkeletonRegion label={label} className="space-y-6">
        {Array.from({ length: fields }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-11 w-full rounded-xl" /></div>)}
    </SkeletonRegion>;
}

export function SkeletonToothChart({ label }: { label: string }) {
    return <SkeletonRegion label={label} className="space-y-4 p-5 sm:p-7">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-72 max-w-full" />
        <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 4 }, (_, quadrant) => <div key={quadrant} className="rounded-2xl border theme-outline p-4"><Skeleton className="mb-3 h-3 w-28" /><div className="grid grid-cols-4 gap-2">{Array.from({ length: 8 }, (_, tooth) => <Skeleton key={tooth} className="h-24 rounded-xl" />)}</div></div>)}</div>
    </SkeletonRegion>;
}
