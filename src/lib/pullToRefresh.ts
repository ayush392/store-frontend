import type { QueryClient, QueryKey } from '@tanstack/react-query';

// Pull-to-refresh gesture logic. Pure functions (no DOM, no React) so the
// rules can be unit tested; components/PullToRefresh.tsx wires them to touch
// events and draws the indicator.

// Finger movement before the gesture is classified (px).
export const PULL_INTENT_SLOP = 10;
// Indicator displacement needed to refresh on release (px).
export const PULL_THRESHOLD = 64;
// Largest indicator displacement (px).
export const PULL_MAX = 96;
// Indicator moves half as far as the finger.
export const PULL_RESISTANCE = 0.5;
// The first movement must be this much more vertical than horizontal.
const VERTICAL_RATIO = 1.5;

export type PullPhase = 'idle' | 'pulling' | 'ready' | 'refreshing';

type Gesture =
  | { kind: 'none' }
  // Finger down at the top of the page; not yet clear what the user wants.
  | { kind: 'pending'; startX: number; startY: number }
  // A deliberate downward pull: we own this gesture until release.
  | { kind: 'active'; startY: number };

export type PullState = {
  phase: PullPhase;
  distance: number; // indicator displacement in px
  gesture: Gesture;
};

export const initialPullState: PullState = {
  phase: 'idle',
  distance: 0,
  gesture: { kind: 'none' }
};

const reset = (): PullState => initialPullState;

export type TouchPoint = { x: number; y: number; touches: number };

// What the touch started on. Anything with `closest` (an Element) works.
export type PullTarget = { closest: (selector: string) => unknown } | null;

// Form controls and editable text keep their own touch behavior; sheets and
// the bill viewer are excluded; only the page content (<main>) can be pulled.
const BLOCKED_TARGETS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"]';

export const canStartPull = ({
  target,
  scrollTop,
  scrollLocked,
  hasSelection
}: {
  target: PullTarget;
  scrollTop: number;
  scrollLocked: boolean; // a sheet or the viewer has locked page scrolling
  hasSelection: boolean; // the user has selected text
}): boolean =>
  scrollTop <= 0 &&
  !scrollLocked &&
  !hasSelection &&
  !!target &&
  !!target.closest('main') &&
  !target.closest(BLOCKED_TARGETS);

export const pullStart = (
  state: PullState,
  touch: TouchPoint,
  allowed: boolean
): PullState => {
  if (state.phase === 'refreshing') return state; // one refresh at a time
  // A second finger (pinch zoom) cancels any pull in progress.
  if (touch.touches !== 1 || !allowed) return reset();
  return {
    ...initialPullState,
    gesture: { kind: 'pending', startX: touch.x, startY: touch.y }
  };
};

export const pullMove = (
  state: PullState,
  touch: TouchPoint
): { state: PullState; preventDefault: boolean } => {
  const { gesture } = state;
  if (gesture.kind === 'none' || state.phase === 'refreshing') {
    return { state, preventDefault: false };
  }
  if (touch.touches !== 1) return { state: reset(), preventDefault: false };

  if (gesture.kind === 'pending') {
    const dx = touch.x - gesture.startX;
    const dy = touch.y - gesture.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < PULL_INTENT_SLOP) {
      return { state, preventDefault: false }; // too small to tell yet
    }
    // Upward or sideways first: ordinary scrolling, leave it alone.
    if (dy <= 0 || dy < Math.abs(dx) * VERTICAL_RATIO) {
      return { state: reset(), preventDefault: false };
    }
    return {
      state: toPull({ kind: 'active', startY: gesture.startY }, dy),
      preventDefault: true
    };
  }

  const dy = touch.y - gesture.startY;
  // Pushed back above the starting point: hand the gesture back to scrolling.
  if (dy <= 0) return { state: reset(), preventDefault: false };
  return { state: toPull(gesture, dy), preventDefault: true };
};

const toPull = (gesture: Gesture, dy: number): PullState => {
  const distance = Math.min(PULL_MAX, dy * PULL_RESISTANCE);
  return {
    phase: distance >= PULL_THRESHOLD ? 'ready' : 'pulling',
    distance,
    gesture
  };
};

// Finger lifted: refresh only if the pull got past the threshold.
export const pullEnd = (
  state: PullState
): { state: PullState; refresh: boolean } => {
  if (state.phase === 'refreshing') return { state, refresh: false };
  if (state.gesture.kind === 'active' && state.phase === 'ready') {
    return {
      state: {
        phase: 'refreshing',
        distance: PULL_THRESHOLD, // hold the indicator while refreshing
        gesture: { kind: 'none' }
      },
      refresh: true
    };
  }
  return { state: reset(), refresh: false };
};

// touchcancel (incoming call, system gesture, ...): never refresh.
export const pullCancel = (state: PullState): PullState =>
  state.phase === 'refreshing' ? state : reset();

// After the refresh settles (success or failure): ready for another pull.
export const refreshSettled = (): PullState => reset();

// Refetches the given queries if a mounted component uses them. Cached data
// stays on screen while fetching (no loading state, nothing removed), a
// request already in flight is reused rather than sent again, and mutations
// are never touched. Rejects if any refetch fails; the old data is kept.
export const refreshQueries = async (
  queryClient: QueryClient,
  queryKeys: readonly QueryKey[]
): Promise<void> => {
  await Promise.all(
    queryKeys.map((queryKey) =>
      queryClient.refetchQueries(
        { queryKey, type: 'active' },
        { cancelRefetch: false, throwOnError: true }
      )
    )
  );
};

// overscroll-behavior on <html> while any pull-to-refresh is mounted. It
// stops the browser's own pull-to-reload and bounce on these pages only.
// Counted, so overlapping mounts during a route change can't leave it set.
type StyleLike = { overscrollBehaviorY: string };
const lock = { holders: 0, saved: '' };

export const acquireOverscrollLock = (style: StyleLike) => {
  if (lock.holders === 0) {
    lock.saved = style.overscrollBehaviorY;
    style.overscrollBehaviorY = 'contain';
  }
  lock.holders += 1;
  let released = false;
  return () => {
    if (released) return; // releasing twice must not unbalance the count
    released = true;
    lock.holders -= 1;
    if (lock.holders === 0) style.overscrollBehaviorY = lock.saved;
  };
};
