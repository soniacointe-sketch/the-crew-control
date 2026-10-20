import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const H={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization,content-type",
  "Access-Control-Allow-Methods":"POST,OPTIONS",
  "Content-Type":"application/json"
};

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:H});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"POST requis"}),{status:405,headers:H});

  const s=createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {auth:{persistSession:false}}
  );

  const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
  const {data:u}=await s.auth.getUser(token);
  if(!u.user) return new Response(JSON.stringify({error:"Connexion requise"}),{status:401,headers:H});

  const {data:list}=await s.auth.admin.listUsers({page:1,perPage:100});
  const first=[...(list?.users||[])].sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())[0];
  if(!first||first.id!==u.user.id) return new Response(JSON.stringify({error:"Accès administrateur requis"}),{status:403,headers:H});

  try{
    const b=await req.json();
    const a=String(b.action||"");


    const hubReply=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{...H,"Cache-Control":"no-store"}});
    const hubUUID=(x:unknown)=>typeof x==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
    const hubDate=(x:unknown)=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x))&&new Date(x+"T12:00:00Z").toISOString().slice(0,10)===x;
    const hubTime=(x:unknown)=>typeof x==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
    if(a==="hub_overview"){
      const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      const result=await Promise.all([
       s.from("crew_groups").select("id,code,name,capacity,active,frequency,tariff_label").eq("active",true),
       s.from("crew_sessions").select("id,group_id,session_date,starts_at,ends_at,title,status,cancellation_reason").gte("session_date",today).order("session_date").order("starts_at").limit(200),
       s.from("crew_events").select("id,title,event_date,starts_at,ends_at,venue,capacity,price,min_age,status,external_url,description,target_audience,responsible,tariff_label").order("event_date",{ascending:false}).limit(150),
       s.from("crew_trials").select("group_code,planned_date").eq("trial_status","planned").gte("planned_date",today),
       s.from("crew_absence_declarations").select("id",{head:true,count:"exact"}).eq("status","new")
      ]);
      const err=result.find(x=>x.error)?.error;if(err)throw err;
      return hubReply({ok:true,groups:result[0].data,sessions:result[1].data,events:result[2].data,planned_trials:result[3].data,new_absences:result[4].count,checked_at:new Date().toISOString()});
    }
    if(a==="hub_absences"){
      const {data,error}=await s.from("crew_absence_declarations").select("id,created_at,full_name,contact_email,group_code,absence_dates,notes,notification_status,status").order("created_at",{ascending:false}).limit(250);
      if(error)throw error;return hubReply({ok:true,items:data});
    }
    if(a==="hub_absence_status"){
      if(b.confirmed!==true||!hubUUID(b.id)||!["new","handled"].includes(b.status))return hubReply({error:"Déclaration et confirmation requises."},400);
      const {data,error}=await s.from("crew_absence_declarations").update({status:b.status}).eq("id",b.id).select("id,status").single();if(error)throw error;
      return hubReply({ok:true,item:data});
    }
    if(a==="hub_session_create"){
      if(b.confirmed!==true||!hubUUID(b.group_id)||!hubDate(b.session_date)||!hubTime(b.starts_at)||!hubTime(b.ends_at)||b.ends_at<=b.starts_at)return hubReply({error:"Vérifie le groupe, la date et les horaires."},400);
      const {data:g,error:ge}=await s.from("crew_groups").select("id,name").eq("id",b.group_id).eq("active",true).single();if(ge||!g)return hubReply({error:"Groupe indisponible."},400);
      const {data,error}=await s.from("crew_sessions").insert({group_id:g.id,session_date:b.session_date,starts_at:b.starts_at,ends_at:b.ends_at,title:String(b.title||g.name).trim().slice(0,180),status:"scheduled"}).select("id").single();
      if(error?.code==="23505")return hubReply({error:"Cette séance existe déjà."},409);if(error)throw error;
      return hubReply({ok:true,id:data.id});
    }
    if(a==="hub_session_status"){
      if(b.confirmed!==true||!hubUUID(b.id)||!["scheduled","cancelled","completed"].includes(b.status))return hubReply({error:"Choisis une séance et un état valide."},400);
      const reason=String(b.reason||"").trim().slice(0,500);
      if(b.status==="cancelled"&&!reason)return hubReply({error:"Indique le motif d’annulation."},400);
      const {data:before,error:be}=await s.from("crew_sessions").select("id,group_id,session_date,status").eq("id",b.id).single();if(be)throw be;
      const {data,error}=await s.from("crew_sessions").update({status:b.status,cancellation_reason:b.status==="cancelled"?reason:null}).eq("id",b.id).eq("status",before.status).select("id,status").maybeSingle();if(error)throw error;if(!data)return hubReply({error:"La séance a changé. Actualise avant de réessayer."},409);
      let affected=0;
      if(b.status==="cancelled"){
       const {data:g}=await s.from("crew_groups").select("code").eq("id",before.group_id).single();
       const {count,error:ce}=await s.from("crew_trials").select("id",{head:true,count:"exact"}).eq("group_code",g?.code||"").eq("planned_date",before.session_date).eq("trial_status","planned");if(ce)throw ce;affected=count||0;
       if(affected){const {data:existing}=await s.from("crew_tasks").select("id").eq("source_id",before.id).eq("task_type","session_cancelled_trials").in("status",["open","doing"]).limit(1);
        if(!existing?.length){const {error:te}=await s.from("crew_tasks").insert({task_type:"session_cancelled_trials",title:"Replanifier les essais d’une séance annulée",description:affected+" essai(s) à vérifier pour "+before.session_date+". Aucun message automatique n’a été envoyé.",priority:"high",status:"open",due_date:new Date().toISOString().slice(0,10),source_type:"session",source_id:before.id});if(te)throw te;}}
      }
      return hubReply({ok:true,item:data,affected_trials:affected});
    }
    if(a==="hub_event_save"){
      if(b.confirmed!==true||(b.id&&!hubUUID(b.id)))return hubReply({error:"Confirmation requise."},400);
      const data=b.data||{},title=String(data.title||"").trim(),date=data.event_date,status=data.status;
      const cap=Number(data.capacity),price=data.price===""||data.price==null?null:Number(data.price),minAge=data.min_age===""||data.min_age==null?null:Number(data.min_age);
      if(title.length<2||title.length>180||!hubDate(date)||!hubTime(data.starts_at)||!hubTime(data.ends_at)||data.ends_at<=data.starts_at||!["draft","open","full","completed","cancelled"].includes(status)||!Number.isInteger(cap)||cap<1||cap>20||(price!==null&&(!Number.isFinite(price)||price<0||price>10000))||(status!=="draft"&&price===null)||(minAge!==null&&(!Number.isInteger(minAge)||minAge<0||minAge>120)))return hubReply({error:"Vérifie titre, date, horaires, capacité (1–20), tarif et statut."},400);
      const url=String(data.external_url||"").trim();if(url){try{const u=new URL(url);if(u.protocol!=="https:"||!["www.helloasso.com","helloasso.com","thecreworchies.blog"].includes(u.hostname))throw Error();}catch{return hubReply({error:"Utilise un lien HTTPS HelloAsso ou The Crew."},400);}}
      const row={title,event_date:date,starts_at:data.starts_at,ends_at:data.ends_at,status,capacity:cap,price,min_age:minAge,external_url:url||null,venue:String(data.venue||"Espace Marypomme").slice(0,250),description:String(data.description||"").slice(0,3000),target_audience:String(data.target_audience||"").slice(0,250),responsible:String(data.responsible||"Sonia Cointe").slice(0,150),tariff_label:price===null?"À confirmer":price+" € par participant",activity_type:"atelier",frequency:"Ponctuel"};
      const query=b.id?s.from("crew_events").update(row).eq("id",b.id):s.from("crew_events").insert(row);
      const {data:out,error}=await query.select("id").single();if(error)throw error;return hubReply({ok:true,id:out.id});
    }
    if(a==="hub_indicators"){
      const counts:Record<string,number|null>={};
      const specs=[["members","crew_members","member_status","active"],["preregistrations","crew_preregistrations","status","pre_registered"],["planned_trials","crew_trials","trial_status","planned"],["attended_trials","crew_trials","trial_status","attended"],["converted_trials","crew_trials","trial_status","converted"],["open_tasks","crew_tasks","status","open"],["new_absences","crew_absence_declarations","status","new"]] as const;
      await Promise.all(specs.map(async([key,table,column,value])=>{const {count,error}=await s.from(table).select("id",{head:true,count:"exact"}).eq(column,value);if(error)throw error;counts[key]=count;}));
      const {data:jobs,error}=await s.rpc("crew_control_automation_state");if(error)throw error;
      return hubReply({ok:true,counts,jobs,checked_at:new Date().toISOString(),note:"Comptages instantanés ; aucun taux de conversion par cohorte n’est déduit de ces seuls totaux."});
    }

    if(a==="invoice_drafts"){
      const {error:refreshError}=await s.rpc("crew_refresh_invoice_drafts");if(refreshError)throw refreshError;
      const [{data:drafts,error:de},{data:config,error:ce}]=await Promise.all([
        s.from("crew_invoice_drafts").select("id,payment_id,status,snapshot,created_at").order("created_at",{ascending:false}).limit(200),
        s.from("crew_billing_config").select("*").eq("id",true).single()]);
      if(de||ce)throw de||ce;
      return new Response(JSON.stringify({ok:true,drafts,config,issue_enabled:false}),{headers:{...H,"Cache-Control":"no-store"}});
    }

    if(a==="add_trial"){
      const {data:r,error}=await s.from("crew_trials").insert({
        first_name:String(b.first_name||"").trim(),
        last_name:String(b.last_name||"").trim()||null,
        group_code:b.group_code,
        planned_date:b.planned_date||null,
        trial_status:"planned",
        source:"control"
      }).select("id").single();
      if(error) throw error;
      return new Response(JSON.stringify({ok:true,id:r.id}),{headers:H});
    }

    if(a==="update_trial"){
      const allowed=["planned","attended","absent","interested","converted","cancelled"];
      const status=String(b.status||"");
      if(!allowed.includes(status)) return new Response(JSON.stringify({error:"Statut essai invalide"}),{status:400,headers:H});

      const {data:trial,error:te}=await s.from("crew_trials")
        .update({trial_status:status,updated_at:new Date().toISOString()})
        .eq("id",b.id)
        .select("id,first_name,last_name,preregistration_id,planned_date")
        .single();
      if(te) throw te;

      if(trial.preregistration_id){
        if(status==="interested"){
          await s.from("crew_preregistrations").update({status:"interested"}).eq("id",trial.preregistration_id);
          const title="Envoyer HelloAsso — "+trial.first_name+" "+(trial.last_name||"");
          const {data:existing}=await s.from("crew_tasks")
            .select("id")
            .eq("source_type","trial")
            .eq("source_id",trial.id)
            .eq("task_type","send_helloasso")
            .in("status",["open","doing"])
            .limit(1);
          if(!existing?.length){
            await s.from("crew_tasks").insert({
              task_type:"send_helloasso",
              title,
              description:"La personne souhaite continuer après son essai. Envoyer le lien d’adhésion HelloAsso.",
              priority:"high",
              status:"open",
              due_date:new Date().toISOString().slice(0,10),
              source_type:"trial",
              source_id:trial.id
            });
          }
        } else if(status==="converted"){
          await s.from("crew_preregistrations").update({status:"converted"}).eq("id",trial.preregistration_id);
          await s.from("crew_tasks")
            .update({status:"done",completed_at:new Date().toISOString()})
            .eq("source_type","trial")
            .eq("source_id",trial.id)
            .in("status",["open","doing"]);
        } else if(status==="absent"){
          const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
          const {data:existing}=await s.from("crew_tasks")
            .select("id")
            .eq("source_type","trial")
            .eq("source_id",trial.id)
            .eq("task_type","trial_absence_followup")
            .in("status",["open","doing"])
            .limit(1);
          if(!existing?.length){
            await s.from("crew_tasks").insert({
              task_type:"trial_absence_followup",
              title:"Relancer après absence — "+trial.first_name+" "+(trial.last_name||""),
              description:"La personne n’est pas venue à son essai. Proposer une nouvelle date.",
              priority:"normal",
              status:"open",
              due_date:tomorrow.toISOString().slice(0,10),
              source_type:"trial",
              source_id:trial.id
            });
          }
        }
      }
      return new Response(JSON.stringify({ok:true,status}),{headers:H});
    }

    if(a==="set_payout_status"){
      const ref=String(b.payment_ref||"").trim();
      const next=String(b.status||"").trim();
      const allowed=["a_verifier","non_verse","verse"];
      if(!/^\\d{6,14}$/.test(ref)||!allowed.includes(next)){
        return new Response(JSON.stringify({error:"Référence ou statut invalide"}),{status:400,headers:H});
      }
      const {data:membership,error:memberErr}=await s.from("crew_payments")
        .select("id,paid_at,provider_payload")
        .eq("provider","helloasso").eq("external_ref",ref).limit(1).maybeSingle();
      if(memberErr)throw memberErr;
      let source: any = membership;
      if(!source){
        const {data:eventPay,error:eventErr}=await s.from("crew_event_payment_orders")
          .select("paid_at,provider_order_id")
          .eq("provider","helloasso").eq("provider_payment_id",ref).limit(1).maybeSingle();
        if(eventErr)throw eventErr;
        if(eventPay)source={paid_at:eventPay.paid_at,provider_payload:{order_id:eventPay.provider_order_id}};
      }
      if(!source)return new Response(JSON.stringify({error:"Paiement HelloAsso inconnu"}),{status:404,headers:H});
      const date=String(b.bank_received_on||"").trim();
      if(next==="verse"&&(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)||!b.bank_receipt_confirmed)){
        return new Response(JSON.stringify({error:"Date bancaire et confirmation explicite obligatoires"}),{status:400,headers:H});
      }
      if(next==="verse" && (date<source.paid_at?.slice(0,10)||date>new Date().toISOString().slice(0,10))){
        return new Response(JSON.stringify({error:"Date de versement impossible"}),{status:400,headers:H});
      }
      const {data:previous}=await s.from("crew_payment_reconciliations")
        .select("provider_order_id,provider_cashout_state,notes")
        .eq("provider","helloasso").eq("provider_payment_id",ref).maybeSingle();
      const {error}=await s.from("crew_payment_reconciliations").upsert({
        provider:"helloasso",provider_payment_id:ref,
        provider_order_id:previous?.provider_order_id||source.provider_payload?.order_id||null,
        provider_cashout_state:previous?.provider_cashout_state||source.provider_payload?.provider_cashout_state||null,
        payout_status:next,last_manual_display_state:next==="verse"?"Versement bancaire confirmé":next==="non_verse"?"Non versé confirmé":"À vérifier",
        bank_received_at:next==="verse"?date+"T12:00:00Z":null,
        bank_reference:next==="verse"?String(b.bank_reference||"").trim().slice(0,120)||null:null,
        notes:previous?.notes||null,updated_at:new Date().toISOString()
      },{onConflict:"provider,provider_payment_id"});
      if(error)throw error;
      return new Response(JSON.stringify({ok:true,ref,status:next}),{headers:H});
    }
    if(a==="complete_task"){
      const {error}=await s.from("crew_tasks")
        .update({status:"done",completed_at:new Date().toISOString()})
        .eq("id",b.id);
      if(error) throw error;
      return new Response(JSON.stringify({ok:true}),{headers:H});
    }

    return new Response(JSON.stringify({error:"Action inconnue"}),{status:400,headers:H});
  }catch(e){
    return new Response(JSON.stringify({error:e instanceof Error?e.message:"Erreur"}),{status:500,headers:H});
  }
});