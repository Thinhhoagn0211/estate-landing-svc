alter table public.social_post_metrics
  add column if not exists reactions_by_type jsonb not null default '{}'::jsonb;

create table if not exists public.social_post_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('facebook')),
  external_post_id text not null,
  snapshot_date date not null,
  views integer not null default 0 check (views >= 0),
  engagements integer not null default 0 check (engagements >= 0),
  comments integer not null default 0 check (comments >= 0),
  reactions integer not null default 0 check (reactions >= 0),
  shares integer not null default 0 check (shares >= 0),
  unique (user_id, platform, external_post_id, snapshot_date)
);

create index if not exists social_post_metric_snapshots_user_date_idx
  on public.social_post_metric_snapshots (user_id, snapshot_date desc);

alter table public.social_post_metric_snapshots enable row level security;
create policy "Users can read their social metric snapshots"
  on public.social_post_metric_snapshots for select using (auth.uid() = user_id);

create table if not exists public.social_post_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('facebook')),
  external_comment_id text not null,
  external_post_id text not null,
  commenter_id text,
  commenter_name text,
  message text,
  like_count integer not null default 0 check (like_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  comment_url text,
  commented_at timestamptz not null,
  synced_at timestamptz not null default now(),
  unique (user_id, platform, external_comment_id)
);

create index if not exists social_post_comments_user_post_idx
  on public.social_post_comments (user_id, external_post_id, commented_at desc);

alter table public.social_post_comments enable row level security;
create policy "Users can read their social post comments"
  on public.social_post_comments for select using (auth.uid() = user_id);

create table if not exists public.facebook_page_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  page_id text not null,
  name text,
  avatar_url text,
  page_url text,
  about text,
  fan_count integer,
  followers_count integer,
  verification_status text,
  webhook_subscribed boolean not null default false,
  webhook_error text,
  synced_at timestamptz not null default now()
);

alter table public.facebook_page_profiles enable row level security;
create policy "Users can read their Facebook Page profile"
  on public.facebook_page_profiles for select using (auth.uid() = user_id);

alter table public.messenger_conversations
  add column if not exists unread_count integer not null default 0 check (unread_count >= 0),
  add column if not exists last_read_at timestamptz,
  add column if not exists synced_at timestamptz;

alter table public.messenger_messages
  add column if not exists message_type text not null default 'text',
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists delivery_status text not null default 'sent'
    check (delivery_status in ('sent', 'delivered', 'read', 'failed')),
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
