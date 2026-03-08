import { createRootRoute, Outlet } from '@tanstack/react-router';
import { FooterNav } from '../components/FooterNav';
import { Header } from '../components/Header';

export const Route = createRootRoute({
  component: RootLayoutComponent,
  errorComponent: RootErrorComponent
});

function RootLayoutComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-20">
        <Outlet />
      </main>

      <FooterNav />
    </div>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
        <p className="text-gray-600 mt-2">{error.message}</p>
      </div>
    </div>
  );
}
