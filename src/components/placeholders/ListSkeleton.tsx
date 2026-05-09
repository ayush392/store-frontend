export const ListSkeleton = ({ showButton = false, count = 5 }) => {
  return (
    <div
      role="status"
      aria-label="Loading transactions"
      className="animate-pulse divide-y divide-gray-100 bg-white"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-4 active:bg-gray-50 transition"
        >
          {/* LEFT SIDE */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="h-3 w-24 rounded bg-gray-100"></div>
          </div>

          {/* RIGHT SIDE: Amount */}
          <div className="ml-3 flex flex-col items-end shrink-0 space-y-2">
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="h-3 w-14 rounded bg-gray-100"></div>
          </div>

          {showButton && (
            <div className="h-8 w-18 rounded bg-gray-200 ml-3"></div>
          )}
        </div>
      ))}

      <span className="sr-only">Loading transactions...</span>
    </div>
  );
};
