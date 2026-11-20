import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
  acquireOverscrollLock,
  canStartPull,
  initialPullState,
  pullCancel,
  pullEnd,
  pullMove,
  pullStart,
  PULL_MAX,
  PULL_THRESHOLD,
  refreshQueries,
  refreshSettled,
  type PullState,
  type PullTarget
} from './pullToRefresh';

const touch = (x: number, y: number, touches = 1) => ({ x, y, touches });

// Starts a gesture at (100, 100) and moves the finger down by `dy` in steps.
const pull = (dy: number, start: PullState = initialPullState) => {
  let state = pullStart(start, touch(100, 100), true);
  const prevented: boolean[] = [];
  for (let y = 100 + 5; y <= 100 + dy; y += 5) {
    const r = pullMove(state, touch(100, y));
    state = r.state;
    prevented.push(r.preventDefault);
  }
  return { state, prevented };
};

// A fake DOM target: `closest` matches against the selectors it lives in.
const target = (...inside: string[]): PullTarget => ({
  closest: (selector: string) =>
    selector
      .split(',')
      .map((s) => s.trim())
      .some((s) => inside.includes(s))
      ? {}
      : null
});

const topOfPage = { scrollTop: 0, scrollLocked: false, hasSelection: false };

describe('canStartPull', () => {
  it('allows a pull at scroll position zero inside the page', () => {
    expect(canStartPull({ ...topOfPage, target: target('main') })).toBe(true);
  });

  it('allows starting on a list row link or button inside the page', () => {
    // A pull that moves never fires a click, so rows stay pullable.
    expect(canStartPull({ ...topOfPage, target: target('main', 'a') })).toBe(true);
  });

  it('does not start when the page is not at the top', () => {
    expect(
      canStartPull({ ...topOfPage, scrollTop: 1, target: target('main') })
    ).toBe(false);
  });

  it('does not start on inputs, selects, text areas or editable text', () => {
    for (const control of ['input', 'select', 'textarea', '[contenteditable="true"]']) {
      expect(canStartPull({ ...topOfPage, target: target('main', control) })).toBe(false);
    }
  });

  it('does not start inside a sheet or the bill viewer', () => {
    expect(
      canStartPull({ ...topOfPage, target: target('main', '[role="dialog"]') })
    ).toBe(false);
    expect(
      canStartPull({ ...topOfPage, scrollLocked: true, target: target('main') })
    ).toBe(false);
  });

  it('does not start outside the page content (header, footer) or with no target', () => {
    expect(canStartPull({ ...topOfPage, target: target('header') })).toBe(false);
    expect(canStartPull({ ...topOfPage, target: null })).toBe(false);
  });

  it('does not start while text is selected', () => {
    expect(
      canStartPull({ ...topOfPage, hasSelection: true, target: target('main') })
    ).toBe(false);
  });
});

describe('gesture', () => {
  it('ignores a pull that was not allowed to start (not at the top)', () => {
    const state = pullStart(initialPullState, touch(100, 100), false);
    const r = pullMove(state, touch(100, 300));
    expect(r.state.phase).toBe('idle');
    expect(r.preventDefault).toBe(false);
    expect(pullEnd(r.state).refresh).toBe(false);
  });

  it('waits for 10px of movement before deciding, without blocking scroll', () => {
    const state = pullStart(initialPullState, touch(100, 100), true);
    const r = pullMove(state, touch(100, 109));
    expect(r.state.gesture.kind).toBe('pending');
    expect(r.preventDefault).toBe(false);
    expect(r.state.distance).toBe(0);
  });

  it('becomes a pull after a clear downward movement and blocks native scroll', () => {
    const state = pullStart(initialPullState, touch(100, 100), true);
    const r = pullMove(state, touch(102, 112));
    expect(r.state.gesture.kind).toBe('active');
    expect(r.state.phase).toBe('pulling');
    expect(r.preventDefault).toBe(true);
    expect(r.state.distance).toBe(6); // half the finger distance
  });

  it('leaves upward and sideways first movements to normal scrolling', () => {
    const start = pullStart(initialPullState, touch(100, 100), true);
    for (const move of [touch(100, 80), touch(130, 110), touch(115, 110)]) {
      const r = pullMove(start, move);
      expect(r.state.gesture.kind).toBe('none');
      expect(r.preventDefault).toBe(false);
    }
  });

  it('does not refresh when released below the threshold', () => {
    const { state } = pull(100); // 50px indicator < 64px
    expect(state.phase).toBe('pulling');
    const end = pullEnd(state);
    expect(end.refresh).toBe(false);
    expect(end.state).toEqual(initialPullState);
  });

  it('is ready past the threshold and refreshes only on release', () => {
    const { state, prevented } = pull(130); // 65px
    expect(state.phase).toBe('ready');
    expect(prevented.slice(-1)[0]).toBe(true);
    const end = pullEnd(state);
    expect(end.refresh).toBe(true);
    expect(end.state.phase).toBe('refreshing');
    expect(end.state.distance).toBe(PULL_THRESHOLD);
  });

  it('caps the indicator at 96px', () => {
    expect(pull(400).state.distance).toBe(PULL_MAX);
  });

  it('can go back below the threshold before release', () => {
    const { state } = pull(150);
    const back = pullMove(state, touch(100, 200)).state; // 50px
    expect(back.phase).toBe('pulling');
    expect(pullEnd(back).refresh).toBe(false);
  });

  it('hands the gesture back to scrolling when pushed above the start', () => {
    const { state } = pull(40);
    const r = pullMove(state, touch(100, 95));
    expect(r.state).toEqual(initialPullState);
    expect(r.preventDefault).toBe(false);
  });

  it('cancels on touchcancel without refreshing', () => {
    const { state } = pull(150);
    const cancelled = pullCancel(state);
    expect(cancelled).toEqual(initialPullState);
    expect(pullEnd(cancelled).refresh).toBe(false);
  });

  it('cancels when a second finger touches (pinch)', () => {
    const { state } = pull(150);
    expect(pullStart(state, touch(100, 100, 2), true)).toEqual(initialPullState);
    expect(pullMove(state, touch(100, 260, 2)).state).toEqual(initialPullState);
  });

  it('ignores new gestures while refreshing (no duplicate refresh)', () => {
    const refreshing = pullEnd(pull(150).state).state;
    const again = pull(150, refreshing).state;
    expect(again).toBe(refreshing);
    expect(pullEnd(again).refresh).toBe(false);
    expect(pullCancel(refreshing)).toBe(refreshing);
  });

  it('allows another pull after a refresh settles (also after a failure)', () => {
    const settled = refreshSettled();
    expect(settled).toEqual(initialPullState);
    const { state } = pull(150, settled);
    expect(pullEnd(state).refresh).toBe(true);
  });
});

describe('refreshQueries', () => {
  // A mounted (active) query with cached data, like a page that has loaded.
  const setup = (key: string, queryFn: () => Promise<string>) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData([key], 'cached');
    const observer = new QueryObserver(client, { queryKey: [key], queryFn, staleTime: Infinity });
    const unsubscribe = observer.subscribe(() => {});
    return { client, observer, unsubscribe };
  };

  it('refetches the page query and keeps the cached data while fetching', async () => {
    let resolve: (v: string) => void = () => {};
    const queryFn = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const { client, observer, unsubscribe } = setup('customers', queryFn);
    const done = refreshQueries(client, [['customers']]);
    await Promise.resolve();
    const during = observer.getCurrentResult();
    expect(during.data).toBe('cached');
    expect(during.isFetching).toBe(true);
    expect(during.isLoading).toBe(false); // no skeleton
    resolve('fresh');
    await done;
    expect(client.getQueryData(['customers'])).toBe('fresh');
    expect(queryFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('rejects on failure and keeps the previously loaded data', async () => {
    const { client, observer, unsubscribe } = setup('customers', () =>
      Promise.reject(new Error('offline'))
    );
    await expect(refreshQueries(client, [['customers']])).rejects.toThrow('offline');
    const result = observer.getCurrentResult();
    expect(result.data).toBe('cached');
    expect(result.error?.message).toBe('offline');
    unsubscribe();
  });

  it('reuses a request already in flight instead of sending another', async () => {
    const queryFn = vi.fn(() => new Promise<string>((r) => setTimeout(() => r('fresh'), 5)));
    const { client, unsubscribe } = setup('customers', queryFn);
    await Promise.all([
      refreshQueries(client, [['customers']]),
      refreshQueries(client, [['customers']])
    ]);
    expect(queryFn).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('does not refetch unrelated or unmounted queries, and leaves mutations alone', async () => {
    const pageFn = vi.fn(async () => 'fresh');
    const { client, unsubscribe } = setup('customers', pageFn);
    const otherFn = vi.fn(async () => 'other');
    client.setQueryData(['stores'], 'cached');
    const other = new QueryObserver(client, { queryKey: ['stores'], queryFn: otherFn, staleTime: Infinity });
    const unsubOther = other.subscribe(() => {});
    client.setQueryData(['customer', 'unmounted'], 'cached'); // no observer
    const mutationFn = vi.fn(async () => 'saved');
    client.getMutationCache().build(client, { mutationFn });

    await refreshQueries(client, [['customers'], ['customer', 'unmounted']]);
    expect(pageFn).toHaveBeenCalledTimes(1);
    expect(otherFn).not.toHaveBeenCalled();
    expect(client.getQueryData(['customer', 'unmounted'])).toBe('cached');
    expect(mutationFn).not.toHaveBeenCalled();
    unsubOther();
    unsubscribe();
  });

  it('refetches a staff calendar by prefix (only the mounted month)', async () => {
    const client = new QueryClient();
    const shown = vi.fn(async () => ['oct']);
    const hidden = vi.fn(async () => ['sep']);
    client.setQueryData(['calendar', 's1', 9, 2026], ['old']);
    client.setQueryData(['calendar', 's1', 8, 2026], ['old']);
    const o = new QueryObserver(client, { queryKey: ['calendar', 's1', 9, 2026], queryFn: shown, staleTime: Infinity });
    const unsub = o.subscribe(() => {});
    client.getQueryCache().find({ queryKey: ['calendar', 's1', 8, 2026] })!.setOptions({ queryKey: ['calendar', 's1', 8, 2026], queryFn: hidden });
    await refreshQueries(client, [['calendar', 's1']]);
    expect(shown).toHaveBeenCalledTimes(1);
    expect(hidden).not.toHaveBeenCalled();
    unsub();
  });
});

describe('acquireOverscrollLock', () => {
  it('sets contain while held and restores the original value', () => {
    const style = { overscrollBehaviorY: 'auto' };
    const release = acquireOverscrollLock(style);
    expect(style.overscrollBehaviorY).toBe('contain');
    release();
    expect(style.overscrollBehaviorY).toBe('auto');
  });

  it('survives overlapping mounts during a route change', () => {
    const style = { overscrollBehaviorY: '' };
    const releaseA = acquireOverscrollLock(style); // old page
    const releaseB = acquireOverscrollLock(style); // new page mounts first
    releaseA(); // old page unmounts
    expect(style.overscrollBehaviorY).toBe('contain');
    releaseB();
    expect(style.overscrollBehaviorY).toBe('');
  });

  it('ignores a second release from the same holder', () => {
    const style = { overscrollBehaviorY: '' };
    const releaseA = acquireOverscrollLock(style);
    const releaseB = acquireOverscrollLock(style);
    releaseA();
    releaseA();
    expect(style.overscrollBehaviorY).toBe('contain');
    releaseB();
    expect(style.overscrollBehaviorY).toBe('');
  });
});
