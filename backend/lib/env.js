import 'dotenv/config';

const getConfiguredValue = (...candidates) => {
  for (const candidate of candidates) {
    const normalizedCandidate = candidate?.trim();

    if (normalizedCandidate) {
      return normalizedCandidate;
    }
  }

  return undefined;
};

const isValidHttpUrl = (value) => {
  if (!value || value === 'your_supabase_url') {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
  } catch {
    return false;
  }
};

const localhostHostnamePattern =
  /^(localhost|127(?:\.[0-9]{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i;

const normalizeOrigin = (value) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const normalizedValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `${localhostHostnamePattern.test(trimmedValue) ? 'http' : 'https'}://${trimmedValue}`;

  try {
    return new URL(normalizedValue).origin;
  } catch {
    return undefined;
  }
};

export const backendPort = Number.parseInt(
  process.env.PORT ?? process.env.BACKEND_PORT ?? '4000',
  10
);

export const frontendOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

export const supabaseUrl = getConfiguredValue(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_URL
);

export const supabaseAnonKey = getConfiguredValue(
  process.env.SUPABASE_ANON_KEY,
  process.env.VITE_SUPABASE_ANON_KEY
);

export const openRouterApiKey = getConfiguredValue(
  process.env.OPENROUTER_API_KEY,
  process.env.VITE_OPENROUTER_API_KEY
);

export const isSupabaseConfigured =
  isValidHttpUrl(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== 'your_supabase_anon_key';

export const supabaseConfigError =
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable syncing mistakes.';

export const isOpenRouterConfigured =
  Boolean(openRouterApiKey) && openRouterApiKey !== 'your_openrouter_api_key';

export const openRouterConfigError =
  'Set OPENROUTER_API_KEY in .env to enable AI question extraction.';
