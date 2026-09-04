create table if not exists public.oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  code_verifier text not null,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;
-- No policies: only the service-role key (used by Edge Functions) can read/write this table.
