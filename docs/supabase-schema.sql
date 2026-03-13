-- Client Portal schema for Disci Law
-- Run this file in Supabase Studio > SQL Editor

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'client');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'client',
  username text unique,
  company_name text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_unique_idx on public.profiles (username);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  description text,
  receipt_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cases_client_id_idx on public.cases (client_id);
create index if not exists expenses_case_id_idx on public.expenses (case_id);
create index if not exists notes_case_id_idx on public.notes (case_id);

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.expenses enable row level security;
alter table public.notes enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
on public.profiles
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Admins can manage all cases" on public.cases;
create policy "Admins can manage all cases"
on public.cases
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read own cases" on public.cases;
create policy "Clients can read own cases"
on public.cases
for select
using (client_id = auth.uid());

drop policy if exists "Admins can manage all expenses" on public.expenses;
create policy "Admins can manage all expenses"
on public.expenses
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read expenses for own cases" on public.expenses;
create policy "Clients can read expenses for own cases"
on public.expenses
for select
using (
  exists (
    select 1
    from public.cases
    where public.cases.id = public.expenses.case_id
      and public.cases.client_id = auth.uid()
  )
);

drop policy if exists "Admins can manage all notes" on public.notes;
create policy "Admins can manage all notes"
on public.notes
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Clients can read notes for own cases" on public.notes;
create policy "Clients can read notes for own cases"
on public.notes
for select
using (
  exists (
    select 1
    from public.cases
    where public.cases.id = public.notes.case_id
      and public.cases.client_id = auth.uid()
  )
);
