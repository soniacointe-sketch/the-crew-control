/* ELOAH MONITOR 2.3 — centre d'action, recherche rapide et focus.
 * S'appuie sur les statuts déjà enregistrés dans Monitor, sans modifier
 * les comptes, les données privées ou la base Supabase.
 */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const app=$('#app'),focusEl=$('#ops-focus'),signalEl=$('#ops-signal'),countEl=$('#ops-count'),dialog=$('#monitor-command');
if(!app||!focusEl||!signalEl||!countEl||!dialog)return;
const KEY='eloah-monitor-focus-v2';
const noteUrl='eloah-partenaire.html?rubrique=Mon%20Espace&fiche=eloah-securite-supabase-a-reprendre-20261015';
const universes=[
 {id:'crew',name:'The Crew Orchies',url:'index.html',group:'Association'},
 {id:'power',name:'Power & Glam',url:'power-glam-control.html',group:'Édition'},
 {id:'os',name:'SONIA OS',url:'sonia-os.html',group:'Pilotage'},
 {id:'parisis',name:'PARISIS Engine',url:'eloah-parisis.html',group:'Recherche'},
 {id:'foi',name:'Foi & spiritualité',url:'foi-control.html',group:'Recherche'},
 {id:'velka',name:'Sonia Velka',url:'sonia-velka-control.html',group:'Identité'},
 {id:'lion',name:'Le Lion Blanc',url:'lion-blanc-control.html',group:'Association'},
 {id:'pg',name:'ELOAH P&G',url:'eloah-control.html',group:'Plateforme'},
 {id:'dark',name:'Dark Energy',url:'dark-energy-control.html',group:'Création'},
 {id:'eloah',name:'ELOAH Studio',url:'eloah-reel-studio.html',group:'Création'}
];
const entries=[
 ...universes.map(u=>({name:u.name,meta:'Univers · '+u.group,url:u.url})),
 {name:'Mon organisation',meta:'Planning & actions',url:'eloah-pilotage.html'},
 {name:'ELOAH Boards',meta:'Projets & cartes',url:'eloah-trello.html'},
 {name:'IA ELOAH 2040',meta:'Assistant et laboratoire',url:'eloah-2040.html'},
 {name:'Mes documents',meta:'Bibliothèque',url:'eloah-bibliotheque.html?type=fichiers'},
 {name:'ELOAH Music',meta:'Musique',url:'eloah-music.html'},
 {name:'Reel Studio',meta:'Création vidéo',url:'eloah-reel-studio.html'},
 {name:'Power & Glam Offres',meta:'Commercial',url:'eloah-offres.html'},
 {name:'Monitor Lab',meta:'Simulateur conservé',url:'eloah-monitor-lab.html'},
 {name:'Note sécurité Supabase',meta:'À reprendre plus tard',url:noteUrl},
 {name:'État des pages',meta:'Monitor · Contrôle HTTP',url:'#controle'},
 {name:'Sécurité & déploiement',meta:'Monitor · Tests GitHub',url:'#audit-securite'},
 {name:'Indicateurs réels',meta:'Monitor · Accès fondatrice',url:'#indicateurs-reels'}
];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const labels={priority:'Prioritaire',active:'En cours',watch:'À suivre'};
function readFocus(){
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return saved?.version===2&&saved.focus&&typeof saved.focus==='object'?saved.focus:{};}catch{return {};}
}
function statusOf(item,focus){const s=focus[item.id];return ['priority','active','watch'].includes(s)?s:'watch';}
function renderFocus(){
 if(app.hidden)return;
 const focus=readFocus();
 const priority=universes.filter(u=>statusOf(u,focus)==='priority');
 const inprogress=universes.filter(u=>statusOf(u,focus)==='active');
 const items=[...priority,...inprogress].slice(0,4);
 countEl.textContent=priority.length+' prioritaire'+(priority.length>1?'s':'')+' · '+inprogress.length+' en cours';
 if(!items.length){
  focusEl.innerHTML='<div class="monitor-ops-empty">Aucune priorité définie. Choisis un univers ci-dessous et utilise son bouton de suivi pour passer à « En cours », puis « Prioritaire ».</div>';
  return;
 }
 focusEl.innerHTML=items.map(u=>'<div class="monitor-ops-item"><div><strong class="monitor-ops-item-title">'+esc(u.name)+'</strong><small><span class="monitor-ops-status" data-type="'+statusOf(u,focus)+'">'+labels[statusOf(u,focus)]+'</span></small></div><a href="'+u.url+'" aria-label="Ouvrir '+esc(u.name)+'">Ouvrir ↗</a></div>').join('')+
 ((priority.length+inprogress.length)>4?'<div class="monitor-ops-small">Les 4 premiers univers suivis sont affichés. Consulte la liste complète ci-dessous.</div>':'');
}
function renderSignal(){
 if(app.hidden)return;
 const statuses=[...document.querySelectorAll('#audit-list .state[data-state]')];
 const failed=statuses.filter(x=>x.dataset.state==='fail').length;
 const checked=$('#last-http')?.textContent?.includes('Test de présence de fichier');
 let message,tone='neutral';
 if(!checked || statuses.length===0){message='Pages publiques non encore contrôlées. Lance une vérification HTTP pour obtenir un état.';}
 else if(failed){message=failed+' page'+(failed>1?'s':'')+' non joignable'+(failed>1?'s':'')+' au dernier contrôle HTTP. Vérifie les liens avant toute action.';tone='attention';}
 else if(statuses.some(x=>x.textContent?.includes('En cours'))){message='Test HTTP en cours. Les résultats ne sont pas encore complets.';}
 else{message='Aucun échec HTTP signalé au dernier contrôle. Cela ne garantit pas que les fonctions métiers marchent.';}
 signalEl.textContent=message;signalEl.dataset.tone=tone;
}
function render(){renderFocus();renderSignal();}
function openPalette(){
 if(app.hidden)return;
 const field=$('#monitor-command-input');
 field.value='';
 displayResults('');
 if(!dialog.open)dialog.showModal();
 field.focus();
}
function closePalette(){if(dialog.open)dialog.close();}
function displayResults(query){
 const list=$('#monitor-command-results');list.replaceChildren();
 const matches=entries.filter(e=>normalize(e.name+' '+e.meta).includes(normalize(query))).slice(0,17);
 for(const e of matches){
  const a=document.createElement('a');a.className='monitor-command-link';a.href=e.url;
  const span=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');
  strong.textContent=e.name;small.textContent=e.meta;span.append(strong,small);
  const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
  a.append(span,arrow);
  a.addEventListener('click',closePalette);
  list.append(a);
 }
 if(!matches.length){
  const p=document.createElement('p');p.className='monitor-ops-empty';
  p.textContent='Aucun outil trouvé. Essaie un univers, un projet ou un studio.';list.append(p);
 }
}
document.getElementById('ops-command-open')?.addEventListener('click',openPalette);
document.getElementById('monitor-command-close')?.addEventListener('click',closePalette);
document.getElementById('monitor-command-input')?.addEventListener('input',e=>displayResults(e.target.value.slice(0,90)));
document.getElementById('monitor-command-input')?.addEventListener('keydown',e=>{
 if(e.key==='Enter'){const first=$('#monitor-command-results a.monitor-command-link');if(first){e.preventDefault();first.click();}}
});
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.altKey){
  e.preventDefault();dialog.open?closePalette():openPalette();
 }
});
document.getElementById('ops-check')?.addEventListener('click',()=>{
 if(app.hidden)return;
 const b=$('#check-btn');if(b&&!b.disabled)b.click();
 document.getElementById('controle')?.scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('ops-refresh')?.addEventListener('click',()=>{
 if(app.hidden)return;
 const b=$('#real-refresh');if(b&&!b.disabled)b.click();
 document.getElementById('indicateurs-reels')?.scrollIntoView({behavior:'smooth',block:'start'});
});
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null)renderFocus();});
const cards=$('#universe-grid'),audit=$('#audit-list');
if(cards)new MutationObserver(renderFocus).observe(cards,{childList:true});
if(audit)new MutationObserver(renderSignal).observe(audit,{childList:true});
new MutationObserver(()=>{
 if(app.hidden){closePalette();focusEl.replaceChildren();signalEl.textContent='Session fondatrice requise.';countEl.textContent='—';}
 else render();
}).observe(app,{attributes:true,attributeFilter:['hidden']});
if(!app.hidden)render();
})();