export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mt-4 h-8 w-full" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
