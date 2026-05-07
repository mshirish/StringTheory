// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BASE: string = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:4000';

export const api = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('accessToken');
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export const apiJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await api(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
};
