-- Track how many times a verification request has been rejected
alter table public.verification_requests
  add column if not exists times_rejected int not null default 0;
