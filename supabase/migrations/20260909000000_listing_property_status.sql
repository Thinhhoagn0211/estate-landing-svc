alter table public.listings
  add column if not exists property_status text not null default 'active'
  check (property_status in ('active', 'paused', 'sold', 'rented', 'archived'));

alter table public.listings
  add column if not exists updated_at timestamptz not null default now();

alter table public.listings
  add column if not exists property_type text,
  add column if not exists bathrooms text,
  add column if not exists price_negotiable boolean not null default false;

create index if not exists listings_user_property_status_idx
  on public.listings (user_id, property_status, updated_at desc);
