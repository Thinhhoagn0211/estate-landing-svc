alter table public.messenger_conversations
  add column if not exists external_conversation_id text;
