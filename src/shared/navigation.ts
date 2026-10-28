let isRedirecting = false;

export const redirectToLogin = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem('token');
  window.location.href = '/login';
};

/** Top-level screens reachable from the bottom tab bar. */
export const TAB_ROOTS = ['/', '/staffs', '/customers', '/stores', '/recycle'];

const normalize = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

export const isTabRoot = (pathname: string) =>
  TAB_ROOTS.includes(normalize(pathname));

/** Task-style screens (create/edit/login) hide the tab bar, like native modals. */
export const isFocusedRoute = (pathname: string) => {
  const path = normalize(pathname);
  return path === '/login' || path.endsWith('/new') || path.endsWith('/edit');
};

export const pathDepth = (pathname: string) =>
  normalize(pathname).split('/').filter(Boolean).length;
