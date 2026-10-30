import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetcher } from '../lib/fetcher';
import { formatAmount } from '../shared/format';
import type { Chart } from '../shared/types';
import { queryKeys } from '../shared/queryKeys';
import { GraphSkeleton } from './placeholders/GraphSkeleton';
import { SkeletonWrapper } from './placeholders/SkeletonWrapper';
import { ErrorState } from './ErrorState';

const svgWidth = 200;
const svgHeight = 100;
const paddingTop = 10;
const paddingBottom = 10;

const shortDate = (date: string) => {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// Credit = payments received (lowers balances); debit = udhaar and advances
// given (raises balances). See store-backend transactionOverview.
export default function WeeklyOverview() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.graph(),
    queryFn: () => fetcher<Chart>('/transaction/graph'),
    staleTime: 10 * 60 * 1000
  });

  const [tooltip, setTooltip] = useState<null | {
    x: number;
    y: number;
    date: string;
    credit: number;
    debit: number;
  }>(null);

  const points = useMemo(() => data?.chartData ?? [], [data]);

  // Guard against an all-zero week (division by zero) by scaling to at least 1.
  const maxAmount = useMemo(
    () => Math.max(1, ...points.map((d) => Math.max(d.credit, d.debit))),
    [points]
  );

  const getY = (value: number) =>
    svgHeight -
    paddingBottom -
    (value / maxAmount) * (svgHeight - paddingTop - paddingBottom);

  // A single day is drawn in the middle (no division by zero).
  const getX = (index: number) =>
    points.length <= 1
      ? svgWidth / 2
      : (index / (points.length - 1)) * (svgWidth - 20) + 10;

  const getPoints = (key: 'credit' | 'debit') =>
    points.map((d, i) => `${getX(i)},${getY(d[key])}`).join(' ');

  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) =>
    Math.round(f * maxAmount).toLocaleString('en-IN')
  );

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  const showTooltip = (index: number, y: number) => {
    const d = points[index];
    setTooltip({ x: getX(index), y, date: d.date, credit: d.credit, debit: d.debit });
  };

  return (
    <section className="relative max-w-full rounded-xl bg-surface p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-fg">Weekly overview</h2>

      <SkeletonWrapper<Chart>
        isLoading={isLoading}
        skeleton={<GraphSkeleton />}
        data={data}
        message="No data yet"
      >
        {!points.length ? (
          <div className="flex h-40 items-center justify-center text-base font-medium text-fg-secondary">
            No transactions this week.
          </div>
        ) : (
          <>
            <div className="relative flex h-40">
              {/* Y-axis labels */}
              <div
                aria-hidden="true"
                className="mr-2 flex flex-col justify-between text-xs text-fg-secondary tabular-nums"
              >
                {yTicks.map((val, idx) => (
                  <span key={idx}>{val}</span>
                ))}
              </div>

              <div className="relative flex-1">
                <svg
                  className="h-full w-full"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  onTouchStart={() => setTooltip(null)}
                >
                  {points.length > 1 && (
                    <>
                      <polyline
                        fill="none"
                        className="stroke-credit"
                        strokeWidth="2"
                        points={getPoints('credit')}
                        strokeDasharray="500"
                        strokeDashoffset="500"
                        style={{ animation: 'draw 1s forwards' }}
                      />
                      <polyline
                        fill="none"
                        className="stroke-debit"
                        strokeWidth="2"
                        points={getPoints('debit')}
                        strokeDasharray="500"
                        strokeDashoffset="500"
                        style={{ animation: 'draw 1s forwards 0.2s' }}
                      />
                    </>
                  )}

                  {points.map((d, index) => {
                    const cx = getX(index);
                    return (['credit', 'debit'] as const).map((key) => {
                      const cy = getY(d[key]);
                      return (
                        <g key={`${key}-${index}`}>
                          {/* Larger invisible hit area for touch */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={8}
                            fill="transparent"
                            onMouseEnter={() => showTooltip(index, cy)}
                            onMouseLeave={() => setTooltip(null)}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              showTooltip(index, cy);
                            }}
                          />
                          <circle
                            cx={cx}
                            cy={cy}
                            r={3}
                            className={key === 'credit' ? 'fill-credit' : 'fill-debit'}
                            pointerEvents="none"
                          />
                        </g>
                      );
                    });
                  })}

                  <style>{`
                    @keyframes draw {
                      to { stroke-dashoffset: 0; }
                    }
                  `}</style>
                </svg>

                {/* X-axis labels */}
                <div
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 right-0 flex text-xs text-fg-secondary ${
                    points.length > 1 ? 'justify-between' : 'justify-center'
                  }`}
                >
                  {points.map((d) => (
                    <span key={d.date}>{shortDate(d.date)}</span>
                  ))}
                </div>

                {tooltip && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute whitespace-nowrap rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg"
                    style={{
                      left: `${(tooltip.x / svgWidth) * 100}%`,
                      top: `${tooltip.y}%`,
                      transform: 'translate(-50%, -110%)'
                    }}
                  >
                    <div className="font-medium text-fg">
                      {shortDate(tooltip.date)}
                    </div>
                    <div className="font-medium text-credit tabular-nums">
                      Credit: {formatAmount(tooltip.credit)}
                    </div>
                    <div className="font-medium text-debit tabular-nums">
                      Debit: {formatAmount(tooltip.debit)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text alternative for screen readers */}
            <table className="sr-only">
              <caption>Credit and debit per day this week</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Credit</th>
                  <th scope="col">Debit</th>
                </tr>
              </thead>
              <tbody>
                {points.map((d) => (
                  <tr key={d.date}>
                    <th scope="row">{shortDate(d.date)}</th>
                    <td>{formatAmount(d.credit)}</td>
                    <td>{formatAmount(d.debit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </SkeletonWrapper>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-fg-secondary">
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded bg-credit" />
          <span>Credit · payments received</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-3 rounded bg-debit" />
          <span>Debit · udhaar &amp; advance given</span>
        </div>
      </div>
    </section>
  );
}
