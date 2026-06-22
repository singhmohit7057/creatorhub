-- Create verification_requests table
create table if not exists public.verification_requests (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  reason        text not null default '',
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  unique (profile_id)
);

alter table public.verification_requests enable row level security;

-- Creators can insert their own request and read it
create policy "creator_insert_own_request"
  on public.verification_requests for insert
  with check (profile_id in (select id from public.profiles where user_id = auth.uid()));

create policy "creator_read_own_request"
  on public.verification_requests for select
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));

-- Admins can read and update all requests
create policy "admin_read_all_requests"
  on public.verification_requests for select
  using (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));

create policy "admin_update_all_requests"
  on public.verification_requests for update
  using (exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin'));
