alter table public.messenger_conversations
  add column if not exists sender_avatar_url text;
