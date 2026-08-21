import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
const resendFrom = Deno.env.get('RESEND_FROM') ?? '';
const allowedOrigin = (Deno.env.get('PORTAL_ALLOWED_ORIGIN') ?? '').replace(/\/$/, '');

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

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (request.method !== 'POST') return json({ error: 'Yalnızca POST desteklenir.' }, 405, origin);
  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !allowedOrigin) {
    return json({ error: 'Bildirim fonksiyonu yapılandırması eksik.' }, 503, origin);
  }
  if (origin && origin !== allowedOrigin) return json({ error: 'İzin verilmeyen origin.' }, 403, origin);

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Oturum gerekli.' }, 401, origin);

  let payload: { submissionId?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Geçersiz istek gövdesi.' }, 400, origin);
  }
  const submissionId = payload.submissionId?.trim() ?? '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) {
    return json({ error: 'Geçersiz gönderi kimliği.' }, 400, origin);
  }

  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Geçersiz veya süresi dolmuş oturum.' }, 401, origin);

  const [{ data: profile, error: profileError }, { data: submission, error: submissionError }] = await Promise.all([
    callerClient.from('profiles').select('role,is_active,display_name').eq('id', userData.user.id).single(),
    callerClient.from('submissions').select('id,subject,document_type,created_at').eq('id', submissionId).single(),
  ]);
  if (profileError || profile?.role !== 'client' || profile.is_active !== true || submissionError || !submission) {
    return json({ error: 'Bu gönderi için bildirim izniniz yok.' }, 403, origin);
  }
  if (!resendApiKey || !resendFrom) return json({ error: 'E-posta bildirimi yapılandırması eksik.' }, 503, origin);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: existingDelivery, error: deliveryLookupError } = await adminClient
    .from('submission_notification_deliveries')
    .select('status')
    .eq('submission_id', submissionId)
    .maybeSingle();
  if (deliveryLookupError) return json({ error: 'Bildirim kaydı okunamadı.' }, 500, origin);
  if (existingDelivery?.status === 'sent') return json({ ok: true, alreadySent: true }, 200, origin);

  const { data: reservation, error: reservationError } = await adminClient
    .from('submission_notification_deliveries')
    .upsert({ submission_id: submissionId, status: 'pending', last_error: null }, { onConflict: 'submission_id' })
    .select('submission_id')
    .single();
  if (reservationError || !reservation) return json({ error: 'Bildirim kaydı oluşturulamadı.' }, 500, origin);

  const { data: admins, error: adminError } = await adminClient
    .from('profiles')
    .select('email')
    .eq('role', 'admin')
    .eq('is_active', true)
    .not('email', 'is', null);
  const recipients = [...new Set((admins ?? []).map((admin) => admin.email?.trim()).filter((email): email is string => Boolean(email)))];
  if (adminError || !recipients.length) {
    await adminClient.from('submission_notification_deliveries').update({ status: 'failed', last_error: 'Aktif yönetici e-posta adresi bulunamadı.' }).eq('submission_id', submissionId);
    return json({ error: 'Aktif yönetici e-posta adresi bulunamadı.' }, 500, origin);
  }

  const clientName = escapeHtml(profile.display_name || 'Müvekkil');
  const subject = escapeHtml(submission.subject);
  const documentType = escapeHtml(submission.document_type);
  const createdAt = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Istanbul' }).format(new Date(submission.created_at));
  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: resendFrom,
      to: recipients,
      subject: `Yeni müvekkil evrakı: ${submission.subject}`,
      html: `<main style="font-family:Arial,sans-serif;color:#2a3128"><h1 style="font-size:20px">Yeni evrak gönderildi</h1><p><strong>${clientName}</strong> portala yeni bir evrak gönderdi.</p><table style="border-collapse:collapse"><tr><td style="padding:4px 16px 4px 0;color:#6b7560">Konu</td><td>${subject}</td></tr><tr><td style="padding:4px 16px 4px 0;color:#6b7560">Evrak türü</td><td>${documentType}</td></tr><tr><td style="padding:4px 16px 4px 0;color:#6b7560">Tarih</td><td>${createdAt}</td></tr></table><p style="margin-top:24px">Gelen Evraklar ekranından inceleyebilirsiniz.</p></main>`,
    }),
  });
  const emailResult = await emailResponse.json().catch(() => ({}));
  if (!emailResponse.ok) {
    const message = typeof emailResult?.message === 'string' ? emailResult.message.slice(0, 500) : 'E-posta sağlayıcısı bildirimi kabul etmedi.';
    await adminClient.from('submission_notification_deliveries').update({ status: 'failed', last_error: message }).eq('submission_id', submissionId);
    return json({ error: 'Bildirim e-postası gönderilemedi.' }, 502, origin);
  }

  await adminClient.from('submission_notification_deliveries').update({ status: 'sent', provider_message_id: typeof emailResult?.id === 'string' ? emailResult.id : null, sent_at: new Date().toISOString(), last_error: null }).eq('submission_id', submissionId);
  return json({ ok: true }, 200, origin);
});
