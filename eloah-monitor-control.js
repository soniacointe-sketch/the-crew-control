/* ELOAH Monitor · Tour de contrôle fondatrice (2026-10-15).
 * Découverte d'outils et contrôles HEAD des pages publiques uniquement.
 * Aucune table Supabase ni donnée personnelle ou cliente n'est consultée.
 * GitHub Pages est un hébergement public : cette garde UI n'est pas une protection serveur.
 */
(()=>{'use strict';
const AUTH_URL='https://voytsqyorhoveurnguxn.supabase.co';
const ANON='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
const FOCUS_KEY='eloah-monitor-focus-v2'; // IDs + états non confidentiels uniquement.
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const universes=[
 {id:'crew',name:'The Crew Orchies',type:'Association',icon:'✳',desc:'Association, répétitions, adhésions et événements.',url:'index.html',other:'eloah-the-crew.html',otherLabel:'Pilotage Crew'},
 {id:'power',name:'Power & Glam',type:'Édition',icon:'✦',desc:'Dossiers, articles, produits et publications.',url:'power-glam-control.html',other:'eloah-power-glam-article-studio.html',otherLabel:'Article Studio'},
 {id:'os',name:'SONIA OS',type:'Système',icon:'◈',desc:'Missions, agents et organisation globale.',url:'sonia-os.html',other:'eloah-cortex.html',otherLabel:'Cortex'},
 {id:'parisis',name:'PARISIS Engine',type:'Enquête',icon:'⌘',desc:'Enquêtes historiques, sources et chronologies.',url:'eloah-parisis.html',other:'eloah-apocryphes-atlas.html',otherLabel:'Atlas'},
 {id:'foi',name:'Foi & spiritualité',type:'Recherche',icon:'☼',desc:'Recherches documentaires, textes et collections.',url:'foi-control.html',other:'eloah-foi-spiritualite.html',otherLabel:'Bibliothèque'},
 {id:'velka',name:'Sonia Velka',type:'Identité',icon:'♕',desc:'Identité artistique, écriture et projets de vie.',url:'sonia-velka-control.html',other:'eloah-velka.html',otherLabel:'Studio Velka'},
 {id:'lion',name:'Le Lion Blanc',type:'Association',icon:'♜',desc:'Engagement citoyen et actions collectives.',url:'lion-blanc-control.html',other:null,otherLabel:''},
 {id:'pg',name:'ELOAH P&G',type:'Plateforme',icon:'◇',desc:'Offres, parcours et gestion de l’écosystème.',url:'eloah-control.html',other:'eloah-offres.html',otherLabel:'Offres'},
 {id:'dark',name:'Dark Energy',type:'Création',icon:'☽',desc:'Laboratoire de création et expérimentation.',url:'dark-energy-control.html',other:null,otherLabel:''},
 {id:'eloah',name:'ELOAH Studio',type:'Création',icon:'✧',desc:'Outils de design, vidéos et création multimédia.',url:'eloah-reel-studio.html',other:'eloah-2040.html',otherLabel:'ELOAH 2040'}
];
const tools=[
 {title:'Mon organisation',detail:'Planning et projets',symbol:'▦',url:'eloah-pilotage.html'},
 {title:'ELOAH Boards',detail:'Tableaux et cartes',symbol:'▤',url:'eloah-trello.html'},
 {title:'ELOAH 2040',detail:'Assistant et laboratoire',symbol:'✧',url:'eloah-2040.html'},
 {title:'Documents',detail:'Bibliothèque',symbol:'◫',url:'eloah-bibliotheque.html?type=fichiers'},
 {title:'Reel Studio',detail:'Création vidéo',symbol:'▷',url:'eloah-reel-studio.html'},
 {title:'ELOAH Music',detail:'Création musicale',symbol:'♫',url:'eloah-music.html'},
 {title:'Mes offres',detail:'Produits et services',symbol:'◇',url:'eloah-offres.html'},
 {title:'Monitor Lab',detail:'Simulateur frigorifique conservé',symbol:'⌁',url:'eloah-monitor-lab.html'}
];
let client=null,authorized=false,revision=0,focus={},checks=new Map(),checking=false,lastCheck=null,external=null;
let filter='all',term='',mobile=false;
let events=[];
const stamp=v=>new Date(v).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
function event(text){events.unshift({when:Date.now(),text});events=events.slice(0,12);renderActivity();}
function save(){try{localStorage.setItem(FOCUS_KEY,JSON.stringify({version:2,focus}));return true;}catch{return false;}}
function read(){try{const v=JSON.parse(localStorage.getItem(FOCUS_KEY)||'null');if(!v||v.version!==2||typeof v.focus!=='object'||!v.focus)return;for(const u of universes){const status=v.focus[u.id];if(['watch','priority','active'].includes(status))focus[u.id]=status;}}catch{}}
function stateOf(u){return focus[u.id]||'watch';}
const pretty={watch:'À suivre',priority:'Prioritaire',active:'En cours'};
function showAuth(message,blocked=false){authorized=false;$('#app').hidden=true;$('#access').hidden=false;$('#access-title').textContent=blocked?'Accès non autorisé':'Connexion fondatrice requise';$('#access-message').textContent=message;$('#connect-link').hidden=blocked;}
function showApp(){authorized=true;$('#access').hidden=true;$('#app').hidden=false;renderAll();}
async function verify(){const current=++revision;try{
 if(!client)throw Error('Connexion indisponible');
 const timeout=new Promise((_,rej)=>setTimeout(()=>rej(Error('Délai de connexion dépassé')),12000));
 const {data,error}=await Promise.race([client.auth.getUser(),timeout]);
 if(current!==revision)return;
 if(error)throw error;
 if(data?.user?.id!==FOUNDER){showAuth(data?.user?'Ce compte appartient à un autre espace ELOAH. Aucun contenu fondatrice n’est affiché.':'Connecte-toi à ton compte fondatrice pour ouvrir la tour de contrôle.',!!data?.user);return;}
 const first=!authorized;if(first){read();showApp();event('Session fondatrice vérifiée. Aucun dossier client chargé.');await Promise.all([verifyPublic(),readExternal()]);}
 }catch{if(current!==revision)return;showAuth('Impossible de vérifier la session. Connecte-toi à ton espace fondatrice puis réessaie.');}
}
async function boot(){
 $('#today').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 if(!window.supabase?.createClient){showAuth('Le module de connexion est indisponible. Vérifie ta connexion Internet.');return;}
 client=window.supabase.createClient(AUTH_URL,ANON,{auth:{storageKey:'eloah-founder-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 client.auth.onAuthStateChange((evt,session)=>{if(evt==='SIGNED_OUT'||(evt==='SIGNED_IN'&&session?.user?.id!==FOUNDER)){revision++;showAuth('Aucune session fondatrice active pour ce compte. Reconnecte-toi.');}else if(evt==='SIGNED_IN'||evt==='TOKEN_REFRESHED')setTimeout(verify,0);});
 await verify();
}
function metrics(){const num=[...checks.values()].filter(x=>x==='ok').length;const total=universes.length;
 $('#metric-universes').textContent=total;
 $('#metric-verified').textContent=checks.size?num+' / '+checks.size:'—';
 $('#metric-focus').textContent=universes.filter(u=>stateOf(u)==='priority').length;
 $('#metric-tools').textContent=tools.length;
 $('#health-caption').textContent=lastCheck?'Dernier test HTTP : '+stamp(lastCheck):'Pas de test HTTP exécuté';
}
function cards(){
 const list=universes.filter(u=>(filter==='all'||(filter==='priority'&&stateOf(u)==='priority')||(filter==='active'&&stateOf(u)==='active')||(filter==='creation'&&['Création','Édition','Identité'].includes(u.type)))&&(!term||(u.name+' '+u.type+' '+u.desc).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))));
 $('#universe-grid').innerHTML=list.map(u=>{
 const state=checks.get(u.id)||'unknown';
 const text=state==='ok'?'Page joignable':state==='fail'?'Page non joignable':state==='checking'?'Vérification…':'Non vérifiée';
 return '<article class="universe"><div class="top"><span class="sign" aria-hidden="true">'+u.icon+'</span><span class="state" data-state="'+(state==='ok'?'ok':state==='fail'?'fail':'unknown')+'"><i class="dot '+(state==='ok'?'good':state==='fail'?'bad':'unknown')+'"></i>'+text+'</span></div><h3>'+esc(u.name)+'</h3><p>'+esc(u.desc)+'</p><div class="tools"><a href="'+u.url+'" aria-label="Ouvrir '+esc(u.name)+'">Ouvrir l’univers →</a>'+ (u.other?'<a href="'+u.other+'">'+esc(u.otherLabel)+' ↗</a>':'')+'<button type="button" class="flag" data-focus="'+u.id+'" aria-label="Changer le suivi de '+esc(u.name)+'" aria-pressed="'+(stateOf(u)==='priority')+'">'+pretty[stateOf(u)]+' ⟳</button></div></article>';
 }).join('')||'<div class="empty">Aucun univers pour ce filtre.</div>';
 $('#universe-count').textContent=list.length+' univers affichés · les états de suivi sont manuels et conservés sur cet appareil.';
 metrics();
}
function renderAudit(){
 const list=universes.map(u=>{const state=checks.get(u.id)||'unknown';
 const label=state==='ok'?'HTTP OK':state==='fail'?'Échec HTTP':state==='checking'?'En cours':'Non testé';
 return '<div class="audit-row"><div><strong>'+esc(u.name)+'</strong><small>'+esc(u.url)+'</small></div><span class="state" data-state="'+(state==='ok'?'ok':state==='fail'?'fail':'unknown')+'"><i class="dot '+(state==='ok'?'good':state==='fail'?'bad':state==='checking'?'warn':'unknown')+'"></i>'+label+'</span><a href="'+u.url+'">Ouvrir ↗</a></div>';
 }).join('');
 $('#audit-list').innerHTML=list;
 $('#last-http').textContent=lastCheck?'Test de présence de fichier : '+stamp(lastCheck):'Vérifie uniquement les fichiers publics de ce site';
 $('#check-btn').disabled=checking;
 $('#check-btn').textContent=checking?'Vérification…':'Vérifier les pages';
}
function renderQuick(){$('#quick-grid').innerHTML=tools.map(t=>'<a class="shortcut" href="'+t.url+'"><span class="symbol" aria-hidden="true">'+t.symbol+'</span><span><strong>'+esc(t.title)+'</strong><small>'+esc(t.detail)+'</small></span></a>').join('');}
function renderActivity(){if(!$('#activity-list'))return;$('#activity-list').innerHTML=events.length?events.map(x=>'<div class="activity-entry"><small>'+stamp(x.when)+'</small><strong>'+esc(x.text)+'</strong></div>').join(''):'<div class="empty">Aucune activité dans cette session.</div>';}
function renderExternal(){const el=$('#external-checks');if(!external){el.textContent='Aucun rapport automatisé chargé.';return;}const date=Date.parse(external.checked_at);const rows=(external.sites||[]).filter(x=>['ELOAH','The Crew','Power & Glam'].includes(x.name));el.innerHTML='<p class="timestamp">Dernier rapport publié : '+(Number.isFinite(date)?stamp(date):'date inconnue')+'. Ce contrôle est historique, pas en direct.</p>'+rows.map(x=>'<div class="audit-row"><div><strong>'+esc(x.name)+'</strong><small>Contrôle externe archivé</small></div><span class="state" data-state="'+(x.ok?'ok':'fail')+'"><i class="dot '+(x.ok?'good':'bad')+'"></i>'+(x.ok?'Accessible au dernier test':'Échec au dernier test')+'</span></div>').join('');}
function renderAll(){renderQuick();renderAudit();cards();renderActivity();renderExternal();metrics();}
async function verifyPublic(){if(!authorized||checking)return;checking=true;$('#check-btn').disabled=true;/* Les tests publics continuent si une revalidation sans changement de compte a lieu. */
 for(const u of universes)checks.set(u.id,'checking');
 renderAudit();cards();event('Contrôle de présence des pages publiques lancé.');
 // HEAD uniquement sur des chemins fixés par l’application, sans cookies ni jetons.
 const results=await Promise.all(universes.map(async u=>{
 try{const url=new URL(u.url,location.href);if(url.origin!==location.origin)throw Error('origine distante');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const r=await fetch(url.href,{method:'HEAD',credentials:'omit',cache:'no-store',redirect:'follow',signal:controller.signal});return [u.id,r.ok?'ok':'fail'];}finally{clearTimeout(timer);}
 }catch{return [u.id,'fail'];}
 }));
 if(!authorized){checking=false;return;}
 for(const [id,value] of results)checks.set(id,value);
 checking=false;lastCheck=Date.now();renderAudit();cards();event('Test terminé : '+results.filter(x=>x[1]==='ok').length+' pages joignables sur '+universes.length+'.');
}
async function readExternal(){try{
 // Fichier public produit par l’action GitHub existante. Aucun service tiers interrogé.
 const url=new URL('eloah-site-status.json',location.href);
 const r=await fetch(url.href,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout?AbortSignal.timeout(8000):undefined});
 if(!r.ok)return;const data=await r.json();
 if(!authorized||!data||!Array.isArray(data.sites)||data.sites.length>20)return;
 external={checked_at:data.checked_at,sites:data.sites.map(x=>({name:String(x.name||'').slice(0,50),ok:x.ok===true}))};renderExternal();
 }catch{$('#external-checks').textContent='Rapport externe indisponible.';}
}
function exportReport(){
 if(!authorized)return;
 const lines=[['Type','Univers','Adresse relative','État de la page publique','Suivi manuel','Date du test'],...universes.map(u=>['DÉMONSTRATION DE SUPERVISION',u.name,u.url,checks.get(u.id)||'non vérifié',pretty[stateOf(u)],lastCheck?new Date(lastCheck).toISOString():''])];
 const quote=s=>{const v=String(s??'');return '"'+( /^[\s]*[=+\-@\t\r]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"';};
 const str='\ufeff'+lines.map(row=>row.map(quote).join(';')).join('\r\n');
 const blob=new Blob([str],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='eloah-monitor-etat-pages-publiques.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);event('Rapport non confidentiel exporté.');
}
function setFilter(v){filter=v;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===v)));cards();}
function menu(open){mobile=open;$('#side').classList.toggle('open',open);$('#veil').hidden=!open;$('#menu').setAttribute('aria-expanded',String(open));}
document.addEventListener('click',e=>{
 const f=e.target.closest('[data-focus]');
 if(f){if(!authorized)return;const id=f.dataset.focus;if(!universes.some(u=>u.id===id))return;const order=['watch','active','priority'],old=stateOf({id});focus[id]=order[(order.indexOf(old)+1)%3];if(!save())event('Stockage indisponible, suivi conservé seulement pendant cette session.');cards();event('Suivi mis à jour : '+universes.find(u=>u.id===id).name+' · '+pretty[focus[id]]+'.');return;}
 const b=e.target.closest('[data-filter]');if(b){setFilter(b.dataset.filter);return;}
 if(mobile&&e.target.closest('.side a'))menu(false);
});
$('#search-univers').addEventListener('input',e=>{term=e.target.value.slice(0,90);cards();});
$('#check-btn').addEventListener('click',verifyPublic);
$('#export-btn').addEventListener('click',exportReport);
$('#retry-btn').addEventListener('click',verify);
$('#menu').addEventListener('click',()=>menu(!mobile));
$('#veil').addEventListener('click',()=>menu(false));
window.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false);});
window.addEventListener('focus',()=>{if(client)verify();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&client)verify();});
window.addEventListener('pageshow',()=>{if(client)verify();});
boot();
})();