/** Placeholder for form screens while their initial data loads. */
export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div role="status" aria-label="Loading form" className="card animate-pulse space-y-5 p-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="h-3 w-20 rounded-md bg-slate-200" />
        <div className="h-12 rounded-xl bg-slate-100" />
      </div>
    ))}
    <div className="h-12 rounded-xl bg-slate-200" />
  </div>
);
