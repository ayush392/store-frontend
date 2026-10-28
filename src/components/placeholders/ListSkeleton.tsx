type Props = {
  showButton?: boolean;
  showAvatar?: boolean;
  count?: number;
};

/** Mirrors the shape of list rows (avatar · two lines · amount · optional button). */
export const ListSkeleton = ({ showButton = false, showAvatar = true, count = 5 }: Props) => (
  <div role="status" aria-label="Loading" className="list-divider animate-pulse">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 px-4 py-3.5">
        {showAvatar && <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded-md bg-slate-200" />
          <div className="h-2.5 w-20 rounded-md bg-slate-100" />
        </div>
        <div className="flex shrink-0 flex-col items-end space-y-2">
          <div className="h-3.5 w-14 rounded-md bg-slate-200" />
          <div className="h-2.5 w-10 rounded-md bg-slate-100" />
        </div>
        {showButton && <div className="h-8 w-16 shrink-0 rounded-full bg-slate-100" />}
      </div>
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);
