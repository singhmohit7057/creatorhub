alter table brand_collaborations
  add column if not exists content_type   text check (content_type in ('post', 'reel', 'story')),
  add column if not exists cover_image_url text,
  add column if not exists post_url        text;
