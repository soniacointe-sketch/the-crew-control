// Read-only Stripe billing, called only after founder authorization.
export async function readBilling(key, fetcher = fetch) {
  const base = {connected:false, state:'missing_key', invoice_total_eur:null, checked_at:new Date().toISOString(), scope:'Factures ELOAH payées en EUR, montants bruts avant remboursements et frais'};
  if (!key) return base;
  if (!/^(sk|rk)_live_/.test(key)) return {...base,state:'live_key_required'};
  const get = async path => {
    const r = await fetcher('https://api.stripe.com/v1/'+path, {headers:{Authorization:'Bearer '+key},signal:AbortSignal.timeout(8000)});
    if (!r.ok) throw new Error(r.status===401?'invalid_key':r.status===403?'permission_denied':'stripe_unavailable');
    return r.json();
  };
  try {
    const account = await get('account');
    if (account.id !== 'acct_1Kvj15ECEqtAYpIk') return {...base,state:'wrong_account'};
    let cursor='', total=0, count=0, scanned=0, complete=false;
    for (let page=0;page<5;page++) {
      const result = await get('invoices?status=paid&limit=100'+(cursor?'&starting_after='+encodeURIComponent(cursor):''));
      if (!Array.isArray(result.data)) throw new Error('stripe_unavailable');
      for (const invoice of result.data) {
        scanned++;
        const meta = invoice.parent?.subscription_details?.metadata || invoice.subscription_details?.metadata || invoice.metadata || {};
        // Never count other universes, tests, or unrelated account revenue as ELOAH.
        if (invoice.livemode!==true || invoice.status!=='paid' || invoice.currency!=='eur' || !/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(meta.eloah_user_id||'') || !meta.eloah_plan) continue;
        if (!Number.isSafeInteger(invoice.amount_paid) || invoice.amount_paid<0) continue;
        total+=invoice.amount_paid; count++;
      }
      if (!result.has_more) { complete=true; break; }
      cursor=result.data.at(-1)?.id;
      if (!cursor) throw new Error('stripe_unavailable');
    }
    return {...base,connected:true,state:complete?'verified':'partial',invoice_total_eur:complete?total/100:null,invoice_count:count,scanned,complete};
  } catch(error) {
    const safe = ['invalid_key','permission_denied','stripe_unavailable'].includes(error.message)?error.message:'stripe_unavailable';
    return {...base,state:safe};
  }
}
