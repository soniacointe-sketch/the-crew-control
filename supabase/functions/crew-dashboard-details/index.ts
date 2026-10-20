import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const H = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: H });

  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({error:"Connexion requise"}), {status:401, headers:H});

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global:{headers:{Authorization:auth}}, auth:{persistSession:false} }
  );
  const { data:{user} } = await userClient.auth.getUser(token);
  if (!user) return new Response(JSON.stringify({error:"Connexion requise"}), {status:401, headers:H});

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {auth:{persistSession:false}}
  );

  const {data:list} = await admin.auth.admin.listUsers({page:1,perPage:100});
  const owner = [...(list?.users || [])].sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())[0];
  if (!owner || owner.id !== user.id) {
    return new Response(JSON.stringify({error:"Accès administrateur requis"}), {status:403, headers:H});
  }

  const v = new URL(req.url).searchParams.get("view") || "";
  let d:any[] = [];

  if (v === "preregistrations") {
    const r = await admin.from("crew_preregistrations")
      .select("id,submitted_at,first_name,last_name,birth_date,group_code,guardian_name,email,phone,status,source")
      .order("submitted_at",{ascending:false})
      .limit(100);
    d = r.data || [];
  } else if (v === "trials") {
    const r = await admin.from("crew_trials")
      .select("id,first_name,last_name,group_code,planned_date,trial_status,source,preregistration_id,created_at")
      .order("planned_date",{ascending:true,nullsFirst:false})
      .limit(100);
    d = r.data || [];
  } else if (v === "tasks") {
    const r = await admin.from("crew_tasks")
      .select("id,task_type,title,description,priority,status,due_date,source_type,source_id,created_at")
      .order("due_date",{ascending:true,nullsFirst:false})
      .limit(100);
    d = r.data || [];
  } else if (v === "members") {
    const mr=await admin.from("crew_members").select("id,first_name,last_name,birth_date,email,phone,guardian_name,guardian_email,guardian_phone,member_status,season").order("first_name").limit(200);
    if(mr.error)return new Response(JSON.stringify({error:mr.error.message}),{status:500,headers:H});
    const ids=(mr.data||[]).map((m:any)=>m.id);
    const rr=ids.length?await admin.from("crew_registrations").select("id,member_id,group_id,plan,amount_expected,registration_status,season").in("member_id",ids):{data:[],error:null};
    if(rr.error)return new Response(JSON.stringify({error:rr.error.message}),{status:500,headers:H});
    const regs=rr.data||[],rids=regs.map((r:any)=>r.id);
    const {data:groups}=await admin.from("crew_groups").select("id,code,name");
    const pp=rids.length?await admin.from("crew_payments").select("id,registration_id,amount,status,provider,external_ref,verified_at").in("registration_id",rids):{data:[],error:null};
    if(pp.error)return new Response(JSON.stringify({error:pp.error.message}),{status:500,headers:H});
    d=(mr.data||[]).map((m:any)=>{
      const reg=regs.find((r:any)=>r.member_id===m.id&&r.season==="2026-2027");
      const payments=(pp.data||[]).filter((p:any)=>p.registration_id===reg?.id&&p.status==="paid"&&p.verified_at);
      const paid=payments.reduce((n:number,p:any)=>n+Number(p.amount||0),0);
      return {...m,registration_id:reg?.id||null,group_code:(groups||[]).find((g:any)=>g.id===reg?.group_id)?.code||null,plan:reg?.plan||null,registration_status:reg?.registration_status||null,amount_expected:reg?.amount_expected??null,amount_paid:paid,remaining:reg?.amount_expected==null?null:Math.max(0,Number(reg.amount_expected)-paid),payment_count:payments.length};
    });
  } else if (v === "payments_audit") {
    const {data:payments,error:pe}=await admin.from("crew_payments")
      .select("id,registration_id,amount,status,provider,external_ref,paid_at,verified_at,provider_payload,created_at")
      .order("created_at",{ascending:false}).limit(200);
    if(pe) return new Response(JSON.stringify({error:"Impossible de consulter les paiements"}),{status:500,headers:H});
    const regIds=[...new Set((payments||[]).map((p:any)=>p.registration_id).filter(Boolean))];
    const refs=[...new Set((payments||[]).map((p:any)=>p.external_ref).filter(Boolean))];
    const regs=regIds.length ? (await admin.from("crew_registrations").select("id,member_id,plan,season,registration_status").in("id",regIds)).data||[] : [];
    const memIds=[...new Set(regs.map((r:any)=>r.member_id).filter(Boolean))];
    const members=memIds.length ? (await admin.from("crew_members").select("id,first_name,last_name,guardian_name").in("id",memIds)).data||[] : [];
    const reconciliations=refs.length ? (await admin.from("crew_payment_reconciliations")
      .select("provider,provider_payment_id,provider_order_id,payout_status,provider_cashout_state,last_manual_display_state,bank_received_at,bank_reference,notes")
      .in("provider_payment_id",refs)).data||[] : [];
    const events=refs.length ? (await admin.from("crew_helloasso_events")
      .select("helloasso_id,payload").eq("event_type","Payment").in("helloasso_id",refs)).data||[] : [];
    const regMap=new Map(regs.map((r:any)=>[r.id,r]));
    const memMap=new Map(members.map((m:any)=>[m.id,m]));
    const reconMap=new Map(reconciliations.map((x:any)=>[x.provider+"|"+x.provider_payment_id,x]));
    const eventMap=new Map(events.map((x:any)=>[x.helloasso_id,x.payload?.data||{}]));
    const rows=(payments||[]).map((p:any)=>{
      const reg=regMap.get(p.registration_id)||{};
      const mem=memMap.get(reg.member_id)||{};
      const event=eventMap.get(p.external_ref)||{};
      const audit=reconMap.get(p.provider+"|"+p.external_ref)||{};
      const payer=event.payer||{};
      return {id:p.id,kind:"adhesion",provider:p.provider,external_ref:p.external_ref,
        amount:Number(p.amount)||0,status:p.status,paid_at:p.paid_at,verified:!!p.verified_at,
        member_name:[mem.first_name,mem.last_name].filter(Boolean).join(" "),
        guardian_name:mem.guardian_name||null,
        payer_name:[payer.firstName,payer.lastName].filter(Boolean).join(" ")||null,
        plan:reg.plan||null,season:reg.season||null,
        order_ref:audit.provider_order_id||p.provider_payload?.order_id||null,
        payout_status:audit.payout_status||"non_suivi",
        cashout_provider:audit.provider_cashout_state||event.cashOutState||null,
        cashout_manual:audit.last_manual_display_state||null,
        bank_received_at:audit.bank_received_at||null,
        bank_reference:audit.bank_reference||null,
        notes:audit.notes||null,
        receipt_url:(event.paymentReceiptUrl||p.provider_payload?.receipt_url||null)
      };
    });
    // One event payment represents an entire order; ticket allocations are displayed beneath it.
    const {data:showOrders,error:eventPaymentError}=await admin.from("crew_event_payment_orders")
      .select("provider,provider_payment_id,provider_order_id,event_id,payer_name,amount_cents,status,paid_at")
      .order("paid_at",{ascending:false}).limit(200);
    if(eventPaymentError)return new Response(JSON.stringify({error:"Impossible de consulter les paiements événementiels"}),{status:500,headers:H});
    const eventRefs=(showOrders||[]).map((x:any)=>x.provider_payment_id);
    if(eventRefs.length){
      const {data:ticketLinks,error:linkError}=await admin.from("crew_event_payment_items")
        .select("provider_payment_id,provider_item_id,event_registration_id,amount_cents")
        .in("provider_payment_id",eventRefs);
      if(linkError)return new Response(JSON.stringify({error:"Impossible de lire les allocations des billets"}),{status:500,headers:H});
      const regEventIds=[...new Set((ticketLinks||[]).map((x:any)=>x.event_registration_id))];
      const {data:ticketPeople,error:peopleError}=regEventIds.length?await admin.from("crew_event_registrations")
        .select("id,first_name,last_name,event_id").in("id",regEventIds):{data:[],error:null};
      if(peopleError)return new Response(JSON.stringify({error:"Impossible de lire les inscriptions événementielles"}),{status:500,headers:H});
      const evIds=[...new Set((showOrders||[]).map((x:any)=>x.event_id))];
      const {data:evNames,error:evNameError}=await admin.from("crew_events").select("id,title").in("id",evIds);
      if(evNameError)return new Response(JSON.stringify({error:"Impossible de lire les événements"}),{status:500,headers:H});
      const {data:payouts,error:payoutError}=await admin.from("crew_payment_reconciliations")
        .select("provider,provider_payment_id,provider_order_id,payout_status,provider_cashout_state,last_manual_display_state,bank_received_at,bank_reference,notes")
        .in("provider_payment_id",eventRefs);
      if(payoutError)return new Response(JSON.stringify({error:"Impossible de lire les versements"}),{status:500,headers:H});
      const {data:receipts,error:receiptError}=await admin.from("crew_helloasso_events")
        .select("helloasso_id,payload").eq("event_type","Payment").in("helloasso_id",eventRefs);
      if(receiptError)return new Response(JSON.stringify({error:"Impossible de lire les attestations"}),{status:500,headers:H});
      const regNames=new Map((ticketPeople||[]).map((r:any)=>[r.id,[r.first_name,r.last_name].filter(Boolean).join(" ")]));
      const eventNames=new Map((evNames||[]).map((e:any)=>[e.id,e.title]));
      const payAudits=new Map((payouts||[]).map((p:any)=>[p.provider+"|"+p.provider_payment_id,p]));
      const paymentReceipts=new Map((receipts||[]).map((p:any)=>[p.helloasso_id,p.payload?.data||{}]));
      for(const ep of showOrders||[]){
        const tickets=(ticketLinks||[]).filter((x:any)=>x.provider_payment_id===ep.provider_payment_id);
        const audit=payAudits.get(ep.provider+"|"+ep.provider_payment_id)||{};
        const webhook=paymentReceipts.get(ep.provider_payment_id)||{};
        rows.push({
          id:ep.provider+"-event-"+ep.provider_payment_id,
          kind:"evenement",provider:ep.provider,external_ref:ep.provider_payment_id,
          amount:Number(ep.amount_cents)/100,status:ep.status,paid_at:ep.paid_at,verified:ep.status==="paid",
          member_name:eventNames.get(ep.event_id)||"Événement",
          payer_name:ep.payer_name||null,guardian_name:null,
          plan:tickets.length+" billet(s)",season:null,
          ticket_holders:tickets.map((i:any)=>regNames.get(i.event_registration_id)||"Billet sans nom"),
          order_ref:ep.provider_order_id,
          payout_status:audit.payout_status||"non_suivi",
          cashout_provider:audit.provider_cashout_state||webhook.cashOutState||null,
          cashout_manual:audit.last_manual_display_state||null,
          bank_received_at:audit.bank_received_at||null,
          bank_reference:audit.bank_reference||null,
          notes:audit.notes||null,
          receipt_url:webhook.paymentReceiptUrl||null
        });
      }
    }

    // CSV exports supplement orders missing a membership allocation; never add them twice.
    const {data:csvMemberships,error:csvError}=await admin.from("crew_helloasso_events")
      .select("helloasso_id,payload,processing_status")
      .eq("event_type","MembershipCsv").order("created_at",{ascending:false}).limit(500);
    if(csvError)return new Response(JSON.stringify({error:"Impossible de lire les cotisations importées"}),{status:500,headers:H});
    for(const imported of csvMemberships||[]){
      const x=imported.payload?.data||{};
      if(x.status!=="Validé"||!x.payment_id)continue;
      const exists=rows.some((p:any)=>p.provider==="helloasso"&&
        (String(p.external_ref)===String(x.payment_id)||String(p.order_ref)===String(x.order_id)));
      if(exists)continue;
      rows.push({
        id:"helloasso-membership-csv-"+imported.helloasso_id,
        kind:"adhesion",provider:"helloasso",external_ref:String(x.payment_id),
        amount:Number(x.amount)||0,status:"paid",paid_at:x.paid_at,verified:true,
        member_name:[x.first_name,x.last_name].filter(Boolean).join(" "),
        guardian_name:null,payer_name:x.payer_name||null,plan:x.tariff||"Adhésion",season:"2026-2027",
        order_ref:String(x.order_id),payout_status:"a_verifier",cashout_provider:x.cashout_state||null,
        cashout_manual:null,bank_received_at:null,bank_reference:null,
        notes:"Cotisation documentée par export HelloAsso et commande source. Dossier adhérent à rattacher ; réception bancaire non vérifiée.",
        receipt_url:x.receipt_url||null
      });
    }


    // Financial confirmations preserve the payer and missing order IDs without inventing tickets.
    const {data:confirmedPayments,error:confirmationError}=await admin.from("crew_helloasso_events")
      .select("helloasso_id,payload").eq("event_type","FinancialConfirmation").limit(500);
    if(confirmationError)return new Response(JSON.stringify({error:"Impossible de lire les paiements documentés"}),{status:500,headers:H});
    for(const confirmed of confirmedPayments||[]){
      const x=confirmed.payload?.data||{};
      if(x.status!=="paid"||!x.payment_id||!(Number(x.amount)>0))continue;
      if(rows.some((p:any)=>p.provider==="helloasso"&&
        (String(p.external_ref)===String(x.payment_id)||(x.order_id&&String(p.order_ref)===String(x.order_id)))))continue;
      rows.push({
        id:"helloasso-financial-confirmation-"+confirmed.helloasso_id,
        kind:"evenement",provider:"helloasso",external_ref:String(x.payment_id),
        amount:Number(x.amount),status:"paid",paid_at:x.paid_at,verified:true,
        member_name:x.campaign||"Billetterie",payer_name:x.payer_name||null,guardian_name:null,
        plan:Number(x.quantity||0)+" billet(s)",season:null,order_ref:x.order_id||null,
        payout_status:"a_verifier",cashout_provider:null,cashout_manual:null,
        bank_received_at:null,bank_reference:null,
        notes:"Paiement documenté par le tableau HelloAsso transmis. Réception bancaire non vérifiée. Les billets nominatifs restent dans leur suivi dédié.",
        receipt_url:null
      });
    }

    const {data:rawEvents,error:queueError}=await admin.from("crew_helloasso_events")
      .select("helloasso_id,payload,processing_status,created_at,matched_registration_id")
      .eq("event_type","Payment").is("matched_registration_id",null)
      .order("created_at",{ascending:false}).limit(80);
    const knownRefs=new Set([
      ...rows.filter((p:any)=>p.provider==="helloasso").map((p:any)=>p.external_ref),
      ...(showOrders||[]).filter((p:any)=>p.provider==="helloasso").map((p:any)=>p.provider_payment_id)
    ]);
    const awaiting=queueError?[]:(rawEvents||[]).filter((e:any)=>!knownRefs.has(e.helloasso_id)).map((e:any)=>{
      const d=e.payload?.data||{};
      const payer=d.payer||{};
      return {reference:e.helloasso_id,received_at:e.created_at,
        amount:Number(d.amount||0)/100,provider_state:d.state||null,
        payer_name:[payer.firstName,payer.lastName].filter(Boolean).join(" "),
        event_status:e.processing_status,
        already_allocated:knownRefs.has(e.helloasso_id)};
    });
    return new Response(JSON.stringify({rows,awaiting,queue_unavailable:!!queueError,generated_at:new Date().toISOString()}),{headers:H});
  } else if (v === "payments") {
    const r = await admin.from("crew_helloasso_events")
      .select("processing_status,created_at,payload")
      .eq("event_type","Payment")
      .order("created_at",{ascending:false})
      .limit(30);
    d = (r.data||[]).map((x:any)=>{
      const p=x.payload?.data||x.payload||{};
      const payer=p?.payer||p?.order?.payer||{};
      return {
        name:[payer?.firstName,payer?.lastName].filter(Boolean).join(" ") || "Paiement HelloAsso",
        email:payer?.email||null,
        amount:Number(p.amount||p.total*100||0)/100,
        status:x.processing_status,
        created_at:x.created_at
      };
    });
  } else if (v === "decisions") {
    const r = await admin.from("crew_household_decision_queue")
      .select("groups,decision,priority,people")
      .limit(100);
    d = r.data || [];
  } else if (v === "followups") {
    const r = await admin.from("crew_preregistration_followups")
      .select("household_key,channel,recipient,message,status,reply_status,created_at,sent_at")
      .order("created_at",{ascending:false})
      .limit(100);
    d = r.data || [];
  } else if (v === "events") {
    const r = await admin.from("crew_event_board")
      .select("title,event_date,registered,capacity,places_left,collected,status")
      .order("event_date");
    d = r.data || [];
  } else {
    return new Response(JSON.stringify({error:"Vue inconnue"}), {status:400, headers:H});
  }

  return new Response(JSON.stringify(d), {headers:H});
});