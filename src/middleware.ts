import { defineMiddleware } from 'astro:middleware';
import {
  createSupabaseServerClient,
  PORTAL_ACCESS_COOKIE,
  PORTAL_REFRESH_COOKIE,
} from './lib/supabase';

const PUBLIC_PORTAL_PATHS = new Set(['/portal/login']);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith('/portal')) {
    return next();
  }

  const accessToken = context.cookies.get(PORTAL_ACCESS_COOKIE)?.value;
  const isPublicPortalPath = PUBLIC_PORTAL_PATHS.has(pathname);

  if (!accessToken) {
    if (isPublicPortalPath) {
      return next();
    }

    return context.redirect('/portal/login');
  }

  let user: { id: string; email?: string } | null = null;
  let supabaseServer: ReturnType<typeof createSupabaseServerClient> | null = null;

  try {
    supabaseServer = createSupabaseServerClient(accessToken);
    const {
      data: { user: currentUser },
    } = await supabaseServer.auth.getUser(accessToken);
    user = currentUser;
  } catch {
    context.cookies.delete(PORTAL_ACCESS_COOKIE, { path: '/' });
    context.cookies.delete(PORTAL_REFRESH_COOKIE, { path: '/' });

    if (isPublicPortalPath) {
      return next();
    }

    return context.redirect('/portal/login');
  }

  if (!user) {
    context.cookies.delete(PORTAL_ACCESS_COOKIE, { path: '/' });
    context.cookies.delete(PORTAL_REFRESH_COOKIE, { path: '/' });

    if (isPublicPortalPath) {
      return next();
    }

    return context.redirect('/portal/login');
  }

  if (pathname === '/portal/login' && supabaseServer) {
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    return context.redirect(profile?.role === 'admin' ? '/portal/admin' : '/portal/dashboard');
  }

  context.locals.portalUser = {
    id: user.id,
    email: user.email,
  };

  return next();
});
