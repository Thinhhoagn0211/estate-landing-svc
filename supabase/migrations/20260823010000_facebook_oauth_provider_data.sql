alter table public.oauth_states
  add column if not exists provider_data jsonb;
