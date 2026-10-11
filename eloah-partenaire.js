'use strict';
const help={"Mon Espace":"Tes fiches de préparation : priorités, briefs et prochaines actions. Ces propositions sont à personnaliser ; choisis tes échéances et mets à jour les statuts.","Tous":"Retrouve tes projets, documents et notes dans les rubriques à gauche.","ELOAH Studio":"Prépare tes briefs et conserve les liens de tes créations. Les générateurs IA ne sont pas connectés.","Coffre-fort":"Répertoire de références uniquement. Aucun coffre chiffré n’est connecté : ne saisis pas de mot de passe, clé API ou document confidentiel.","Mailing":"Prépare tes campagnes et leurs liens. Aucun envoi ni suivi de destinataires n’est connecté.","Documents":"Classe tes références et liens de documents. Aucun fichier n’est téléversé ici.","Mon abonnement":"Abonnement partenaire non connecté. Aucun forfait ni paiement ne peut être consulté ou modifié depuis cet espace.","Crédits IA":"Solde de crédits non connecté. Aucun crédit n’est affiché ou consommé ici.","Analytics":"Les compteurs ci-dessus portent uniquement sur tes saisies locales. Aucune statistique externe n’est connectée.","Mon profil":"Notes de profil locales uniquement. Elles ne modifient pas ton compte partenaire.","Entretiens":"Prépare les entretiens, leurs échéances et leurs comptes rendus.","Formations":"Organise tes formations et conserve les liens utiles.","Bases d’Expertise":"Classe tes références, méthodes et sources par sujet.","THE CREW ACADEMY":"Prépare les séances de danse, les parcours Kids, Ados et intergénérationnels.","Chroniques":"Prépare tes chroniques et suis leur avancement."};
const cfg=JSON.parse(document.getElementById('config').textContent),key='sonia-universe-v1-'+cfg.id;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageReadable=true;
let rows=[],view=new URLSearchParams(location.search).get('rubrique')||'Tous',editing=null;if(view!=='Tous'&&!cfg.modules.includes(view))view='Tous';
try{rows=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(rows))throw Error();rows=rows.map(r=>({...r,module:r.module==='ITRIIA Studio'?'ELOAH Studio':r.module}))}catch(e){storageReadable=false;$('#status').textContent='Lecture du stockage impossible. Restaure une sauvegarde.';rows=[]}
function save(next){try{localStorage.setItem(key,JSON.stringify(next));rows=next;$('#status').textContent='Enregistré sur ce navigateur.';render();return true}catch(e){$('#status').textContent='Enregistrement impossible : exporte tes données avant de fermer.';return false}}
function render(){
const active=rows.filter(r=>!r.archived),today=new Date().toLocaleDateString('en-CA');
$('#metrics').innerHTML=[['Éléments actifs',active.length],['Terminés',active.filter(r=>r.state==='Terminé').length],['Échéances dépassées',active.filter(r=>r.date&&r.date<today&&r.state!=='Terminé').length]].map(([l,n])=>'<div class="panel">'+l+'<strong>'+n+'</strong></div>').join('');
$('#tabs').innerHTML=['Tous',...cfg.modules,'Archives'].map((x,i)=>'<button class="'+(view===x?'active':'')+'" data-view="'+esc(x)+'" aria-current="'+(view===x?'page':'false')+'">'+icon(i)+'<span>'+esc(x==='Tous'?'Toutes mes notes':x==='ELOAH Studio'?'ELOAH Studio':x)+'</span></button>').join('');
const q=$('#search').value.toLocaleLowerCase();
const visible=rows.filter(r=>(view==='Archives'?r.archived:!r.archived)&&(view==='Tous'||view==='Archives'||r.module===view)&&[r.title,r.note,r.module].join(' ').toLocaleLowerCase().includes(q)).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
$('#list').innerHTML=visible.length?visible.map(r=>'<article class="row"><h3>'+esc(r.title)+'</h3><div class="meta">'+esc(r.module==='ELOAH Studio'?'ELOAH Studio':r.module)+' · '+esc(r.state)+(r.date?' · '+esc(r.date):'')+'</div>'+(r.note?'<p>'+esc(r.note)+'</p>':'')+(r.url?'<p><a target="_blank" rel="noopener noreferrer" href="'+esc(r.url)+'">Ouvrir la ressource ↗</a></p>':'')+'<div class="actions"><button data-edit="'+esc(r.id)+'">Modifier</button><button data-archive="'+esc(r.id)+'">'+(r.archived?'Restaurer':'Archiver')+'</button></div></article>').join(''):'<div class="empty">Aucun élément ici. Ajoute ton premier projet, ta tâche ou ta note.</div>';
$('#section').textContent=view==='Tous'?'Toutes mes notes':view==='ELOAH Studio'?'ELOAH Studio':view;$('#moduleHelp').textContent=help[view]||'Organise ici tes éléments, notes et prochaines étapes. Les saisies sont conservées sur ce navigateur.';
if(view==='THE CREW ACADEMY'){const a=document.createElement('a');a.href='eloah-academy.html';a.textContent='Ouvrir le studio THE CREW ACADEMY →';a.style.cssText='display:inline-block;margin:12px 0;padding:11px 16px;background:#28362f;color:#fff;border-radius:3px;text-decoration:none;font-weight:600';$('#moduleHelp').append(document.createElement('br'),a);}
if(view==='Bases d’Expertise'){const a=document.createElement('a');a.href='eloah-base.html';a.textContent='Ouvrir la base documentaire « the crew » →';a.style.cssText='display:inline-block;margin:12px 0;padding:11px 16px;background:#28362f;color:#fff;border-radius:3px;text-decoration:none;font-weight:600';$('#moduleHelp').append(document.createElement('br'),a);}
}
function open(id){editing=id||null;const r=rows.find(x=>x.id===id)||{};$('#form').reset();$('#module').innerHTML=cfg.modules.map(m=>'<option value="'+esc(m)+'">'+esc(m==='ELOAH Studio'?'ELOAH Studio':m)+'</option>').join('');for(const k of ['title','module','state','date','note','url'])if(r[k])$('#form').elements[k].value=r[k];if(!id&&cfg.modules.includes(view))$('#module').value=view;$('#editor').showModal();}
$('#new').onclick=()=>open();$('#cancel').onclick=()=>$('#editor').close();$('#search').oninput=render;
$('#tabs').onclick=e=>{const b=e.target.closest('[data-view]');if(b){view=b.dataset.view;render()}};
$('#list').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.edit)open(b.dataset.edit);if(b.dataset.archive)save(rows.map(r=>r.id===b.dataset.archive?{...r,archived:!r.archived}:r))};
$('#form').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.title=data.title.trim();if(!data.title)return;if(data.url&&!/^https?:\/\//i.test(data.url)){alert('Utilise un lien https:// ou http://.');return}const old=rows.find(r=>r.id===editing);const r={...old,...data,id:editing||crypto.randomUUID(),updated:new Date().toISOString()};const next=editing?rows.map(x=>x.id===editing?r:x):[...rows,r];if(save(next))$('#editor').close()};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'sonia-universe-v1',universe:cfg.id,records:rows},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=cfg.id+'-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('#restore').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const p=JSON.parse(await f.text());if(p.format!=='sonia-universe-v1'||p.universe!==cfg.id||!Array.isArray(p.records))throw Error('Sauvegarde incompatible avec cet univers.');const ids=new Set();const next=p.records.map(r=>{if(r&&r.module==='ITRIIA Studio')r={...r,module:'ELOAH Studio'};if(!r||typeof r.id!=='string'||ids.has(r.id)||typeof r.title!=='string'||!cfg.modules.includes(r.module)||!['À faire','En cours','À vérifier','Terminé'].includes(r.state)||r.url&&!/^https?:\/\//i.test(r.url))throw Error('Sauvegarde invalide.');ids.add(r.id);return {id:r.id,title:r.title,module:r.module,state:r.state,date:String(r.date||''),note:String(r.note||''),url:String(r.url||''),archived:!!r.archived}});if(confirm('Remplacer les données de cet univers par '+next.length+' éléments ?'))save(next)}catch(err){alert(err.message)}e.target.value=''};render();
function icon(i){const paths=['M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z','M20 21v-2a7 7 0 0 0-14 0v2 M12 3a4 4 0 1 0 0 8a4 4 0 0 0 0-8','M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z','M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4','M4 4h16v12H9l-5 4z','M3 5h18v14H3z M3 5l9 7 9-7','M6 2h8l4 4v16H6z M14 2v5h4 M9 12h6 M9 16h6','M3 5h18v14H3z M3 10h18','M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18 M9 9h6 M9 12h6 M9 15h6','M2 8l10-5 10 5-10 5z M6 10v7l6 3 6-3v-7','M4 3v18h17 M8 16v-5 M13 16V7 M18 16V4','M3 6h7l2 3h9v12H3z','M3 4h8l1 2 1-2h8v16h-8l-1 1-1-1H3z M12 6v15','M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5'];return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[i%paths.length]+'"/></svg>'}

// Install once per browser; keep existing notes, edits and archives.
(function prepareMySpace(){
if(!storageReadable||cfg.id!=='itriia'||!cfg.modules.includes('Mon Espace'))return;
const marker=key+'-mon-espace-seed-v1';
try{
if(localStorage.getItem(marker))return;
const seed=[
  {
    "id": "eloah-mon-espace-v1-01",
    "title": "01 · Ma priorité de la semaine",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : avancer sur un seul résultat concret avant de disperser les efforts.\nÀ préparer : le résultat attendu, les trois actions nécessaires et le temps disponible.\nProchaine étape : choisir la priorité parmi ELOAH, The Crew Orchies et les contenus à préparer. Fixer ensuite une échéance réaliste.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/mes-univers.html",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-02",
    "title": "02 · Mon point de départ dans ELOAH",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : retrouver rapidement mes projets, mes documents et mes bases d’expertise.\nProchaine étape : ouvrir chaque rubrique depuis l’accueil, repérer ce qui me manque et le noter dans la fiche « Retours et améliorations ».\nCritère de validation : je retrouve un projet et sa prochaine action sans chercher.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/mes-univers.html",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-03",
    "title": "03 · The Crew Orchies — cadrer le projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Brief : rassembler le contexte, les objectifs, les publics et les prochaines actions du projet.\nProchaine étape : compléter son identité dans Paramètres, puis inscrire une décision et une question ouverte dans sa mémoire.\nÀ préciser : priorité actuelle, responsables et date cible.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=The%20Crew%20Orchies&onglet=parametres",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-04",
    "title": "04 · Base d’expertise — vérifier les sources",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : disposer de références fiables pour préparer les réponses et les documents.\nProchaine étape : consulter la base The Crew, vérifier les sources déjà présentes et lister les documents à ajouter.\nÀ vérifier avant utilisation : exactitude, date et pertinence de chaque source.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-bibliotheque.html?type=bases",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-05",
    "title": "05 · Ma prochaine base d’expertise — préparer le brief",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Brief à compléter : nom de la base, sujet, utilité, public et documents sources.\nProchaine étape : choisir entre Base Libre, Base Thématique Spécialisée, Corpus Méthodologique Long, Corpus Scientifique et Base Conceptuelle Structurante.\nRésultat attendu : un périmètre clair et une première source prête à importer.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-bibliotheque.html?type=bases",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-06",
    "title": "06 · Mes documents — faire le tri",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : retrouver la bonne version de chaque document utile.\nProchaine étape : identifier les documents de référence, les brouillons et les doublons ; noter ceux à conserver avant toute suppression.\nConvention proposée : Projet — Sujet — AAAA-MM-JJ — Version.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-bibliotheque.html?type=fichiers",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-07",
    "title": "07 · Tableau de bord — vérifier mon parcours",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Parcours à essayer : ouvrir un projet, créer une conversation, ajouter une note, retrouver un fichier, consulter une base et modifier les paramètres.\nProchaine étape : effectuer ce parcours et relever chaque bouton ou écran qui pose problème.\nValidation : les informations saisies restent visibles après actualisation.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=The%20Crew%20Orchies",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-08",
    "title": "08 · Mémoire projet — poser les repères",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : conserver les décisions et les questions utiles au prochain échange.\nProchaine étape : écrire les trois décisions à retenir, les sujets ouverts et les informations à confirmer dans le projet concerné.\nÀ examiner : quelles conversations doivent rester hors mémoire ? Ne consolider qu’après relecture.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=The%20Crew%20Orchies&onglet=parametres",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-09",
    "title": "09 · Paramètres — valider mes besoins",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "À vérifier : identité du projet, échéance, tags, budget, préférences de consolidation et bases attachées.\nProchaine étape : distinguer les champs déjà utiles des fonctions qui nécessitent encore une connexion ou du développement.\nRésultat attendu : une liste courte des ajustements prioritaires.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=The%20Crew%20Orchies&onglet=parametres",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-10",
    "title": "10 · Atelier d’écriture — préparer mon premier document",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Brief à compléter : type de document, lecteur, objectif, longueur et ton.\nPlan de départ : contexte, message principal, parties à développer et conclusion attendue.\nProchaine étape : choisir un document réel à produire, puis préparer son plan avant la première version.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=The%20Crew%20Orchies&onglet=parametres",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-11",
    "title": "11 · Mes idées — garder une prochaine action",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Réserve d’idées : amélioration d’ELOAH, nouveau contenu, document à créer, service à explorer.\nPour chaque idée, noter : à qui elle sert, ce qu’elle apporte et la plus petite action pour la tester.\nProchaine étape : remplacer cette note par une première idée, puis créer une fiche séparée pour les suivantes.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-12",
    "title": "12 · Retours et améliorations — noter les blocages",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Modèle de retour : page concernée / action effectuée / résultat attendu / résultat obtenu / capture éventuelle.\nProchaine étape : relever le premier problème rencontré et préciser son impact.\nPriorité proposée : bloquant, gênant ou amélioration de confort. Aucun problème n’est considéré comme résolu sans vérification.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-13",
    "title": "13 · Mes sauvegardes — conserver une copie",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Objectif : garder une copie des notes et des projets importants.\nProchaine étape : utiliser Exporter sur cette page et conserver le fichier daté ; les notes restent propres à ce navigateur.\nPour les projets : vérifier séparément la sauvegarde privée dans Compte & sauvegardes. La sauvegarde d’un projet ne remplace pas l’export de ces notes.",
    "url": "https://soniacointe-sketch.github.io/the-crew-control/eloah-projet.html?projet=ELOAH&onglet=parametres&compte=1",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v1-14",
    "title": "14 · Mon bilan — préparer la suite",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "Questions de bilan : qu’ai-je terminé ? Qu’est-ce qui bloque ? Quelle décision faut-il prendre ?\nProchaine étape : mettre à jour les statuts, archiver les fiches terminées et choisir les trois prochaines actions.\nÀ planifier : un moment de revue adapté à mon rythme ; aucune échéance n’est imposée.",
    "url": "",
    "archived": false
  }
];
const ids=new Set(rows.map(r=>r.id));
const missing=seed.filter(r=>!ids.has(r.id));
if(missing.length&&!save([...rows,...missing]))return;
localStorage.setItem(marker,'installed');
if(missing.length)$('#status').textContent=missing.length+' fiches de préparation ajoutées à Mon Espace. Personnalise-les avec Modifier.';
}catch(e){$('#status').textContent='Les fiches de préparation n’ont pas pu être enregistrées sur ce navigateur.';}
})();
