import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { FiAlertTriangle, FiCompass, FiWifiOff } from 'react-icons/fi';
import { FooterNav } from '../components/FooterNav';
import { Header } from '../components/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { isFocusedRoute, isTabRoot } from '../shared/navigation';
import { useNetworkStatus } from '../shared/utils/pwa';

export const Route = createRootRoute({
  component: RootLayoutComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent
});

function RootLayoutComponent() {
  const { isOnline } = useNetworkStatus();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Tab screens get the app header; pushed screens draw their own nav bar (PageLayout).
  // Task screens (forms, login) hide the tab bar so the keyboard has room.
  const showHeader = isTabRoot(pathname);
  const showTabBar = !isFocusedRoute(pathname);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      {showHeader && <Header />}

      {!isOnline && (
        <div
          role="status"
          className="fixed top-[calc(var(--app-header-h)+0.5rem)] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md animate-fade-in"
        >
          <FiWifiOff size={13} />
          Offline · showing saved data
        </div>
      )}

      <main
        className="flex-1 px-4 pt-3"
        style={{
          paddingBottom: showTabBar
            ? 'calc(var(--tab-bar-h) + 1.25rem)'
            : 'calc(max(1rem, env(safe-area-inset-bottom, 0px)) + 1rem)'
        }}
      >
        <div className="mx-auto w-full max-w-lg">
          <Outlet />
        </div>
      </main>

      {showTabBar && <FooterNav />}
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div className="card mt-6">
      <EmptyState
        icon={FiCompass}
        title="Nothing here yet"
        description="This screen doesn't exist or isn't available yet."
        action={
          <Link to="/" className="btn btn-md btn-tinted">
            Go to Home
          </Link>
        }
      />
    </div>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
      <div className="card w-full max-w-sm p-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <FiAlertTriangle size={26} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-1.5 text-sm text-slate-500">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          type="button"
          className="btn btn-lg btn-primary mt-5"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
