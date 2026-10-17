/* ELOAH · Sources externes sélectionnées avec consentement (pas de transfert automatique).
   WordPress public + Google Drive/Gmail OAuth, lecture seule, réservés à la fondatrice.
   Les jetons Google restent dans la session du navigateur ; aucun token vers l'IA. */
(()=>{
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co';
const KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
const SITE={pg:'257263122',crew:'257252103',exp:'257624305'}; // IDs réels des 3 sites WordPress de la fondatrice.
const LIB='https://esm.sh/@supabase/supabase-js@2.116.0';
const lookup=id=>document.getElementById(id);
let selected=[],results=[],epoch=0,founderClient=null,googleClient=null,providerToken=null,loading=false;
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>{const d=new DOMParser().parseFromString(String(s??'').slice(0,12000),'text/html');d.querySelectorAll('script,style,iframe,form,object,img,link').forEach(x=>x.remove());return (d.body?.textContent||'').replace(/\s+/g,' ').trim()};
const clip=(s,n)=>String(s||'').slice(0,n);
const STOP_WORDS=new Set(['avec','pour','dans','sans','comme','quand','quelle','quelles','quels','entre','faire','creer','creation','dossier','article','texte','sujet','autre','autres','nous','vous','elle','elles','celui','celle','comment','pourquoi','trouver','recherche','power','glam','the','crew','orchies','sonia','eloah']);
function topicWords(topic){
 return [...new Set(String(topic||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').split(/[^\p{L}\p{N}]+/u)
   .filter(w=>w.length>=4&&!STOP_WORDS.has(w)))].slice(0,8);
}

const current=()=>lookup('home-ai-project')?.value||'';
function notify(message){const e=lookup('ecs-remote-status');if(e)e.textContent=message;}
function validUrl(url,domain){try{const parsed=new URL(url);return parsed.protocol==='https:'&&(parsed.hostname===domain||parsed.hostname.endsWith('.'+domain))?parsed.href:''}catch{return ''}}
const snapshot=()=>selected.map(x=>({...x}));
window.EloahConnectedSources={
 evidence(universe){return selected.filter(x=>x.universe===universe).map(x=>({key:x.key,title:x.title,origin:x.origin,universe:x.universe,url:x.url||'',excerpt:x.excerpt}));},
 sources(){return snapshot().map(x=>({title:x.title,origin:x.origin,url:x.url||'',universe:x.universe}))},
 abortAutoSearch(){
  // Ignore les retours WordPress tardifs, mais conserve les sources choisies manuellement.
  epoch++;
  selected=selected.filter(item=>!item.auto);
  showSelected();
  notify('WordPress n’a pas répondu à temps : tes sources choisies restent disponibles.');
 },
 async prepare(topic,universe){
  selected=selected.filter(x=>!x.auto);
  if(lookup('ers-wp-auto')?.checked!==true)return 0;
  const siteId=universe==='Power & Glam'?'pg':universe==='The Crew Orchies'?'crew':null;
  if(!siteId)return 0;
  const words=topicWords(topic);
  if(!words.length)return 0;
  const run=++epoch;
  try{
   const params=new URLSearchParams({number:'12',search:words[0],fields:'ID,title,URL,excerpt,content,status'});
   const response=await fetch('https://public-api.wordpress.com/rest/v1.1/sites/'+encodeURIComponent(SITE[siteId])+'/posts/?'+params,{cache:'no-store',signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const data=await response.json();
   if(epoch!==run||universe!==current())return 0;
   const ranked=(data.posts||[]).filter(p=>p.status==='publish').map(p=>{
    const title=plain(p.title||''),content=plain(p.content||p.excerpt||'');
    const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
    const score=words.reduce((n,w)=>n+(norm(title).includes(w)?4:0)+(norm(content).includes(w)?1:0),0);
    return {p,title,content,score};
   }).filter(x=>x.score>=2&&x.content.length>=40).sort((a,b)=>b.score-a.score).slice(0,2);
   for(const x of ranked){
    const key='wp:'+siteId+':'+String(x.p.ID);
    if(selected.some(v=>v.key===key)||selected.length>=5)continue;
    selected.push({key,title:x.title,origin:'WordPress public · recherche automatique (non vérifié)',universe,excerpt:clip(x.content,1200),auto:true,url:validUrl(x.p.URL,'wordpress.com')||validUrl(x.p.URL,'thecreworchies.blog')||''});
   }
   showSelected();notify(selected.filter(x=>x.auto).length+' article(s) publics pertinents retenu(s) automatiquement. Sources non vérifiées.');
   return selected.filter(x=>x.auto).length;
  }catch(e){if(epoch!==run)return 0;selected=selected.filter(x=>!x.auto);showSelected();notify('Recherche WordPress automatique indisponible : '+clip(e.message,120));throw new Error('WordPress : '+clip(e.message,120))}
 },
 clearPrivateAfterAnswer(){
  // Le registre CDSQCD a déjà sauvegardé la provenance de la réponse terminée.
  // Les extraits privés ne doivent pas être joints à une demande ultérieure par inadvertance.
  selected=selected.filter(x=>!(x.key?.startsWith('mail:')||x.key?.startsWith('drive:')));
  results=results.filter(x=>!(x.key?.startsWith('mail:')||x.key?.startsWith('drive:')));
  epoch++;
  showSelected();showResults();
 },
 clear(){epoch++;selected=[];results=[];showResults();showSelected();notify('Univers ou compte changé : références externes retirées de la préparation.')}
};
function showSelected(){
 const zone=lookup('ecs-remote-selected');if(!zone)return;
 zone.replaceChildren();
 if(!selected.length){zone.textContent='Aucune source externe ajoutée à cette création.';return}
 for(const item of selected){
  const row=document.createElement('div');row.className='ers-selected';
  const label=document.createElement('span');label.textContent=item.title+' · '+item.origin;
  const remove=document.createElement('button');remove.type='button';remove.textContent='Retirer';
  remove.addEventListener('click',()=>{selected=selected.filter(x=>x.key!==item.key);showSelected();showResults();notify('Source retirée de la demande.')});
  row.append(label,remove);zone.append(row);
 }
}
function showResults(){
 const zone=lookup('ecs-remote-results');if(!zone)return;
 zone.replaceChildren();
 if(!results.length){zone.textContent='Aucun résultat chargé pour cette recherche.';return}
 for(const item of results){
  const row=document.createElement('article');row.className='ers-result';
  const title=document.createElement('strong');title.textContent=item.title;
  const desc=document.createElement('p');desc.textContent=item.origin+' · '+clip(item.preview,270);
  const actions=document.createElement('div');actions.className='ers-actions';
  if(item.url&&validUrl(item.url,'wordpress.com')||item.url&&validUrl(item.url,'google.com')||item.url&&validUrl(item.url,'googleusercontent.com')||item.url&&validUrl(item.url,'thecreworchies.blog')){
   const anchor=document.createElement('a');anchor.href=item.url;anchor.rel='noopener noreferrer';anchor.target='_blank';anchor.textContent='Voir la source ↗';actions.append(anchor);
  }
  const add=document.createElement('button');add.type='button';add.textContent=selected.some(x=>x.key===item.key)?'Ajoutée ✓':'Joindre à la création';
  add.disabled=selected.some(x=>x.key===item.key);
  add.addEventListener('click',async()=>{
   if(current()!==item.universe){notify('Univers modifié. Refais une recherche.');return}
   if(selected.length>=5){notify('Maximum cinq sources externes par demande. Retire une référence pour en ajouter une autre.');return}
   add.disabled=true;add.textContent='Lecture de la source…';
   const sourceEpoch=epoch;
   try{
    const full=await item.getContent();
    if(sourceEpoch!==epoch||current()!==item.universe)throw Error('Recherche ou univers changé pendant la lecture');
    const text=clip(plain(full||item.preview),1250);
    if(text.length<15)throw Error('Aucun extrait utilisable');
    selected.push({key:item.key,title:item.title,origin:item.origin,url:item.url,universe:item.universe,excerpt:text});
    showSelected();showResults();notify('Source jointe. Seul cet extrait sera transmis au moteur IA lors de ta prochaine demande.');
   }catch(e){notify('Source non ajoutée : '+clip(e.message,160));showResults()}
  });
  actions.append(add);row.append(title,desc,actions);zone.append(row);
 }
}
async function sdk(){
 const m=await import(LIB);
 if(!founderClient) founderClient=m.createClient(BASE,KEY,{auth:{storageKey:'eloah-founder-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 return m;
}
async function founder(){
 await sdk();const {data,error}=await founderClient.auth.getUser();
 if(error||data?.user?.id!==FOUNDER||data.user?.is_anonymous)throw Error('Connexion ELOAH Fondatrice requise pour ces sources.');
 return true;
}
async function google(){
 await founder();const mod=await sdk();
 if(!googleClient)googleClient=mod.createClient(BASE,KEY,{auth:{storageKey:'eloah-sources-google-pkce-v1',storage:sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 return googleClient;
}
async function token(){
 const client=await google();
 const {data,error}=await client.auth.getSession();
 if(error||!data.session?.provider_token){providerToken=null;throw Error('Google non autorisé pour cet onglet. Clique sur « Autoriser Google » pour continuer.')}
 providerToken=data.session.provider_token;
 return providerToken;
}
async function api(url,access){
 const response=await fetch(url,{method:'GET',headers:{Authorization:'Bearer '+access,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(13000)});
 if(!response.ok){
  if(response.status===401){providerToken=null;throw Error('Autorisation Google expirée. Reconnecte le compte.')}
  if(response.status===403)throw Error('Accès Google refusé : API ou autorisations non activées dans Google Cloud. Aucune donnée lue.');
  throw Error('Google : erreur HTTP '+response.status);
 }
 return await response.json();
}
async function verifyWordPress(){
 const status=lookup('ers-wordpress-diagnostic');
 const button=lookup('ers-wordpress-check');
 if(button)button.disabled=true;
 if(status)status.textContent='Diagnostic des trois sites publics et des modules de création…';
 try{
  const ids=['pg','crew','exp'],labels={pg:'Power & Glam',crew:'The Crew Orchies',exp:'P&G Expérience'};
  const checks=await Promise.all(ids.map(async id=>{
   try{
    const qs=new URLSearchParams({number:'1',fields:'ID,title,status'});
    const response=await fetch('https://public-api.wordpress.com/rest/v1.1/sites/'+encodeURIComponent(SITE[id])+'/posts/?'+qs,{cache:'no-store',signal:AbortSignal.timeout(9000)});
    if(!response.ok)throw Error('HTTP '+response.status);
    const body=await response.json();
    if(!Array.isArray(body.posts))throw Error('Réponse inattendue');
    return {name:labels[id],ok:true,articles:body.posts.filter(x=>x.status==='publish').length};
   }catch(error){return{name:labels[id],ok:false,reason:clip(error?.message||'indisponible',75)}}
  }));
  const modules=[
   {name:'Recherche de sources',loaded:typeof window.EloahConnectedSources?.evidence==='function'},
   {name:'Registre de références',loaded:typeof window.EloahEvidence?.audit==='function'},
   {name:'Création de 10 PNG',loaded:typeof window.EloahCarouselProduction?.makePNGSet==='function'},
   {name:'Export du dossier',loaded:Boolean(lookup('eloah-final-package'))}
  ];
  // Vérifie seulement le CHARGEMENT des composants. Un essai complet reste nécessaire.
  if(status){
   status.replaceChildren();
   const heading=document.createElement('strong');heading.textContent='Diagnostic local · '+new Date().toLocaleString('fr-FR');
   const list=document.createElement('ul');
   for(const check of checks){
    const line=document.createElement('li');line.textContent=check.name+' : '+(check.ok?'API publique accessible':'lecture impossible ('+check.reason+')');list.append(line);
   }
   for(const module of modules){
    const line=document.createElement('li');line.textContent=module.name+' : '+(module.loaded?'module chargé':'module absent ou indisponible');list.append(line);
   }
   const foot=document.createElement('p');
   foot.textContent='Ce diagnostic ne valide ni la connexion Google, ni les permissions fondatrice, ni la génération IA. Il ne lit pas de documents privés.';
   status.append(heading,list,foot);
  }
 }finally{if(button)button.disabled=false}
}
async function searchWP(query,universe,run){
 const ids=['pg','crew','exp'];
 let reached=0;
 const errors=[];
 const all=await Promise.all(ids.map(async id=>{
  const url='https://public-api.wordpress.com/rest/v1.1/sites/'+encodeURIComponent(SITE[id])+'/posts/?'+new URLSearchParams({number:'15',search:query,fields:'ID,title,URL,excerpt,content,date,status'}).toString();
  try{
   const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('WordPress '+response.status);
   const data=await response.json();
   reached++;
   return (Array.isArray(data.posts)?data.posts:[]).filter(post=>post.status==='publish').slice(0,6).map(post=>{
    const label={pg:'Power & Glam',crew:'The Crew Orchies',exp:'P&G Expérience'}[id];
    const url=validUrl(post.URL,'wordpress.com')||validUrl(post.URL,'thecreworchies.blog')||'';
    const excerpt=plain(post.excerpt||post.content||'');
    return {key:'wp:'+id+':'+String(post.ID),title:plain(post.title||'Article sans titre'),origin:'WordPress public · '+label,url,preview:clip(excerpt,250),universe,
      getContent:async()=>plain(post.content||post.excerpt||'')};
   });
  }catch(err){errors.push(id);return []}
 }));
 if(run!==epoch||current()!==universe)return;
 results=all.flat().slice(0,16);showResults();
 notify(reached===0?'Échec de lecture des trois sites WordPress : aucun résultat confirmé.':results.length+' article(s) publics retrouvés · '+reached+'/3 site(s) consulté(s).'+(errors.length?' Recherche partielle.':'')+' Sélectionne seulement les références utiles.');
}
async function searchDrive(query,universe,run){
 const access=await token();
 // Recherche par nom limitée ; ne lit aucun fichier avant un clic explicite sur Joindre.
 const first=query.trim().split(/\s+/).filter(Boolean)[0].replace(/\\/g,'').replace(/'/g,"\\'");
 const q="trashed = false"+(first?" and name contains '"+first+"'":'');
 const params=new URLSearchParams({q,pageSize:'70',fields:'nextPageToken,files(id,name,mimeType,description,webViewLink,modifiedTime)',orderBy:'modifiedTime desc'});
 const data=await api('https://www.googleapis.com/drive/v3/files?'+params,access);
 if(run!==epoch||current()!==universe)return;
 results=(data.files||[]).filter(x=>/google-apps\.document|text\/plain|text\/markdown/.test(x.mimeType||'')).slice(0,18).map(item=>{
  const preview=clip(item.description||('Document '+item.mimeType),240);
  return {key:'drive:'+item.id,title:clip(item.name,150),origin:'Google Drive · document sélectionnable',universe,
   url:item.webViewLink||'',preview,
   getContent:async()=>{
    const t=await token();
    const exportUrl=item.mimeType==='application/vnd.google-apps.document'
      ?'https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.id)+'/export?mimeType=text%2Fplain'
      :'https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(item.id)+'?alt=media';
    const response=await fetch(exportUrl,{headers:{Authorization:'Bearer '+t},cache:'no-store',signal:AbortSignal.timeout(13000)});
    if(!response.ok)throw Error('Ce document ne peut pas être lu en texte (HTTP '+response.status+').');
    const raw=await response.text();return raw.slice(0,1250);
   }};
 });
 showResults();notify(results.length+' document(s) Google Drive retrouvés. Le contenu sera lu uniquement si tu choisis « Joindre ».');
}
async function searchGmail(query,universe,run){
 if(query.trim().length<2)throw Error('Saisis au moins deux caractères pour une recherche Gmail.');
 const access=await token();
 const params=new URLSearchParams({q:query,maxResults:'12'});
 const index=await api('https://gmail.googleapis.com/gmail/v1/users/me/messages?'+params,access);
 const found=(index.messages||[]).slice(0,12);
 const rows=await Promise.all(found.map(async item=>{
  const p=new URLSearchParams({format:'metadata'});['Subject','From','Date'].forEach(s=>p.append('metadataHeaders',s));
  try{
   const detail=await api('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(item.id)+'?'+p,access);
   const heads=detail.payload?.headers||[];
   const header=name=>heads.find(x=>x.name?.toLowerCase()===name.toLowerCase())?.value||'';
   const subject=header('Subject')||'Message sans objet',from=header('From')||'Expéditeur non identifié';
   const preview=clip(detail.snippet||'',300);
   return {key:'mail:'+item.id,title:clip(subject,140),origin:'Gmail · '+clip(from,100),universe,url:'https://mail.google.com/mail/u/0/#all/'+item.id,preview,
     getContent:async()=> 'Objet : '+subject+'\nDe : '+from+'\nDate : '+header('Date')+'\nExtrait : '+preview};
  }catch{return null}
 }));
 if(run!==epoch||current()!==universe)return;
 results=rows.filter(Boolean);showResults();
 notify(results.length+' message(s) Gmail retrouvés. Seuls objet, expéditeur, date et extrait seront disponibles. Aucun corps de mail complet n’est transmis.');
}
async function runSearch(kind){
 if(loading)return;
 const query=lookup('ecs-remote-query')?.value.trim()||'';
 const universe=current();
 if(!universe){notify('Choisis d’abord un univers dans l’atelier.');return}
 if(!query){notify('Écris un sujet ou un mot-clé pour rechercher.');return}
 const run=++epoch;results=[];showResults();loading=true;toggle(true);notify('Recherche '+kind+' en cours…');
 try{
  if(kind==='wordpress')await searchWP(query,universe,run);
  if(kind==='drive'){await founder();await searchDrive(query,universe,run)}
  if(kind==='gmail'){await founder();await searchGmail(query,universe,run)}
 }catch(e){if(run===epoch)notify('Recherche impossible : '+clip(e.message,210))}
 finally{loading=false;toggle(false)}
}
function toggle(disabled){document.querySelectorAll('[data-ers-search]').forEach(b=>b.disabled=disabled);}
async function authorizeGoogle(kind){
 try{
  await founder();notify(kind==='gmail'?'Autorisation Gmail demandée séparément. Google peut exiger une validation de l’application.':'Autorisation Google Drive uniquement, en lecture seule…');
  const c=await google();
  const {data,error}=await c.auth.signInWithOAuth({provider:'google',options:{
    scopes:kind==='gmail'?'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly':'https://www.googleapis.com/auth/drive.readonly',
    redirectTo:location.origin+location.pathname,
    queryParams:{access_type:'online',prompt:'consent select_account'}
  }});
  if(error)throw error;
  if(!data?.url)throw Error('Aucune adresse de connexion Google fournie.');
 }catch(e){notify('Autorisation non lancée : '+clip(e.message,200))}
}
async function verifyGoogle(){
 notify('Vérification réelle des deux API Google, sans importer de données…');
 try{
  const t=await token();
  const outcomes=await Promise.allSettled([
   api('https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id)',t),
   api('https://gmail.googleapis.com/gmail/v1/users/me/profile',t)
  ]);
  const labels=['Drive','Gmail'];
  const outcome=outcomes.map((r,i)=>labels[i]+' : '+(r.status==='fulfilled'?'lecture autorisée':'non autorisé ou non configuré'));
  notify(outcome.join(' · ')+'. Aucune donnée importée par ce test.');
 }catch(e){notify('Connexion Google non confirmée : '+clip(e.message,160))}
}
async function forgetGoogle(){
 providerToken=null;window.EloahConnectedSources.clear();
 try{if(googleClient)await googleClient.auth.signOut({scope:'local'});notify('Session Google de cet onglet fermée. Révoque aussi l’accès depuis ton compte Google si nécessaire.')}catch(e){notify('Déconnexion non confirmée : '+clip(e.message,140))}
}
function init(){
 const form=lookup('home-ai-form');if(!form||lookup('eloah-connected-sources'))return;
 const section=document.createElement('section');section.id='eloah-connected-sources';
 section.innerHTML='<details><summary>Mes sources externes · WordPress, Drive et Gmail</summary>'+
 '<p>Recherche des contenus réels et choisis ce qu’ELOAH peut utiliser. Aucun mail ou document Google n’est lu ni transmis automatiquement. Les sources sélectionnées ne constituent pas une preuve indépendante.</p>'+
 '<label for="ecs-remote-query">Sujet à rechercher</label><input id="ecs-remote-query" type="search" maxlength="140" placeholder="Ex. attachement, Nostradamus, atelier latino…">'+
 '<div class="ers-actions"><button type="button" id="ers-wordpress-check">Vérifier mes sites WordPress</button><button type="button" data-ers-search="wordpress">Chercher sur mes WordPress publics</button><button type="button" id="ers-google-connect">Autoriser Drive (lecture seule)</button><button type="button" id="ers-gmail-connect">Autoriser Gmail (+ Drive)</button></div>'+
 '<div class="ers-actions"><button type="button" id="ers-google-verify">Vérifier Google</button><button type="button" data-ers-search="drive">Chercher dans Drive</button><button type="button" data-ers-search="gmail">Chercher dans Gmail</button><button type="button" id="ers-google-forget">Fermer la session Google</button></div>'+
 '<p class="ers-note">Google nécessite une connexion Fondatrice, une autorisation distincte et les API/scopes configurés dans Google Cloud. L’accès Gmail est facultatif et sa permission est restreinte : elle peut nécessiter une vérification Google. Les connexions ChatGPT ne sont pas transférées à ton site.</p>'+
 '<label class="ers-auto"><input type="checkbox" id="ers-wp-auto" checked> Chercher automatiquement jusqu’à deux articles publics pertinents de Power & Glam ou The Crew pour ma création. Aucun accès Google automatique.</label>'+
 '<div id="ers-wordpress-diagnostic" role="status" aria-live="polite">WordPress : lecture depuis ce navigateur non encore vérifiée.</div>'+'<p id="ecs-remote-status" role="status" aria-live="polite">WordPress public consultable sans connexion. Google : autorisation non vérifiée.</p>'+
 '<h4>Résultats</h4><div id="ecs-remote-results"></div><h4>Sources choisies pour cette création</h4><div id="ecs-remote-selected"></div></details>';
 const library=lookup('eloah-creation-sources');(library||form).before(section);
 for(const button of section.querySelectorAll('[data-ers-search]'))button.addEventListener('click',()=>runSearch(button.dataset.ersSearch));
 lookup('ers-wordpress-check').addEventListener('click',verifyWordPress);
 lookup('ers-google-connect').addEventListener('click',()=>authorizeGoogle('drive'));
 lookup('ers-gmail-connect').addEventListener('click',()=>authorizeGoogle('gmail'));
 lookup('ers-google-verify').addEventListener('click',verifyGoogle);
 lookup('ers-google-forget').addEventListener('click',forgetGoogle);
 lookup('home-ai-project')?.addEventListener('change',()=>window.EloahConnectedSources.clear());
 window.addEventListener('storage',event=>{if(event.key==='eloah-founder-auth-v1'||event.key===null)window.EloahConnectedSources.clear()});
 window.addEventListener('pagehide',()=>{epoch++;selected=[];results=[];providerToken=null});
 showResults();showSelected();
 const style=document.createElement('style');
 style.textContent='#eloah-connected-sources{margin:15px 0;background:#fffdf9;color:#262b29;border:1px solid #d7d7ce;border-radius:13px;padding:14px 17px}#eloah-connected-sources summary{min-height:44px;cursor:pointer;font:600 16px/1.5 system-ui;color:#293d38}#eloah-connected-sources p{font:13px/1.55 system-ui;color:#4d5650}#eloah-connected-sources label{display:block;font:600 13px system-ui;margin:14px 0 6px}#eloah-connected-sources input{box-sizing:border-box;width:100%;padding:12px;background:#fff;color:#1b2520;border:1px solid #aab6ac;border-radius:8px;font:16px system-ui}#eloah-connected-sources h4{font:600 16px system-ui;margin:20px 0 8px}.ers-actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.ers-actions button,.ers-actions a,#eloah-connected-sources .ers-selected button{display:inline-flex;align-items:center;min-height:44px;padding:10px 12px;background:#293d38;border:1px solid #293d38;border-radius:8px;color:#fff;font:600 12px system-ui;cursor:pointer;text-decoration:none}#eloah-connected-sources button:disabled{opacity:.6;cursor:default}.ers-result{margin:8px 0;padding:13px;border:1px solid #dce1d9;border-radius:9px;background:#fff}.ers-result strong{font:600 15px system-ui}.ers-result p{overflow-wrap:anywhere}.ers-selected{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:7px 0;padding:9px;background:#f1f2ef;border-radius:8px;overflow-wrap:anywhere}#eloah-connected-sources .ers-auto{display:flex;align-items:flex-start;gap:10px;background:#f0f4ed;padding:12px;border-radius:8px;color:#283e32}#eloah-connected-sources .ers-auto input{width:18px;height:18px;flex:0 0 18px;margin-top:2px}#eloah-connected-sources :focus-visible{outline:3px solid #b58e62;outline-offset:2px}@media(max-width:600px){.ers-actions{display:grid}.ers-actions button,.ers-actions a{justify-content:center}.ers-selected{align-items:flex-start;flex-direction:column}}';
 document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
