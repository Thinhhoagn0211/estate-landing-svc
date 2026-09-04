create table if not exists public.messenger_auto_replies (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  reply_text text not null default 'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ phản hồi sớm nhất!',
  updated_at timestamptz not null default now(),
  constraint messenger_auto_replies_reply_text_length check (char_length(reply_text) between 1 and 1000)
);

alter table public.messenger_auto_replies enable row level security;

create policy "Users can read their Messenger auto-reply settings"
  on public.messenger_auto_replies for select using (auth.uid() = user_id);

create policy "Users can create their Messenger auto-reply settings"
  on public.messenger_auto_replies for insert with check (auth.uid() = user_id);

create policy "Users can update their Messenger auto-reply settings"
  on public.messenger_auto_replies for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.messenger_auto_reply_events (
  message_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  page_id text not null,
  sender_id text not null,
  created_at timestamptz not null default now()
);

alter table public.messenger_auto_reply_events enable row level security;
