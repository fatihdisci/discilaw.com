-- Disci Law client portal
-- Secure, invite-only portal schema for Supabase Auth, Postgres and Storage.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'client');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type public.submission_status as enum (
      'new',
      'reviewing',
      'awaiting_documents',
      'in_progress',
      'completed'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'document_visibility') then
    create type public.document_visibility as enum ('client', 'internal');
  end if;
  if not exists (select 1 from pg_type where typname = 'uploader_party') then
    create type public.uploader_party as enum ('admin', 'client');
  end if;
end $$;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'client',
  username text unique,
  company_name text,
  display_name text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists is_active boolean not null default true;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

update public.profiles
set display_name = coalesce(nullif(display_name, ''), nullif(company_name, ''), nullif(username, ''), 'Müvekkil')
where display_name is null or display_name = '';

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id and profile.email is null;

alter table public.profiles alter column display_name set not null;

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete restrict,
  title text not null,
  reference_number text,
  status text not null default 'Açık',
  client_summary text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cases add column if not exists reference_number text;
alter table public.cases add column if not exists client_summary text;
alter table public.cases add column if not exists updated_at timestamptz not null default now();

update public.cases
set client_summary = description
where client_summary is null and description is not null;

create table if not exists public.case_updates (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  title text not null,
  body text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint case_updates_title_length check (char_length(title) between 1 and 160),
  constraint case_updates_body_length check (char_length(body) between 1 and 5000)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete restrict,
  case_id uuid references public.cases (id) on delete set null,
  subject text not null,
  description text,
  document_type text not null,
  status public.submission_status not null default 'new',
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submissions_subject_length check (char_length(subject) between 1 and 200),
  constraint submissions_description_length check (description is null or char_length(description) <= 5000),
  constraint submissions_internal_note_length check (internal_note is null or char_length(internal_note) <= 10000)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases (id) on delete cascade,
  submission_id uuid references public.submissions (id) on delete cascade,
  owner_client_id uuid not null references public.profiles (id) on delete restrict,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  uploader_party public.uploader_party not null,
  visibility public.document_visibility not null default 'client',
  document_type text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now(),
  constraint documents_parent_required check (case_id is not null or submission_id is not null),
  constraint documents_file_name_length check (char_length(file_name) between 1 and 255),
  constraint documents_size_limit check (size_bytes > 0 and size_bytes <= 15728640),
  constraint documents_allowed_mime check (
    mime_type in (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  )
);

create index if not exists profiles_role_active_idx on public.profiles (role, is_active);
create unique index if not exists profiles_single_admin_idx on public.profiles ((role)) where role = 'admin';
create index if not exists cases_client_updated_idx on public.cases (client_id, updated_at desc);
create index if not exists case_updates_case_published_idx on public.case_updates (case_id, published_at desc);
create index if not exists submissions_client_updated_idx on public.submissions (client_id, updated_at desc);
create index if not exists submissions_status_updated_idx on public.submissions (status, updated_at desc);
create index if not exists documents_case_created_idx on public.documents (case_id, created_at desc);
create index if not exists documents_submission_created_idx on public.documents (submission_id, created_at desc);
create index if not exists documents_owner_created_idx on public.documents (owner_client_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public;

create or replace function private.enforce_portal_owner_consistency()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  expected_client_id uuid;
begin
  if tg_table_name = 'submissions' and new.case_id is not null then
    select client_id into expected_client_id from public.cases where id = new.case_id;
    if expected_client_id is distinct from new.client_id then
      raise exception 'Submission and case must belong to the same client';
    end if;
  end if;

  if tg_table_name = 'documents' then
    if new.case_id is not null then
      select client_id into expected_client_id from public.cases where id = new.case_id;
      if expected_client_id is distinct from new.owner_client_id then
        raise exception 'Document and case must belong to the same client';
      end if;
    end if;
    if new.submission_id is not null then
      select client_id into expected_client_id from public.submissions where id = new.submission_id;
      if expected_client_id is distinct from new.owner_client_id then
        raise exception 'Document and submission must belong to the same client';
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_portal_owner_consistency() from public;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at before update on public.cases
for each row execute function private.set_updated_at();

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at before update on public.submissions
for each row execute function private.set_updated_at();

drop trigger if exists submissions_owner_consistency on public.submissions;
create trigger submissions_owner_consistency before insert or update on public.submissions
for each row execute function private.enforce_portal_owner_consistency();

drop trigger if exists documents_owner_consistency on public.documents;
create trigger documents_owner_consistency before insert or update on public.documents
for each row execute function private.enforce_portal_owner_consistency();

create or replace function private.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function private.current_user_is_admin_aal2()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_is_admin()
    and coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2';
$$;

create or replace function private.current_user_is_active_client()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'client'
      and is_active = true
  );
$$;

revoke all on function private.current_user_is_admin() from public;
revoke all on function private.current_user_is_admin_aal2() from public;
revoke all on function private.current_user_is_active_client() from public;
grant execute on function private.current_user_is_admin() to authenticated, service_role;
grant execute on function private.current_user_is_admin_aal2() to authenticated, service_role;
grant execute on function private.current_user_is_active_client() to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_updates enable row level security;
alter table public.submissions enable row level security;
alter table public.documents enable row level security;

drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins manage profiles with MFA" on public.profiles;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
for select to authenticated
using ((select auth.uid()) = id);
create policy "Admins manage profiles with MFA" on public.profiles
for all to authenticated
using (private.current_user_is_admin_aal2())
with check (private.current_user_is_admin_aal2());

drop policy if exists "Admins can manage all cases" on public.cases;
drop policy if exists "Clients can read own cases" on public.cases;
drop policy if exists "Admins manage cases with MFA" on public.cases;
drop policy if exists "Active clients read own cases" on public.cases;
create policy "Admins manage cases with MFA" on public.cases
for all to authenticated
using (private.current_user_is_admin_aal2())
with check (private.current_user_is_admin_aal2());
create policy "Active clients read own cases" on public.cases
for select to authenticated
using (private.current_user_is_active_client() and client_id = (select auth.uid()));

create policy "Admins manage case updates with MFA" on public.case_updates
for all to authenticated
using (private.current_user_is_admin_aal2())
with check (private.current_user_is_admin_aal2());
create policy "Active clients read own case updates" on public.case_updates
for select to authenticated
using (
  private.current_user_is_active_client()
  and exists (
    select 1 from public.cases
    where cases.id = case_updates.case_id
      and cases.client_id = (select auth.uid())
  )
);

create policy "Admins manage submissions with MFA" on public.submissions
for all to authenticated
using (private.current_user_is_admin_aal2())
with check (private.current_user_is_admin_aal2());
create policy "Active clients read own submissions" on public.submissions
for select to authenticated
using (private.current_user_is_active_client() and client_id = (select auth.uid()));
create policy "Active clients create own submissions" on public.submissions
for insert to authenticated
with check (
  private.current_user_is_active_client()
  and client_id = (select auth.uid())
  and case_id is null
  and status = 'new'
  and internal_note is null
);

create policy "Admins manage documents with MFA" on public.documents
for all to authenticated
using (private.current_user_is_admin_aal2())
with check (private.current_user_is_admin_aal2());
create policy "Active clients read allowed documents" on public.documents
for select to authenticated
using (
  private.current_user_is_active_client()
  and owner_client_id = (select auth.uid())
  and (
    uploaded_by = (select auth.uid())
    or (
      visibility = 'client'
      and (
        (case_id is not null and exists (
          select 1 from public.cases
          where cases.id = documents.case_id
            and cases.client_id = (select auth.uid())
        ))
        or
        (submission_id is not null and exists (
          select 1 from public.submissions
          where submissions.id = documents.submission_id
            and submissions.client_id = (select auth.uid())
        ))
      )
    )
  )
);
create policy "Active clients register submission documents" on public.documents
for insert to authenticated
with check (
  private.current_user_is_active_client()
  and owner_client_id = (select auth.uid())
  and uploaded_by = (select auth.uid())
  and uploader_party = 'client'
  and visibility = 'client'
  and case_id is null
  and submission_id is not null
  and split_part(storage_path, '/', 1) = (select auth.uid())::text
  and exists (
    select 1 from public.submissions
    where submissions.id = documents.submission_id
      and submissions.client_id = (select auth.uid())
      and submissions.status = 'new'
  )
);

-- Remove legacy client visibility. These tables are retained for backwards
-- compatibility, but they are not part of the new client portal contract.
do $$
begin
  if to_regclass('public.expenses') is not null then
    execute 'drop policy if exists "Clients can read expenses for own cases" on public.expenses';
    execute 'drop policy if exists "Admins can manage all expenses" on public.expenses';
    execute 'create policy "Admins manage legacy expenses with MFA" on public.expenses for all to authenticated using (private.current_user_is_admin_aal2()) with check (private.current_user_is_admin_aal2())';
  end if;
  if to_regclass('public.notes') is not null then
    execute 'drop policy if exists "Clients can read notes for own cases" on public.notes';
    execute 'drop policy if exists "Admins can manage all notes" on public.notes';
    execute 'create policy "Admins manage legacy notes with MFA" on public.notes for all to authenticated using (private.current_user_is_admin_aal2()) with check (private.current_user_is_admin_aal2())';
  end if;
end $$;

drop function if exists public.is_admin();

revoke all on public.profiles, public.cases, public.case_updates, public.submissions, public.documents from anon;
grant select, insert, update, delete on public.profiles, public.cases, public.case_updates, public.submissions, public.documents to authenticated;
grant all on public.profiles, public.cases, public.case_updates, public.submissions, public.documents to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-documents',
  'portal-documents',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage portal storage with MFA" on storage.objects;
drop policy if exists "Clients upload own submission files" on storage.objects;
drop policy if exists "Clients read authorized portal files" on storage.objects;

create policy "Admins manage portal storage with MFA" on storage.objects
for all to authenticated
using (bucket_id = 'portal-documents' and private.current_user_is_admin_aal2())
with check (bucket_id = 'portal-documents' and private.current_user_is_admin_aal2());

create policy "Clients upload own submission files" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'portal-documents'
  and private.current_user_is_active_client()
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] = 'submissions'
  and exists (
    select 1 from public.submissions
    where submissions.id::text = (storage.foldername(name))[3]
      and submissions.client_id = (select auth.uid())
      and submissions.status = 'new'
  )
);

create policy "Clients read authorized portal files" on storage.objects
for select to authenticated
using (
  bucket_id = 'portal-documents'
  and private.current_user_is_active_client()
  and exists (
    select 1
    from public.documents
    where documents.storage_path = storage.objects.name
      and documents.owner_client_id = (select auth.uid())
      and (
        documents.uploaded_by = (select auth.uid())
        or documents.visibility = 'client'
      )
  )
);
