import { createClient } from '@supabase/supabase-js';

const getConfiguredValue = (primaryValue, fallbackValue, placeholderValue) => {
	const normalizedPrimary = primaryValue?.trim();

	if (normalizedPrimary && normalizedPrimary !== placeholderValue) {
		return normalizedPrimary;
	}

	const normalizedFallback = fallbackValue?.trim();
	return normalizedFallback && normalizedFallback !== placeholderValue
		? normalizedFallback
		: undefined;
};

const supabaseUrl = getConfiguredValue(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
	'your_supabase_url'
);

const supabaseKey = getConfiguredValue(
	import.meta.env.VITE_SUPABASE_ANON_KEY,
	import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
	'your_supabase_anon_key'
);

const hasPlaceholderSupabaseConfig =
	!supabaseUrl ||
	!supabaseKey ||
	supabaseUrl === 'your_supabase_url' ||
	supabaseKey === 'your_supabase_anon_key';

const hasValidSupabaseUrl = (() => {
	if (hasPlaceholderSupabaseConfig) {
		return false;
	}

	try {
		const parsedUrl = new URL(supabaseUrl);
		return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
	} catch {
		return false;
	}
})();

export const isSupabaseConfigured = hasValidSupabaseUrl;

export const supabaseConfigError =
	'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable syncing mistakes.';

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseKey)
	: null;
