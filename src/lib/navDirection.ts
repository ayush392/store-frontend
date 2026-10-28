import type { AnyRouter } from '@tanstack/react-router';
import { isTabRoot, pathDepth } from '../shared/navigation';

export type NavDirection = 'forward' | 'back' | 'tab';

/**
 * Works out whether a navigation is a push (deeper), a pop (shallower) or a
 * tab switch, and exposes it on <html data-nav>. index.css uses it to pick
 * the slide direction of the page transition.
 */
export const getNavDirection = (from: string, to: string): NavDirection => {
  if (isTabRoot(from) && isTabRoot(to)) return 'tab';
  const fromDepth = pathDepth(from);
  const toDepth = pathDepth(to);
  if (toDepth > fromDepth) return 'forward';
  if (toDepth < fromDepth) return 'back';
  return 'tab';
};

export const trackNavDirection = (router: AnyRouter) =>
  router.subscribe('onBeforeNavigate', ({ fromLocation, toLocation }) => {
    const root = document.documentElement;
    if (!fromLocation || fromLocation.pathname === toLocation.pathname) {
      delete root.dataset.nav;
      return;
    }
    root.dataset.nav = getNavDirection(fromLocation.pathname, toLocation.pathname);
  });
