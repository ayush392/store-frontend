import { useState, useRef, type ReactNode } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { haptics } from '../shared/utils/haptics';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<unknown> | void;
}

const PULL_THRESHOLD = 65;
const MAX_PULL = 95;

export const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startY = useRef(0);
  const isPulling = useRef(false);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-down if user is at the very top of the page
    if (window.scrollY > 0 || isRefreshing) return;
    const touch = e.touches[0];
    if (!touch) return;

    startY.current = touch.clientY;
    isPulling.current = true;
    setIsDragging(true);
    hasTriggeredHaptic.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    const touch = e.touches[0];
    if (!touch) return;

    const currentY = touch.clientY;
    const deltaY = currentY - startY.current;

    // Only handle pull down
    if (deltaY <= 0) {
      setPullDistance(0);
      return;
    }

    // Resistance curve
    const distance = Math.min(MAX_PULL, deltaY * 0.42);
    setPullDistance(distance);

    if (distance >= PULL_THRESHOLD && !hasTriggeredHaptic.current) {
      haptics.medium();
      hasTriggeredHaptic.current = true;
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;
    setIsDragging(false);

    if (pullDistance >= PULL_THRESHOLD && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(48); // lock height while refreshing
      try {
        await Promise.resolve(onRefresh());
        haptics.success();
      } catch {
        // ignore
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 350);
      }
    } else {
      setPullDistance(0);
    }
  };

  const rotation = Math.min(360, (pullDistance / PULL_THRESHOLD) * 360);
  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full"
    >
      {/* Pull indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center transition-transform duration-150 ease-out z-20"
        style={{
          transform: `translateY(${pullDistance > 0 ? pullDistance - 40 : -45}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-blue-600">
          <FiRefreshCw
            size={18}
            className={`${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
              opacity: isRefreshing ? 1 : Math.max(0.3, progress)
            }}
          />
        </div>
      </div>

      {/* Main Content with dynamic downward shift during pull */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
