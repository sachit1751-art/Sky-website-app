import { isNative } from './capacitor';

// Determine backend API origin
const getBaseApiUrl = (): string => {
  const customUrl = import.meta.env.VITE_API_URL;
  if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') {
    return customUrl.trim().replace(/\/+$/, '');
  }

  // If running inside Capacitor Android WebView, fallback to the production hosted backend
  if (isNative) {
    return 'https://sky-roms.vercel.app';
  }

  // Standard web browser relative paths
  return '';
};

export const API_BASE_URL = getBaseApiUrl();

/**
 * Resolves a full API URL given a route path (e.g. '/api/feedback' or 'api/feedback')
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Robust fetch wrapper with automatic native URL routing and timeout handling
 */
export async function apiFetch(path: string, init?: RequestInit, timeoutMs = 12000): Promise<Response> {
  const fullUrl = getApiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(fullUrl, {
      ...init,
      signal: init?.signal || controller.signal,
      headers: {
        ...(init?.headers || {})
      }
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
