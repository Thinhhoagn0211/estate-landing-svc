create table if not exists public.messenger_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null,
  sender_id text not null,
  last_message text not null default '',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, page_id, sender_id)
);

create table if not exists public.messenger_messages (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  conversation_id uuid not null references public.messenger_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('incoming', 'outgoing')),
  body text not null,
  sent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists messenger_conversations_user_last_message_idx
  on public.messenger_conversations (user_id, last_message_at desc);

create index if not exists messenger_messages_conversation_sent_idx
  on public.messenger_messages (conversation_id, sent_at asc);

alter table public.messenger_conversations enable row level security;
alter table public.messenger_messages enable row level security;

create policy "Users can read their Messenger conversations"
  on public.messenger_conversations for select
  using (auth.uid() = user_id);

create policy "Users can read their Messenger messages"
  on public.messenger_messages for select
  using (auth.uid() = user_id);
