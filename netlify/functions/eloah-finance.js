// ELOAH backend · Netlify Function. Credentials are server-side only.
// Configure STRIPE_SECRET_KEY, RESEND_API_KEY and ELOAH_DASHBOARD_TOKEN in Netlify.
// Dashboard uses a temporary bearer token held in browser memory (never localStorage).
const allowedOrigins = new Set([
  'https://soniacointe-sketch.github.io',
  'https://the-crew-control.netlify.app'
]);
exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = {'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin']=origin;
  headers['Access-Control-Allow-Headers']='Authorization, Content-Type';
  headers['Access-Control-Allow-Methods']='GET, OPTIONS';
  const result=(statusCode,obj)=>({statusCode,headers,body:JSON.stringify(obj)});
  if(event.httpMethod==='OPTIONS') return result(204,{});
  if(event.httpMethod!=='GET')return result(405,{error:'Method not allowed'});
  if(origin&&!allowedOrigins.has(origin))return result(403,{error:'Origin not permitted'});
  const token=process.env.ELOAH_DASHBOARD_TOKEN;
  if(!token||token.length<24) return result(503,{error:'Dashboard authentication not configured'});
  const supplied=(event.headers.authorization||event.headers.Authorization||'').replace(/^Bearer\s+/i,'');
  // Constant-time compare when lengths equal
  const crypto=require('crypto');
  const a=Buffer.from(token),b=Buffer.from(supplied);
  if(a.length!==b.length || !crypto.timingSafeEqual(a,b))return result(401,{error:'Unauthorized'});
  if(!process.env.STRIPE_SECRET_KEY||!process.env.RESEND_API_KEY)return result(503,{error:'Provider credentials not configured'});
  try{
    const stripeRes=await fetch('https://api.stripe.com/v1/charges?limit=100',{headers:{Authorization:'Bearer '+process.env.STRIPE_SECRET_KEY}});
    if(!stripeRes.ok)throw Error('Stripe unavailable ('+stripeRes.status+')');
    const stripe=await stripeRes.json();
    const charges=(stripe.data||[]).map(c=>({created:c.created,amount:c.amount,currency:c.currency,status:c.status,paid:c.paid,refunded:c.amount_refunded||0})); // no PII
    const resendHeaders={Authorization:'Bearer '+process.env.RESEND_API_KEY};
    const [broadcastRes,contactRes]=await Promise.all([
      fetch('https://api.resend.com/broadcasts',{headers:resendHeaders}),
      fetch('https://api.resend.com/contacts?limit=100',{headers:resendHeaders})
    ]);
    if(!broadcastRes.ok||!contactRes.ok)throw Error('Mail provider unavailable');
    const broadcasts=await broadcastRes.json(),contacts=await contactRes.json();
    const paid=charges.filter(c=>c.paid&&c.status==='succeeded');
    const byCurrency={};
    for(const c of paid){
      const cur=(c.currency||'eur').toUpperCase();
      const entry=byCurrency[cur] ||= {gross:0,refunds:0,count:0};
      entry.gross+=c.amount;entry.refunds+=c.refunded;entry.count++;
    }
    const failed=charges.filter(c=>c.status==='failed').length;
    return result(200,{at:new Date().toISOString(),source:'live-api',partial:!!stripe.has_more,
      stripe:{byCurrency,paidCount:paid.length,failedCount:failed,recordsExamined:charges.length},
      resend:{broadcastCount:Array.isArray(broadcasts.data)?broadcasts.data.length:null,
      contactCount:Array.isArray(contacts.data)?contacts.data.length:null,
      countsMayBePartial:!!(broadcasts.has_more||contacts.has_more)},
      warnings:['Stripe limited to last 100 charges; values are not accounting net revenue.',
      'Mail campaign and contact counts may be partial if API pagination continues.']});
  }catch(err){return result(502,{error:'Data sources temporarily unavailable'});}
};
