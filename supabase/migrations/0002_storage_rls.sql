-- Enable public read and authenticated uploads on the place-media bucket for mobile & direct client uploads
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read place-media'
  ) then
    create policy "Public read place-media"
      on storage.objects for select
      using (bucket_id = 'place-media');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated upload place-media'
  ) then
    create policy "Authenticated upload place-media"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'place-media');
  end if;
end $$;
