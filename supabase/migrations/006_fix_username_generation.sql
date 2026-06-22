-- Fix handle_new_user so uppercase letters are lowercased BEFORE regexp_replace.
-- "Mohit Singh" previously produced "_ohit__ingh" because capital M/S were not
-- in [a-z0-9] and got replaced with underscores before lower() ran.
-- Now: lower() first → "mohit singh" → regexp strips space → "mohit_singh"

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  -- lower() first, THEN replace non-alphanumeric chars with underscores
  base_username := regexp_replace(
    lower(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))),
    '[^a-z0-9]+', '_', 'g'
  );
  -- strip leading/trailing underscores (e.g. "_mohit_" → "mohit")
  base_username := trim(both '_' from base_username);
  -- ensure at least 3 chars for the username_format check constraint
  if length(base_username) < 3 then
    base_username := 'user';
  end if;
  -- truncate to 25 chars to leave room for a numeric suffix
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
