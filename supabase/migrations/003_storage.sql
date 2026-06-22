-- ============================================================
-- CreatorHub – Storage Buckets & Policies
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',   'avatars',   true, 5242880,    array['image/jpeg','image/png','image/webp']),
  ('covers',    'covers',    true, 10485760,   array['image/jpeg','image/png','image/webp']),
  ('media',     'media',     true, 104857600,  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']),
  ('logos',     'logos',     true, 5242880,    array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('testimonials','testimonials',true,5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- Avatars: owner can upload/update, public read
create policy "Avatar upload by owner"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatar update by owner"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatar delete by owner"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatars are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Covers
create policy "Cover upload by owner"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Cover update by owner"
  on storage.objects for update
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Cover delete by owner"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Covers are public"
  on storage.objects for select
  using (bucket_id = 'covers');

-- Media
create policy "Media upload by owner"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Media delete by owner"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Media are public"
  on storage.objects for select
  using (bucket_id = 'media');

-- Logos
create policy "Logo upload by owner"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Logo delete by owner"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Logos are public"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Testimonial avatars
create policy "Testimonial avatar upload by owner"
  on storage.objects for insert
  with check (bucket_id = 'testimonials' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Testimonial avatar delete by owner"
  on storage.objects for delete
  using (bucket_id = 'testimonials' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Testimonial avatars are public"
  on storage.objects for select
  using (bucket_id = 'testimonials');
