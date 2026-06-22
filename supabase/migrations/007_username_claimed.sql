-- Track whether the user has explicitly claimed their username.
-- Auto-generated usernames (from the trigger) stay false and remain editable.
-- Once the user saves their chosen username via the UI, this flips to true
-- and the username is permanently locked.

alter table profiles
  add column if not exists username_claimed boolean not null default false;

-- Existing rows keep false (auto-generated, still changeable via Settings).
-- Future rows inserted by handle_new_user also default to false.
