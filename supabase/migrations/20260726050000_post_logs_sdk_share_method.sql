alter table public.post_logs drop constraint if exists post_logs_method_check;
alter table public.post_logs add constraint post_logs_method_check
  check (method in ('auto', 'manual_share', 'sdk_share'));
