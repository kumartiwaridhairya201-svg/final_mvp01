import { isSupabaseConfigured, supabaseConfigError } from '../lib/env.js';
import { createAuthClient, createUserClient } from '../lib/supabase.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim() || null;
};

export const requireAuth = async (req, res, next) => {
  if (!isSupabaseConfigured) {
    res.status(503).json({ error: supabaseConfigError });
    return;
  }

  const accessToken = extractBearerToken(req.headers.authorization);

  if (!accessToken) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return;
  }

  try {
    const authClient = createAuthClient();
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(accessToken);

    if (error || !user) {
      res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
      return;
    }

    req.accessToken = accessToken;
    req.user = user;
    req.supabase = createUserClient(accessToken);
    next();
  } catch (error) {
    console.error('Auth middleware failed:', error);
    res.status(500).json({ error: 'Failed to validate your session.' });
  }
};