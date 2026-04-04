import { redirectToLogin } from '../shared/navigation';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const fetcher = async <T>(
  endpoint: string,
  method: Method = 'GET',
  body?: unknown
): Promise<T> => {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const url = API_URL + endpoint;

  console.log('Hit endpint: ' + endpoint);

  const options: RequestInit = {
    method,
    headers: {
      Accept: 'application/json'
    },
    credentials: 'include'
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };
  }

  if (method !== 'GET') {
    options.body = JSON.stringify(body);
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log({ errorData });
    if (errorData.code === 'UNAUTHORIZED') {
      redirectToLogin();
    }
    throw new Error(errorData.message || 'Network error');
  }

  const json = await res.json();
  console.log({ json });
  return json.data as T;
};
