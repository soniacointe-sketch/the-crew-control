-- Suivi privé des dossiers Courrier. Champs facultatifs, politiques de propriété inchangées.
ALTER TABLE public.eloah_mail_cases ADD COLUMN IF NOT EXISTS follow_up_on date, ADD COLUMN IF NOT EXISTS waiting_for text;
COMMENT ON COLUMN public.eloah_mail_cases.follow_up_on IS 'Date de suivi choisie par le propriétaire, distincte de la date limite confirmée due_on. Ne programme aucun envoi.';
COMMENT ON COLUMN public.eloah_mail_cases.waiting_for IS 'Réponse ou interlocuteur attendu, renseigné par le propriétaire.';
CREATE OR REPLACE FUNCTION public.eloah_mail_case_log() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $function$
begin
 if tg_op='INSERT' then
  insert into public.eloah_mail_case_history(owner_id,case_id,description) values(new.owner_id,new.id,'Dossier créé');
 elsif new.status is distinct from old.status or new.next_action is distinct from old.next_action or new.due_on is distinct from old.due_on or new.follow_up_on is distinct from old.follow_up_on or new.waiting_for is distinct from old.waiting_for then
  insert into public.eloah_mail_case_history(owner_id,case_id,description) values(new.owner_id,new.id,'Suivi modifié : ' || coalesce(new.status,'') || ' · ' || left(coalesce(new.next_action,''),150) || case when new.follow_up_on is not null then ' · Suivi prévu le ' || new.follow_up_on::text else '' end);
 end if;
 return new;
end $function$;
NOTIFY pgrst, 'reload schema';