import { createRootRoute, Outlet } from '@tanstack/react-router';
import { FooterNav } from '../components/FooterNav';
import { Header } from '../components/Header';

export const Route = createRootRoute({
  component: Layout
});

function Layout() {
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
