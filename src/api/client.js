import { supabase, supabaseConfigError } from '../lib/supabase';

const defaultApiBaseUrl = '/api';

const localhostPattern = /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;

const normalizeApiBaseUrl = (value) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return defaultApiBaseUrl;
  }

  if (trimmedValue.startsWith('/')) {
    return trimmedValue.replace(/\/$/, '') || defaultApiBaseUrl;
  }

  const normalizedValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `${localhostPattern.test(trimmedValue) ? 'http' : 'https'}://${trimmedValue}`;

  try {
    const url = new URL(normalizedValue);
    const normalizedPath = url.pathname.replace(/\/$/, '');

    url.pathname = normalizedPath && normalizedPath !== '/' ? normalizedPath : '/api';

    return url.toString().replace(/\/$/, '');
  } catch {
    return trimmedValue.replace(/\/$/, '');
  }
};

export const apiBaseUrl =
  normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const backendUnavailableError =
  'Backend API is unavailable. Start the backend server or set VITE_API_BASE_URL to a running API origin.';

const isFormData = (value) => typeof FormData !== 'undefined' && value instanceof FormData;

const getAccessToken = async () => {
  if (!supabase) {
    throw new Error(supabaseConfigError);
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token) {
    throw new Error('Your session expired. Please sign in again.');
  }

  return session.access_token;
};

export const apiRequest = async (
  path,
  { body, headers, method = 'GET', requiresAuth = true } = {}
) => {
  const requestHeaders = new Headers(headers);
  let requestBody = body;

  if (requiresAuth) {
    requestHeaders.set('Authorization', `Bearer ${await getAccessToken()}`);
  }

  if (body !== undefined && !isFormData(body)) {
    requestHeaders.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload?.error;
      throw new Error(message || `Request failed with status ${response.status}.`);
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(backendUnavailableError);
    }

    throw error;
  }
};
