create policy "Users can upload their own listing photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read their own listing photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public read access to listing photos"
  on storage.objects for select
  to public
  using (bucket_id = 'listing-photos');
