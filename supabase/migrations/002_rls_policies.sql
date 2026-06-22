-- ============================================================
-- CreatorHub – Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
alter table profiles             enable row level security;
alter table portfolio_stats      enable row level security;
alter table social_links         enable row level security;
alter table media_files          enable row level security;
alter table creator_services     enable row level security;
alter table brand_collaborations enable row level security;
alter table testimonials         enable row level security;
alter table contact_inquiries    enable row level security;
alter table analytics_events     enable row level security;

-- ─── Helper: is current user an admin ────────────────────────

create or replace function is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ─── profiles ────────────────────────────────────────────────

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (is_published = true or auth.uid() = user_id or is_admin());

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = user_id or is_admin());

create policy "Admins can delete profiles"
  on profiles for delete
  using (is_admin());

-- ─── portfolio_stats ─────────────────────────────────────────

create policy "Stats viewable if profile is public"
  on portfolio_stats for select
  using (
    exists (
      select 1 from profiles p
      where p.id = portfolio_stats.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners can upsert their stats"
  on portfolio_stats for all
  using (
    exists (select 1 from profiles where id = portfolio_stats.profile_id and user_id = auth.uid())
  );

-- ─── social_links ────────────────────────────────────────────

create policy "Social links viewable if profile is public"
  on social_links for select
  using (
    exists (
      select 1 from profiles p
      where p.id = social_links.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners manage their social links"
  on social_links for all
  using (
    exists (select 1 from profiles where id = social_links.profile_id and user_id = auth.uid())
  );

-- ─── media_files ─────────────────────────────────────────────

create policy "Media viewable if profile is public"
  on media_files for select
  using (
    exists (
      select 1 from profiles p
      where p.id = media_files.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners manage their media"
  on media_files for all
  using (
    exists (select 1 from profiles where id = media_files.profile_id and user_id = auth.uid())
  );

-- ─── creator_services ────────────────────────────────────────

create policy "Services viewable if profile is public"
  on creator_services for select
  using (
    exists (
      select 1 from profiles p
      where p.id = creator_services.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners manage their services"
  on creator_services for all
  using (
    exists (select 1 from profiles where id = creator_services.profile_id and user_id = auth.uid())
  );

-- ─── brand_collaborations ────────────────────────────────────

create policy "Collabs viewable if profile is public"
  on brand_collaborations for select
  using (
    exists (
      select 1 from profiles p
      where p.id = brand_collaborations.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners manage their collabs"
  on brand_collaborations for all
  using (
    exists (select 1 from profiles where id = brand_collaborations.profile_id and user_id = auth.uid())
  );

-- ─── testimonials ────────────────────────────────────────────

create policy "Testimonials viewable if profile is public"
  on testimonials for select
  using (
    exists (
      select 1 from profiles p
      where p.id = testimonials.profile_id
      and (p.is_published = true or p.user_id = auth.uid() or is_admin())
    )
  );

create policy "Owners manage their testimonials"
  on testimonials for all
  using (
    exists (select 1 from profiles where id = testimonials.profile_id and user_id = auth.uid())
  );

-- ─── contact_inquiries ───────────────────────────────────────

-- Anyone can submit an inquiry (public portfolio contact form)
create policy "Anyone can submit an inquiry"
  on contact_inquiries for insert
  with check (true);

-- Only the creator (profile owner) and admins can read
create policy "Owners and admins can read inquiries"
  on contact_inquiries for select
  using (
    exists (select 1 from profiles where id = contact_inquiries.profile_id and user_id = auth.uid())
    or is_admin()
  );

create policy "Owners can mark inquiries as read"
  on contact_inquiries for update
  using (
    exists (select 1 from profiles where id = contact_inquiries.profile_id and user_id = auth.uid())
    or is_admin()
  );

-- ─── analytics_events ────────────────────────────────────────

-- Anyone (including anon) can insert analytics events
create policy "Anyone can insert analytics events"
  on analytics_events for insert
  with check (true);

-- Only owners and admins can read
create policy "Owners and admins can read analytics"
  on analytics_events for select
  using (
    exists (select 1 from profiles where id = analytics_events.profile_id and user_id = auth.uid())
    or is_admin()
  );
