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

// Extend the initial 14 preparation cards once, preserving user changes.
(function completeMySpace(){
if(!storageReadable||cfg.id!=='itriia'||!cfg.modules.includes('Mon Espace'))return;
const marker=key+'-mon-espace-seed-v2-100';
try{
if(localStorage.getItem(marker))return;
const seed=[
  {
    "id": "eloah-mon-espace-v2-15",
    "title": "15 · Accueil général",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Vérifier que le logo ELOAH et le bouton Accueil reviennent à Mes univers depuis chaque page.\nRÉSULTAT À VÉRIFIER : Un seul point de retour identifiable sur chaque écran.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-16",
    "title": "16 · Entrée Tableau de bord",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Comparer le clic Tableau de bord au parcours demandé : ouverture du projet, titre visible et onglets accessibles.\nRÉSULTAT À VÉRIFIER : Le bouton mène au bon espace et ne ressemble pas à une simple liste de notes.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-17",
    "title": "17 · Choix du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Ouvrir The Crew Orchies, passer à un autre projet puis revenir et comparer titres et contenus.\nRÉSULTAT À VÉRIFIER : Les conversations, fichiers et paramètres ne se mélangent pas.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-18",
    "title": "18 · Onglets du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Contrôler Chat Projet, Fichiers, Facturation, Bases d’expertise, Équipe, Meta Projets Memory, Analytics et Paramètres.\nRÉSULTAT À VÉRIFIER : Chaque onglet indique clairement son contenu réel ou son état non connecté.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-19",
    "title": "19 · Navigation mobile",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Parcourir l’accueil et un projet sur un écran étroit ; vérifier menus, titres et boutons.\nRÉSULTAT À VÉRIFIER : Aucun bouton indispensable hors écran et aucun texte coupé.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-20",
    "title": "20 · Retour au bon univers",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Depuis un projet ouvert par un univers, essayer Retour et Changer d’univers.\nRÉSULTAT À VÉRIFIER : Le retour conserve un chemin compréhensible vers l’univers d’origine.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-21",
    "title": "21 · Reprendre mon travail",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Choisir un projet déjà utilisé et vérifier son accès depuis la zone de reprise.\nRÉSULTAT À VÉRIFIER : Le raccourci ouvre le projet attendu sans recréer un doublon.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-22",
    "title": "22 · Libellés ELOAH",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Relire les titres, boutons et descriptions visibles pour repérer les anciens noms ITRIIA.\nRÉSULTAT À VÉRIFIER : La marque affichée est cohérente sans casser les anciennes données.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-23",
    "title": "23 · Écrans vides",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Examiner un projet sans conversation, fichier ou base ; relever les messages et boutons proposés.\nRÉSULTAT À VÉRIFIER : Chaque écran vide explique la première action possible.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-24",
    "title": "24 · Liens utiles des notes",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Navigation & tableau de bord\nACTION PRÉCISE : Ouvrir les ressources des fiches et vérifier leur destination avec le titre de la fiche.\nRÉSULTAT À VÉRIFIER : Chaque lien mène au bon écran, les liens inutiles sont retirés.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-25",
    "title": "25 · Première conversation",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Préparer une conversation « Programme et prochaines étapes » dans The Crew Orchies.\nRÉSULTAT À VÉRIFIER : Le contexte, le résultat attendu et les questions ouvertes sont explicites.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-26",
    "title": "26 · Noms des conversations",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Définir des titres comme « Inscriptions — suivi », « Atelier — préparation » et « Site — corrections ».\nRÉSULTAT À VÉRIFIER : Chaque titre permet de retrouver son sujet sans ouvrir tous les échanges.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-27",
    "title": "27 · Message de cadrage",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Rédiger un message avec projet, mission, informations disponibles, contraintes et livrable attendu.\nRÉSULTAT À VÉRIFIER : Le message peut être réutilisé sans inventer de contexte.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-28",
    "title": "28 · Passage vers ChatGPT",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Tester la préparation du contexte et l’ouverture de ChatGPT depuis une conversation.\nRÉSULTAT À VÉRIFIER : Le texte transmis correspond au projet ; aucune réponse automatique n’est annoncée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-29",
    "title": "29 · Retour de réponse",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Définir comment reprendre une réponse obtenue dans ChatGPT et la conserver dans le projet.\nRÉSULTAT À VÉRIFIER : La réponse reste attribuée et datée, sans être présentée comme un échange synchronisé.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-30",
    "title": "30 · Décisions prises",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Créer une structure de décision : question, choix de Sonia, motif, conséquence et prochaine action.\nRÉSULTAT À VÉRIFIER : Une décision proposée se distingue d’une décision réellement validée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-31",
    "title": "31 · Questions ouvertes",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Lister les questions qui empêchent une action et préciser qui peut répondre à chacune.\nRÉSULTAT À VÉRIFIER : Chaque question contient l’information manquante et l’action débloquée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-32",
    "title": "32 · Thèmes de mémoire",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Proposer les thèmes organisation, contenu, développement, documents et événements.\nRÉSULTAT À VÉRIFIER : Les thèmes rassemblent des échanges utiles sans compter de faux éléments.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-33",
    "title": "33 · Exclusion par cadenas",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Sur une conversation de test, vérifier le passage hors mémoire puis sa réactivation.\nRÉSULTAT À VÉRIFIER : La conversation reste accessible mais son contenu est exclu du contexte préparé.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-34",
    "title": "34 · Consolidation manuelle",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Chat & mémoire\nACTION PRÉCISE : Choisir un échange de test et préparer une synthèse avec faits, décisions, questions et actions.\nRÉSULTAT À VÉRIFIER : La consolidation demande une action explicite et ne transforme pas une hypothèse en fait.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-35",
    "title": "35 · État sans base",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Comparer l’écran vide à ton texte « Aucune base d’expertise » et au bouton de construction.\nRÉSULTAT À VÉRIFIER : Le texte explique l’utilité de la base et le bouton ouvre le formulaire.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-36",
    "title": "36 · Fenêtre de construction",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Comparer le formulaire aux captures : titre, introduction, types de contenu et champs.\nRÉSULTAT À VÉRIFIER : La fenêtre est lisible, défilable et refermable sur ordinateur comme sur mobile.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-37",
    "title": "37 · Base Libre",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Préparer une courte note de référence pour essayer le type Base Libre.\nRÉSULTAT À VÉRIFIER : Le type choisi et la source importée sont identifiables dans la base.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-38",
    "title": "38 · Base Thématique Spécialisée",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Préparer trois textes courts sur un seul sujet et préciser leur point commun.\nRÉSULTAT À VÉRIFIER : Les sources restent distinctes dans une base au périmètre clair.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-39",
    "title": "39 · Corpus Méthodologique Long",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Préparer le plan d’un manuel avec chapitres et sections avant tout import.\nRÉSULTAT À VÉRIFIER : La structure attendue est documentée ; les capacités réellement disponibles sont vérifiées.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-40",
    "title": "40 · Corpus Scientifique",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Définir les champs à conserver : titre, auteurs, date, références et identifiant DOI si présent.\nRÉSULTAT À VÉRIFIER : Les références proviennent des documents et aucun DOI n’est inventé.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-41",
    "title": "41 · Base Conceptuelle Structurante",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Choisir un cadre conceptuel et lister définitions, principes, limites et sources.\nRÉSULTAT À VÉRIFIER : Les interprétations personnelles sont séparées des affirmations sourcées.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-42",
    "title": "42 · Nom et slug",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Choisir un nom lisible puis vérifier le slug automatique et les collisions de noms.\nRÉSULTAT À VÉRIFIER : Deux bases distinctes ne se remplacent pas à cause d’un nom similaire.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-43",
    "title": "43 · Description et catégorie",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Décrire ce que la base couvre, ce qu’elle ne couvre pas et ses usages attendus.\nRÉSULTAT À VÉRIFIER : La description permet de décider rapidement s’il faut l’attacher à un projet.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-44",
    "title": "44 · Modèle de synthèse",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Examiner les choix réellement proposés et documenter leur effet sur le résultat.\nRÉSULTAT À VÉRIFIER : Une option sans moteur connecté n’est pas présentée comme une analyse exécutée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-45",
    "title": "45 · Première source importée",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Importer un petit document de test dans un format accepté et contrôler titre et texte.\nRÉSULTAT À VÉRIFIER : Le texte est lisible et rattaché à la bonne base.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-46",
    "title": "46 · Découpage des sources",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Comparer les extraits générés au document de départ, notamment titres et paragraphes.\nRÉSULTAT À VÉRIFIER : Les extraits ne perdent pas le sens ni leur référence de source.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-47",
    "title": "47 · Recherche dans une base",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Chercher une expression présente puis une expression absente et comparer les résultats.\nRÉSULTAT À VÉRIFIER : Le moteur retourne des extraits pertinents et sait indiquer une absence de résultat.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-48",
    "title": "48 · Attachement au projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Attacher une base de test, vérifier son mode d’utilisation puis préparer un contexte.\nRÉSULTAT À VÉRIFIER : La base apparaît dans le bon projet et les extraits injectés sont identifiables.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-49",
    "title": "49 · Mise à jour documentaire",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Bases d’expertise\nACTION PRÉCISE : Choisir une source modifiée et définir comment conserver date, version et provenance.\nRÉSULTAT À VÉRIFIER : Le lecteur peut distinguer la référence actuelle d’une ancienne version.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-50",
    "title": "50 · Identité Projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Compléter nom, description et type pour The Crew Orchies à partir des informations validées.\nRÉSULTAT À VÉRIFIER : L’identité est sauvegardée et réapparaît après actualisation.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-51",
    "title": "51 · Échéance du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Choisir une date seulement si elle correspond à une décision réelle ; vérifier sa présentation française.\nRÉSULTAT À VÉRIFIER : Une date vide reste possible et aucune échéance arbitraire n’est ajoutée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-52",
    "title": "52 · Tags du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Préparer quelques tags utiles, puis essayer une saisie séparée par des virgules.\nRÉSULTAT À VÉRIFIER : Les tags sont lisibles, sans doublons et utiles pour retrouver le projet.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-53",
    "title": "53 · Compteurs de mémoire",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Comparer conversations, thèmes, décisions et profondeur mémoire aux données présentes.\nRÉSULTAT À VÉRIFIER : Les chiffres proviennent des données réelles, pas des valeurs de la capture.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-54",
    "title": "54 · Résumé complet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Ouvrir le résumé et comparer ses décisions et questions à celles enregistrées.\nRÉSULTAT À VÉRIFIER : Le résumé correspond au projet affiché et signale les informations manquantes.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-55",
    "title": "55 · Sessions hors mémoire",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Vérifier la liste après exclusion d’une conversation puis après sa réactivation.\nRÉSULTAT À VÉRIFIER : La liste reflète l’état réel du cadenas.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-56",
    "title": "56 · Stockage et quota",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Comparer nombre de fichiers et volume avec les fichiers réellement enregistrés.\nRÉSULTAT À VÉRIFIER : Le quota affiché indique sa portée et ne promet pas un stockage distant inexistant.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-57",
    "title": "57 · Équipe Projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Définir les rôles nécessaires et vérifier les fonctions réellement disponibles pour les membres.\nRÉSULTAT À VÉRIFIER : Sonia reste identifiable comme créatrice ; aucune invitation fictive n’est affichée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-58",
    "title": "58 · Budget maximum",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Préparer un budget de travail et vérifier la différence entre prévision locale et limite réellement appliquée.\nRÉSULTAT À VÉRIFIER : La page ne prétend pas bloquer des coûts externes si aucun contrôle n’est connecté.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-59",
    "title": "59 · Seuil et période budgétaires",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Essayer un seuil d’alerte et une période mensuelle ; vérifier leur sauvegarde.\nRÉSULTAT À VÉRIFIER : Les préférences persistent et le fonctionnement des alertes est décrit honnêtement.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-60",
    "title": "60 · Préférences de consolidation",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Vérifier les champs messages, inactivité et coût ainsi que le bouton Enregistrer.\nRÉSULTAT À VÉRIFIER : Les seuils sont conservés sans déclencher une consolidation automatique.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-61",
    "title": "61 · Historique des consolidations",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Examiner les informations conservées pour une consolidation : origine, synthèse et date.\nRÉSULTAT À VÉRIFIER : Les messages d’origine restent récupérables selon le fonctionnement effectivement implémenté.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-62",
    "title": "62 · Bases attachées dans Paramètres",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Comparer la liste des bases attachées à celle de l’onglet Bases d’expertise.\nRÉSULTAT À VÉRIFIER : Les deux écrans montrent les mêmes rattachements et modes.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-63",
    "title": "63 · Archivage du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Définir puis vérifier sur un projet de test comment archiver et retrouver un projet.\nRÉSULTAT À VÉRIFIER : L’archive est réversible et son contenu reste disponible.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-64",
    "title": "64 · Suppression du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Paramètres du projet\nACTION PRÉCISE : Préparer un scénario de vérification sans supprimer de données réelles : saisie du nom et périmètre annoncé.\nRÉSULTAT À VÉRIFIER : La confirmation précise ce qui serait supprimé localement ou à distance.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-65",
    "title": "65 · Import de fichiers",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Essayer un petit document non sensible et vérifier son nom, sa taille et son projet.\nRÉSULTAT À VÉRIFIER : Le fichier reste accessible après actualisation.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-66",
    "title": "66 · Téléchargement de contrôle",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Télécharger un fichier de test déjà ajouté et comparer son contenu à l’original.\nRÉSULTAT À VÉRIFIER : Le téléchargement restitue le bon fichier sans corruption.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-67",
    "title": "67 · Recherche de documents",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Chercher un fichier par son nom puis filtrer par projet dans la bibliothèque.\nRÉSULTAT À VÉRIFIER : Le résultat permet d’identifier son projet avant ouverture.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-68",
    "title": "68 · Classement par projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Définir les dossiers ou catégories nécessaires avant de déplacer des documents.\nRÉSULTAT À VÉRIFIER : Chaque document possède une destination claire sans duplication inutile.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-69",
    "title": "69 · Organisation IA proposée",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Rédiger les règles souhaitées de classement : types de fichiers, noms et exceptions.\nRÉSULTAT À VÉRIFIER : Le plan est relu avant toute application et ne prétend pas qu’une IA a déjà classé les fichiers.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-70",
    "title": "70 · Journal et annulation",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Décrire les informations nécessaires au journal d’organisation et au retour à l’emplacement initial.\nRÉSULTAT À VÉRIFIER : La possibilité d’annuler pendant 72 h est vérifiée avant d’être annoncée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-71",
    "title": "71 · Plan d’un document",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Préparer un plan de rapport avec contexte, objectifs, actions, résultats et annexes.\nRÉSULTAT À VÉRIFIER : Chaque chapitre a une fonction et les sources nécessaires sont listées.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-72",
    "title": "72 · Versions de chapitre",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Créer deux versions de test d’un paragraphe et vérifier leur conservation.\nRÉSULTAT À VÉRIFIER : La version retenue est identifiable et l’ancienne reste consultable.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-73",
    "title": "73 · Comparaison de versions",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Comparer deux versions en distinguant corrections, ajouts et changements de sens.\nRÉSULTAT À VÉRIFIER : Les différences sont lisibles avant validation d’une nouvelle version.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-74",
    "title": "74 · Brief de révision IA",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Documents & écriture\nACTION PRÉCISE : Préparer une consigne de révision indiquant lecteur, ton, longueur et éléments intouchables.\nRÉSULTAT À VÉRIFIER : Le texte révisé conserve les faits et les changements sont soumis à relecture.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-75",
    "title": "75 · Export de Mon Espace",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Exporter les notes puis contrôler que titres, statuts, dates, liens et archives sont inclus.\nRÉSULTAT À VÉRIFIER : Le fichier contient les données nécessaires à une restauration.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-76",
    "title": "76 · Restauration isolée",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Préparer un test de restauration dans un profil de test avec une copie de sauvegarde.\nRÉSULTAT À VÉRIFIER : Le remplacement est annoncé et aucune donnée de travail n’est écrasée pour le test.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-77",
    "title": "77 · Persistance des notes",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Modifier une fiche de test, actualiser la page puis la retrouver par recherche.\nRÉSULTAT À VÉRIFIER : La modification est conservée sans ajout de doublon.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-78",
    "title": "78 · Archives des notes",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Archiver une fiche de test, la retrouver dans Archives puis la restaurer.\nRÉSULTAT À VÉRIFIER : Le titre, la note et le statut restent identiques après restauration.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-79",
    "title": "79 · Sauvegarde privée de projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Préparer une première sauvegarde après connexion personnelle, puis vérifier sa présence et son horodatage.\nRÉSULTAT À VÉRIFIER : Le succès est confirmé par une version réellement disponible.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-80",
    "title": "80 · Périmètre des sauvegardes",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Lister séparément notes, conversations, fichiers et bases, avec leur méthode de sauvegarde.\nRÉSULTAT À VÉRIFIER : Aucune rubrique n’est supposée protégée par une sauvegarde qui ne la contient pas.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-81",
    "title": "81 · Erreurs de stockage",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Prévoir le message et la marche à suivre quand le navigateur refuse un enregistrement.\nRÉSULTAT À VÉRIFIER : L’utilisateur sait que la saisie n’est pas sauvegardée et peut exporter ce qui reste accessible.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-82",
    "title": "82 · Liens et erreurs de navigation",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Recenser les liens cassés rencontrés avec page de départ, cible et résultat attendu.\nRÉSULTAT À VÉRIFIER : Chaque anomalie possède une reproduction claire et une correction à vérifier.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-83",
    "title": "83 · Accessibilité des formulaires",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Parcourir les champs au clavier et vérifier intitulés, focus et fermeture des fenêtres.\nRÉSULTAT À VÉRIFIER : Les actions essentielles sont utilisables sans souris.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-84",
    "title": "84 · Recette avant mise en service",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Sauvegarde & validation\nACTION PRÉCISE : Regrouper les contrôles indispensables : navigation, saisie, persistance, recherche, export et restauration.\nRÉSULTAT À VÉRIFIER : Chaque contrôle porte une preuve ou la mention non testé.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-85",
    "title": "85 · The Crew — programme du projet",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer une demande ChatGPT sur le programme de The Crew, ses objectifs et ses trois prochaines étapes.\nRÉSULTAT À VÉRIFIER : Le programme distingue informations vérifiées, questions et actions proposées.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-86",
    "title": "86 · The Crew — préparation des séances",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer un brief de séance avec groupe, durée, objectif, matériel et progression.\nRÉSULTAT À VÉRIFIER : Le brief peut être relu dans THE CREW ACADEMY avant utilisation.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-87",
    "title": "87 · The Crew — préparation d’un atelier",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Rassembler titre, public, déroulé, lieu, tarif et lien d’inscription à confirmer.\nRÉSULTAT À VÉRIFIER : La fiche événement ne publie aucune date ou disponibilité non vérifiée.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-88",
    "title": "88 · The Crew — journal en ligne",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer la vérification de la une, des neuf articles et des sept images déjà demandés.\nRÉSULTAT À VÉRIFIER : Les articles s’ouvrent et les visuels restent associés au bon contenu.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-89",
    "title": "89 · Power & Glam — calendrier de travail",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer le lien entre un sujet, son univers, sa date envisagée et ses déclinaisons.\nRÉSULTAT À VÉRIFIER : Chaque entrée indique le livrable à produire et son état réel.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-90",
    "title": "90 · Power & Glam — brief de contenu",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Structurer un brief avec sujet, Amour/Beauté/Argent/Vie/Désir, audience, format et intention.\nRÉSULTAT À VÉRIFIER : Le brief est assez précis pour créer un contenu sans réinventer la demande.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-91",
    "title": "91 · Power & Glam — prompts de production",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Définir les champs d’un prompt réutilisable : mission, contexte, contraintes, sources et sortie attendue.\nRÉSULTAT À VÉRIFIER : Le prompt reprend les informations de la fiche concernée sans ajouter de faits.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-92",
    "title": "92 · SONIA OS — fiche de mission",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer une mission avec agent demandé, objectif, périmètre, autorité et preuve attendue.\nRÉSULTAT À VÉRIFIER : La fiche distingue une consigne de travail d’une intégration technique réelle.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-93",
    "title": "93 · SONIA OS — ROUTER",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Rassembler les preuves à chercher sur l’orientation des missions et les destinations possibles.\nRÉSULTAT À VÉRIFIER : Une liaison est marquée vérifiée seulement avec une observation reproductible.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-94",
    "title": "94 · SONIA OS — LE SIÈGE",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Préparer le dossier de délibération : question, options, critères, objections et décision réservée à Sonia.\nRÉSULTAT À VÉRIFIER : Les analyses simulées restent distinctes des réponses réelles des outils.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-95",
    "title": "95 · Meta Projets Memory — liens utiles",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Connexions et pilotage\nACTION PRÉCISE : Identifier les projets qui doivent partager des références et préciser la raison de chaque lien.\nRÉSULTAT À VÉRIFIER : La liste distingue un lien souhaité d’un rattachement techniquement disponible.\nREPÈRE : proposition issue de nos échanges ; disponibilité technique à vérifier.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-96",
    "title": "96 · Meta Projets Memory — insights",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Connexions et pilotage\nACTION PRÉCISE : Définir un insight avec projets sources, observation, utilité et proposition d’action.\nRÉSULTAT À VÉRIFIER : Chaque rapprochement est traçable et ne mélange pas des données sans rapport.\nREPÈRE : proposition issue de nos échanges ; disponibilité technique à vérifier.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-97",
    "title": "97 · Facturation — périmètre réel",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Connexions et pilotage\nACTION PRÉCISE : Lister les informations souhaitées : dépenses, fournisseur, période et justificatif ; vérifier les données accessibles.\nRÉSULTAT À VÉRIFIER : Aucun montant fictif ni paiement non connecté ne figure comme transaction réelle.\nREPÈRE : proposition issue de nos échanges ; disponibilité technique à vérifier.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-98",
    "title": "98 · Analytics — indicateurs utiles",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Connexions et pilotage\nACTION PRÉCISE : Choisir trois indicateurs locaux utiles, par exemple actions terminées, questions ouvertes et fichiers par projet.\nRÉSULTAT À VÉRIFIER : Chaque indicateur indique sa source et sa période, sans confusion avec les statistiques des sites.\nREPÈRE : proposition issue de nos échanges ; disponibilité technique à vérifier.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-99",
    "title": "99 · Transmission vers ChatGPT — contexte maîtrisé",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Connexions et pilotage\nACTION PRÉCISE : Relire le texte préparé avant ouverture : projet, fiche sélectionnée, mission et résultat attendu.\nRÉSULTAT À VÉRIFIER : Seules les informations utiles sont transmises ; le retour dans ELOAH reste expliqué.\nREPÈRE : proposition issue de nos échanges ; disponibilité technique à vérifier.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-mon-espace-v2-100",
    "title": "100 · ELOAH — revue des 100 fiches",
    "module": "Mon Espace",
    "state": "À faire",
    "date": "",
    "note": "CHANTIER : Univers & missions\nACTION PRÉCISE : Rechercher les doublons, choisir dix priorités et préciser la prochaine action de chacune.\nRÉSULTAT À VÉRIFIER : Un ordre de travail court se dégage ; les autres fiches restent disponibles sans fausse échéance.\nREPÈRE : fiche de travail proposée à partir de nos échanges ; réalisation et validation à confirmer.",
    "url": "",
    "archived": false
  }
];
const ids=new Set(rows.map(r=>r.id));
const missing=seed.filter(r=>!ids.has(r.id));
if(missing.length&&!save([...rows,...missing]))return;
localStorage.setItem(marker,'installed');
if(missing.length)$('#status').textContent=missing.length+' nouvelles fiches ajoutées : la collection Mon Espace comprend désormais 100 propositions modifiables.';
}catch(e){$('#status').textContent='Ajout des nouvelles fiches impossible : vérifie le stockage de ce navigateur.';}
})();

// Seed Studio briefs once without replacing personal records.
(function prepareStudio(){
if(!storageReadable||cfg.id!=='itriia'||!cfg.modules.includes('ELOAH Studio'))return;
const marker=key+'-studio-seed-v1';
try{
if(localStorage.getItem(marker))return;
const seed=[
  {
    "id": "eloah-studio-v1-01",
    "title": "01 · Accueil ELOAH — maquette principale",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette d’accueil ordinateur et mobile.\n\nBRIEF DE CRÉATION\nHiérarchiser Mes univers, Reprendre mon travail, projets récents et prochaines actions. Utiliser une base crème, des textes foncés et des boutons clairement identifiables.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Accueil ELOAH — maquette principale. Produis maintenant : Une maquette d’accueil ordinateur et mobile. Consignes : Hiérarchiser Mes univers, Reprendre mon travail, projets récents et prochaines actions. Utiliser une base crème, des textes foncés et des boutons clairement identifiables. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe premier écran permet de choisir un projet et de reprendre une action.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-02",
    "title": "02 · Tableau de bord projet — écran de référence",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette détaillée du tableau de bord The Crew Orchies.\n\nBRIEF DE CRÉATION\nReprendre la structure demandée : titre du projet, onglets, conversations au centre et panneau de fichiers à droite. Adapter la présentation à ELOAH.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Tableau de bord projet — écran de référence. Produis maintenant : Une maquette détaillée du tableau de bord The Crew Orchies. Consignes : Reprendre la structure demandée : titre du projet, onglets, conversations au centre et panneau de fichiers à droite. Adapter la présentation à ELOAH. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nChaque zone a une fonction explicite ; les données fictives sont signalées comme exemples.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-03",
    "title": "03 · Chat projet — état initial",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nLe texte d’accueil et trois suggestions de première conversation.\n\nBRIEF DE CRÉATION\nProposer Programme et prochaines étapes, État du projet et Préparer un document. Expliquer le passage vers ChatGPT lorsqu’il est nécessaire.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Chat projet — état initial. Produis maintenant : Le texte d’accueil et trois suggestions de première conversation. Consignes : Proposer Programme et prochaines étapes, État du projet et Préparer un document. Expliquer le passage vers ChatGPT lorsqu’il est nécessaire. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes suggestions contiennent une mission exploitable et ne simulent pas une réponse IA.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-04",
    "title": "04 · Conversations — panneau de navigation",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de liste de conversations et ses libellés.\n\nBRIEF DE CRÉATION\nPrévoir titre, dernière activité, création, recherche et indication hors mémoire. Différencier la conversation sélectionnée.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Conversations — panneau de navigation. Produis maintenant : Une maquette de liste de conversations et ses libellés. Consignes : Prévoir titre, dernière activité, création, recherche et indication hors mémoire. Différencier la conversation sélectionnée. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nUn titre long reste lisible et le changement de conversation est compréhensible.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-05",
    "title": "05 · Fichiers projet — panneau latéral",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette avec liste de fichiers et zone de dépôt.\n\nBRIEF DE CRÉATION\nPrévoir nom, format, taille, recherche et actions disponibles. Montrer aussi les états vide, chargement et échec.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Fichiers projet — panneau latéral. Produis maintenant : Une maquette avec liste de fichiers et zone de dépôt. Consignes : Prévoir nom, format, taille, recherche et actions disponibles. Montrer aussi les états vide, chargement et échec. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes boutons décrivent des actions réelles et les erreurs indiquent quoi faire.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-06",
    "title": "06 · Bases d’expertise — écran vide",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne composition avec titre, texte explicatif et bouton principal.\n\nBRIEF DE CRÉATION\nUtiliser « Aucune base d’expertise » et « Construire ma première base ». Expliquer les sources, leur organisation et leur utilisation dans les projets.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Bases d’expertise — écran vide. Produis maintenant : Une composition avec titre, texte explicatif et bouton principal. Consignes : Utiliser « Aucune base d’expertise » et « Construire ma première base ». Expliquer les sources, leur organisation et leur utilisation dans les projets. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLa promesse de traitement correspond aux capacités réellement disponibles.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-07",
    "title": "07 · Construction d’une base — fenêtre complète",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette du formulaire en deux vues : haut et bas.\n\nBRIEF DE CRÉATION\nPrévoir introduction, cinq types, nom, slug, description, catégorie et synthèse. Afficher compteurs et budgets uniquement lorsque les données existent.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Construction d’une base — fenêtre complète. Produis maintenant : Une maquette du formulaire en deux vues : haut et bas. Consignes : Prévoir introduction, cinq types, nom, slug, description, catégorie et synthèse. Afficher compteurs et budgets uniquement lorsque les données existent. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe formulaire reste utilisable sur petit écran sans masquer le bouton final.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-08",
    "title": "08 · Types de bases — cinq cartes",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nLes textes courts et la disposition de cinq cartes de choix.\n\nBRIEF DE CRÉATION\nPrésenter Base Libre, Thématique Spécialisée, Méthodologique Long, Scientifique et Conceptuelle Structurante. Pour chaque type : usage, exemple et limite.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Types de bases — cinq cartes. Produis maintenant : Les textes courts et la disposition de cinq cartes de choix. Consignes : Présenter Base Libre, Thématique Spécialisée, Méthodologique Long, Scientifique et Conceptuelle Structurante. Pour chaque type : usage, exemple et limite. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nUne personne sait quel type choisir sans vocabulaire technique inutile.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-09",
    "title": "09 · Base d’expertise — fiche détaillée",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de consultation d’une base.\n\nBRIEF DE CRÉATION\nOrganiser résumé, sources, extraits, recherche, projets attachés et date de mise à jour. Afficher la provenance au plus près des extraits.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Base d’expertise — fiche détaillée. Produis maintenant : Une maquette de consultation d’une base. Consignes : Organiser résumé, sources, extraits, recherche, projets attachés et date de mise à jour. Afficher la provenance au plus près des extraits. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes informations sourcées se distinguent des notes personnelles.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-10",
    "title": "10 · Sources documentaires — fiche source",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn modèle de fiche source réutilisable.\n\nBRIEF DE CRÉATION\nInclure titre, origine, auteur si connu, date, version, format, résumé descriptif et points à vérifier. Ne pas compléter les champs inconnus par invention.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Sources documentaires — fiche source. Produis maintenant : Un modèle de fiche source réutilisable. Consignes : Inclure titre, origine, auteur si connu, date, version, format, résumé descriptif et points à vérifier. Ne pas compléter les champs inconnus par invention. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLa source peut être retrouvée et sa fiabilité examinée.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-11",
    "title": "11 · Attacher une base — parcours guidé",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de sélection d’une base et de son mode d’utilisation.\n\nBRIEF DE CRÉATION\nPrésenter les modes réellement implémentés, expliquer leur effet et montrer un aperçu du contexte préparé.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Attacher une base — parcours guidé. Produis maintenant : Une maquette de sélection d’une base et de son mode d’utilisation. Consignes : Présenter les modes réellement implémentés, expliquer leur effet et montrer un aperçu du contexte préparé. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe choix est compréhensible et son enregistrement clairement confirmé.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-12",
    "title": "12 · Paramètres — identité du projet",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de formulaire et ses textes d’aide.\n\nBRIEF DE CRÉATION\nInclure nom, description, type, échéance facultative et tags séparés par des virgules. Prévoir confirmation de sauvegarde et erreurs de validation.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Paramètres — identité du projet. Produis maintenant : Une maquette de formulaire et ses textes d’aide. Consignes : Inclure nom, description, type, échéance facultative et tags séparés par des virgules. Prévoir confirmation de sauvegarde et erreurs de validation. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes champs requis sont identifiés et une échéance vide est autorisée.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-13",
    "title": "13 · Paramètres — mémoire persistante",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette du bloc mémoire et du résumé complet.\n\nBRIEF DE CRÉATION\nPrévoir conversations, thèmes, décisions, questions ouvertes et profondeur mémoire. Utiliser des emplacements vides tant que les chiffres ne sont pas calculés.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Paramètres — mémoire persistante. Produis maintenant : Une maquette du bloc mémoire et du résumé complet. Consignes : Prévoir conversations, thèmes, décisions, questions ouvertes et profondeur mémoire. Utiliser des emplacements vides tant que les chiffres ne sont pas calculés. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nAucun nombre de la capture de référence n’est présenté comme donnée réelle.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-14",
    "title": "14 · Paramètres — budget et coûts",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de budget prévisionnel et de suivi.\n\nBRIEF DE CRÉATION\nPrévoir budget maximal, devise, seuil, période et statut de connexion des dépenses. Distinguer configuration locale et limite réellement appliquée.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Paramètres — budget et coûts. Produis maintenant : Une maquette de budget prévisionnel et de suivi. Consignes : Prévoir budget maximal, devise, seuil, période et statut de connexion des dépenses. Distinguer configuration locale et limite réellement appliquée. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes montants d’exemple sont signalés et aucune dépense n’est inventée.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-15",
    "title": "15 · Paramètres — consolidation",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette avec historique, préférences et action manuelle.\n\nBRIEF DE CRÉATION\nExpliquer la synthèse d’une conversation, les seuils suggérés et la récupération des originaux. Vérifier toute durée annoncée.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Paramètres — consolidation. Produis maintenant : Une maquette avec historique, préférences et action manuelle. Consignes : Expliquer la synthèse d’une conversation, les seuils suggérés et la récupération des originaux. Vérifier toute durée annoncée. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe texte indique que Sonia conserve la décision de consolider.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-16",
    "title": "16 · Paramètres — archivage et suppression",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nLes textes et états des confirmations sensibles.\n\nBRIEF DE CRÉATION\nDistinguer archivage réversible et suppression. Décrire précisément le périmètre concerné et demander le nom du projet pour une suppression définitive.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Paramètres — archivage et suppression. Produis maintenant : Les textes et états des confirmations sensibles. Consignes : Distinguer archivage réversible et suppression. Décrire précisément le périmètre concerné et demander le nom du projet pour une suppression définitive. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLa maquette permet de comprendre les conséquences avant confirmation.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-17",
    "title": "17 · Atelier d’écriture — choix du document",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de démarrage et six fiches de format.\n\nBRIEF DE CRÉATION\nProposer livre, thèse, rapport, article, document technique et guide pratique. Demander lecteur, objectif, longueur souhaitée et sources disponibles.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Atelier d’écriture — choix du document. Produis maintenant : Une maquette de démarrage et six fiches de format. Consignes : Proposer livre, thèse, rapport, article, document technique et guide pratique. Demander lecteur, objectif, longueur souhaitée et sources disponibles. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nChaque format mène à un plan adapté sans lancer de production fictive.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-18",
    "title": "18 · Atelier d’écriture — éditeur de chapitre",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette avec plan, texte et historique des versions.\n\nBRIEF DE CRÉATION\nPrévoir navigation entre chapitres, titre, statut, version actuelle et consigne de révision. Garder l’espace de rédaction prioritaire.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Atelier d’écriture — éditeur de chapitre. Produis maintenant : Une maquette avec plan, texte et historique des versions. Consignes : Prévoir navigation entre chapitres, titre, statut, version actuelle et consigne de révision. Garder l’espace de rédaction prioritaire. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nL’utilisateur voit quel chapitre et quelle version il modifie.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-19",
    "title": "19 · Atelier d’écriture — comparer deux versions",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne maquette de comparaison et les libellés des actions.\n\nBRIEF DE CRÉATION\nDistinguer ajouts, retraits et modifications. Prévoir conserver la version actuelle, reprendre une ancienne version et relire avant validation.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Atelier d’écriture — comparer deux versions. Produis maintenant : Une maquette de comparaison et les libellés des actions. Consignes : Distinguer ajouts, retraits et modifications. Prévoir conserver la version actuelle, reprendre une ancienne version et relire avant validation. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes différences de sens restent visibles, sans dépendre uniquement des couleurs.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-20",
    "title": "20 · Notes & préparation — carte de brief",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn modèle de carte compact pour les briefs du Studio.\n\nBRIEF DE CRÉATION\nAfficher titre, type de livrable, prochaine action, statut et lien éventuel. Prévoir un accès au brief complet et aux consignes.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Notes & préparation — carte de brief. Produis maintenant : Un modèle de carte compact pour les briefs du Studio. Consignes : Afficher titre, type de livrable, prochaine action, statut et lien éventuel. Prévoir un accès au brief complet et aux consignes. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLa carte se parcourt rapidement sans perdre les informations détaillées.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-21",
    "title": "21 · Studio — fiche de création visuelle",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn brief visuel réutilisable à compléter.\n\nBRIEF DE CRÉATION\nPrévoir sujet, usage, format, dimensions, texte exact, palette, références autorisées et éléments à éviter. Séparer demande d’image et résultat livré.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — fiche de création visuelle. Produis maintenant : Un brief visuel réutilisable à compléter. Consignes : Prévoir sujet, usage, format, dimensions, texte exact, palette, références autorisées et éléments à éviter. Séparer demande d’image et résultat livré. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe brief permet de lancer une création sans supposer qu’un générateur est connecté.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-22",
    "title": "22 · Studio — bibliothèque de composants",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn inventaire visuel des composants réutilisables d’ELOAH.\n\nBRIEF DE CRÉATION\nDocumenter boutons, champs, cartes, onglets, badges, fenêtres, messages d’erreur et confirmations avec leurs états.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — bibliothèque de composants. Produis maintenant : Un inventaire visuel des composants réutilisables d’ELOAH. Consignes : Documenter boutons, champs, cartes, onglets, badges, fenêtres, messages d’erreur et confirmations avec leurs états. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nChaque composant a un usage clair et un comportement mobile prévu.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-23",
    "title": "23 · Studio — pictogrammes cohérents",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne planche de pictogrammes pour les rubriques ELOAH.\n\nBRIEF DE CRÉATION\nPrévoir accueil, projets, chat, fichiers, bases, équipe, budget, paramètres et sauvegardes. Utiliser un style simple et des libellés textuels.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — pictogrammes cohérents. Produis maintenant : Une planche de pictogrammes pour les rubriques ELOAH. Consignes : Prévoir accueil, projets, chat, fichiers, bases, équipe, budget, paramètres et sauvegardes. Utiliser un style simple et des libellés textuels. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes icônes restent lisibles à petite taille et ne remplacent pas seules les noms.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-24",
    "title": "24 · Studio — guide de rédaction des interfaces",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn guide court avec exemples de titres, boutons et messages.\n\nBRIEF DE CRÉATION\nÉcrire en français simple, avec une action par bouton. Préférer « Enregistrer » et « Ouvrir » aux formulations vagues. Décrire les états réels.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — guide de rédaction des interfaces. Produis maintenant : Un guide court avec exemples de titres, boutons et messages. Consignes : Écrire en français simple, avec une action par bouton. Préférer « Enregistrer » et « Ouvrir » aux formulations vagues. Décrire les états réels. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLes messages sont compréhensibles sans connaître le fonctionnement technique.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-25",
    "title": "25 · Studio — adaptation mobile",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne série de vues mobiles des écrans essentiels.\n\nBRIEF DE CRÉATION\nAdapter accueil, chat, base, paramètres et notes. Replier les panneaux secondaires et conserver les actions principales accessibles.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — adaptation mobile. Produis maintenant : Une série de vues mobiles des écrans essentiels. Consignes : Adapter accueil, chat, base, paramètres et notes. Replier les panneaux secondaires et conserver les actions principales accessibles. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nAucune action essentielle n’exige de défilement horizontal.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-26",
    "title": "26 · Studio — parcours au clavier",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn scénario de navigation accessible et ses corrections proposées.\n\nBRIEF DE CRÉATION\nDécrire ordre du focus, ouverture et fermeture des fenêtres, libellés de champs et retour du focus. Prévoir des contrastes lisibles.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — parcours au clavier. Produis maintenant : Un scénario de navigation accessible et ses corrections proposées. Consignes : Décrire ordre du focus, ouverture et fermeture des fenêtres, libellés de champs et retour du focus. Prévoir des contrastes lisibles. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe scénario peut être exécuté sans souris et ses résultats sont notés.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-27",
    "title": "27 · Studio — tutoriel de démarrage",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn tutoriel de cinq étapes avec textes courts.\n\nBRIEF DE CRÉATION\nGuider le choix d’un projet, la première note, l’ajout d’une source, la préparation d’un échange et l’export d’une sauvegarde.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — tutoriel de démarrage. Produis maintenant : Un tutoriel de cinq étapes avec textes courts. Consignes : Guider le choix d’un projet, la première note, l’ajout d’une source, la préparation d’un échange et l’export d’une sauvegarde. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nChaque étape indique où cliquer et ce que l’utilisateur doit observer.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-28",
    "title": "28 · Studio — dossier de recette",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUne grille de validation réutilisable avant livraison.\n\nBRIEF DE CRÉATION\nPrévoir écran, action testée, résultat attendu, résultat observé, preuve, anomalie et décision. Séparer tests effectués et tests à faire.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — dossier de recette. Produis maintenant : Une grille de validation réutilisable avant livraison. Consignes : Prévoir écran, action testée, résultat attendu, résultat observé, preuve, anomalie et décision. Séparer tests effectués et tests à faire. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nAucune fonctionnalité n’est déclarée validée sans observation.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-29",
    "title": "29 · Studio — présentation du service",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn texte de présentation d’ELOAH en une page.\n\nBRIEF DE CRÉATION\nExpliquer à quoi servent projets, notes, fichiers, mémoire et bases. Préciser ce qui fonctionne localement et ce qui nécessite une connexion externe.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — présentation du service. Produis maintenant : Un texte de présentation d’ELOAH en une page. Consignes : Expliquer à quoi servent projets, notes, fichiers, mémoire et bases. Préciser ce qui fonctionne localement et ce qui nécessite une connexion externe. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nLe texte décrit une utilité concrète sans promettre des automatisations inexistantes.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  },
  {
    "id": "eloah-studio-v1-30",
    "title": "30 · Studio — dossier de transmission",
    "module": "ELOAH Studio",
    "state": "À faire",
    "date": "",
    "note": "LIVRABLE ATTENDU\nUn modèle de dossier pour reprendre une création ou un développement.\n\nBRIEF DE CRÉATION\nInclure objectif, version, éléments livrés, décisions validées, liens, vérifications réalisées, limites et prochaine action.\n\nCONSIGNE À UTILISER DANS CHATGPT\n« Travaille sur ELOAH, l’espace de pilotage de Sonia. Sujet : Studio — dossier de transmission. Produis maintenant : Un modèle de dossier pour reprendre une création ou un développement. Consignes : Inclure objectif, version, éléments livrés, décisions validées, liens, vérifications réalisées, limites et prochaine action. Présente une proposition prête à relire. Signale les informations manquantes et distingue la conception proposée des fonctions réellement testées. »\n\nVALIDATION\nUne autre personne peut reprendre le travail sans deviner ce qui a été fait.\n\nPROCHAINE ÉTAPE\nUtiliser cette consigne pour produire une première version, puis conserver ici le lien du livrable et les corrections souhaitées.",
    "url": "",
    "archived": false
  }
];
const ids=new Set(rows.map(r=>r.id));
const missing=seed.filter(r=>!ids.has(r.id));
if(missing.length&&!save([...rows,...missing]))return;
localStorage.setItem(marker,'installed');
if(missing.length)$('#status').textContent=missing.length+' briefs de création ajoutés à ELOAH Studio. Chaque fiche contient ses consignes et le résultat attendu.';
}catch(e){$('#status').textContent='Les briefs du Studio n’ont pas pu être enregistrés sur ce navigateur.';}
})();

(function addUniverseStudioBriefs(){
if(!storageReadable||cfg.id!=='itriia'||!cfg.modules.includes('ELOAH Studio'))return;
const marker=key+'-studio-univers-v1';
try{if(localStorage.getItem(marker))return;
const seed=[{"id":"eloah-studio-univers-v1-1","title":"31 · The Crew Orchies — Affiche du cours d’essai","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : The Crew Orchies\n\nLIVRABLE À PRÉPARER\nAffiche du cours d’essai.\n\nBRIEF PRÉCIS\nConcevoir une affiche noir et or avec pompons, public intergénérationnel et appel à réserver ; laisser horaires et lien à confirmer.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Affiche du cours d’essai pour The Crew Orchies. Concevoir une affiche noir et or avec pompons, public intergénérationnel et appel à réserver ; laisser horaires et lien à confirmer. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-2","title":"32 · The Crew Orchies — Kit atelier danse","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : The Crew Orchies\n\nLIVRABLE À PRÉPARER\nKit atelier danse.\n\nBRIEF PRÉCIS\nPréparer affiche, texte court et trois stories : découverte, déroulé, inscription ; ne renseigner que les informations validées.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Kit atelier danse pour The Crew Orchies. Préparer affiche, texte court et trois stories : découverte, déroulé, inscription ; ne renseigner que les informations validées. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-3","title":"33 · The Crew Orchies — Une du Crew Magazine","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : The Crew Orchies\n\nLIVRABLE À PRÉPARER\nUne du Crew Magazine.\n\nBRIEF PRÉCIS\nComposer une une illustrée, trois accroches d’articles et une invitation à lire ; utiliser les articles et photos disponibles avec autorisation.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Une du Crew Magazine pour The Crew Orchies. Composer une une illustrée, trois accroches d’articles et une invitation à lire ; utiliser les articles et photos disponibles avec autorisation. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-4","title":"34 · The Crew Orchies — Fiche pédagogique de séance","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : The Crew Orchies\n\nLIVRABLE À PRÉPARER\nFiche pédagogique de séance.\n\nBRIEF PRÉCIS\nStructurer accueil, échauffement, apprentissage, jeu collectif et retour au calme, avec variantes selon le groupe.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche pédagogique de séance pour The Crew Orchies. Structurer accueil, échauffement, apprentissage, jeu collectif et retour au calme, avec variantes selon le groupe. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-5","title":"35 · Power & Glam — Carrousel Amour — poser une limite","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Power & Glam\n\nLIVRABLE À PRÉPARER\nCarrousel Amour — poser une limite.\n\nBRIEF PRÉCIS\nPréparer dix slides : scène vécue, difficulté, distinction expliquer/se justifier, trois formulations et choix personnel.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carrousel Amour — poser une limite pour Power & Glam. Préparer dix slides : scène vécue, difficulté, distinction expliquer/se justifier, trois formulations et choix personnel. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-6","title":"36 · Power & Glam — Portrait des cinq univers","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Power & Glam\n\nLIVRABLE À PRÉPARER\nPortrait des cinq univers.\n\nBRIEF PRÉCIS\nConcevoir cinq cartes Amour, Beauté, Argent, Vie et Désir ; employer leurs couleurs validées et un bénéfice concret par carte.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Portrait des cinq univers pour Power & Glam. Concevoir cinq cartes Amour, Beauté, Argent, Vie et Désir ; employer leurs couleurs validées et un bénéfice concret par carte. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-7","title":"37 · Power & Glam — Présentation d’un accompagnement","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Power & Glam\n\nLIVRABLE À PRÉPARER\nPrésentation d’un accompagnement.\n\nBRIEF PRÉCIS\nPréparer une page avec besoin, déroulé, livrables, limites et prise de contact ; réserver les prix et disponibilités aux données confirmées.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Présentation d’un accompagnement pour Power & Glam. Préparer une page avec besoin, déroulé, livrables, limites et prise de contact ; réserver les prix et disponibilités aux données confirmées. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-8","title":"38 · Power & Glam — Dossier éditorial — retrouver sa place","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Power & Glam\n\nLIVRABLE À PRÉPARER\nDossier éditorial — retrouver sa place.\n\nBRIEF PRÉCIS\nProposer couverture, sommaire et structure de dossier ; articuler scène quotidienne, analyse nuancée, exercices et décision concrète.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Dossier éditorial — retrouver sa place pour Power & Glam. Proposer couverture, sommaire et structure de dossier ; articuler scène quotidienne, analyse nuancée, exercices et décision concrète. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-9","title":"39 · SONIA OS — Carte des routes de mission","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA OS\n\nLIVRABLE À PRÉPARER\nCarte des routes de mission.\n\nBRIEF PRÉCIS\nDessiner les six routes BUSINESS, EDITORIAL, IMAGE LAB, ASSOCIATION, ADMIN/LEGAL et TECH, avec entrée, responsable proposé et résultat.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte des routes de mission pour SONIA OS. Dessiner les six routes BUSINESS, EDITORIAL, IMAGE LAB, ASSOCIATION, ADMIN/LEGAL et TECH, avec entrée, responsable proposé et résultat. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-10","title":"40 · SONIA OS — Fiche d’agent documentaire","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA OS\n\nLIVRABLE À PRÉPARER\nFiche d’agent documentaire.\n\nBRIEF PRÉCIS\nCréer un modèle avec nom, rôle, mandat, outils vérifiés, limites et preuve attendue ; distinguer identité conceptuelle et agent exécuté.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche d’agent documentaire pour SONIA OS. Créer un modèle avec nom, rôle, mandat, outils vérifiés, limites et preuve attendue ; distinguer identité conceptuelle et agent exécuté. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-11","title":"41 · SONIA OS — Tableau de mission","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA OS\n\nLIVRABLE À PRÉPARER\nTableau de mission.\n\nBRIEF PRÉCIS\nConcevoir une vue mission, prochaine action, livrable, état et décision Sonia ; aucun état validé sans preuve.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Tableau de mission pour SONIA OS. Concevoir une vue mission, prochaine action, livrable, état et décision Sonia ; aucun état validé sans preuve. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-12","title":"42 · SONIA OS — Rapport de fin de mission","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA OS\n\nLIVRABLE À PRÉPARER\nRapport de fin de mission.\n\nBRIEF PRÉCIS\nStructurer réalisé, proposé, non vérifié, fichiers livrés, limites et prochaine étape en une page lisible.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Rapport de fin de mission pour SONIA OS. Structurer réalisé, proposé, non vérifié, fichiers livrés, limites et prochaine étape en une page lisible. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-13","title":"43 · Sonia Velka — Portrait éditorial authentique","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Sonia Velka\n\nLIVRABLE À PRÉPARER\nPortrait éditorial authentique.\n\nBRIEF PRÉCIS\nPréparer trois recadrages à partir d’une vraie photographie fournie ; lumière naturelle, retouche légère et aucun visage synthétique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Portrait éditorial authentique pour Sonia Velka. Préparer trois recadrages à partir d’une vraie photographie fournie ; lumière naturelle, retouche légère et aucun visage synthétique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-14","title":"44 · Sonia Velka — Bannière personnelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Sonia Velka\n\nLIVRABLE À PRÉPARER\nBannière personnelle.\n\nBRIEF PRÉCIS\nConcevoir une bannière avec Sonia Velka et une zone de respiration ; proposer la signature séparément pour validation.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Bannière personnelle pour Sonia Velka. Concevoir une bannière avec Sonia Velka et une zone de respiration ; proposer la signature séparément pour validation. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-15","title":"45 · Sonia Velka — Vidéo du quotidien","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Sonia Velka\n\nLIVRABLE À PRÉPARER\nVidéo du quotidien.\n\nBRIEF PRÉCIS\nPréparer un montage court depuis les vidéos fournies, avec sous-titres sobres, rythme naturel et sans emojis ajoutés.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Vidéo du quotidien pour Sonia Velka. Préparer un montage court depuis les vidéos fournies, avec sous-titres sobres, rythme naturel et sans emojis ajoutés. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-16","title":"46 · Sonia Velka — Présentation personnelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Sonia Velka\n\nLIVRABLE À PRÉPARER\nPrésentation personnelle.\n\nBRIEF PRÉCIS\nRédiger trois longueurs de bio, simples et incarnées, sans raconter de détails privés ni inventer de parcours.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Présentation personnelle pour Sonia Velka. Rédiger trois longueurs de bio, simples et incarnées, sans raconter de détails privés ni inventer de parcours. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-17","title":"47 · Le Lion Blanc — Présentation du projet citoyen","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Le Lion Blanc\n\nLIVRABLE À PRÉPARER\nPrésentation du projet citoyen.\n\nBRIEF PRÉCIS\nPréparer une page qui explique intention, publics et formes d’action proposées sans attribuer de statut juridique non confirmé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Présentation du projet citoyen pour Le Lion Blanc. Préparer une page qui explique intention, publics et formes d’action proposées sans attribuer de statut juridique non confirmé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-18","title":"48 · Le Lion Blanc — Affiche atelier papiers et budget","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Le Lion Blanc\n\nLIVRABLE À PRÉPARER\nAffiche atelier papiers et budget.\n\nBRIEF PRÉCIS\nConcevoir une affiche avec objectif pratique, déroulé et champs lieu/date à compléter ; ne publier aucune donnée de participant.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Affiche atelier papiers et budget pour Le Lion Blanc. Concevoir une affiche avec objectif pratique, déroulé et champs lieu/date à compléter ; ne publier aucune donnée de participant. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-19","title":"49 · Le Lion Blanc — Livret participant vierge","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Le Lion Blanc\n\nLIVRABLE À PRÉPARER\nLivret participant vierge.\n\nBRIEF PRÉCIS\nCréer une trame pour classer ses documents et préparer ses questions, sans conseil juridique ou financier personnalisé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Livret participant vierge pour Le Lion Blanc. Créer une trame pour classer ses documents et préparer ses questions, sans conseil juridique ou financier personnalisé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-20","title":"50 · Le Lion Blanc — Bilan d’action collective","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Le Lion Blanc\n\nLIVRABLE À PRÉPARER\nBilan d’action collective.\n\nBRIEF PRÉCIS\nPréparer un modèle avec objectif, actions réalisées, retours consentis, difficultés et suites ; aucun résultat fictif.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Bilan d’action collective pour Le Lion Blanc. Préparer un modèle avec objectif, actions réalisées, retours consentis, difficultés et suites ; aucun résultat fictif. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-21","title":"51 · PARISIS Engine — Fiche de lecture sourcée","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : PARISIS Engine\n\nLIVRABLE À PRÉPARER\nFiche de lecture sourcée.\n\nBRIEF PRÉCIS\nConcevoir un modèle avec ouvrage, page, affirmation, éléments cités et question de vérification.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de lecture sourcée pour PARISIS Engine. Concevoir un modèle avec ouvrage, page, affirmation, éléments cités et question de vérification. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-22","title":"52 · PARISIS Engine — Carte d’exploration parisienne","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : PARISIS Engine\n\nLIVRABLE À PRÉPARER\nCarte d’exploration parisienne.\n\nBRIEF PRÉCIS\nPréparer une légende pour lieux, dates et références ; distinguer trajet de visite et hypothèse d’alignement.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte d’exploration parisienne pour PARISIS Engine. Préparer une légende pour lieux, dates et références ; distinguer trajet de visite et hypothèse d’alignement. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-23","title":"53 · PARISIS Engine — Comparaison de deux hypothèses","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : PARISIS Engine\n\nLIVRABLE À PRÉPARER\nComparaison de deux hypothèses.\n\nBRIEF PRÉCIS\nCréer une double page avec arguments, contre-exemples, sources indépendantes et niveau d’incertitude.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Comparaison de deux hypothèses pour PARISIS Engine. Créer une double page avec arguments, contre-exemples, sources indépendantes et niveau d’incertitude. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-24","title":"54 · PARISIS Engine — Chronologie documentaire","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : PARISIS Engine\n\nLIVRABLE À PRÉPARER\nChronologie documentaire.\n\nBRIEF PRÉCIS\nPréparer une frise dont chaque entrée comporte date, événement, source et degré de certitude.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Chronologie documentaire pour PARISIS Engine. Préparer une frise dont chaque entrée comporte date, événement, source et degré de certitude. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-25","title":"55 · ELOAH P&G — Parcours des cinq portes","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH P&G\n\nLIVRABLE À PRÉPARER\nParcours des cinq portes.\n\nBRIEF PRÉCIS\nConcevoir cinq écrans Eau, Peau, Terre, Vie et Feu avec intention, question et exercice ; ne promettre aucun effet thérapeutique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Parcours des cinq portes pour ELOAH P&G. Concevoir cinq écrans Eau, Peau, Terre, Vie et Feu avec intention, question et exercice ; ne promettre aucun effet thérapeutique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-26","title":"56 · ELOAH P&G — Fiche de clarté relationnelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH P&G\n\nLIVRABLE À PRÉPARER\nFiche de clarté relationnelle.\n\nBRIEF PRÉCIS\nStructurer faits observés, ressenti, besoin, limite et prochaine décision, avec un exemple explicitement fictif.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de clarté relationnelle pour ELOAH P&G. Structurer faits observés, ressenti, besoin, limite et prochaine décision, avec un exemple explicitement fictif. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-27","title":"57 · ELOAH P&G — Carnet Revenir à Soi","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH P&G\n\nLIVRABLE À PRÉPARER\nCarnet Revenir à Soi.\n\nBRIEF PRÉCIS\nProposer couverture, introduction et sept pages de pratique à personnaliser, sans progression imposée.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carnet Revenir à Soi pour ELOAH P&G. Proposer couverture, introduction et sept pages de pratique à personnaliser, sans progression imposée. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-28","title":"58 · ELOAH P&G — Écran de reprise personnelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH P&G\n\nLIVRABLE À PRÉPARER\nÉcran de reprise personnelle.\n\nBRIEF PRÉCIS\nMaquetter une reprise avec dernière pratique, note libre et choix de prochaine étape, sans score psychologique inventé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Écran de reprise personnelle pour ELOAH P&G. Maquetter une reprise avec dernière pratique, note libre et choix de prochaine étape, sans score psychologique inventé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-29","title":"59 · Dark Energy — Note d’intention créative","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Dark Energy\n\nLIVRABLE À PRÉPARER\nNote d’intention créative.\n\nBRIEF PRÉCIS\nDéfinir une exploration visuelle sombre à partir de matière, lumière, rythme et contraste ; la présenter comme concept artistique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Note d’intention créative pour Dark Energy. Définir une exploration visuelle sombre à partir de matière, lumière, rythme et contraste ; la présenter comme concept artistique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-30","title":"60 · Dark Energy — Triptyque expérimental","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Dark Energy\n\nLIVRABLE À PRÉPARER\nTriptyque expérimental.\n\nBRIEF PRÉCIS\nPréparer trois compositions réellement différentes autour de silence, tension et mouvement, avec palettes et textures décrites.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Triptyque expérimental pour Dark Energy. Préparer trois compositions réellement différentes autour de silence, tension et mouvement, avec palettes et textures décrites. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-31","title":"61 · Dark Energy — Carnet de fragments","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Dark Energy\n\nLIVRABLE À PRÉPARER\nCarnet de fragments.\n\nBRIEF PRÉCIS\nStructurer un recueil de textes originaux courts avec respiration, ordre de lecture et pistes graphiques.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carnet de fragments pour Dark Energy. Structurer un recueil de textes originaux courts avec respiration, ordre de lecture et pistes graphiques. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-32","title":"62 · Dark Energy — Installation imaginaire","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Dark Energy\n\nLIVRABLE À PRÉPARER\nInstallation imaginaire.\n\nBRIEF PRÉCIS\nÉcrire le storyboard d’une expérience image/son en trois séquences, en distinguant concept et réalisation technique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Installation imaginaire pour Dark Energy. Écrire le storyboard d’une expérience image/son en trois séquences, en distinguant concept et réalisation technique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-33","title":"63 · MAIA — Planning maison réutilisable","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : MAIA\n\nLIVRABLE À PRÉPARER\nPlanning maison réutilisable.\n\nBRIEF PRÉCIS\nConcevoir un planning quotidien et hebdomadaire vierge avec tâches essentielles, durée estimée et report possible.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Planning maison réutilisable pour MAIA. Concevoir un planning quotidien et hebdomadaire vierge avec tâches essentielles, durée estimée et report possible. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-34","title":"64 · MAIA — Étiquettes de rangement","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : MAIA\n\nLIVRABLE À PRÉPARER\nÉtiquettes de rangement.\n\nBRIEF PRÉCIS\nPréparer un système imprimable par catégorie avec texte lisible et pictogrammes simples, sans informations personnelles.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Étiquettes de rangement pour MAIA. Préparer un système imprimable par catégorie avec texte lisible et pictogrammes simples, sans informations personnelles. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-35","title":"65 · MAIA — Inventaire des stocks","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : MAIA\n\nLIVRABLE À PRÉPARER\nInventaire des stocks.\n\nBRIEF PRÉCIS\nCréer une fiche produit, quantité, seuil souhaité et prochaine vérification ; conserver les quantités vides.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Inventaire des stocks pour MAIA. Créer une fiche produit, quantité, seuil souhaité et prochaine vérification ; conserver les quantités vides. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-36","title":"66 · MAIA — Tableau réparer donner vendre","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : MAIA\n\nLIVRABLE À PRÉPARER\nTableau réparer donner vendre.\n\nBRIEF PRÉCIS\nConcevoir quatre colonnes avec objet, état, action et décision, incluant une zone pour ce qui doit être jeté.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Tableau réparer donner vendre pour MAIA. Concevoir quatre colonnes avec objet, état, action et décision, incluant une zone pour ce qui doit être jeté. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-37","title":"67 · Etsy Factory — Fiche d’analyse d’une référence","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Etsy Factory\n\nLIVRABLE À PRÉPARER\nFiche d’analyse d’une référence.\n\nBRIEF PRÉCIS\nPréparer une grille : public, besoin, formats, mécanisme de vente et possibilités originales ; ne copier aucun texte ou visuel protégé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche d’analyse d’une référence pour Etsy Factory. Préparer une grille : public, besoin, formats, mécanisme de vente et possibilités originales ; ne copier aucun texte ou visuel protégé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-38","title":"68 · Etsy Factory — Architecture d’un pack original","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Etsy Factory\n\nLIVRABLE À PRÉPARER\nArchitecture d’un pack original.\n\nBRIEF PRÉCIS\nDéfinir catégories, nombre de pièces, formats, fichiers éditables et mode d’emploi, avec distinction entre prévu et livré.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Architecture d’un pack original pour Etsy Factory. Définir catégories, nombre de pièces, formats, fichiers éditables et mode d’emploi, avec distinction entre prévu et livré. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-39","title":"69 · Etsy Factory — Planche de présentation du pack","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Etsy Factory\n\nLIVRABLE À PRÉPARER\nPlanche de présentation du pack.\n\nBRIEF PRÉCIS\nConcevoir une image principale et cinq vues de détail à partir de créations réellement produites, sans faux avis.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Planche de présentation du pack pour Etsy Factory. Concevoir une image principale et cinq vues de détail à partir de créations réellement produites, sans faux avis. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-40","title":"70 · Etsy Factory — Guide d’utilisation client","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Etsy Factory\n\nLIVRABLE À PRÉPARER\nGuide d’utilisation client.\n\nBRIEF PRÉCIS\nPréparer une notice ouvrir, personnaliser, exporter et vérifier, adaptée au format effectivement livré.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Guide d’utilisation client pour Etsy Factory. Préparer une notice ouvrir, personnaliser, exporter et vérifier, adaptée au format effectivement livré. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-41","title":"71 · Musique & identité artistique — Brief de pochette","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Musique & identité artistique\n\nLIVRABLE À PRÉPARER\nBrief de pochette.\n\nBRIEF PRÉCIS\nPréparer une fiche format, titre à confirmer, ambiance, composition et droits des éléments ; ne générer ni nom définitif ni musique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Brief de pochette pour Musique & identité artistique. Préparer une fiche format, titre à confirmer, ambiance, composition et droits des éléments ; ne générer ni nom définitif ni musique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-42","title":"72 · Musique & identité artistique — Dossier de références sonores","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Musique & identité artistique\n\nLIVRABLE À PRÉPARER\nDossier de références sonores.\n\nBRIEF PRÉCIS\nCréer une grille morceau, artiste, source, caractéristique observée et piste originale à explorer, à compléter avec références vérifiées.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Dossier de références sonores pour Musique & identité artistique. Créer une grille morceau, artiste, source, caractéristique observée et piste originale à explorer, à compléter avec références vérifiées. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-43","title":"73 · Musique & identité artistique — Livret de projet musical","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Musique & identité artistique\n\nLIVRABLE À PRÉPARER\nLivret de projet musical.\n\nBRIEF PRÉCIS\nMaquetter des pages pour intention, titres provisoires, textes autorisés et crédits, avec champs inconnus laissés ouverts.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Livret de projet musical pour Musique & identité artistique. Maquetter des pages pour intention, titres provisoires, textes autorisés et crédits, avec champs inconnus laissés ouverts. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-44","title":"74 · Musique & identité artistique — Planning de fabrication musicale","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Musique & identité artistique\n\nLIVRABLE À PRÉPARER\nPlanning de fabrication musicale.\n\nBRIEF PRÉCIS\nCréer un modèle écriture, composition, enregistrement, mixage, droits et livraison ; distinguer préparation et sortie publiée.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Planning de fabrication musicale pour Musique & identité artistique. Créer un modèle écriture, composition, enregistrement, mixage, droits et livraison ; distinguer préparation et sortie publiée. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-45","title":"75 · SMITH Studio — Planche de direction artistique","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SMITH Studio\n\nLIVRABLE À PRÉPARER\nPlanche de direction artistique.\n\nBRIEF PRÉCIS\nPréparer une planche palette, typographies, matières, cadrages et contre-exemples pour l’univers choisi.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Planche de direction artistique pour SMITH Studio. Préparer une planche palette, typographies, matières, cadrages et contre-exemples pour l’univers choisi. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-46","title":"76 · SMITH Studio — Gabarits multi-formats","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SMITH Studio\n\nLIVRABLE À PRÉPARER\nGabarits multi-formats.\n\nBRIEF PRÉCIS\nDéfinir un système de composition pour carré, portrait et vertical avec zones de texte et marges de sécurité.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Gabarits multi-formats pour SMITH Studio. Définir un système de composition pour carré, portrait et vertical avec zones de texte et marges de sécurité. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-47","title":"77 · SMITH Studio — Contrôle des créations","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SMITH Studio\n\nLIVRABLE À PRÉPARER\nContrôle des créations.\n\nBRIEF PRÉCIS\nCréer une fiche lisibilité, anatomie éventuelle, texte, marque, contraste et cohérence, à compléter sur chaque rendu.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Contrôle des créations pour SMITH Studio. Créer une fiche lisibilité, anatomie éventuelle, texte, marque, contraste et cohérence, à compléter sur chaque rendu. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-48","title":"78 · SMITH Studio — Dossier de livraison visuelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SMITH Studio\n\nLIVRABLE À PRÉPARER\nDossier de livraison visuelle.\n\nBRIEF PRÉCIS\nStructurer fichiers finaux, sources éditables, variantes, références et consignes de modification.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Dossier de livraison visuelle pour SMITH Studio. Structurer fichiers finaux, sources éditables, variantes, références et consignes de modification. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-49","title":"79 · SONIA HUMAN VOICE ENGINE — Guide de voix naturelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA HUMAN VOICE ENGINE\n\nLIVRABLE À PRÉPARER\nGuide de voix naturelle.\n\nBRIEF PRÉCIS\nPréparer une grille basée sur des textes fournis : rythme, vocabulaire, humour, apartés et formulations à éviter.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Guide de voix naturelle pour SONIA HUMAN VOICE ENGINE. Préparer une grille basée sur des textes fournis : rythme, vocabulaire, humour, apartés et formulations à éviter. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-50","title":"80 · SONIA HUMAN VOICE ENGINE — Réécriture avant après","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA HUMAN VOICE ENGINE\n\nLIVRABLE À PRÉPARER\nRéécriture avant après.\n\nBRIEF PRÉCIS\nCréer un modèle comparatif montrant ce qui a été simplifié et pourquoi, sans modifier le sens initial.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Réécriture avant après pour SONIA HUMAN VOICE ENGINE. Créer un modèle comparatif montrant ce qui a été simplifié et pourquoi, sans modifier le sens initial. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-51","title":"81 · SONIA HUMAN VOICE ENGINE — Réponses courtes réutilisables","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA HUMAN VOICE ENGINE\n\nLIVRABLE À PRÉPARER\nRéponses courtes réutilisables.\n\nBRIEF PRÉCIS\nConcevoir des modèles accueil, remerciement, précision et refus poli, avec champs à personnaliser avant envoi.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Réponses courtes réutilisables pour SONIA HUMAN VOICE ENGINE. Concevoir des modèles accueil, remerciement, précision et refus poli, avec champs à personnaliser avant envoi. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-52","title":"82 · SONIA HUMAN VOICE ENGINE — Script parlé spontané","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA HUMAN VOICE ENGINE\n\nLIVRABLE À PRÉPARER\nScript parlé spontané.\n\nBRIEF PRÉCIS\nPréparer une trame accroche, scène, idée et conclusion, en phrases orales et sans slogans empilés.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Script parlé spontané pour SONIA HUMAN VOICE ENGINE. Préparer une trame accroche, scène, idée et conclusion, en phrases orales et sans slogans empilés. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-53","title":"83 · AUDIO-FIRST EXPERIENCE ENGINE — Storyboard audio","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AUDIO-FIRST EXPERIENCE ENGINE\n\nLIVRABLE À PRÉPARER\nStoryboard audio.\n\nBRIEF PRÉCIS\nDécrire séquences, voix, ambiance, silences et durée indicative sans annoncer d’enregistrement réalisé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Storyboard audio pour AUDIO-FIRST EXPERIENCE ENGINE. Décrire séquences, voix, ambiance, silences et durée indicative sans annoncer d’enregistrement réalisé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-54","title":"84 · AUDIO-FIRST EXPERIENCE ENGINE — Maquette de lecteur audio","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AUDIO-FIRST EXPERIENCE ENGINE\n\nLIVRABLE À PRÉPARER\nMaquette de lecteur audio.\n\nBRIEF PRÉCIS\nPrévoir lecture, pause, progression, transcription et titre explicite ; distinguer maquette et lecteur fonctionnel.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Maquette de lecteur audio pour AUDIO-FIRST EXPERIENCE ENGINE. Prévoir lecture, pause, progression, transcription et titre explicite ; distinguer maquette et lecteur fonctionnel. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-55","title":"85 · AUDIO-FIRST EXPERIENCE ENGINE — Texte pour lecture à voix haute","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AUDIO-FIRST EXPERIENCE ENGINE\n\nLIVRABLE À PRÉPARER\nTexte pour lecture à voix haute.\n\nBRIEF PRÉCIS\nAdapter un texte fourni avec respirations et transitions, en préservant son sens et sa voix.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Texte pour lecture à voix haute pour AUDIO-FIRST EXPERIENCE ENGINE. Adapter un texte fourni avec respirations et transitions, en préservant son sens et sa voix. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-56","title":"86 · AUDIO-FIRST EXPERIENCE ENGINE — Fiche de production sonore","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AUDIO-FIRST EXPERIENCE ENGINE\n\nLIVRABLE À PRÉPARER\nFiche de production sonore.\n\nBRIEF PRÉCIS\nCréer une liste prises, autorisations, fichiers sources, niveau d’écoute et contrôles finaux.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de production sonore pour AUDIO-FIRST EXPERIENCE ENGINE. Créer une liste prises, autorisations, fichiers sources, niveau d’écoute et contrôles finaux. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-57","title":"87 · BUZZ AGENT — Fiche de signal éditorial","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : BUZZ AGENT\n\nLIVRABLE À PRÉPARER\nFiche de signal éditorial.\n\nBRIEF PRÉCIS\nCréer un modèle source, date, observation, audience concernée et idée originale ; ne pas inventer de tendance.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de signal éditorial pour BUZZ AGENT. Créer un modèle source, date, observation, audience concernée et idée originale ; ne pas inventer de tendance. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-58","title":"88 · BUZZ AGENT — Trois accroches à comparer","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : BUZZ AGENT\n\nLIVRABLE À PRÉPARER\nTrois accroches à comparer.\n\nBRIEF PRÉCIS\nPréparer trois angles pour un même sujet avec intention et critère de comparaison, sans promesse de viralité.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Trois accroches à comparer pour BUZZ AGENT. Préparer trois angles pour un même sujet avec intention et critère de comparaison, sans promesse de viralité. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-59","title":"89 · BUZZ AGENT — Plan de déclinaison","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : BUZZ AGENT\n\nLIVRABLE À PRÉPARER\nPlan de déclinaison.\n\nBRIEF PRÉCIS\nTransformer un sujet en post, story et vidéo courte ; conserver le même message avec trois constructions distinctes.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Plan de déclinaison pour BUZZ AGENT. Transformer un sujet en post, story et vidéo courte ; conserver le même message avec trois constructions distinctes. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-60","title":"90 · BUZZ AGENT — Bilan de diffusion","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : BUZZ AGENT\n\nLIVRABLE À PRÉPARER\nBilan de diffusion.\n\nBRIEF PRÉCIS\nCréer un tableau objectif, données observées, période, limites et prochain test, sans statistiques fictives.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Bilan de diffusion pour BUZZ AGENT. Créer un tableau objectif, données observées, période, limites et prochain test, sans statistiques fictives. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-61","title":"91 · SONIA ALERT / OSINT — Bulletin de veille vierge","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA ALERT / OSINT\n\nLIVRABLE À PRÉPARER\nBulletin de veille vierge.\n\nBRIEF PRÉCIS\nPréparer une page faits recoupés, sources, dates, incertitudes et points à suivre ; aucun incident inventé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Bulletin de veille vierge pour SONIA ALERT / OSINT. Préparer une page faits recoupés, sources, dates, incertitudes et points à suivre ; aucun incident inventé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-62","title":"92 · SONIA ALERT / OSINT — Fiche de corroboration","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA ALERT / OSINT\n\nLIVRABLE À PRÉPARER\nFiche de corroboration.\n\nBRIEF PRÉCIS\nStructurer affirmation, source primaire, seconde source, contradictions et conclusion provisoire.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de corroboration pour SONIA ALERT / OSINT. Structurer affirmation, source primaire, seconde source, contradictions et conclusion provisoire. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-63","title":"93 · SONIA ALERT / OSINT — Chronologie d’un événement","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA ALERT / OSINT\n\nLIVRABLE À PRÉPARER\nChronologie d’un événement.\n\nBRIEF PRÉCIS\nCréer un modèle séparant date de publication, date du fait, lieu et évolution des informations.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Chronologie d’un événement pour SONIA ALERT / OSINT. Créer un modèle séparant date de publication, date du fait, lieu et évolution des informations. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-64","title":"94 · SONIA ALERT / OSINT — Carte de niveaux de preuve","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA ALERT / OSINT\n\nLIVRABLE À PRÉPARER\nCarte de niveaux de preuve.\n\nBRIEF PRÉCIS\nConcevoir une légende confirmé, plausible, non vérifié et infirmé avec critères explicites, sans dramatisation.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte de niveaux de preuve pour SONIA ALERT / OSINT. Concevoir une légende confirmé, plausible, non vérifié et infirmé avec critères explicites, sans dramatisation. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-65","title":"95 · Foi & spiritualité — Carnet de lecture","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Foi & spiritualité\n\nLIVRABLE À PRÉPARER\nCarnet de lecture.\n\nBRIEF PRÉCIS\nPréparer une page texte étudié, référence, contexte, question et réflexion personnelle, sans citations inventées.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carnet de lecture pour Foi & spiritualité. Préparer une page texte étudié, référence, contexte, question et réflexion personnelle, sans citations inventées. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-66","title":"96 · Foi & spiritualité — Fiche de prière personnelle","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Foi & spiritualité\n\nLIVRABLE À PRÉPARER\nFiche de prière personnelle.\n\nBRIEF PRÉCIS\nMaquetter intention, texte fourni, silence et relecture ; respecter la tradition indiquée par Sonia.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de prière personnelle pour Foi & spiritualité. Maquetter intention, texte fourni, silence et relecture ; respecter la tradition indiquée par Sonia. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-67","title":"97 · Foi & spiritualité — Glossaire de symboles religieux","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Foi & spiritualité\n\nLIVRABLE À PRÉPARER\nGlossaire de symboles religieux.\n\nBRIEF PRÉCIS\nCréer un modèle symbole, tradition, contexte historique, source et variantes, sans universaliser les significations.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Glossaire de symboles religieux pour Foi & spiritualité. Créer un modèle symbole, tradition, contexte historique, source et variantes, sans universaliser les significations. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-68","title":"98 · Foi & spiritualité — Plan de séance d’étude","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Foi & spiritualité\n\nLIVRABLE À PRÉPARER\nPlan de séance d’étude.\n\nBRIEF PRÉCIS\nStructurer lecture, repères de contexte, questions et synthèse en distinguant foi personnelle et analyse historique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Plan de séance d’étude pour Foi & spiritualité. Structurer lecture, repères de contexte, questions et synthèse en distinguant foi personnelle et analyse historique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-69","title":"99 · SONIA FUTURES INTELLIGENCE — Matrice de scénarios","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA FUTURES INTELLIGENCE\n\nLIVRABLE À PRÉPARER\nMatrice de scénarios.\n\nBRIEF PRÉCIS\nConcevoir quatre cases fondées sur deux incertitudes explicites, avec conséquences et limites de chaque scénario.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Matrice de scénarios pour SONIA FUTURES INTELLIGENCE. Concevoir quatre cases fondées sur deux incertitudes explicites, avec conséquences et limites de chaque scénario. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-70","title":"100 · SONIA FUTURES INTELLIGENCE — Fiche de signal faible","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA FUTURES INTELLIGENCE\n\nLIVRABLE À PRÉPARER\nFiche de signal faible.\n\nBRIEF PRÉCIS\nCréer un modèle observation, source datée, interprétations possibles et indicateurs à suivre.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de signal faible pour SONIA FUTURES INTELLIGENCE. Créer un modèle observation, source datée, interprétations possibles et indicateurs à suivre. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-71","title":"101 · SONIA FUTURES INTELLIGENCE — Carte des conséquences","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA FUTURES INTELLIGENCE\n\nLIVRABLE À PRÉPARER\nCarte des conséquences.\n\nBRIEF PRÉCIS\nPréparer un diagramme effets directs, indirects et hypothèses, sans transformer une possibilité en prédiction.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte des conséquences pour SONIA FUTURES INTELLIGENCE. Préparer un diagramme effets directs, indirects et hypothèses, sans transformer une possibilité en prédiction. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-72","title":"102 · SONIA FUTURES INTELLIGENCE — Note de décision prospective","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA FUTURES INTELLIGENCE\n\nLIVRABLE À PRÉPARER\nNote de décision prospective.\n\nBRIEF PRÉCIS\nStructurer options robustes, dépendances, signaux de révision et décisions réservées à Sonia.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Note de décision prospective pour SONIA FUTURES INTELLIGENCE. Structurer options robustes, dépendances, signaux de révision et décisions réservées à Sonia. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-73","title":"103 · SYMBOL ATLAS — Fiche de symbole","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SYMBOL ATLAS\n\nLIVRABLE À PRÉPARER\nFiche de symbole.\n\nBRIEF PRÉCIS\nPréparer forme, variantes, contexte culturel, sens documentés, datation et source iconographique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche de symbole pour SYMBOL ATLAS. Préparer forme, variantes, contexte culturel, sens documentés, datation et source iconographique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-74","title":"104 · SYMBOL ATLAS — Planche de comparaison","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SYMBOL ATLAS\n\nLIVRABLE À PRÉPARER\nPlanche de comparaison.\n\nBRIEF PRÉCIS\nComparer deux formes avec points communs, différences et limites ; distinguer ressemblance et filiation attestée.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Planche de comparaison pour SYMBOL ATLAS. Comparer deux formes avec points communs, différences et limites ; distinguer ressemblance et filiation attestée. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-75","title":"105 · SYMBOL ATLAS — Carte des occurrences","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SYMBOL ATLAS\n\nLIVRABLE À PRÉPARER\nCarte des occurrences.\n\nBRIEF PRÉCIS\nDéfinir une fiche lieu, position, photographie autorisée, date d’observation et référence historique.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte des occurrences pour SYMBOL ATLAS. Définir une fiche lieu, position, photographie autorisée, date d’observation et référence historique. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-76","title":"106 · SYMBOL ATLAS — Registre de contre-exemples","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SYMBOL ATLAS\n\nLIVRABLE À PRÉPARER\nRegistre de contre-exemples.\n\nBRIEF PRÉCIS\nCréer une grille hypothèse, cas contraires et ajustement de conclusion pour limiter les rapprochements arbitraires.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Registre de contre-exemples pour SYMBOL ATLAS. Créer une grille hypothèse, cas contraires et ajustement de conclusion pour limiter les rapprochements arbitraires. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-77","title":"107 · SONIA Labs — Fiche d’expérimentation","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA Labs\n\nLIVRABLE À PRÉPARER\nFiche d’expérimentation.\n\nBRIEF PRÉCIS\nPréparer hypothèse, protocole, matériel, critères de réussite et résultat observé, laissés ouverts avant test.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche d’expérimentation pour SONIA Labs. Préparer hypothèse, protocole, matériel, critères de réussite et résultat observé, laissés ouverts avant test. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-78","title":"108 · SONIA Labs — Journal de prototype","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA Labs\n\nLIVRABLE À PRÉPARER\nJournal de prototype.\n\nBRIEF PRÉCIS\nCréer une fiche version, changement, raison, résultat et problème restant.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Journal de prototype pour SONIA Labs. Créer une fiche version, changement, raison, résultat et problème restant. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-79","title":"109 · SONIA Labs — Comparatif d’outils","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA Labs\n\nLIVRABLE À PRÉPARER\nComparatif d’outils.\n\nBRIEF PRÉCIS\nDéfinir critères liés à un besoin réel : fonction, accès, coût à vérifier, export et limites.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Comparatif d’outils pour SONIA Labs. Définir critères liés à un besoin réel : fonction, accès, coût à vérifier, export et limites. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-80","title":"110 · SONIA Labs — Rapport de validation","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : SONIA Labs\n\nLIVRABLE À PRÉPARER\nRapport de validation.\n\nBRIEF PRÉCIS\nStructurer tests exécutés, preuves, échecs, risques restants et décision de poursuivre ou reprendre.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Rapport de validation pour SONIA Labs. Structurer tests exécutés, preuves, échecs, risques restants et décision de poursuivre ou reprendre. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-81","title":"111 · LE SIÈGE — Dossier de délibération","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : LE SIÈGE\n\nLIVRABLE À PRÉPARER\nDossier de délibération.\n\nBRIEF PRÉCIS\nPréparer question, contexte, options, critères et informations manquantes pour une décision de Sonia.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Dossier de délibération pour LE SIÈGE. Préparer question, contexte, options, critères et informations manquantes pour une décision de Sonia. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-82","title":"112 · LE SIÈGE — Cartes des points de vue","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : LE SIÈGE\n\nLIVRABLE À PRÉPARER\nCartes des points de vue.\n\nBRIEF PRÉCIS\nConcevoir les rôles Architecture, Risque et Contradiction ; marquer les analyses simulées comme telles.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Cartes des points de vue pour LE SIÈGE. Concevoir les rôles Architecture, Risque et Contradiction ; marquer les analyses simulées comme telles. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-83","title":"113 · LE SIÈGE — Matrice d’arbitrage","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : LE SIÈGE\n\nLIVRABLE À PRÉPARER\nMatrice d’arbitrage.\n\nBRIEF PRÉCIS\nPrésenter options, bénéfices, coûts à documenter, réversibilité et objections, sans choisir à la place de Sonia.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Matrice d’arbitrage pour LE SIÈGE. Présenter options, bénéfices, coûts à documenter, réversibilité et objections, sans choisir à la place de Sonia. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-84","title":"114 · LE SIÈGE — Compte rendu de conseil","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : LE SIÈGE\n\nLIVRABLE À PRÉPARER\nCompte rendu de conseil.\n\nBRIEF PRÉCIS\nSéparer arguments, désaccords, recommandation et décision effectivement prononcée.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Compte rendu de conseil pour LE SIÈGE. Séparer arguments, désaccords, recommandation et décision effectivement prononcée. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-85","title":"115 · AION OS V2 / V3 — Fiche d’automatisation proposée","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AION OS V2 / V3\n\nLIVRABLE À PRÉPARER\nFiche d’automatisation proposée.\n\nBRIEF PRÉCIS\nDécrire déclencheur, données, étapes, sortie et arrêt ; marquer le fonctionnement non activé tant qu’il n’est pas testé.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Fiche d’automatisation proposée pour AION OS V2 / V3. Décrire déclencheur, données, étapes, sortie et arrêt ; marquer le fonctionnement non activé tant qu’il n’est pas testé. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-86","title":"116 · AION OS V2 / V3 — Carte des dépendances","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AION OS V2 / V3\n\nLIVRABLE À PRÉPARER\nCarte des dépendances.\n\nBRIEF PRÉCIS\nRelier services requis, permissions, données échangées et conditions de panne.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte des dépendances pour AION OS V2 / V3. Relier services requis, permissions, données échangées et conditions de panne. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-87","title":"117 · AION OS V2 / V3 — Journal d’exécution type","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AION OS V2 / V3\n\nLIVRABLE À PRÉPARER\nJournal d’exécution type.\n\nBRIEF PRÉCIS\nCréer un modèle horodatage, action, résultat, erreur et preuve ; laisser les exécutions vides.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Journal d’exécution type pour AION OS V2 / V3. Créer un modèle horodatage, action, résultat, erreur et preuve ; laisser les exécutions vides. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-88","title":"118 · AION OS V2 / V3 — Parcours de reprise après erreur","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : AION OS V2 / V3\n\nLIVRABLE À PRÉPARER\nParcours de reprise après erreur.\n\nBRIEF PRÉCIS\nPréparer une procédure détection, arrêt, diagnostic et relance contrôlée sans doublonner les actions.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Parcours de reprise après erreur pour AION OS V2 / V3. Préparer une procédure détection, arrêt, diagnostic et relance contrôlée sans doublonner les actions. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-89","title":"119 · ELOAH — Carte des 24 univers","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH\n\nLIVRABLE À PRÉPARER\nCarte des 24 univers.\n\nBRIEF PRÉCIS\nConcevoir un annuaire avec nom, rôle, lien et livrable principal de chaque univers réellement présent.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte des 24 univers pour ELOAH. Concevoir un annuaire avec nom, rôle, lien et livrable principal de chaque univers réellement présent. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-90","title":"120 · ELOAH — Studio — suivi des livrables","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH\n\nLIVRABLE À PRÉPARER\nStudio — suivi des livrables.\n\nBRIEF PRÉCIS\nMaquetter une vue brief, brouillon, corrections et lien final en gardant le statut de création explicite.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Studio — suivi des livrables pour ELOAH. Maquetter une vue brief, brouillon, corrections et lien final en gardant le statut de création explicite. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-91","title":"121 · ELOAH — Recherche par univers","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH\n\nLIVRABLE À PRÉPARER\nRecherche par univers.\n\nBRIEF PRÉCIS\nPréparer un parcours de recherche qui retrouve une fiche par nom d’univers, titre ou mots du brief.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Recherche par univers pour ELOAH. Préparer un parcours de recherche qui retrouve une fiche par nom d’univers, titre ou mots du brief. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-92","title":"122 · ELOAH — Guide de passage entre espaces","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : ELOAH\n\nLIVRABLE À PRÉPARER\nGuide de passage entre espaces.\n\nBRIEF PRÉCIS\nDocumenter accueil, notes, projet et bibliothèque avec exemples de chemins concrets.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Guide de passage entre espaces pour ELOAH. Documenter accueil, notes, projet et bibliothèque avec exemples de chemins concrets. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-93","title":"123 · Agent Authority Fabric — Carte de mandat","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Agent Authority Fabric\n\nLIVRABLE À PRÉPARER\nCarte de mandat.\n\nBRIEF PRÉCIS\nCréer un modèle autorité, action autorisée, périmètre, durée et conditions d’arrêt ; ne pas assimiler un rôle à une permission.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Carte de mandat pour Agent Authority Fabric. Créer un modèle autorité, action autorisée, périmètre, durée et conditions d’arrêt ; ne pas assimiler un rôle à une permission. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-94","title":"124 · Agent Authority Fabric — Matrice des permissions","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Agent Authority Fabric\n\nLIVRABLE À PRÉPARER\nMatrice des permissions.\n\nBRIEF PRÉCIS\nPrésenter lecture, préparation, écriture et publication par outil, uniquement avec accès vérifiés.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Matrice des permissions pour Agent Authority Fabric. Présenter lecture, préparation, écriture et publication par outil, uniquement avec accès vérifiés. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-95","title":"125 · Agent Authority Fabric — Preuve d’action","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Agent Authority Fabric\n\nLIVRABLE À PRÉPARER\nPreuve d’action.\n\nBRIEF PRÉCIS\nConcevoir une fiche demande, outil utilisé, résultat observé et validation, sans journal fictif.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Preuve d’action pour Agent Authority Fabric. Concevoir une fiche demande, outil utilisé, résultat observé et validation, sans journal fictif. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-96","title":"126 · Agent Authority Fabric — Revue des accès","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Agent Authority Fabric\n\nLIVRABLE À PRÉPARER\nRevue des accès.\n\nBRIEF PRÉCIS\nPréparer une liste d’accès à vérifier avec propriétaire, utilité et décision à prendre sans modifier les permissions.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Revue des accès pour Agent Authority Fabric. Préparer une liste d’accès à vérifier avec propriétaire, utilité et décision à prendre sans modifier les permissions. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-97","title":"127 · Tous les univers — Catalogue de créations","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Tous les univers\n\nLIVRABLE À PRÉPARER\nCatalogue de créations.\n\nBRIEF PRÉCIS\nAssembler un index des briefs par univers, format, état et prochaine action ; garder les titres et textes existants.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Catalogue de créations pour Tous les univers. Assembler un index des briefs par univers, format, état et prochaine action ; garder les titres et textes existants. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-98","title":"128 · Tous les univers — Calendrier de production vierge","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Tous les univers\n\nLIVRABLE À PRÉPARER\nCalendrier de production vierge.\n\nBRIEF PRÉCIS\nPréparer une semaine type avec capacité disponible, priorités et emplacements de livrables ; ne fixer aucune date de publication.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Calendrier de production vierge pour Tous les univers. Préparer une semaine type avec capacité disponible, priorités et emplacements de livrables ; ne fixer aucune date de publication. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-99","title":"129 · Tous les univers — Dossier de références communes","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Tous les univers\n\nLIVRABLE À PRÉPARER\nDossier de références communes.\n\nBRIEF PRÉCIS\nCréer une structure références validées, sources, droits et fichiers utilisables ; séparer strictement les identités de marque.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Dossier de références communes pour Tous les univers. Créer une structure références validées, sources, droits et fichiers utilisables ; séparer strictement les identités de marque. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false},{"id":"eloah-studio-univers-v1-100","title":"130 · Tous les univers — Revue des créations","module":"ELOAH Studio","state":"À faire","date":"","note":"UNIVERS : Tous les univers\n\nLIVRABLE À PRÉPARER\nRevue des créations.\n\nBRIEF PRÉCIS\nPréparer une séance choisir, comparer, corriger et valider avec une liste des décisions attendues de Sonia.\n\nPROMPT POUR CHATGPT\n« Prépare le livrable Revue des créations pour Tous les univers. Préparer une séance choisir, comparer, corriger et valider avec une liste des décisions attendues de Sonia. Fournis une première version complète et exploitable, les choix de présentation et les points à vérifier. Utilise uniquement les informations disponibles. Signale les données manquantes. Respecte l’identité de cet univers ; aucune publication ni activation automatique. »\n\nPROCHAINE ÉTAPE\nProduire une première version avec ce brief, puis ajouter le lien du résultat à cette fiche.\n\nVALIDATION\nContrôler le respect du brief, la lisibilité, les sources nécessaires et les éléments manquants. Cette fiche est une proposition de création, pas un livrable déjà fabriqué.","url":"","archived":false}];
const ids=new Set(rows.map(r=>r.id));const missing=seed.filter(r=>!ids.has(r.id));
if(missing.length&&!save([...rows,...missing]))return;
localStorage.setItem(marker,'installed');
if(missing.length)$('#status').textContent='100 briefs supplémentaires pour les 24 univers ont été ajoutés à ELOAH Studio. Recherche le nom d’un univers pour retrouver ses fiches.';
}catch(e){$('#status').textContent='Ajout des briefs impossible : vérifie le stockage du navigateur.';}
})();
