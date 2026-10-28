import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { trackNavDirection } from './lib/navDirection';
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  // Touch devices fire "intent" on touchstart, so data starts loading before the tap ends
  defaultPreload: 'intent',
  // Going back restores the previous scroll position, like a native stack
  scrollRestoration: true,
  // Slide/fade between screens (no-op on browsers without View Transitions)
  defaultViewTransition: true
});
trackNavDirection(router);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000
    }
  }
});

// Register the router instance for type-safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// iOS Safari only applies :active styles when a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true });

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          gutter={8}
          containerStyle={{
            top: 'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 0.5rem)'
          }}
          toastOptions={{
            style: {
              borderRadius: '9999px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0f172a',
              background: 'rgba(255,255,255,0.96)',
              boxShadow: '0 8px 30px rgba(15,23,42,0.14)',
              border: '1px solid rgba(226,232,240,0.9)',
              maxWidth: 'calc(100vw - 32px)'
            },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } }
          }}
        />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
