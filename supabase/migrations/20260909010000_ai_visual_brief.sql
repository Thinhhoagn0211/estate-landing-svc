alter table public.listings
  add column if not exists visual_brief jsonb;

comment on column public.listings.visual_brief is
  'Observations extracted from listing photos. These are suggestions for content generation, not verified property facts.';
