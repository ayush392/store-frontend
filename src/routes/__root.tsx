import {
  createRootRoute,
  Link,
  Outlet,
  useLocation
} from '@tanstack/react-router';
import { buttonClass } from '../components/buttonClass';
import { FooterNav } from '../components/FooterNav';
import { Header } from '../components/Header';

export const Route = createRootRoute({
  component: RootLayoutComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent
});

function RootLayoutComponent() {
  // The login screen has no app chrome: no header, no navigation.
  const isLogin = useLocation({
    select: (location) => location.pathname.startsWith('/login')
  });

  return (
    <div
      className={`flex min-h-dvh flex-col bg-page pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${
        isLogin
          ? 'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
          : ''
      }`}
    >
      {!isLogin && <Header />}

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        <Outlet />
      </main>

      {!isLogin && <FooterNav />}
    </div>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-4">
      <div role="alert" className="text-center">
        <h1 className="text-xl font-semibold text-error">
          Something went wrong
        </h1>
        <p className="mt-2 text-base text-fg-secondary">{error.message}</p>
        <Link
          to="/"
          className={buttonClass({ variant: 'secondary', className: 'mt-4' })}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl bg-surface p-8 text-center shadow-sm"
    >
      <h1 className="text-xl font-semibold text-fg">Page not found</h1>
      <p className="text-base text-fg-secondary">
        This page doesn't exist or has moved.
      </p>
      <Link to="/" className={buttonClass({ variant: 'secondary' })}>
        Go to Home
      </Link>
    </div>
  );
}
