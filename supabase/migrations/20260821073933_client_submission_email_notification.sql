-- Records a single administrator notification per completed client submission.
-- RLS intentionally has no client policies; only the Edge Function service role writes it.
create table if not exists public.submission_notification_deliveries (
  submission_id uuid primary key references public.submissions (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.submission_notification_deliveries enable row level security;

revoke all on public.submission_notification_deliveries from anon, authenticated;
