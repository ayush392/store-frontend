let isRedirecting = false;

export const redirectToLogin = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  localStorage.removeItem('token');
  window.location.href = '/login';
};
