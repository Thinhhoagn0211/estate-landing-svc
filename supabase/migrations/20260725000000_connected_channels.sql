create table if not exists public.connected_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('zalo', 'facebook', 'tiktok')),
  external_id text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  unique (user_id, platform)
);

alter table public.connected_channels enable row level security;

-- Users can see their own connections, but never the raw tokens (handled via a view)
create policy "Users can view their own connected channels"
  on public.connected_channels for select
  using (auth.uid() = user_id);

create policy "Users can delete their own connected channels"
  on public.connected_channels for delete
  using (auth.uid() = user_id);

-- No insert/update policy for regular users — only the service-role Edge Function
-- (which bypasses RLS) is allowed to write tokens, so access_token can never be
-- set/tampered with directly from the client.

-- Client-safe view that never exposes tokens
create or replace view public.connected_channels_public as
  select id, user_id, platform, external_id, display_name, avatar_url, connected_at
  from public.connected_channels;

alter view public.connected_channels_public set (security_invoker = true);
