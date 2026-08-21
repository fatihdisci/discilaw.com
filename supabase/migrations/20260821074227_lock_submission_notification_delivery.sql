-- No browser role can read or write notification delivery records.
-- The service-role Edge Function remains the sole operational actor.
drop policy if exists "Service role manages notification deliveries" on public.submission_notification_deliveries;
create policy "Service role manages notification deliveries"
on public.submission_notification_deliveries
for all
to service_role
using (true)
with check (true);
