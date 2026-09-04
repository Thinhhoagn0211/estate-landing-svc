alter table public.connected_channels drop constraint if exists connected_channels_platform_check;
alter table public.connected_channels add constraint connected_channels_platform_check
  check (platform in ('zalo', 'zalo_oa', 'facebook', 'tiktok'));

alter table public.oauth_states drop constraint if exists oauth_states_platform_check;
alter table public.oauth_states add constraint oauth_states_platform_check
  check (platform in ('zalo', 'zalo_oa', 'facebook', 'tiktok'));
