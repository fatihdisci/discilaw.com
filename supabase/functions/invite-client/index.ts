import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const portalSiteUrl = (Deno.env.get('PORTAL_SITE_URL') ?? '').replace(/\/$/, '');
const allowedOrigin = (Deno.env.get('PORTAL_ALLOWED_ORIGIN') ?? portalSiteUrl).replace(/\/$/, '');
const portalRedirectPath = Deno.env.get('PORTAL_REDIRECT_PATH') ?? '/portal';

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'Yalnızca POST desteklenir.' }, 405, origin);
  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !portalSiteUrl || !allowedOrigin) {
    return json({ error: 'Fonksiyon yapılandırması eksik.' }, 500, origin);
  }
  if (origin && origin !== allowedOrigin) return json({ error: 'İzin verilmeyen origin.' }, 403, origin);

  const authorization = request.headers.get('authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Oturum gerekli.' }, 401, origin);

  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [{ data: userData, error: userError }, { data: claimsData, error: claimsError }] = await Promise.all([
    callerClient.auth.getUser(token),
    callerClient.auth.getClaims(token),
  ]);
  if (userError || claimsError || !userData.user) return json({ error: 'Geçersiz veya süresi dolmuş oturum.' }, 401, origin);
  if (claimsData?.claims?.aal !== 'aal2') return json({ error: 'Yönetici işlemi için iki aşamalı doğrulama gerekli.' }, 403, origin);

  const { data: callerProfile, error: profileError } = await callerClient
    .from('profiles')
    .select('role,is_active')
    .eq('id', userData.user.id)
    .single();
  if (profileError || callerProfile?.role !== 'admin' || callerProfile?.is_active !== true) {
    return json({ error: 'Yönetici yetkisi gerekli.' }, 403, origin);
  }

  let payload: { email?: string; displayName?: string; companyName?: string | null };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Geçersiz istek gövdesi.' }, 400, origin);
  }

  const email = payload.email?.trim().toLowerCase() ?? '';
  const displayName = payload.displayName?.trim() ?? '';
  const companyName = payload.companyName?.trim() || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400, origin);
  if (displayName.length < 2 || displayName.length > 160) return json({ error: 'Ad soyad / yetkili alanı 2-160 karakter olmalıdır.' }, 400, origin);
  if (companyName && companyName.length > 160) return json({ error: 'Şirket adı en fazla 160 karakter olabilir.' }, 400, origin);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const redirectTo = `${portalSiteUrl}${portalRedirectPath}?mode=setup`;
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { display_name: displayName },
  });
  if (inviteError || !inviteData.user) return json({ error: inviteError?.message ?? 'Davet oluşturulamadı.' }, 400, origin);

  const { error: insertError } = await adminClient.from('profiles').insert({
    id: inviteData.user.id,
    role: 'client',
    display_name: displayName,
    company_name: companyName,
    email,
    is_active: true,
  });
  if (insertError) {
    await adminClient.auth.admin.deleteUser(inviteData.user.id);
    return json({ error: 'Müvekkil profili oluşturulamadı; davet geri alındı.' }, 500, origin);
  }

  return json({ ok: true, userId: inviteData.user.id }, 201, origin);
});
