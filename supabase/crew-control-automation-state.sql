create or replace function public.crew_control_automation_state()
returns jsonb language sql stable security invoker set search_path=''
as $f$ select coalesce(jsonb_agg(jsonb_build_object('name',jobname,'schedule',schedule,'active',active)),'[]'::jsonb) from cron.job where jobname in ('crew-invoice-drafts-hourly','crew-payment-followups-hourly','crew-trials-retention-three-months'); $f$;
revoke all on function public.crew_control_automation_state() from public,anon,authenticated;
grant execute on function public.crew_control_automation_state() to service_role;
grant usage on schema cron to service_role;
grant select on cron.job to service_role;