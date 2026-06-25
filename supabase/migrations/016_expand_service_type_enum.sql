-- Add new platform-specific service types
alter type service_type add value if not exists 'youtube_video';
alter type service_type add value if not exists 'youtube_integration';
alter type service_type add value if not exists 'instagram_post';
alter type service_type add value if not exists 'instagram_stories';
alter type service_type add value if not exists 'live_streaming';
alter type service_type add value if not exists 'brand_ambassador';
alter type service_type add value if not exists 'affiliate_marketing';
