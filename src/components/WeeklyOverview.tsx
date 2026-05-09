import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetcher } from '../lib/fetcher';
import type { Chart } from '../shared/types';
import { GraphSkeleton } from './placeholders/GraphSkeleton';
import { SkeletonWrapper } from './placeholders/SkeletonWrapper';

export default function WeeklyOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['graph'],
    queryFn: () => fetcher<Chart>('/transaction/graph'),
    staleTime: 10 * 60 * 1000
  });

  const [maxAmount, setMaxAmount] = useState(100);
  const [tooltip, setTooltip] = useState<null | {
    x: number;
    y: number;
    credit: number;
    debit: number;
  }>(null);

  useEffect(() => {
    (async () => {
      if (!data) return;
      const max = Math.max(
        ...data.chartData.map((d) => Math.max(d.credit, d.debit))
      );
      setMaxAmount(max);
    })();
  }, [data]);

  const svgWidth = 200;
  const svgHeight = 100;
  const paddingTop = 10;
  const paddingBottom = 10;

  // Convert value to Y coordinate
  const getY = (value: number) =>
    svgHeight -
    paddingBottom -
    (value / maxAmount) * (svgHeight - paddingTop - paddingBottom);

  // Convert index to X coordinate
  const getX = (index: number) =>
    data ? (index / (data.chartData.length - 1)) * (svgWidth - 20) + 10 : 0; // 10px padding left & right

  // Generate points string for polyline
  const getPoints = (key: 'credit' | 'debit') =>
    data?.chartData.map((d, i) => `${getX(i)},${getY(d[key])}`).join(' ');

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1]
    .map((f) => Math.round(f * maxAmount))
    .reverse();

  if (error) {
    console.log(error);
    return <div>{error.message}</div>;
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm max-w-full overflow-x-auto relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Overview</h3>
      </div>

      <SkeletonWrapper<Chart>
        isLoading={isLoading}
        skeleton={<GraphSkeleton />}
        data={data}
        message="No data found"
      >
        <div className="h-40 relative flex chart-container">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-xs text-gray-600 mr-2">
            {yTicks.map((val, idx) => (
              <span key={idx}>{val}</span>
            ))}
          </div>

          <div className="flex-1 relative">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              {/* Credit line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={getPoints('credit')}
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{ animation: 'draw 1s forwards' }}
              />
              {/* Debit line */}
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                points={getPoints('debit')}
                strokeDasharray="500"
                strokeDashoffset="500"
                style={{ animation: 'draw 1s forwards 0.2s' }}
              />

              {/* Dots */}
              {data?.chartData.map((data, index) => {
                const cx = getX(index);
                const cyCredit = getY(data.credit);
                const cyDebit = getY(data.debit);

                return (
                  <g key={`dots-${index}`}>
                    {/* Credit hit area */}
                    <circle
                      cx={cx}
                      cy={cyCredit}
                      r={8}
                      fill="rgba(0,0,0,0)"
                      onMouseEnter={() =>
                        setTooltip({
                          x: cx,
                          y: cyCredit,
                          credit: data.credit,
                          debit: data.debit
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setTooltip({
                          x: cx,
                          y: cyCredit,
                          credit: data.credit,
                          debit: data.debit
                        });
                      }}
                    />
                    {/* Credit dot */}
                    <circle
                      cx={cx}
                      cy={cyCredit}
                      r={3}
                      fill="#2563eb"
                      pointerEvents="none"
                    />

                    {/* Debit hit area */}
                    <circle
                      cx={cx}
                      cy={cyDebit}
                      r={8}
                      fill="rgba(0,0,0,0)"
                      onMouseEnter={() =>
                        setTooltip({
                          x: cx,
                          y: cyDebit,
                          credit: data.credit,
                          debit: data.debit
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        setTooltip({
                          x: cx,
                          y: cyDebit,
                          credit: data.credit,
                          debit: data.debit
                        });
                      }}
                    />
                    {/* Debit dot */}
                    <circle
                      cx={cx}
                      cy={cyDebit}
                      r={3}
                      fill="#dc2626"
                      pointerEvents="none"
                    />
                  </g>
                );
              })}

              <style>{`
              @keyframes draw {
                to { stroke-dashoffset: 0; }
              }
            `}</style>
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
              {data?.chartData.map((data, index) => {
                const dateObj = new Date(data.date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                return (
                  <span key={index}>
                    {day}-{month}
                  </span>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute bg-white shadow-md rounded-md text-xs text-gray-800"
                style={{
                  left: `${(tooltip.x / svgWidth) * 100}%`,
                  top: `${tooltip.y}%`,
                  transform: 'translate(-50%, -110%)',
                  padding: '6px 10px',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <div className="text-blue-600 font-medium">
                  Credit: {tooltip.credit}
                </div>
                <div className="text-rose-600 font-medium">
                  Debit: {tooltip.debit}
                </div>
              </div>
            )}
          </div>
        </div>
      </SkeletonWrapper>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-xs text-gray-600">Credit</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-rose-500 rounded"></div>
          <span className="text-xs text-gray-600">Debit</span>
        </div>
      </div>
    </div>
  );
}
