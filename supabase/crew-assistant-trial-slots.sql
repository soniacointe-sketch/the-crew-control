CREATE OR REPLACE FUNCTION public.crew_reserve_public_trial(p_preregistration_id uuid, p_first_name text, p_last_name text, p_group_code text, p_source text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare g public.crew_groups%rowtype; s public.crew_sessions%rowtype; t public.crew_trials%rowtype; occupied integer; reserved integer; chosen date; requested date; today date := (now() at time zone 'Europe/Paris')::date;
begin
 if p_source ~ '^(open_day|assistant)_[0-9]{8}$' then
 requested:=to_date(right(p_source,8),'YYYYMMDD');
 if to_char(requested,'YYYYMMDD')<>right(p_source,8) then raise exception 'Date de découverte invalide';end if;
 end if;
 select * into g from public.crew_groups where code=p_group_code and active=true for update;
 if not found then raise exception 'Groupe indisponible';end if;
 select * into t from public.crew_trials tr where tr.preregistration_id=p_preregistration_id and tr.group_code=p_group_code and tr.trial_status='planned' and tr.planned_date>=today and exists(select 1 from public.crew_sessions cs where cs.group_id=g.id and cs.session_date=tr.planned_date and cs.status='scheduled') order by planned_date limit 1;
 if found then return jsonb_build_object('id',t.id,'planned_date',t.planned_date,'duplicate',true);end if;
 select count(distinct r.member_id) into occupied from public.crew_registrations r join public.crew_members m on m.id=r.member_id where r.group_id=g.id and r.season='2026-2027' and r.registration_status in ('complete','pending') and m.member_status in ('active','pending');
 for s in select sess.* from public.crew_sessions sess where group_id=g.id and status='scheduled' and session_date>=today and (requested is null or session_date=requested) and (session_date>today or starts_at>(now() at time zone 'Europe/Paris')::time) and not exists(select 1 from public.crew_events e where e.event_date=sess.session_date and e.status not in ('cancelled','completed') and (e.starts_at is null or e.ends_at is null or (e.starts_at<sess.ends_at and e.ends_at>sess.starts_at))) order by session_date,starts_at loop
 select count(*) into reserved from public.crew_trials where group_code=p_group_code and planned_date=s.session_date and trial_status='planned';
 if occupied+reserved<least(g.capacity,20) then chosen:=s.session_date;exit;end if;
 end loop;
 insert into public.crew_trials(first_name,last_name,group_code,planned_date,trial_status,source,preregistration_id) values(p_first_name,p_last_name,p_group_code,chosen,'planned',p_source,p_preregistration_id) returning * into t;
 return jsonb_build_object('id',t.id,'planned_date',chosen,'duplicate',false,'awaiting_schedule',chosen is null);
end;$function$
;
create or replace function public.crew_public_trial_slots()
returns table(group_code text,session_date date,starts_at time,ends_at time)
language sql stable security invoker set search_path=''
as $slots$
with candidates as (
 select g.code as group_code,s.session_date,s.starts_at,s.ends_at,
 row_number() over(partition by g.code order by s.session_date,s.starts_at) as rn
 from public.crew_groups g join public.crew_sessions s on s.group_id=g.id
 where g.active and g.code in ('KIDS','ADOS_ADULTES') and s.status='scheduled'
 and s.session_date>=(now() at time zone 'Europe/Paris')::date
 and s.session_date<=((now() at time zone 'Europe/Paris')::date+90)
 and (s.session_date>(now() at time zone 'Europe/Paris')::date or s.starts_at>(now() at time zone 'Europe/Paris')::time)
 and not exists(select 1 from public.crew_events e where e.event_date=s.session_date and e.status not in ('cancelled','completed') and (e.starts_at is null or e.ends_at is null or (e.starts_at<s.ends_at and e.ends_at>s.starts_at)))
 and (
 (select count(distinct r.member_id) from public.crew_registrations r join public.crew_members m on m.id=r.member_id where r.group_id=g.id and r.season='2026-2027' and r.registration_status in ('complete','pending') and m.member_status in ('active','pending'))
 +(select count(*) from public.crew_trials t where t.group_code=g.code and t.planned_date=s.session_date and t.trial_status='planned')
 )<least(g.capacity,20)
)
select c.group_code,c.session_date,c.starts_at,c.ends_at from candidates c where c.rn<=3 order by c.group_code,c.session_date;
$slots$;
revoke all on function public.crew_public_trial_slots() from public,anon,authenticated;
grant execute on function public.crew_public_trial_slots() to service_role;
revoke all on function public.crew_reserve_public_trial(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.crew_reserve_public_trial(uuid,text,text,text,text) to service_role;