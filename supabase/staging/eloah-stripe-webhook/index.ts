import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const response=(code:number,message:string)=>new Response(message,{status:code,headers:{"content-type":"text/plain"}});
function equal(a:string,b:string){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
async function validSignature(payload:string,header:string,secret:string){
 const parts=Object.fromEntries(header.split(",").map(s=>s.trim().split("=",2)));
 const stamp=Number(parts.t);if(!Number.isFinite(stamp)||Math.abs(Date.now()/1000-stamp)>300||!parts.v1)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),"HMAC",false,["sign"]);
 const sig=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(parts.t+"."+payload)));
 const digest=Array.from(sig).map(v=>v.toString(16).padStart(2,"0")).join("");
 return header.split(",").some(p=>p.trim().startsWith("v1=")&&equal(p.trim().slice(3),digest));
}
Deno.serve(async req=>{
 if(req.method!=="POST")return response(405,"method not allowed");
 const secret=Deno.env.get("ELOAH_STRIPE_WEBHOOK_SECRET"),stripe=Deno.env.get("ELOAH_STRIPE_SECRET_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),url=Deno.env.get("SUPABASE_URL");
 if(Deno.env.get("ELOAH_TEST_ENVIRONMENT")!=="true"||!stripe?.startsWith("sk_test_"))return response(503,"test environment only");
 if(!secret||!stripe||!service||!url)return response(503,"not configured");
 const raw=await req.text();if(raw.length>250000)return response(413,"too large");
 if(!await validSignature(raw,req.headers.get("stripe-signature")||"",secret))return response(400,"invalid signature");
 let evt:any;try{evt=JSON.parse(raw)}catch{return response(400,"invalid payload")}
 const accepted=new Set(["checkout.session.completed","customer.subscription.created","customer.subscription.updated","customer.subscription.deleted","invoice.paid","invoice.payment_failed"]);
 if(!accepted.has(evt.type))return response(200,"ignored");
 const obj=evt.data?.object;
 let subscriptionId:string|undefined;
 if(evt.type.startsWith("customer.subscription."))subscriptionId=obj?.id;
 else if(evt.type==="checkout.session.completed")subscriptionId=typeof obj?.subscription==="string"?obj.subscription:undefined;
 else subscriptionId=obj?.parent?.subscription_details?.subscription||obj?.subscription;
 if(!subscriptionId||!/^sub_[A-Za-z0-9]+$/.test(subscriptionId))return response(200,"no subscription");
 const stripeResponse=await fetch("https://api.stripe.com/v1/subscriptions/"+encodeURIComponent(subscriptionId)+"?expand[]=latest_invoice",{headers:{"authorization":"Bearer "+stripe}});
 if(!stripeResponse.ok)return response(502,"stripe lookup failed");
 const sub=await stripeResponse.json();
 const uid=sub.metadata?.eloah_user_id;
 if(typeof uid!=="string"||!(/^[a-f0-9-]{36}$/i).test(uid))return response(200,"unmapped subscription");
 // Prices are public identifiers, not secret keys. Only the exact ELOAH plan prices can activate access.
 const ids:Record<string,string>={
  entree:Deno.env.get("ELOAH_STRIPE_PRICE_ENTREE") || "",
  partenaire:Deno.env.get("ELOAH_STRIPE_PRICE_PARTENAIRE") || "",
 };
 const subscriptionItems=sub.items?.data;
 if(!Array.isArray(subscriptionItems)||subscriptionItems.length!==1)return response(200,"unexpected items");
 const subscriptionPrice=subscriptionItems[0]?.price?.id;
 const plan=Object.keys(ids).find(k=>ids[k]===subscriptionPrice);
 if(!plan||!/^price_[A-Za-z0-9]+$/.test(ids[plan])||sub.metadata?.eloah_plan!==plan)return response(200,"unknown plan");
 const invoice=sub.latest_invoice;
 const paid=invoice&&typeof invoice==="object"&&invoice.status==="paid";
 const status=sub.status==="active"&&paid?"active":"inactive";
 const upsert=await fetch(url+"/rest/v1/eloah_customer_entitlements?on_conflict=owner_id",{method:"POST",headers:{"apikey":service,"authorization":"Bearer "+service,"content-type":"application/json","prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({owner_id:uid,plan,status})});
 if(!upsert.ok)return response(500,"entitlement update failed");
 return response(200,"ok");
});