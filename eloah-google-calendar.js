/* ELOAH Google Calendar — OAuth lecture seule. Aucun secret privé dans ce fichier. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const state=$('google-state'),list=$('google-event-list'),connect=$('google-connect-button'),refresh=$('google-refresh-button'),disconnect=$('google-disconnect-button');
if(!state||!connect)return;
const URL='https://voytsqyorhoveurnguxn.supabase.co';
const PUBLIC_KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const client=window.supabase?.createClient(URL,PUBLIC_KEY,{auth:{storageKey:'eloah-google-calendar-oauth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
let providerToken=null;
let selectedAccount='';
const show=t=>{state.textContent=t};
const buttonState=()=>{refresh.disabled=!providerToken;disconnect.disabled=!providerToken};
async function checkSession(){
 if(!client){show('Bibliothèque d’authentification indisponible.');return}
 try{
  const {data,error}=await client.auth.getSession();if(error)throw error;
  providerToken=data.session?.provider_token||null;buttonState();
  if(providerToken){show('Autorisation Google active pour cette session. Lecture seule.');await loadEvents()}
  else show(data.session?'Session ELOAH trouvée, mais accès Google Agenda absent : reconnecte Google pour autoriser la lecture.':'Google Agenda non connecté. Le fournisseur OAuth doit être configuré dans Supabase.');
 }catch(e){show('Connexion non disponible : '+e.message)}
}
connect.addEventListener('click',async()=>{
 if(!client){show('Service de connexion non chargé.');return}
 connect.disabled=true;
 show('Ouverture de la demande d’autorisation Google…');
 try{
  const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{scopes:'https://www.googleapis.com/auth/calendar.readonly',redirectTo:location.origin+location.pathname,queryParams:{access_type:'online',prompt:'select_account consent'},skipBrowserRedirect:false}});
  if(error)throw error;
  if(!data?.url)show('Aucune page de connexion renvoyée : vérifier la configuration du fournisseur Google.');
 }catch(e){show('Configuration ou connexion Google à vérifier : '+e.message)}
 finally{connect.disabled=false}
});
async function loadEvents(){
 if(!providerToken)return;
 refresh.disabled=true;list.replaceChildren();show('Lecture des prochains événements Google Agenda…');
 try{
  const now=new Date(),end=new Date(now.getTime()+30*86400000);
  const query=new URLSearchParams({timeMin:now.toISOString(),timeMax:end.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'40'});
  const response=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?'+query,{headers:{Authorization:'Bearer '+providerToken},cache:'no-store'});
  if(!response.ok){if(response.status===401){providerToken=null;buttonState();throw Error('Autorisation expirée : reconnecte Google.')}throw Error('Google Calendar HTTP '+response.status+' (vérifier API et permissions)')}
  const data=await response.json();
  const events=(Array.isArray(data.items)?data.items:[]).filter(e=>e.status!=='cancelled');
  for(const event of events){
   const card=document.createElement('article');card.className='event';
   const date=document.createElement('div');date.className='event-date';
   const start=event.start?.dateTime||event.start?.date||'';
   date.textContent=start?new Date(start.length===10?start+'T12:00:00':start).toLocaleString('fr-FR',{dateStyle:'medium',...(start.length===10?{}:{timeStyle:'short'})}):'Date à vérifier';
   const title=document.createElement('div');title.className='event-title';title.textContent=event.summary||'Événement sans titre';
   const desc=document.createElement('div');desc.className='event-desc';desc.textContent=event.location||'Google Agenda · lecture seule';
   card.append(date,title,desc);
   if(event.htmlLink&&event.htmlLink.startsWith('https://')){const a=document.createElement('a');a.className='back';a.href=event.htmlLink;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Voir dans Google Agenda ↗';card.append(a)}
   const add=document.createElement('button');add.type='button';add.textContent='Ajouter une tâche de préparation';
   add.onclick=()=>{
     const key='eloah-action-tasks-v1';
     const day=(event.start?.dateTime||event.start?.date||'').slice(0,10);
     const titleText=('Préparer : '+(event.summary||'Rendez-vous')).slice(0,180);
     const seedId='google:'+String(event.id||'').slice(0,150);
     try{
       let tasks=JSON.parse(localStorage.getItem(key)||'[]');
       if(!Array.isArray(tasks))throw Error('Format des tâches inattendu');
       if(tasks.some(t=>t.seedId===seedId)){show('Cette tâche a déjà été ajoutée.');return}
       if(!confirm('Créer la tâche « '+titleText+' » pour le '+day+' ?'))return;
       tasks.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),seedId,title:titleText,date:day,project:'ELOAH',priority:'normale',done:false});
       localStorage.setItem(key,JSON.stringify(tasks));
       show('Tâche ajoutée. Recharge le tableau pour actualiser les compteurs.');
       add.disabled=true;add.textContent='Tâche ajoutée ✓';
     }catch(e){show('Impossible de sauvegarder la tâche localement : '+e.message)}
   };
   card.append(add);
   list.append(card);
  }
  show(events.length+' événement(s) lus depuis le calendrier principal du compte autorisé · 30 jours. Aucune donnée publiée.');
  if(!events.length){const p=document.createElement('p');p.textContent='Aucun événement à venir dans ce calendrier principal.';list.append(p)}
 }catch(e){show('Lecture impossible : '+e.message)}
 finally{buttonState()}
}
refresh.addEventListener('click',loadEvents);
disconnect.addEventListener('click',async()=>{
 providerToken=null;list.replaceChildren();buttonState();
 try{if(client)await client.auth.signOut({scope:'local'});show('Session Google locale fermée. Pour retirer aussi l’autorisation accordée à l’application, consulte les paramètres de sécurité de ton compte Google.')}catch(e){show('Déconnexion locale non confirmée : '+e.message)}
});
checkSession();
})();
