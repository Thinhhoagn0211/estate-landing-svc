create table if not exists public.post_logs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('zalo', 'zalo_oa', 'facebook', 'tiktok')),
  method text not null check (method in ('auto', 'manual_share')),
  status text not null check (status in ('success', 'error', 'user_confirmed', 'user_declined')),
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.post_logs enable row level security;

create policy "Users can view their own post logs"
  on public.post_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own post logs"
  on public.post_logs for insert
  with check (auth.uid() = user_id);

create index if not exists post_logs_user_id_created_at_idx on public.post_logs (user_id, created_at desc);
