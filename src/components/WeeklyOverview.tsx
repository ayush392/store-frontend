import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetcher } from '../lib/fetcher';
import { formatAmount } from '../shared/format';
import type { Chart } from '../shared/types';
import { haptics } from '../shared/utils/haptics';
import { GraphSkeleton } from './placeholders/GraphSkeleton';
import { SkeletonWrapper } from './placeholders/SkeletonWrapper';
import { ErrorState } from './ui/ErrorState';

const CREDIT = '#2563eb'; // blue-600
const DEBIT = '#e11d48'; // rose-600

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });

const svgWidth = 200;
const svgHeight = 100;
const paddingY = 10;

export default function WeeklyOverview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['graph'],
    queryFn: () => fetcher<Chart>('/transaction/graph'),
    staleTime: 10 * 60 * 1000
  });

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const points = useMemo(() => data?.chartData ?? [], [data]);
  // Never 0, so an all-zero week doesn't divide by zero
  const maxAmount = useMemo(
    () => Math.max(1, ...points.map((d) => Math.max(d.credit, d.debit))),
    [points]
  );

  const getY = (value: number) =>
    svgHeight - paddingY - (value / maxAmount) * (svgHeight - paddingY * 2);
  // Centre of each day's column, so dots line up with the tap targets and labels
  const getX = (index: number) => ((index + 0.5) / points.length) * svgWidth;
  const getPoints = (key: 'credit' | 'debit') =>
    points.map((d, i) => `${getX(i)},${getY(d[key])}`).join(' ');

  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(f * maxAmount));
  const active = activeIndex !== null ? points[activeIndex] : undefined;

  const selectPoint = (index: number) => {
    haptics.selection();
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="card-title">Weekly Overview</h3>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: CREDIT }} />
            Credit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: DEBIT }} />
            Debit
          </span>
        </div>
      </div>

      {error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <SkeletonWrapper<Chart>
          isLoading={isLoading}
          skeleton={<GraphSkeleton />}
          data={data}
          message="No data yet"
        >
          {points.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm font-medium text-slate-400">
              Not enough data yet
            </div>
          ) : (
            <>
              {/* Selected day summary (tap a day to toggle) */}
              <div className="mb-2 flex h-5 items-center gap-3 text-xs font-semibold tabular-nums">
                {active ? (
                  <>
                    <span className="text-slate-500">
                      {new Date(active.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short'
                      })}
                    </span>
                    <span style={{ color: CREDIT }}>+{formatAmount(active.credit)}</span>
                    <span style={{ color: DEBIT }}>−{formatAmount(active.debit)}</span>
                  </>
                ) : (
                  <span className="font-medium text-slate-400">Tap a day for details</span>
                )}
              </div>

              <div className="relative flex h-40">
                {/* Y-axis labels */}
                {/* Padding lines label centres up with the 10% plot inset */}
                <div className="mr-2 flex flex-col justify-between pt-[7px] pb-[calc(1.25rem+7px)] text-[10px] leading-[14px] font-medium text-slate-400 tabular-nums">
                  {yTicks.map((val, idx) => (
                    <span key={idx}>{compact.format(val)}</span>
                  ))}
                </div>

                <div className="relative flex-1">
                  {/* Plot area (leaves 1.25rem at the bottom for date labels) */}
                  <div className="absolute inset-x-0 top-0 bottom-5">
                  <svg
                    className="h-full w-full overflow-visible"
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                  >
                    {activeIndex !== null && (
                      <line
                        x1={getX(activeIndex)}
                        x2={getX(activeIndex)}
                        y1={0}
                        y2={svgHeight}
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        strokeDasharray="3 3"
                      />
                    )}
                    {(['credit', 'debit'] as const).map((key, i) => (
                      <polyline
                        key={key}
                        fill="none"
                        stroke={key === 'credit' ? CREDIT : DEBIT}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        points={getPoints(key)}
                        pathLength={1}
                        strokeDasharray="1"
                        strokeDashoffset="1"
                        style={{ animation: `chart-draw 0.9s ease-out ${i * 0.15}s forwards` }}
                      />
                    ))}
                    <style>{`@keyframes chart-draw { to { stroke-dashoffset: 0; } }`}</style>
                  </svg>

                  {/* Dots as HTML so they stay round despite the stretched SVG */}
                  {points.map((d, index) => (
                    <div key={index}>
                      {(['credit', 'debit'] as const).map((key) => (
                        <span
                          key={key}
                          className={`pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white transition-transform ${
                            activeIndex === index ? 'scale-150' : ''
                          }`}
                          style={{
                            left: `${(getX(index) / svgWidth) * 100}%`,
                            top: `${(getY(d[key]) / svgHeight) * 100}%`,
                            background: key === 'credit' ? CREDIT : DEBIT
                          }}
                        />
                      ))}
                    </div>
                  ))}
                  </div>

                  {/* Full-height tap columns, one per day */}
                  <div className="absolute inset-0 flex">
                    {points.map((d, index) => {
                      const dateObj = new Date(d.date);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectPoint(index)}
                          aria-label={`${dateObj.toDateString()}: credit ${d.credit}, debit ${d.debit}`}
                          aria-pressed={activeIndex === index}
                          className="flex flex-1 items-end justify-center"
                        >
                          <span
                            className={`text-[10px] font-medium tabular-nums ${
                              activeIndex === index ? 'font-bold text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {String(dateObj.getDate()).padStart(2, '0')}/
                            {String(dateObj.getMonth() + 1).padStart(2, '0')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </SkeletonWrapper>
      )}
    </div>
  );
}
