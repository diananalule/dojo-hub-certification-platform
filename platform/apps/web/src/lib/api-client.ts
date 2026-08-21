/*
 * Empty by default: requests go to this app's own origin at /api, which Next rewrites
 * to the API service (see next.config.ts). Keeping them same-origin is what makes the
 * session cookie first-party, so it works on Safari/iOS and mobile Chrome.
 *
 * Set NEXT_PUBLIC_API_URL only to bypass the proxy and call the API directly.
 */
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api`;

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Endpoints that establish or end a session themselves — a 401 from one of these
// is a real auth failure, never something a token refresh-and-retry should mask.
const NO_REFRESH_RETRY_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']);

// Access tokens are short-lived (15 min). Rather than let every request that
// outlives one silently fail with 401, refresh once and retry transparently.
// Refresh tokens rotate server-side on use, so concurrent 401s must share a
// single in-flight refresh — otherwise the second refresh call would race
// against the first and get rejected for reusing an already-rotated token.
let refreshInFlight: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !isRetry && !NO_REFRESH_RETRY_PATHS.has(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, true);
    }
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? `Request failed with status ${res.status}`, body?.errors);
  }

  return (body?.data ?? body) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
