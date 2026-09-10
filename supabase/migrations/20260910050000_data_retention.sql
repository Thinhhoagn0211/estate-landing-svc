create index if not exists messenger_messages_user_sent_idx on public.messenger_messages (user_id, sent_at);
create index if not exists messenger_auto_reply_events_created_idx on public.messenger_auto_reply_events (created_at);
create index if not exists oauth_states_created_idx on public.oauth_states (created_at);
create index if not exists social_post_comments_user_commented_idx on public.social_post_comments (user_id, commented_at);

create or replace function public.prune_expired_app_data()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from oauth_states where created_at < now() - interval '1 day';
  delete from messenger_auto_reply_events where created_at < now() - interval '30 days';
  delete from messenger_messages where sent_at < now() - interval '30 days';
  delete from social_post_comments where commented_at < now() - interval '180 days';
  delete from social_post_metric_snapshots where snapshot_date < current_date - 180;
  delete from post_logs where created_at < now() - interval '365 days';
end;
$$;
revoke all on function public.prune_expired_app_data() from public;
grant execute on function public.prune_expired_app_data() to service_role;
