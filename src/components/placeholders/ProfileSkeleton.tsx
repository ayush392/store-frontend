export const ProfileCardSkeleton = () => {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="bg-surface rounded-lg shadow-sm p-4 animate-pulse space-y-4"
    >
      {/* Header: Avatar + Name + Edit Button */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-12 h-12 bg-line rounded-full" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-4 w-32 bg-line rounded"></div>
          <div className="h-3 w-24 bg-line/60 rounded"></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-line/60 rounded"></div>
          <div className="h-3 w-20 bg-line rounded"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-16 bg-line/60 rounded"></div>
          <div className="h-3 w-28 bg-line rounded"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-16 bg-line/60 rounded"></div>
          <div className="h-3 w-32 bg-line rounded"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-20 bg-line/60 rounded"></div>
          <div className="h-3 w-24 bg-line rounded"></div>
        </div>
      </div>
      <span className="sr-only">Loading profile...</span>
    </div>
  );
};
