create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  deal_type text not null default 'sale' check (deal_type in ('sale', 'rent')),
  price text,
  area text,
  bedrooms text,
  address text,
  direction text,
  legal_status text,
  contact_phone text,
  description text,
  amenities text[] not null default '{}',
  photo_urls text[] not null default '{}',
  caption_primary text,
  hashtags text,
  caption_friendly text,
  status text not null default 'draft' check (status in ('draft', 'live')),
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Users can view their own listings"
  on public.listings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

create index if not exists listings_user_id_created_at_idx on public.listings (user_id, created_at desc);
