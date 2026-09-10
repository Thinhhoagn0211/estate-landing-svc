create table if not exists public.analytics_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'tiktok', 'zalo')),
  metric_type text not null check (metric_type in ('views', 'engagements', 'comments')),
  metric_value integer not null check (metric_value >= 0),
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists analytics_metrics_user_recorded_at_idx
  on public.analytics_metrics (user_id, recorded_at desc);

create index if not exists analytics_metrics_user_metric_idx
  on public.analytics_metrics (user_id, metric_type, recorded_at desc);

alter table public.analytics_metrics enable row level security;

create policy "Users can read their analytics metrics"
  on public.analytics_metrics for select
  using (auth.uid() = user_id);
