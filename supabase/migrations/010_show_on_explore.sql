-- Add opt-in/out toggle for Explore page visibility
alter table public.profiles
  add column if not exists show_on_explore boolean not null default true;
