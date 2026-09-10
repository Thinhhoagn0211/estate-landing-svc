create table if not exists public.social_post_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  platform text not null check (platform in ('facebook', 'tiktok', 'zalo')),
  external_post_id text not null,
  post_url text,
  message text,
  published_at timestamptz not null,
  views integer not null default 0 check (views >= 0),
  engagements integer not null default 0 check (engagements >= 0),
  comments integer not null default 0 check (comments >= 0),
  reactions integer not null default 0 check (reactions >= 0),
  shares integer not null default 0 check (shares >= 0),
  synced_at timestamptz not null default now(),
  unique (user_id, platform, external_post_id)
);

create index if not exists social_post_metrics_user_published_idx
  on public.social_post_metrics (user_id, published_at desc);

alter table public.social_post_metrics enable row level security;

create policy "Users can read their social post metrics"
  on public.social_post_metrics for select
  using (auth.uid() = user_id);

alter table public.post_logs
  add column if not exists external_post_id text,
  add column if not exists external_post_url text;

create index if not exists post_logs_external_post_idx
  on public.post_logs (user_id, platform, external_post_id)
  where external_post_id is not null;
