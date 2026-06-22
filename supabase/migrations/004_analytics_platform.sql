-- Add platform column for social_click events
alter table analytics_events add column if not exists platform text;
