export const FormSkeleton = () => (
  <div
    role="status"
    aria-label="Loading form"
    className="animate-pulse space-y-4 rounded-xl bg-surface p-4 shadow-sm"
  >
    <div className="h-10 rounded-lg bg-line/60" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-16 rounded-lg bg-line" />
      <div className="h-16 rounded-lg bg-line" />
    </div>
    <div className="h-16 rounded-lg bg-line" />
    <div className="h-24 rounded-lg bg-line" />
    <div className="h-11 rounded-lg bg-line/60" />
    <span className="sr-only">Loading form...</span>
  </div>
);
