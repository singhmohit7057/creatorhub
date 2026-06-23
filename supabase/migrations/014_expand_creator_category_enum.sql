-- Expand creator_category enum to 25 values
alter type creator_category add value if not exists 'music';
alter type creator_category add value if not exists 'entertainment';
alter type creator_category add value if not exists 'sports';
alter type creator_category add value if not exists 'art';
alter type creator_category add value if not exists 'photography';
alter type creator_category add value if not exists 'comedy';
alter type creator_category add value if not exists 'diy';
alter type creator_category add value if not exists 'pets';
alter type creator_category add value if not exists 'health';
alter type creator_category add value if not exists 'business';
alter type creator_category add value if not exists 'automotive';
alter type creator_category add value if not exists 'nature';
alter type creator_category add value if not exists 'motivation';
