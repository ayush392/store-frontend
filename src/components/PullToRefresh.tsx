import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { notifyError } from '../lib/toast';
import {
  acquireOverscrollLock,
  canStartPull,
  initialPullState,
  pullCancel,
  pullEnd,
  pullMove,
  pullStart,
  PULL_THRESHOLD,
  refreshQueries,
  refreshSettled,
  type PullState,
  type TouchPoint
} from '../lib/pullToRefresh';

type Props = {
  // Queries this page shows; only these are refetched.
  queryKeys: readonly QueryKey[];
  // The element that scrolls the page. The app scrolls the document.
  getScrollElement?: () => Element | null;
};

const INDICATOR_SIZE = 40;
// Keep the spinner up briefly so a fast refresh doesn't just flicker.
const MIN_SPIN_MS = 400;

const defaultScrollElement = () => document.scrollingElement;

const point = (e: TouchEvent): TouchPoint => ({
  x: e.touches[0]?.clientX ?? 0,
  y: e.touches[0]?.clientY ?? 0,
  touches: e.touches.length
});

// Pull down at the top of the page to refetch its queries. Renders only a
// fixed indicator, so page layout and fixed elements (add button, sheets)
// are unaffected. Touch only; nothing changes for mouse or keyboard users.
export const PullToRefresh = ({
  queryKeys,
  getScrollElement = defaultScrollElement
}: Props) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<PullState>(initialPullState);
  const [top, setTop] = useState(0);
  const stateRef = useRef<PullState>(initialPullState);
  const keysRef = useRef(queryKeys);
  const scrollRef = useRef(getScrollElement);
  const inFlight = useRef(false);

  useEffect(() => {
    keysRef.current = queryKeys;
    scrollRef.current = getScrollElement;
  });

  useEffect(() => {
    const update = (next: PullState) => {
      const prev = stateRef.current;
      stateRef.current = next;
      if (
        next.phase !== prev.phase ||
        next.distance !== prev.distance ||
        (next.gesture.kind === 'active') !== (prev.gesture.kind === 'active')
      ) {
        setView(next);
      }
    };

    const refresh = async () => {
      if (inFlight.current) return; // never two refreshes at once
      inFlight.current = true;
      try {
        await Promise.all([
          refreshQueries(queryClient, keysRef.current),
          new Promise((resolve) => setTimeout(resolve, MIN_SPIN_MS))
        ]);
      } catch {
        notifyError("Couldn't refresh. Showing the last loaded data.");
      } finally {
        inFlight.current = false;
        update(refreshSettled());
      }
    };

    const onStart = (e: TouchEvent) => {
      const selection = window.getSelection();
      const allowed = canStartPull({
        target: e.target instanceof Element ? e.target : null,
        scrollTop: scrollRef.current()?.scrollTop ?? window.scrollY,
        scrollLocked: document.body.style.overflow === 'hidden',
        hasSelection: !!selection && !selection.isCollapsed
      });
      const next = pullStart(stateRef.current, point(e), allowed);
      if (next.gesture.kind === 'pending') {
        // The indicator slides out from under the sticky header.
        setTop(document.querySelector('header')?.getBoundingClientRect().bottom ?? 0);
      }
      update(next);
    };

    const onMove = (e: TouchEvent) => {
      if (stateRef.current.gesture.kind === 'none') return;
      const { state, preventDefault } = pullMove(stateRef.current, point(e));
      // Only once a deliberate downward pull is identified: stops the page
      // bounce and the browser's own pull-to-reload for this gesture.
      if (preventDefault && e.cancelable) e.preventDefault();
      update(state);
    };

    const onEnd = () => {
      const { state, refresh: shouldRefresh } = pullEnd(stateRef.current);
      update(state);
      if (shouldRefresh) void refresh();
    };

    const onCancel = () => update(pullCancel(stateRef.current));

    const releaseOverscroll = acquireOverscrollLock(document.documentElement.style);
    document.addEventListener('touchstart', onStart, { passive: true });
    // Not passive: preventDefault is needed during an active pull.
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd, { passive: true });
    document.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onCancel);
      releaseOverscroll();
      stateRef.current = initialPullState;
    };
  }, [queryClient]);

  const { phase, distance, gesture } = view;
  const dragging = gesture.kind === 'active';
  const refreshing = phase === 'refreshing';
  const ready = phase === 'ready';
  const message = refreshing ? 'Refreshing' : ready ? 'Release to refresh' : '';

  const indicatorStyle = {
    top,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    // Hidden under the header at 0; slides down with the pull.
    transform: `translate(-50%, ${distance - INDICATOR_SIZE - 8}px)`,
    opacity: distance > 0 ? 1 : 0,
    '--ptr-rotate': `${(Math.min(distance, PULL_THRESHOLD) / PULL_THRESHOLD) * 270}deg`
  } as CSSProperties;

  return (
    <>
      <div
        aria-hidden="true"
        style={indicatorStyle}
        className={`pointer-events-none fixed left-1/2 z-20 flex items-center justify-center rounded-full border border-line shadow-md ${
          ready || refreshing ? 'bg-primary-soft text-primary' : 'bg-surface text-fg-secondary'
        } ${dragging ? '' : 'transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none'}`}
      >
        <FiRefreshCw
          size={20}
          className={
            refreshing
              ? 'animate-spin motion-reduce:animate-none'
              : 'motion-safe:rotate-(--ptr-rotate)'
          }
        />
      </div>
      <p role="status" className="sr-only">
        {message}
      </p>
    </>
  );
};
