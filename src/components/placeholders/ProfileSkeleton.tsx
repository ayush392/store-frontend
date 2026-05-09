export const ProfileCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse space-y-4">
      {/* Header: Avatar + Name + Edit Button */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-300 rounded"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-28 bg-gray-300 rounded text-right"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 bg-gray-300 rounded text-right"></div>
        </div>

        <div className="flex justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-300 rounded text-red-600"></div>
        </div>
      </div>
    </div>
  );
};
