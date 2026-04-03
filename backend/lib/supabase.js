import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseConfigError,
  supabaseUrl,
} from './env.js';

const getBaseOptions = () => ({
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'notebook-backend',
    },
  },
});

const assertSupabaseConfig = () => {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigError);
  }
};

export const createAuthClient = () => {
  assertSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, getBaseOptions());
};

export const createUserClient = (accessToken) => {
  assertSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    ...getBaseOptions(),
    accessToken: async () => accessToken,
  });
};