// components/placeholders/GraphSkeleton.tsx
export const GraphSkeleton = () => {
  const svgWidth = 200;
  const svgHeight = 100;

  // Y-axis ticks (5 placeholders)
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="h-40 flex bg-white max-w-full overflow-x-auto relative">
      {/* Y-axis labels skeleton */}
      <div className="flex flex-col justify-between mr-2 w-6">
        {yTicks.map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-gray-200 rounded animate-pulse"
          ></div>
        ))}
      </div>

      <div className="flex-1 relative">
        {/* SVG skeleton */}
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
        >
          {/* Placeholder line 1 */}
          <polyline
            fill="none"
            stroke="#ddd"
            strokeWidth="2"
            points="10,80 50,60 90,70 130,40 170,50 190,30"
            className="animate-pulse"
          />
          {/* Placeholder line 2 */}
          <polyline
            fill="none"
            stroke="#eee"
            strokeWidth="2"
            points="10,70 50,50 90,60 130,30 170,40 190,20"
            className="animate-pulse"
          />
        </svg>

        {/* X-axis labels skeleton */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between mt-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-3 w-6 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
