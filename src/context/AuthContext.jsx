import { useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase, supabaseConfigError } from '../lib/supabase';

import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error loading session:', error);
      }

      if (isMounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isAuthenticated: Boolean(session?.user),
      isSupabaseConfigured,
      supabaseConfigError,
      async signOut() {
        if (!supabase) {
          return { error: new Error(supabaseConfigError) };
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Error signing out:', error);
        }

        return { error };
      },
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
