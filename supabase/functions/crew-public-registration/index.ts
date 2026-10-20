import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const SITE = "https://thecreworchies.blog";
const THANK_YOU = SITE + "/merci-essai/";
const cors = {
  "Access-Control-Allow-Origin": SITE,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const clean = (v: unknown) => typeof v === "string" ? v.trim() : "";
const isTrue = (v: unknown) => v === true || ["true","1","on","yes"].includes(String(v ?? "").toLowerCase());

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("application/json")) return await req.json();
  if (ct.includes("multipart/form-data")) {
    const fd = await req.formData();
    return Object.fromEntries(fd.entries());
  }
  const txt = await req.text();
  return Object.fromEntries(new URLSearchParams(txt).entries());
}

function ageFromBirthDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const birth = new Date(value + "T00:00:00Z");
  if (Number.isNaN(birth.getTime()) || birth > new Date()) return null;
  if (birth.toISOString().slice(0,10) !== value) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const m = today.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

function fail(message: string, status = 400, html = false) {
  if (html) {
    return new Response(
      "Impossible d’enregistrer la demande : " + message + "\nRetourne sur thecreworchies.blog/inscription/ ou contacte The Crew.",
      { status, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
  return new Response(JSON.stringify({ ok: false, error: message }), { status, headers: cors });
}

function groupLabel(groupCode: string) {
  return groupCode === "KIDS" ? "KIDS 4–11 ans" : "ADOS & ADULTES";
}

function dateLabel(plannedDate: string | null) {
  return plannedDate
    ? new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(plannedDate+"T12:00:00Z"))
    : "À planifier";
}

async function sendResend(
  apiKey: string,
  payload: { from: string; to: string[]; subject: string; text: string; html: string; reply_to?: string }
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(()=>({}));
  return { ok: res.ok, status: res.status, id: body?.id || null, error: body?.message || null };
}


async function recordCrewAbsence(b:Record<string,unknown>, req:Request, browserForm:boolean) {
 const error=(s:string,status=400)=>new Response(s+" Retourne au formulaire de déclaration d’absence.",{status,headers:{"content-type":"text/plain; charset=utf-8"}});
 const origin=req.headers.get("origin"); if(origin && origin!==SITE)return error("Origine non autorisée.",403);
 if(clean(b.website))return error("Demande non acceptée.");
 const full_name=clean(b.full_name), contact_email=clean(b.contact_email).toLowerCase(), group_code=clean(b.group_code);
 const selectedDates=Object.entries(b).filter(([k,v])=>/^absence_\d{4}-\d{2}-\d{2}$/.test(k)&&typeof v==="string").map(([,v])=>String(v));
 const dates=[...new Set((selectedDates.length?selectedDates:Array.isArray(b.absence_dates)?b.absence_dates:clean(b.absence_dates).split(/[\s,;]+/)).map(v=>String(v).trim()).filter(Boolean))].sort();
 const today=new Date().toISOString().slice(0,10);
 if(full_name.length<2||full_name.length>120||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)||contact_email.length>254)return error("Vérifie le nom et l’adresse e-mail.");
 if(!["KIDS","ADOS_ADULTES","ATELIER"].includes(group_code))return error("Choisis le groupe.");
 if(!isTrue(b.consent_data))return error("Merci d’accepter le traitement de cette déclaration.");
 if(!dates.length||dates.length>20||dates.some(v=>!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v+"T12:00:00Z").toISOString().slice(0,10)!==v||v<today||v>"2027-08-31"))return error("Indique entre 1 et 20 dates à venir, au format AAAA-MM-JJ, pour la saison 2026–2027.");
 const notes=clean(b.notes);if(notes.length>1000)return error("La remarque doit rester sous 1 000 caractères.");
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const {count,error:countError}=await sb.from("crew_absence_declarations").select("id",{count:"exact",head:true}).eq("contact_email",contact_email).gte("created_at",new Date(Date.now()-3600000).toISOString());
 if(countError)return error("Service temporairement indisponible.",503); if((count||0)>=5)return error("Trop de demandes. Réessaie dans une heure ou contacte Sonia.",429);
 const {data:row,error:insertError}=await sb.from("crew_absence_declarations").insert({full_name,contact_email,group_code,absence_dates:dates,notes:notes||null,consent_data:true}).select("id").single();
 if(insertError)return error("Enregistrement impossible. Contacte Sonia.",503);
 try{
 const {data:key}=await sb.rpc("crew_get_resend_api_key");
 if(typeof key==="string"&&key){
 const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
 const text=["Déclaration d’absence — The Crew Orchies","Nom : "+full_name,"Groupe : "+group_code,"Dates : "+dates.join(", "),"Contact : "+contact_email,"Remarque : "+(notes||"—"),"Référence : "+row.id].join("\n");
 const sent=await sendResend(key,{from:"The Crew Orchies <bonjour@thecreworchies.blog>",to:["soniacointe@icloud.com"],reply_to:contact_email,subject:"Absence déclarée — "+group_code,text,html:"<pre style=\"font:16px/1.6 Arial,sans-serif;white-space:pre-wrap\">"+esc(text)+"</pre>"});
 await sb.from("crew_absence_declarations").update({notification_status:sent.ok?"sent":"failed",notification_email_id:sent.id}).eq("id",row.id);
 }
 }catch{await sb.from("crew_absence_declarations").update({notification_status:"failed"}).eq("id",row.id);}
 if(browserForm)return new Response("<!doctype html><html lang=\"fr\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Absence enregistrée — The Crew</title><body style=\"background:#090909;color:#f7f2e8;font:18px/1.7 Arial,sans-serif;padding:40px 24px;max-width:650px;margin:auto\"><h1 style=\"color:#d8b96e\">Ton absence est enregistrée.</h1><p>L’équipe peut consulter ta déclaration. Tu n’as rien d’autre à envoyer.</p><p><a style=\"color:#d8b96e\" href=\"https://thecreworchies.blog/\">Retour à The Crew →</a></p></body></html>",{headers:{"content-type":"text/html; charset=utf-8","Cache-Control":"no-store"}});
 return new Response(JSON.stringify({ok:true,id:row.id}),{headers:cors});
}


async function publicActivityListing() {
 try {
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const [{data:groups,error:ge},{data:events,error:ee}]=await Promise.all([
 sb.from("crew_groups").select("code,name,description,target_audience,frequency,responsible,capacity,tariff_label,tracking_status").eq("active",true).in("code",["KIDS","ADOS_ADULTES"]),
 sb.from("crew_events").select("title,event_date,starts_at,ends_at,description,target_audience,frequency,responsible,capacity,tariff_label,status").neq("status","cancelled").order("event_date",{ascending:false})]);
 if(ge||ee)throw new Error("Activity listing unavailable");
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const items=[...(groups||[]).map(g=>({type:"Activité",title:g.name,description:g.description,target_audience:g.target_audience,frequency:g.frequency,responsible:g.responsible,capacity:g.capacity,tariff_label:g.tariff_label,status:g.tracking_status==="termine"?"Terminé":g.tracking_status==="planifie"?"Planifié":"En cours",needs_review:false})),
 ...(events||[]).map(e=>({type:"Atelier · Événement",title:e.title,description:e.description,target_audience:e.target_audience,frequency:e.frequency,responsible:e.responsible,capacity:e.capacity,tariff_label:e.tariff_label,status:e.status==="completed"||e.event_date<today?"Terminé":"Planifié",needs_review:e.status==="draft"}))];
 return new Response(JSON.stringify({ok:true,items,updated_at:new Date().toISOString()}),{headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"public, max-age=30","X-Content-Type-Options":"nosniff"}});
 }catch{return new Response(JSON.stringify({ok:false,error:"Suivi temporairement indisponible"}),{status:503,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"no-store"}});}
}


async function publicTrialSlots() {
 try {
 const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const {data,error}=await sb.rpc("crew_public_trial_slots");if(error)throw error;
 return new Response(JSON.stringify({ok:true,slots:data||[],checked_at:new Date().toISOString(),notice:"Disponibilités indicatives, revérifiées lors de la réservation."}),{headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return new Response(JSON.stringify({ok:false,error:"Disponibilités momentanément indisponibles."}),{status:503,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Cache-Control":"no-store"}});}
}


function assistantTrialReceipt(plannedDate:string|null,duplicate=false){
 const date=plannedDate?dateLabel(plannedDate):"";
 const title=duplicate?"Un essai est déjà prévu pour toi.":plannedDate?"Ton essai est réservé.":"Ta demande est enregistrée.";
 const detail=plannedDate?("Date retenue : "+date+". "+(duplicate?"La réservation existante est conservée ; contacte Sonia pour la modifier.":"Le groupe est déterminé par l’âge : 4–11 ans de 18 h 30 à 19 h 30 ; dès 12 ans de 19 h 30 à 20 h 30.")):"Le créneau n’a pas pu être réservé. Aucune autre date ne t’a été attribuée : Sonia te recontactera pour trouver une solution.";
 return new Response('<!doctype html><html lang="fr"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ton essai — The Crew</title><body style="background:#111;color:#f7f2e8;font:17px/1.7 Arial,sans-serif;padding:35px 22px;max-width:650px;margin:auto"><p style="color:#d8b96e">THE CREW ORCHIES</p><h1>'+title+'</h1><p>'+detail+'</p><p>Espace Marypomme · 18 rue Gaston Leroy · Orchies.</p><p>Prévois une tenue confortable, des baskets propres et une bouteille d’eau. Si tu as indiqué un e-mail, consulte ta boîte et tes indésirables pour la confirmation.</p><p><a style="color:#d8b96e" href="https://thecreworchies.blog/contact/">Contacter Sonia →</a></p><p><a style="color:#d8b96e" href="https://thecreworchies.blog/">Retour au site →</a></p></body></html>',{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}

Deno.serve(async (req: Request) => {
  if(req.method==="GET"&&new URL(req.url).searchParams.get("resource")==="trial-slots")return publicTrialSlots();
  if(req.method==="GET"&&new URL(req.url).searchParams.get("resource")==="activities")return publicActivityListing();
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return fail("POST required", 405);

  const ct = (req.headers.get("content-type") || "").toLowerCase();
  const browserForm = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data");

  try {
    const b = await parseBody(req);
    if(clean(b.source)==="website_absence_form")return await recordCrewAbsence(b,req,browserForm);

    if (clean(b.website)) return browserForm ? Response.redirect(THANK_YOU, 303) : new Response(JSON.stringify({ok:true}), {headers:cors});

    const firstName = clean(b.first_name);
    const lastName = clean(b.last_name);
    const birthDate = clean(b.birth_date);
    if (!firstName || !lastName || !birthDate) return fail("Prénom, nom et date de naissance obligatoires.", 400, browserForm);
    if (!isTrue(b.consent_data)) return fail("Le consentement au traitement des données est obligatoire.", 400, browserForm);

    const age = ageFromBirthDate(birthDate);
    if (age === null) return fail("Date de naissance invalide.", 400, browserForm);
    if (age < 4) return fail("Les cours réguliers commencent à 4 ans.", 400, browserForm);

    const guardianName = clean(b.guardian_name) || null;
    const guardianEmail = clean(b.guardian_email) || null;
    const guardianPhone = clean(b.guardian_phone) || null;
    const email = clean(b.email) || null;
    const phone = clean(b.phone) || null;

    if (age < 18 && !guardianName) return fail("Responsable légal obligatoire pour un mineur.", 400, browserForm);
    if (age < 18 && !guardianEmail && !guardianPhone) return fail("Un e-mail ou téléphone du responsable légal est obligatoire.", 400, browserForm);
    if (age >= 18 && !email && !phone) return fail("Un e-mail ou téléphone est obligatoire.", 400, browserForm);

    if (age < 18 && !isTrue(b.guardian_authorization)) return fail("L’autorisation du responsable légal est obligatoire pour un mineur.", 400, browserForm);
    const authorizationEvidence = {
      guardian_authorization: age < 18 ? true : null,
      guardian_authorization_recorded_at: age < 18 ? new Date().toISOString() : null,
      guardian_authorization_text: age < 18 ? "Je suis le responsable légal et j’autorise ce mineur à participer au cours d’essai." : null,
      consent_form_version: "2026-10-19"
    };
    const groupCode = age <= 11 ? "KIDS" : "ADOS_ADULTES";
    const contactEmail = age < 18 ? (guardianEmail || email) : email;
    const contactPhone = age < 18 ? (guardianPhone || phone) : phone;
    const rawSource = clean(b.source);
    const source = /^[a-zA-Z0-9_-]{1,80}$/.test(rawSource) ? rawSource : "website_trial_form";
    const now = new Date();
    const today = now.toISOString().slice(0,10);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const submission = {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      email,
      phone,
      guardian_name: guardianName,
      guardian_email: guardianEmail,
      guardian_phone: guardianPhone,
      season: "2026-2027",
      consent_data: true,
      consent_image: isTrue(b.consent_image) ? true : null,
      source,
      processing_status: "new",
      processing_result: { ...authorizationEvidence, group_code: groupCode, age },
    };

    const { data: intake, error: intakeError } = await sb
      .from("crew_intake_submissions")
      .insert(submission)
      .select("id")
      .single();
    if (intakeError) throw intakeError;

    const { data: existing } = await sb
      .from("crew_preregistrations")
      .select("id,group_code,status")
      .eq("birth_date", birthDate)
      .ilike("first_name", firstName)
      .ilike("last_name", lastName)
      .neq("status", "cancelled")
      .limit(1)
      .maybeSingle();

    let preregId: string;

    if (existing?.id) {
      preregId = existing.id;

      await sb
        .from("crew_preregistrations")
        .update({
          submitted_at: now.toISOString(),
          group_code: groupCode,
          guardian_name: guardianName,
          email: contactEmail,
          phone: contactPhone,
          consent: true,
          source,
          status: "pre_registered",
        })
        .eq("id", preregId);

      const { data: activeTrial } = await sb
        .from("crew_trials")
        .select("id,planned_date,trial_status")
        .eq("preregistration_id", preregId)
        .eq("trial_status", "planned")
        .gte("planned_date", today)
        .order("planned_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      let activeTrialSessionValid=false;
      if(activeTrial?.id&&activeTrial.planned_date){
        const {data:activeGroup}=await sb.from("crew_groups").select("id").eq("code",groupCode).eq("active",true).maybeSingle();
        if(activeGroup?.id){const {data:validSessions}=await sb.from("crew_sessions").select("id").eq("group_id",activeGroup.id).eq("session_date",activeTrial.planned_date).eq("status","scheduled").limit(1);activeTrialSessionValid=Boolean(validSessions?.length);}
      }
      if (activeTrial?.id && activeTrialSessionValid) {
        await sb
          .from("crew_intake_submissions")
          .update({
            processing_status: "processed",
            processing_result: { ...authorizationEvidence,
              group_code: groupCode,
              age,
              source,
              preregistration_id: preregId,
              trial_id: activeTrial.id,
              planned_date: activeTrial.planned_date,
              duplicate_active: true,
            },
            processed_at: new Date().toISOString(),
          })
          .eq("id", intake.id);

        if (browserForm && /^assistant_[0-9]{8}$/.test(source)) return assistantTrialReceipt(activeTrial.planned_date,true);
        if (browserForm) return Response.redirect(THANK_YOU, 303);
        return new Response(JSON.stringify({
          ok: true,
          duplicate: true,
          active_trial: true,
          preregistration_id: preregId,
          trial_id: activeTrial.id,
          group_code: groupCode,
          planned_date: activeTrial.planned_date,
        }), { status: 200, headers: cors });
      }
    } else {
      const { data: prereg, error: preregError } = await sb
        .from("crew_preregistrations")
        .insert({
          submitted_at: now.toISOString(),
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          group_code: groupCode,
          guardian_name: guardianName,
          email: contactEmail,
          phone: contactPhone,
          consent: true,
          source,
          status: "pre_registered",
        })
        .select("id")
        .single();
      if (preregError) throw preregError;
      preregId = prereg.id;
    }

    const { data: reservation, error: trialError } = await sb.rpc("crew_reserve_public_trial", {
      p_preregistration_id: preregId,p_first_name:firstName,p_last_name:lastName,p_group_code:groupCode,p_source:source
    });
    if(trialError||!reservation?.id)throw trialError||new Error("Réservation indisponible");
    const trial={id:reservation.id};
    const plannedDate:string|null=reservation.planned_date||null;

    if (plannedDate) {
      const d = new Date(plannedDate + "T12:00:00Z");
      const before = new Date(d);
      before.setUTCDate(before.getUTCDate() - 1);
      const after = new Date(d);
      after.setUTCDate(after.getUTCDate() + 1);
      await sb.from("crew_tasks").insert([
        {
          task_type: "trial_reminder",
          title: "Rappel avant essai — " + firstName + " " + lastName,
          description: "Vérifier que la personne a bien les informations pratiques pour son essai " + groupCode + ".",
          priority: "normal",
          due_date: before.toISOString().slice(0,10),
          source_type: "trial",
          source_id: trial.id,
        },
        {
          task_type: "trial_followup",
          title: "Suite après essai — " + firstName + " " + lastName,
          description: "Vérifier la présence, noter le retour et envoyer le lien HelloAsso si la personne souhaite continuer.",
          priority: "high",
          due_date: after.toISOString().slice(0,10),
          source_type: "trial",
          source_id: trial.id,
        }
      ]);
    } else {
      await sb.from("crew_tasks").insert({
        task_type: "trial_schedule",
        title: "Planifier un essai — " + firstName + " " + lastName,
        description: "Aucune prochaine séance planifiée n’a été trouvée pour " + groupCode + ".",
        priority: "high",
        due_date: today,
        source_type: "trial",
        source_id: trial.id,
      });
    }

    let notificationResult: Record<string, unknown> = {
      admin_email_sent: false,
      participant_email_sent: false,
    };

    try {
      const { data: resendKey, error: keyError } = await sb.rpc("crew_get_resend_api_key");
      if (keyError) throw keyError;
      if (typeof resendKey !== "string" || !resendKey) throw new Error("Clé Resend indisponible");

      const label = groupLabel(groupCode);
      const formattedDate = dateLabel(plannedDate);

      const alertText = [
        "Nouvelle réservation de cours d’essai The Crew",
        "",
        "Prénom : " + firstName,
        "Nom : " + lastName,
        "Groupe : " + label,
        "Téléphone : " + (contactPhone || "—"),
        "E-mail : " + (contactEmail || "—"),
        "Date prévue : " + formattedDate,
        "Statut : Préinscrit",
        "Source : " + source,
        "",
        "Ouvrir The Crew Control pour le suivi."
      ].join("\n");

      const adminResult = await sendResend(resendKey, {
        from: "The Crew Orchies <bonjour@thecreworchies.blog>",
        to: ["soniacointe@icloud.com"],
        subject: "Nouvelle réservation d’essai — " + label,
        text: alertText,
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto">
          <p style="font-size:12px;letter-spacing:.12em;color:#8a6b1f"><strong>THE CREW ORCHIES</strong></p>
          <h2>Nouvelle réservation de cours d’essai</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0"><strong>Prénom</strong></td><td>${firstName}</td></tr>
            <tr><td style="padding:8px 0"><strong>Nom</strong></td><td>${lastName}</td></tr>
            <tr><td style="padding:8px 0"><strong>Groupe</strong></td><td>${label}</td></tr>
            <tr><td style="padding:8px 0"><strong>Téléphone</strong></td><td>${contactPhone || "—"}</td></tr>
            <tr><td style="padding:8px 0"><strong>E-mail</strong></td><td>${contactEmail || "—"}</td></tr>
            <tr><td style="padding:8px 0"><strong>Date prévue</strong></td><td>${formattedDate}</td></tr>
            <tr><td style="padding:8px 0"><strong>Statut</strong></td><td>Préinscrit</td></tr>
          </table>
          <p style="margin-top:24px"><a href="https://soniacointe-sketch.github.io/the-crew-control/" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">OUVRIR THE CREW CONTROL</a></p>
        </div>`,
      });

      const participantFrom = "The Crew Orchies <bonjour@thecreworchies.blog>";
      let participantResult: Record<string, unknown> = {
        sent: false,
        skipped: !contactEmail,
        reason: contactEmail ? null : "no_email",
      };

      if (contactEmail) {
        const practical = plannedDate
          ? `Ton cours d’essai est prévu le ${formattedDate} à l’Espace Marypomme, 18 rue Gaston Leroy, 59310 Orchies.`
          : "Nous avons bien reçu ta demande. The Crew te recontactera pour fixer la date de ton essai.";

        const result = await sendResend(resendKey, {
          from: participantFrom,
          to: [contactEmail],
          reply_to: "soniacointe@icloud.com",
          subject: "Ton cours d’essai The Crew Orchies",
          text: [
            "Bonjour " + firstName + ",",
            "",
            "Ta demande de cours d’essai est bien enregistrée.",
            "Groupe : " + label,
            "Date : " + formattedDate,
            "Lieu : Espace Marypomme — 18 rue Gaston Leroy, 59310 Orchies",
            "",
            practical,
            "",
            "Prévois une tenue confortable, des baskets propres et une bouteille d’eau.",
            "",
            "À bientôt,",
            "The Crew Orchies"
          ].join("\n"),
          html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#111">
            <p style="font-size:12px;letter-spacing:.14em;color:#8a6b1f"><strong>THE CREW ORCHIES</strong></p>
            <h1 style="font-size:32px;line-height:1.05">TA DEMANDE EST BIEN ENREGISTRÉE.</h1>
            <p>Bonjour ${firstName},</p>
            <p>Ton cours d’essai est bien enregistré.</p>
            <div style="background:#111;color:#fff;border-radius:16px;padding:20px;margin:22px 0">
              <p style="margin:0 0 8px"><strong>Groupe :</strong> ${label}</p>
              <p style="margin:0 0 8px"><strong>Date :</strong> ${formattedDate}</p>
              <p style="margin:0"><strong>Lieu :</strong> Espace Marypomme · 18 rue Gaston Leroy · 59310 Orchies</p>
            </div>
            <p>${practical}</p>
            <p>Prévois une tenue confortable, des baskets propres et une bouteille d’eau.</p>
            <p style="margin-top:26px"><strong>À bientôt,<br>The Crew Orchies</strong></p>
          </div>`,
        });
        participantResult = {
          sent: result.ok,
          skipped: false,
          status: result.status,
          id: result.id,
          error: result.error,
        };
      }

      notificationResult = {
        admin_email_sent: adminResult.ok,
        admin_email_status: adminResult.status,
        admin_email_id: adminResult.id,
        participant_email_sent: participantResult.sent === true,
        participant_email: participantResult,
      };
    } catch (notifyError) {
      notificationResult = {
        admin_email_sent: false,
        participant_email_sent: false,
        email_error: notifyError instanceof Error ? notifyError.message : "Erreur notification"
      };
    }

    await sb
      .from("crew_intake_submissions")
      .update({
        processing_status: "processed",
        processing_result: { ...authorizationEvidence,
          group_code: groupCode,
          age,
          source,
          preregistration_id: preregId,
          trial_id: trial.id,
          planned_date: plannedDate,
          rebooked_after_previous_trial: !!existing?.id,
          notification: notificationResult
        },
        processed_at: new Date().toISOString(),
      })
      .eq("id", intake.id);

    if (browserForm && /^assistant_[0-9]{8}$/.test(source)) return assistantTrialReceipt(plannedDate);
    if (browserForm) return Response.redirect(THANK_YOU, 303);

    return new Response(JSON.stringify({
      ok: true,
      preregistration_id: preregId,
      trial_id: trial.id,
      group_code: groupCode,
      planned_date: plannedDate,
      rebooked_after_previous_trial: !!existing?.id,
    }), { status: 200, headers: cors });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Erreur serveur.", 500, browserForm);
  }
});