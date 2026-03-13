import { createClient } from '@supabase/supabase-js';

function getSupabasePublicEnv() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY to your environment.',
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

export const PORTAL_ACCESS_COOKIE = 'portal-access-token';
export const PORTAL_REFRESH_COOKIE = 'portal-refresh-token';

export function createSupabaseServerClient(accessToken?: string) {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicEnv();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function createSupabaseAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv();
  const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
