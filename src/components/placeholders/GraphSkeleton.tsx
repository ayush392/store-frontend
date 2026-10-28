export const GraphSkeleton = () => (
  <div role="status" aria-label="Loading chart" className="relative flex h-40 animate-pulse">
    <div className="mr-2 flex w-7 flex-col justify-between py-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="h-2.5 rounded bg-slate-100" />
      ))}
    </div>

    <div className="relative flex-1">
      <svg className="h-full w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          points="10,80 50,60 90,70 130,40 170,50 190,30"
        />
        <polyline
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="2"
          points="10,70 50,50 90,60 130,30 170,40 190,20"
        />
      </svg>

      <div className="absolute right-0 bottom-0 left-0 flex justify-between">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="h-2.5 w-6 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  </div>
);
