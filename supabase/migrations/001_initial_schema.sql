-- ============================================================
-- CreatorHub – Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for fast username/name search

-- ─── Enums ──────────────────────────────────────────────────

create type creator_category as enum (
  'fashion','beauty','lifestyle','travel','food','fitness',
  'tech','gaming','education','finance','parenting','other'
);

create type portfolio_template as enum (
  'minimal','modern-dark','fashion-premium','creative-grid'
);

create type service_type as enum (
  'ugc_videos','product_photography','reels','shorts',
  'product_reviews','voice_overs','brand_campaigns','social_media_content'
);

create type social_platform as enum (
  'instagram','tiktok','youtube','linkedin','facebook','website'
);

create type media_type as enum ('image','video');

create type user_role   as enum ('creator','admin');
create type account_status as enum ('active','suspended','deleted');

create type analytics_event_type as enum (
  'portfolio_view','contact_submission','social_click','media_view'
);

-- ─── profiles ────────────────────────────────────────────────

create table profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  username              text not null,
  full_name             text not null default '',
  creator_title         text,
  bio                   text,
  avatar_url            text,
  cover_url             text,
  city                  text,
  country               text,
  languages             text[]   not null default '{}',
  email                 text     not null default '',
  phone                 text,
  role                  user_role         not null default 'creator',
  status                account_status    not null default 'active',
  category              creator_category,
  template              portfolio_template not null default 'minimal',
  is_published          boolean  not null default false,
  is_featured           boolean  not null default false,
  onboarding_completed  boolean  not null default false,
  onboarding_step       smallint not null default 1,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  constraint username_unique unique (username)
);

create index profiles_username_trgm on profiles using gin (username gin_trgm_ops);
create index profiles_full_name_trgm on profiles using gin (full_name gin_trgm_ops);
create index profiles_category on profiles (category) where is_published = true;
create index profiles_country  on profiles (country)  where is_published = true;
create index profiles_featured on profiles (is_featured) where is_published = true;
create index profiles_user_id  on profiles (user_id);

-- ─── portfolio_stats ─────────────────────────────────────────

create table portfolio_stats (
  id                    uuid primary key default uuid_generate_v4(),
  profile_id            uuid not null references profiles(id) on delete cascade,
  followers             bigint,
  monthly_reach         bigint,
  avg_views             bigint,
  engagement_rate       numeric(5,2),
  collaborations_count  int,
  updated_at            timestamptz not null default now(),
  unique (profile_id)
);

-- ─── social_links ────────────────────────────────────────────

create table social_links (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  platform    social_platform not null,
  url         text not null,
  created_at  timestamptz not null default now(),
  unique (profile_id, platform)
);

create index social_links_profile on social_links (profile_id);

-- ─── media_files ─────────────────────────────────────────────

create table media_files (
  id             uuid primary key default uuid_generate_v4(),
  profile_id     uuid not null references profiles(id) on delete cascade,
  type           media_type not null,
  url            text not null,
  thumbnail_url  text,
  title          text,
  description    text,
  size_bytes     bigint not null default 0,
  mime_type      text   not null default '',
  is_featured    boolean not null default false,
  sort_order     int     not null default 0,
  created_at     timestamptz not null default now()
);

create index media_files_profile    on media_files (profile_id);
create index media_files_type       on media_files (profile_id, type);
create index media_files_sort       on media_files (profile_id, sort_order);

-- ─── creator_services ────────────────────────────────────────

create table creator_services (
  id           uuid primary key default uuid_generate_v4(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  service_type service_type not null,
  title        text not null,
  description  text,
  created_at   timestamptz not null default now(),
  unique (profile_id, service_type)
);

create index creator_services_profile on creator_services (profile_id);

-- ─── brand_collaborations ────────────────────────────────────

create table brand_collaborations (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid not null references profiles(id) on delete cascade,
  brand_name           text not null,
  brand_logo_url       text,
  project_description  text,
  campaign_results     text,
  collaboration_date   date,
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now()
);

create index brand_collabs_profile on brand_collaborations (profile_id, sort_order);

-- ─── testimonials ────────────────────────────────────────────

create table testimonials (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  client_name text not null,
  company     text,
  review      text not null,
  avatar_url  text,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create index testimonials_profile on testimonials (profile_id, sort_order);

-- ─── contact_inquiries ───────────────────────────────────────

create table contact_inquiries (
  id              uuid primary key default uuid_generate_v4(),
  profile_id      uuid not null references profiles(id) on delete cascade,
  brand_name      text not null,
  contact_person  text not null,
  email           text not null,
  budget          text,
  project_details text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index contact_inquiries_profile on contact_inquiries (profile_id, created_at desc);

-- ─── analytics_events ────────────────────────────────────────

create table analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  event_type  analytics_event_type not null,
  visitor_id  text,
  referrer    text,
  country     text,
  created_at  timestamptz not null default now()
);

create index analytics_profile_date on analytics_events (profile_id, created_at desc);
create index analytics_event_type   on analytics_events (profile_id, event_type);

-- ─── updated_at trigger ──────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger portfolio_stats_updated_at
  before update on portfolio_stats
  for each row execute function update_updated_at();

-- ─── auto-create profile on signup ───────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
      '[^a-z0-9]', '_', 'g'
    )
  );
  -- truncate to 25 chars max to leave room for suffix
  base_username := left(base_username, 25);
  final_username := base_username;

  loop
    exit when not exists (select 1 from profiles where username = final_username);
    suffix := suffix + 1;
    final_username := base_username || '_' || suffix::text;
  end loop;

  insert into profiles (user_id, username, full_name, email)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );

  insert into portfolio_stats (profile_id)
  select id from profiles where user_id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
