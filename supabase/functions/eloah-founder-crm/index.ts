import { readBilling } from "./billing.mjs";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
const ORIGIN = "https://soniacointe-sketch.github.io";
const FOUNDER = "bd4b7197-6401-4a9a-a14e-c6adbdc0ed46";
const ALLOWED_STAGES = new Set(["nouveau","a_contacter","en_cours","suivi","clos"]);
const HEADERS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Vary": "Origin"
};
const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {status,headers:HEADERS});
const isUUID = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

Deno.serve(async request => {
  if(request.headers.get("origin") !== ORIGIN) return json(403,{error:"Origine non autorisée"});
  if(request.method === "OPTIONS") return new Response(null,{status:204,headers:HEADERS});
  if(request.method !== "GET" && request.method !== "POST") return json(405,{error:"Méthode non autorisée"});
  const auth = request.headers.get("Authorization");
  const token = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
  if(!token) return json(401,{error:"Connexion fondatrice requise"});
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if(!url || !anon || !service) return json(503,{error:"Service temporairement indisponible"});
  try {
    const verifier = createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:identity,error:authError} = await verifier.auth.getUser(token);
    if(authError || !identity.user) return json(401,{error:"Session expirée, reconnecte-toi"});
    if(identity.user.id !== FOUNDER) return json(403,{error:"Accès réservé à la fondatrice ELOAH"});
    const admin = createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    if(request.method === "POST") {
      const data = await request.json().catch(()=>null);
      if(!data || data.action !== "save_followup" || !isUUID(data.customer_id) || data.customer_id===FOUNDER)
        return json(400,{error:"Fiche client invalide"});
      if(!ALLOWED_STAGES.has(data.stage) || typeof data.next_action!=="string" || typeof data.internal_notes!=="string" || data.next_action.length>280 || data.internal_notes.length>2000)
        return json(400,{error:"Statut ou longueur de texte non valide"});
      const {data:target,error:targetError}=await admin.auth.admin.getUserById(data.customer_id);
      if(targetError || !target?.user) return json(404,{error:"Compte introuvable"});
      const payload = {
        customer_id:data.customer_id,
        stage:data.stage,
        next_action:data.next_action.trim(),
        internal_notes:data.internal_notes.trim(),
        updated_by:identity.user.id,
        updated_at:new Date().toISOString()
      };
      const {data:saved,error:saveError}=await admin.from("eloah_customer_followups").upsert(payload,{onConflict:"customer_id"}).select("customer_id,stage,next_action,internal_notes,updated_at").single();
      if(saveError) throw saveError;
      return json(200,{saved,success:true});
    }
    const requestUrl = new URL(request.url);
    const requestedPage = Number(requestUrl.searchParams.get("page")||"1");
    const page = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage,1),100) : 1;
    const [usersResult,entResult,workspaceResult,itemResult,followResult,workspaceTotal,itemTotal]=await Promise.all([
      admin.auth.admin.listUsers({page,perPage:100}),
      admin.from("eloah_customer_entitlements").select("owner_id,plan,status,updated_at"),
      admin.from("eloah_customer_workspaces").select("owner_id,id,updated_at").limit(1000),
      admin.from("eloah_customer_workspace_items").select("owner_id,id,status").limit(1000),
      admin.from("eloah_customer_followups").select("customer_id,stage,next_action,internal_notes,updated_at"),
      admin.from("eloah_customer_workspaces").select("id",{count:"exact",head:true}).neq("owner_id",FOUNDER),
      admin.from("eloah_customer_workspace_items").select("id",{count:"exact",head:true}).neq("owner_id",FOUNDER)
    ]);
    if(usersResult.error || entResult.error || workspaceResult.error || itemResult.error || followResult.error || workspaceTotal.error || itemTotal.error)
      throw (usersResult.error||entResult.error||workspaceResult.error||itemResult.error||followResult.error||workspaceTotal.error||itemTotal.error);
    const countBy=(values:any[])=>(values||[]).reduce((map:Map<string,number>,row:any)=>{
      map.set(row.owner_id,(map.get(row.owner_id)||0)+1);return map;
    },new Map<string,number>());
    const workspaces=countBy(workspaceResult.data||[]);
    const items=countBy(itemResult.data||[]);
    const ent=new Map((entResult.data||[]).map((r:any)=>[r.owner_id,r]));
    const follow=new Map((followResult.data||[]).map((r:any)=>[r.customer_id,r]));
    const accounts=(usersResult.data.users||[]).filter((u:any)=>u.id!==FOUNDER).map((u:any)=>({
      id:u.id,email:u.email||"",created_at:u.created_at,last_sign_in_at:u.last_sign_in_at||null,
      confirmed_at:u.email_confirmed_at||null,workspace_count:workspaces.get(u.id)||0,item_count:items.get(u.id)||0,
      entitlement:ent.get(u.id)||null,followup:follow.get(u.id)||null
    }));
    const entitlements=(entResult.data||[]).filter((r:any)=>r.owner_id!==FOUNDER);
    const billing = await readBilling(Deno.env.get("ELOAH_STRIPE_READ_KEY") || Deno.env.get("ELOAH_STRIPE_SECRET_KEY"));
    return json(200,{
      billing,
      accounts,page,has_more:(usersResult.data.users||[]).length===100,
      summary:{
        displayed_accounts:accounts.length,
        total_accounts:usersResult.data.total??null,
        workspaces:workspaceTotal.count??null,
        workspace_items:itemTotal.count??null,
        active_entitlements:entitlements.filter((r:any)=>r.status==="active").length,
        paid_plan_entitlements:entitlements.filter((r:any)=>r.status==="active" && r.plan!=="decouverte").length,
        payments_connected:billing.connected,revenue_eur:null,mrr_eur:null
      },
      disclaimer:"Comptes d'authentification Supabase, pas nécessairement clients payants. Les droits ne constituent pas des preuves de paiement Stripe."
    });
  } catch(error) {
    console.error("ELOAH CRM server failure",error instanceof Error?error.message:"unknown");
    return json(500,{error:"Chargement indisponible. Réessaye ou consulte les journaux Supabase."});
  }
});
