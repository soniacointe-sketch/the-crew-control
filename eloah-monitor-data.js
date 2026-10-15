/* ELOAH Monitor — données agrégées Supabase, côté navigateur.
   Jamais de lecture directe des tables ni des comptes clientes.
   Jamais de conservation des résultats dans localStorage.
   Service vérifie la session et l'identité fondatrice indépendamment.
*/
(()=>{'use strict';
const PROJECT='https://voytsqyorhoveurnguxn.supabase.co';
const PUBLISHABLE='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
const ENDPOINT=PROJECT+'/functions/v1/eloah-monitor-founder-metrics';
const $=s=>document.querySelector(s);
const root=$('#indicateurs-reels'),gate=$('#app'),status=$('#real-status'),button=$('#real-refresh');
if(!root||!gate||!status||!button)return;
const KEYS=['osMissions','osTasks','crewProjects','crewTasks','crewMembers','crewEvents','crewEventRegistrations','crewPaymentsVerified','crewEventOrdersPaid','crewFinanceEntries','pgArticles','pgOffersOpen','pgDistributionQueue','projectBackups'];
let client=null,revision=0,busy=false,checkedAt=0;
function message(str,state='pending'){status.textContent=str;status.dataset.status=state;}
function wipe(reason='Reconnexion nécessaire.'){revision++;busy=false;button.disabled=false;$('#real-results').hidden=true;for(const key of KEYS){const e=$('[data-real="'+key+'"]');if(e)e.textContent='—';}$('#real-events').replaceChildren();$('#real-checked').textContent='Aucune donnée affichée';message(reason,'error');}
function show(rows){
 for(const key of KEYS){const el=$('[data-real="'+key+'"]');if(!el)continue;const v=rows.measures?.[key];el.textContent=Number.isSafeInteger(v)&&v>=0?new Intl.NumberFormat('fr-FR').format(v):'—';}
 const container=$('#real-events');container.replaceChildren();
 const items=Array.isArray(rows.nextEvents)?rows.nextEvents.slice(0,4):[];
 for(const item of items){
  const d=document.createElement('div');d.className='real-event';
  const title=document.createElement('strong');title.textContent=String(item.title||'Événement').slice(0,100);
  const info=document.createElement('small');
  const date=/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')?new Date(String(item.date)+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):'date à vérifier';
  const capacity=Number.isInteger(item.capacity)&&item.capacity>=0?' · capacité '+item.capacity:'';
  info.textContent=date+capacity+' · statut enregistré : '+String(item.status||'indéfini').slice(0,24);
  d.append(title,info);container.append(d);
 }
 if(!items.length){const p=document.createElement('p');p.className='real-help';p.textContent=rows.unavailable?.includes('nextEvents')?'Calendrier temporairement indisponible.':'Aucun événement futur enregistré dans cette base.';container.append(p);}
 const dt=Date.parse(rows.generatedAt);
 $('#real-checked').textContent=Number.isFinite(dt)?'Actualisé depuis Supabase le '+new Date(dt).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'}):'Actualisation effectuée';
 $('#real-results').hidden=false;
 if(Array.isArray(rows.unavailable)&&rows.unavailable.length){message('Données réelles partiellement disponibles : certains modules n’ont pas répondu.','pending');}
 else message('Données réelles disponibles · lecture seule · fondatrice','success');
}
async function refresh(force=false){
 if(gate.hidden||busy)return;
 if(!force && Date.now()-checkedAt<10000)return;
 const ticket=++revision;busy=true;button.disabled=true;message('Vérification du compte et lecture des indicateurs…','pending');
 try{
   if(!window.supabase?.createClient)throw Error('client');
   if(!client){client=window.supabase.createClient(PROJECT,PUBLISHABLE,{auth:{storageKey:'eloah-founder-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
     client.auth.onAuthStateChange((kind,session)=>{
       if(kind==='SIGNED_OUT'||(kind==='SIGNED_IN'&&session?.user?.id!==FOUNDER))wipe('Connexion fondatrice nécessaire.');
     });
   }
   const {data:identity,error:authError}=await client.auth.getUser();
   if(ticket!==revision)return;
   if(authError||identity.user?.id!==FOUNDER)throw Error('auth');
   const {data:sessionResult,error:sessionError}=await client.auth.getSession();
   const session=sessionResult?.session;
   if(sessionError||!session?.access_token||session.user?.id!==FOUNDER)throw Error('auth');
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
   let response;
   try{
     response=await fetch(ENDPOINT,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal,
       headers:{'Content-Type':'application/json','apikey':PUBLISHABLE,'Authorization':'Bearer '+session.access_token},body:'{}'});
   }finally{clearTimeout(timer);}
   if(ticket!==revision||gate.hidden)return;
   if(response.status===401||response.status===403)throw Error('auth');
   if(!response.ok)throw Error('service');
   const data=await response.json();
   if(!data||data.ok!==true||data.source!=='supabase_founder'||!data.measures||typeof data.measures!=='object')throw Error('service');
   const again=await client.auth.getUser();
   if(ticket!==revision||gate.hidden)return;
   if(again.error||again.data.user?.id!==FOUNDER)throw Error('auth');
   checkedAt=Date.now();show(data);
 }catch(err){
   if(ticket!==revision)return;
   if(err.message==='auth')wipe('Compte fondatrice non vérifié. Ouvre ELOAH Fondatrice puis réessaie.');
   else{$('#real-results').hidden=true;message('Connexion aux indicateurs indisponible. Les autres outils restent accessibles.','error');$('#real-checked').textContent='Indicateurs non actualisés';}
 }finally{
   if(ticket===revision){busy=false;button.disabled=false;}
   else busy=false;
 }
}
const observer=new MutationObserver(()=>{
 if(gate.hidden){wipe('Indicateurs masqués : session fondatrice non vérifiée.');return;}
 refresh();
});
observer.observe(gate,{attributes:true,attributeFilter:['hidden']});
button.addEventListener('click',()=>refresh(true));
window.addEventListener('focus',()=>{if(!gate.hidden&&checkedAt&&Date.now()-checkedAt>10*60*1000){$('#real-results').hidden=true;message('Indicateurs anciens : actualise pour les revoir.','pending');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){/* Pas de donnée recopiée en arrière-plan. */return;}if(!gate.hidden&&!$('#real-results').hidden&&checkedAt&&Date.now()-checkedAt>10*60*1000){$('#real-results').hidden=true;message('Clique sur « Actualiser » pour retrouver les chiffres.','pending');}});
if(!gate.hidden)refresh();
})();
