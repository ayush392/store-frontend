/** Mirrors ProfileCard: avatar + name, balance banner, detail rows. */
export const ProfileCardSkeleton = () => (
  <div role="status" aria-label="Loading profile" className="card animate-pulse space-y-4 p-4">
    <div className="flex items-center gap-3.5">
      <div className="h-14 w-14 rounded-2xl bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 rounded-md bg-slate-200" />
        <div className="h-3 w-24 rounded-md bg-slate-100" />
      </div>
    </div>

    <div className="h-14 rounded-xl bg-slate-100" />

    <div className="space-y-3">
      {[28, 36, 24].map((w) => (
        <div key={w} className="flex justify-between">
          <div className="h-3 w-16 rounded-md bg-slate-100" />
          <div className="h-3 rounded-md bg-slate-200" style={{ width: `${w * 4}px` }} />
        </div>
      ))}
    </div>
  </div>
);
