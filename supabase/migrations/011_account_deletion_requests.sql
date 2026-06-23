-- Account deletion requests table
create table if not exists public.account_deletion_requests (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  reason      text not null default '',
  status      text not null default 'pending' check (status in ('pending', 'dismissed', 'deleted')),
  requested_at timestamptz not null default now(),
  reviewed_at  timestamptz,
  unique (profile_id)
);

alter table public.account_deletion_requests enable row level security;

-- Creator can insert/read own request
create policy "creator insert deletion request" on public.account_deletion_requests
  for insert to authenticated
  with check (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "creator read own deletion request" on public.account_deletion_requests
  for select to authenticated
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

-- Admin can read and update all
create policy "admin read deletion requests" on public.account_deletion_requests
  for select to authenticated
  using ((select role from public.profiles where user_id = auth.uid()) = 'admin');

create policy "admin update deletion requests" on public.account_deletion_requests
  for update to authenticated
  using ((select role from public.profiles where user_id = auth.uid()) = 'admin');
