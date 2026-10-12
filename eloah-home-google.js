/* ELOAH accueil — lecture Google Agenda uniquement si session OAuth déjà autorisée. */
(()=>{'use strict';
const root=document.getElementById('eloah-daily');if(!root)return;
const status=document.createElement('p');status.id='eloah-home-google-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const link=document.createElement('a');link.href='eloah-actions.html#google-connect';link.textContent='Gérer la connexion Google Agenda ↗';link.style.cssText='display:inline-block;margin:6px 0 10px;font:12px system-ui;color:#4057a5';
const content=root.querySelector('#eloah-home-daily');if(!content)return;content.append(status,link);
const publish=(events)=>window.dispatchEvent(new CustomEvent('eloah-google-calendar-loaded',{detail:events}));
async function init(){
 const lib=window.supabase;
 if(!lib?.createClient){status.textContent='Google Agenda : bibliothèque de connexion indisponible.';return}
 const client=lib.createClient('https://voytsqyorhoveurnguxn.supabase.co','sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy',{auth:{storageKey:'eloah-google-calendar-oauth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,flowType:'pkce'}});
 try{
  const {data,error}=await client.auth.getSession();if(error)throw error;
  const token=data.session?.provider_token;
  if(!token){status.textContent='Google Agenda : connecte ton compte depuis le centre d’actions pour afficher tes rendez-vous ici.';return}
  status.textContent='Google Agenda : récupération des événements…';
  const start=new Date(),end=new Date(start.getTime()+30*86400000);
  const q=new URLSearchParams({timeMin:start.toISOString(),timeMax:end.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'100'});
  const response=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?'+q,{headers:{Authorization:'Bearer '+token},cache:'no-store'});
  if(!response.ok){status.textContent=response.status===401?'Google Agenda : autorisation expirée, reconnecte-toi depuis le centre d’actions.':'Google Agenda : lecture indisponible (erreur '+response.status+').';return}
  const result=await response.json();const items=Array.isArray(result.items)?result.items.filter(e=>e.status!=='cancelled'):[];
  publish(items.map(e=>({id:e.id||'',title:e.summary||'Événement sans titre',date:(e.start?.dateTime||e.start?.date||'').slice(0,10),url:e.htmlLink||''})));
  status.textContent='Google Agenda : '+items.length+' événement(s) chargés sur 30 jours. Aucune donnée publiée.';
 }catch(e){status.textContent='Google Agenda : impossible de charger la session. Ouvre le centre d’actions pour te reconnecter.'}
}
init();
})();