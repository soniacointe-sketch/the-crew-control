create table public.eloah_project_backups (
 id uuid primary key,
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 project_key text not null check (length(project_key) between 1 and 200),
 project_name text not null check (length(project_name) between 1 and 200),
 created_at timestamptz not null default now(),
 payload jsonb not null check (jsonb_typeof(payload)='object' and octet_length(payload::text)<=10000000),
 file_count integer not null default 0 check(file_count between 0 and 200),
 total_bytes bigint not null default 0 check(total_bytes between 0 and 104857600)
);
alter table public.eloah_project_backups enable row level security;
revoke all on public.eloah_project_backups from anon,authenticated;
grant select,insert,delete on public.eloah_project_backups to authenticated;
create policy eloah_backup_owner_read on public.eloah_project_backups for select to authenticated using ((select auth.uid())=owner_id);
create policy eloah_backup_owner_insert on public.eloah_project_backups for insert to authenticated with check ((select auth.uid())=owner_id);
create policy eloah_backup_owner_delete on public.eloah_project_backups for delete to authenticated using ((select auth.uid())=owner_id);
create index eloah_backups_owner_project_date on public.eloah_project_backups(owner_id,project_key,created_at desc);
insert into storage.buckets(id,name,public,file_size_limit) values ('eloah-private','eloah-private',false,26214400);
create policy eloah_files_owner_read on storage.objects for select to authenticated using (bucket_id='eloah-private' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy eloah_files_owner_insert on storage.objects for insert to authenticated with check (bucket_id='eloah-private' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy eloah_files_owner_delete on storage.objects for delete to authenticated using (bucket_id='eloah-private' and (storage.foldername(name))[1]=(select auth.uid())::text);