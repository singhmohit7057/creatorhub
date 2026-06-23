-- Remove content_type check constraint to allow any text value
alter table public.brand_collaborations
  drop constraint if exists brand_collaborations_content_type_check;
