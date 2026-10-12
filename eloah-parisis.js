(()=>{
'use strict';
const KEY='eloah-parisis-research-v1',SEEDKEY=KEY+'-seeded';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const views=[
{id:'overview',title:'Vue d’ensemble',icon:'⌂'},
{id:'lieux',title:'CLEFS · Lieux',icon:'⌖'},
{id:'symboles',title:'SYMBOL ATLAS',icon:'◇'},
{id:'corpus',title:'Corpus & pages',icon:'▤'},
{id:'align',title:'ALIGN · GEOMETRY',icon:'△'},
{id:'chronos',title:'CHRONOS · SOLAR',icon:'◷'},
{id:'toponym',title:'TOPONYM · BIOGRAPH',icon:'↗'},
{id:'sources',title:'HISTORIA · Sources',icon:'▥'},
{id:'preuves',title:'Hypothèses & preuves',icon:'◈'},
{id:'audit',title:'AUDIT',icon:'✓'},
{id:'settings',title:'Données & sauvegardes',icon:'⚙'}
];
const cfg={
lieux:{title:'CLEFS · Lieux candidats',hint:'Inventaire de lieux à étudier, sans conclusion automatique.',fields:[['title','Lieu ou monument','text'],['place','Localisation / périmètre','text'],['type','Catégorie','select:Lieu candidat|Monument|Rue|Cimetière|Œuvre|Autre'],['reference','Source et localisation de la preuve','text'],['claim','Question précise','textarea'],['status','État','select:À vérifier|Source trouvée|Documenté|Hypothèse|Écarté'],['notes','Notes / contre-exemples','textarea']]},
symboles:{title:'SYMBOL ATLAS · Inventaire ouvert',hint:'Toutes les familles de symboles peuvent être examinées, sans présumer de leur présence dans Paris.',fields:[['title','Symbole / motif','text'],['family','Famille iconographique','select:Géométrie|Égyptien|Grec / romain|Chrétien|Hébraïque|Islamique|Hermétique|Astrologie / astronomie|Héraldique|Bestiaire|Végétal|Anatomie|Architecture|Eau / feu / terre / air|Chiffres / lettres|Autre'],['place','Objet / lieu observé','text'],['reference','Source avec date ou page','text'],['claim','Description et sens historiquement contextualisé','textarea'],['status','État','select:À vérifier|Source trouvée|Documenté|Hypothèse|Écarté'],['notes','Variantes / objections','textarea']]},
corpus:{title:'Corpus · Documents et pages',hint:'Indexer page par page les affirmations, les personnes, les dates et les lieux réellement fournis.',fields:[['title','Document ou dossier','text'],['author','Auteur / éditeur','text'],['pages','Pages / cote / chapitre','text'],['reference','Référence bibliographique','text'],['claim','Affirmation à examiner','textarea'],['status','État','select:À vérifier|Source trouvée|Documenté|Hypothèse|Écarté'],['notes','Extrait court, analyse originale / réserves','textarea']]},
align:{title:'ALIGN · Géométrie',hint:'Mesurer à partir de coordonnées choisies et documentées ; distinguer tracé et intention.',fields:[['title','Étude d’alignement','text'],['place','Points et repères précis','text'],['reference','Source des coordonnées / plan','text'],['claim','Règles de mesure et résultats observés','textarea'],['status','État','select:À vérifier|Mesuré|Documenté|Hypothèse|Écarté'],['notes','Tolérances / contre-tests / alternatives','textarea']]},
chronos:{title:'CHRONOS · SOLAR',hint:'Sources datées, chronologies et paramètres solaires. Toute équivalence doit être démontrée.',fields:[['title','Événement ou phénomène','text'],['date','Date ou intervalle historique','text'],['reference','Source / plan / édition','text'],['claim','Correspondance étudiée','textarea'],['status','État','select:À vérifier|Source trouvée|Documenté|Hypothèse|Écarté'],['notes','Variantes de calendrier / incertitudes','textarea']]},
toponym:{title:'TOPONYM · BIOGRAPH',hint:'Comparer anciens noms de rues, personnages, archives et périodes réellement attestées.',fields:[['title','Nom / personnage','text'],['place','Rue / lieu / période','text'],['reference','Carte, acte ou source primaire','text'],['claim','Problème historique à résoudre','textarea'],['status','État','select:À vérifier|Source trouvée|Documenté|Hypothèse|Écarté'],['notes','Homonymies, étymologies et contradictions','textarea']]},
sources:{title:'HISTORIA · Registre documentaire',hint:'Garder provenance, cote, période, date et lien vérifié. Pas de document fictif.',fields:[['title','Titre de la source','text'],['author','Auteur ou institution','text'],['date','Date / période de la source','text'],['pages','Cote / page / plan','text'],['url','Lien public, facultatif','url'],['status','Vérification','select:À retrouver|À vérifier|Consulté|Source primaire vérifiée|À écarter'],['notes','Ce que la source permet réellement de dire','textarea']]},
preuves:{title:'Registre des hypothèses et preuves',hint:'F0 : fait ; F1 : sens contextualisé ; F2 : mesure reproductible ; H : hypothèse.',fields:[['title','Proposition testable','text'],['level','Classe de preuve','select:H - Hypothèse|F0 - Fait attesté|F1 - Sens documenté|F2 - Structure mesurée'],['reference','Source / preuve / cote','text'],['claim','Affirmation exacte et test','textarea'],['status','Verdict','select:À vérifier|Non démontré|Concordance descriptive|Corroboré|Contredit'],['notes','Contre-exemples et limites','textarea']]},
audit:{title:'AUDIT · Contrôles',hint:'Vérifier précision, sélection des candidats, répétition et hasard avant toute conclusion.',fields:[['title','Contrôle','text'],['reference','Dossier / fiche examinée','text'],['claim','Question du test','textarea'],['status','Résultat','select:À faire|En cours|Conforme|À corriger|Non démontré'],['notes','Preuve du contrôle et prochaine étape','textarea']]}
};
const store={};for(const k of Object.keys(cfg))store[k]=[];
let active='overview',editing=null,lastMeasured='';
try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');for(const k of Object.keys(cfg))if(Array.isArray(saved[k]))store[k]=saved[k]}catch{}
function seed(){
if(localStorage.getItem(SEEDKEY))return;
const entries={
lieux:[
['Opéra Garnier','Paris','Piste CLEF','Examiner les formes et l’iconographie dans leurs contextes architecturaux. Aucune interprétation ânkh validée.'],
['Notre-Dame de Paris','Paris','Piste CLEF','Étudier les phases historiques, plans, iconographie et chronologies.'],
['Tour Eiffel','Paris','Piste CLEF','Documenter la géométrie choisie et l’histoire avant les tracés.'],
['Arc de Triomphe','Paris','Piste CLEF','Distinguer repère spatial et signification documentée.'],
['Père-Lachaise','Paris','Piste CLEF','Comparer sépultures, toponymie et parcours historiques.'],
['Trocadéro','Paris','Piste CLEF','Définir l’époque et le point exact utilisé.'],
['Buttes-Chaumont','Paris','Piste CLEF','Contrôler le site, les travaux et la datation.'],
['Tour Montparnasse','Paris','Piste CLEF','Évaluer la pertinence historique de la chronologie.']],
symboles:[
['Croix ânkh','Égyptien'],['Croix et cruciformes','Chrétien'],['Rosaces et roues','Géométrie'],['Astres et constellations','Astrologie / astronomie'],
['Symboles royaux et héraldiques','Héraldique'],['Bestiaire','Bestiaire'],['Plantes et feuilles','Végétal'],['Eau et fontaines','Eau / feu / terre / air'],
['Chiffres et lettres','Chiffres / lettres'],['Objets et insignes','Autre'],['Urbanisme et figures spatiales','Géométrie'],['Symboles hermétiques documentés','Hermétique']],
corpus:[
['Parisis Code — Tome 1','Thierry Van de Leur','Pages photographiées à indexer','Analyse du livre source sans reproduire les pages protégées.'],
['Paroles de Michel — 4Q529','Qumrân · éditions scientifiques à vérifier','4Q529','Étudier le manuscrit araméen en tant que source distincte ; aucun plan de Paris démontré.']],
sources:[
['Gallica — plans, ouvrages et archives','Bibliothèque nationale de France'],
['IGN — Remonter le temps','Institut national de l’information géographique et forestière'],
['Archives de Paris — plans et actes','Archives de Paris'],
['Plan de Truschet-Hoyau — comparaison historique','Source et reproduction à localiser'],
['Plans Vasserot — 1810–1836','Cotes et feuilles à localiser']],
preuves:[
['Opéra Garnier / motif ânkh','H - Hypothèse','Ressemblance possible, intention architecturale non démontrée.'],
['Neuf montagnes de 4Q529 / monuments parisiens','H - Hypothèse','Aucun lien historique ou topographique démontré.']],
audit:[
['Coordonnées et emprise du monument','Vérifier centre, sommet, limites et marges d’erreur.'],
['Plans d’époques différentes','Éviter de mêler des lieux et structures d’époques incompatibles.'],
['Alignement et hasard','Fixer règles et contre-exemples avant les mesures.'],
['Citation originale et source primaire','Identifier auteur, cote, date et édition.'],
['Ressemblance et intention','Ne jamais inférer une intention de la seule géométrie.']]
};
for(const [module,items] of Object.entries(entries))for(let i=0;i<items.length;i++){
const a=items[i],id='parisis-seed-'+module+'-'+i;
if(store[module].some(x=>x.id===id))continue;
let r={id,title:a[0],status:'À vérifier',notes:'Référence de recherche · À documenter ; aucune validation technique.'};
if(module==='lieux'){r.place=a[1];r.type=a[2];r.claim=a[3]}
if(module==='symboles'){r.family=a[1];r.claim='Catégorie d’atlas, pas occurrence historique établie.'}
if(module==='corpus'){r.author=a[1];r.pages=a[2];r.claim=a[3]}
if(module==='sources'){r.author=a[1];r.status='À retrouver'}
if(module==='preuves'){r.level=a[1];r.claim=a[2];r.status='Non démontré'}
if(module==='audit'){r.claim=a[1];r.status='À faire'}
store[module].push(r);
}
try{localStorage.setItem(KEY,JSON.stringify(store));localStorage.setItem(SEEDKEY,'1')}catch(e){console.warn('Initialisation locale non persistée',e)}
}
seed();
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));render();return true}catch(e){alert('Enregistrement local impossible. Exporte une sauvegarde.');return false}}
function current(){return cfg[active]}
function schemaOptions(spec){return spec.slice(7).split('|')}
function fieldHTML(field,value){
const [key,label,type]=field,val=escape(value??''),wide=type==='textarea';
let input='';
if(type==='textarea')input='<textarea class="field" name="'+key+'" rows="4">'+val+'</textarea>';
else if(type.startsWith('select:'))input='<select class="field" name="'+key+'">'+schemaOptions(type).map(x=>'<option value="'+escape(x)+'" '+(x===(value||schemaOptions(type)[0])?'selected':'')+'>'+escape(x)+'</option>').join('')+'</select>';
else input='<input class="field" name="'+key+'" type="'+(type==='url'?'url':'text')+'" value="'+val+'" '+(key==='title'?'required maxlength="180"':'maxlength="2000"')+'>';
return '<label class="'+(wide?'wide':'')+'"><strong>'+escape(label)+'</strong>'+input+'</label>'
}
function openEditor(id,values){
if(!cfg[active])return;
editing=id||null;const item=store[active].find(x=>x.id===id)||values||{};
$('editorTitle').textContent=(id?'Modifier : ':'Nouvelle fiche : ')+cfg[active].title;
$('formFields').innerHTML=cfg[active].fields.map(f=>fieldHTML(f,item[f[0]])).join('');
$('editor').showModal()
}
function pill(status){const s=String(status||'À vérifier'),style=/Documenté|Corroboré|Conforme|vérifiée/.test(s)?'valid':/Hypothèse|Non démontré|Contredit/.test(s)?'guess':'unknown';return '<span class="pill '+style+'">'+escape(s)+'</span>'}
function card(module,item){
const content=Object.entries(item).filter(([k,v])=>!['id','title','status','notes'].includes(k)&&v).slice(0,3).map(([k,v])=>'<span class="smallmeta">'+escape(String(v).slice(0,160))+'</span>').join(' · ');
const q=String(item.claim||item.notes||'').slice(0,260);
return '<article class="record"><div class="record-top"><div><h3>'+escape(item.title)+'</h3><div>'+content+'</div></div>'+pill(item.status)+'</div>'+(q?'<p>'+escape(q)+'</p>':'')+'<div class="record-controls"><button data-edit="'+escape(item.id)+'">Modifier</button><button data-chat="'+escape(item.id)+'">Analyser dans ChatGPT ↗</button><button data-delete="'+escape(item.id)+'">Supprimer</button></div></article>'
}
const modules=[
['CLEFS','Examiner les lieux pivots sans en déduire une intention.'],['ALIGN','Tester des alignements selon des règles préalables.'],
['TOPONYM','Retrouver les noms anciens et leurs sources.'],['BIOGRAPH','Lier les personnes à des faits biographiques attestés.'],
['SYMBOL','Comparer des motifs documentés, en contexte.'],['CHRONOS','Distinguer chronologies, calendrier et commémoration.'],
['GEOMETRY','Calculer angles, distances et écarts reproductibles.'],['SOLAR','Tester des phénomènes astronomiques avec paramètres explicites.'],
['HISTORIA','Consulter plans, archives et éditions.'],['AUDIT','Chercher les contre-exemples et l’hypothèse du hasard.']
];
function legacyRecords(){
try{const r=JSON.parse(localStorage.getItem('sonia-universe-v1-parisis')||'[]');return Array.isArray(r)?r.filter(x=>x&&typeof x.title==='string'):[]}catch{return []}
}
function legacyPanel(){
const old=legacyRecords(),notImported=old.filter(x=>!Object.values(store).some(rows=>rows.some(y=>y.id==='parisis-legacy-'+x.id)));
return '<section class="panel"><div class="panel-header"><h2>Travaux de l’ancien PARISIS Control</h2><span class="pill">'+old.length+' fiche(s) locales détectées</span></div><p class="micro">L’ancien tableau reste inchangé. Les notes sont accessibles seulement si elles existent sur ce navigateur ; aucune synchronisation ni suppression automatique.</p><div class="record-controls"><a class="button-light" href="parisis-control.html">Ouvrir l’ancien espace ↗</a>'+ (notImported.length?'<button id="legacyImport">Importer '+notImported.length+' fiche(s) dans le nouveau moteur</button>':'<span class="micro">'+(old.length?'Fiches déjà reprises ou aucune nouvelle fiche.':'Aucune donnée historique détectée ici.')+'</span>')+'</div></section>';
}
function importLegacy(){
const existing=legacyRecords(),map={'Enquêtes':'preuves','Hypothèses':'preuves','Sources & archives':'sources','Atlas des symboles':'symboles'},newRows=existing.filter(x=>!Object.values(store).some(rows=>rows.some(y=>y.id==='parisis-legacy-'+x.id)));
if(!newRows.length)return;
if(!confirm('Importer '+newRows.length+' notes de l’ancien PARISIS Control ? Leurs originaux restent inchangés et les nouvelles copies seront à vérifier.'))return;
for(const x of newRows){const section=map[x.module]||'preuves',item={id:'parisis-legacy-'+x.id,title:String(x.title),status:'À vérifier',notes:'Import historique local, à recontrôler. '+String(x.note||'').slice(0,7000)};
if(x.url&&/^https:\/\//.test(x.url))item.url=String(x.url);if(section==='preuves'){item.level='H - Hypothèse';item.claim='Entrée historique à classer et vérifier.'}if(section==='sources')item.author='Auteur / institution à compléter';
store[section].push(item)}
save();
}
function overview(){
const total=Object.values(store).reduce((n,a)=>n+a.length,0),toAudit=store.preuves.filter(x=>/À vérifier|Non démontré|Hypothèse/.test(x.status)).length;
const stats=[['Fiches documentées ou à vérifier',total],['Lieux candidats',store.lieux.length],['Familles symboliques',store.symboles.length],['Hypothèses ouvertes',toAudit]];
const statsHTML='<div class="grid-stats">'+stats.map(([n,v])=>'<div class="stat"><small>'+escape(n)+'</small><strong>'+v+'</strong></div>').join('')+'</div>';
const method='<section class="panel"><div class="panel-header"><h2>Les dix moteurs de recherche</h2><span class="pill">Méthode documentaire</span></div><div class="method-list">'+modules.map(x=>'<div class="method"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>').join('')+'</div></section>';
const corpus='<section class="panel"><div class="panel-header"><h2>Corpus de travail</h2><button data-nav="corpus">Ouvrir le corpus →</button></div>'+store.corpus.slice(0,3).map(x=>'<p><strong>'+escape(x.title)+'</strong><br><span class="micro">'+escape(x.claim||'')+'</span></p>').join('')+'</section>';
const todo='<section class="panel"><div class="panel-header"><h2>À examiner ensuite</h2><button data-nav="audit">Ouvrir AUDIT →</button></div><p class="micro">Pour chaque piste : source primaire, date, localisation exacte, type de symbole, test géographique et contre-exemple.</p><button class="primary" data-chat-global="1">Lancer une analyse PARISIS dans ChatGPT ↗</button></section>';
return statsHTML+method+'<div class="two-col">'+corpus+todo+'</div>'+legacyPanel()
}
function layoutRecords(){
const q=$('globalSearch').value.toLowerCase().trim();
const arr=store[active].filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));
const intro='<section class="panel"><div class="panel-header"><div><div class="eyebrow">MODULE DE RECHERCHE</div><h2>'+escape(cfg[active].title)+'</h2><p class="micro">'+escape(cfg[active].hint)+'</p></div><span class="pill">'+arr.length+' fiche(s)</span></div><div class="controlbar"><select id="statusFilter" aria-label="Filtrer par état"><option value="">Tous les états</option>'+Array.from(new Set(store[active].map(x=>x.status).filter(Boolean))).map(x=>'<option>'+escape(x)+'</option>').join('')+'</select></div><div id="records">'+(arr.length?arr.map(x=>card(active,x)).join(''):'<div class="empty">Aucune fiche correspondante. Commence par une piste documentable.</div>')+'</div></section>';
return intro
}
function geometry(){return '<section class="panel"><div class="panel-header"><div><div class="eyebrow">MOTEUR DE CALCUL</div><h2>Distance, azimut et test du troisième point</h2></div><span class="pill">Calcul indicatif</span></div><p class="micro">Saisis toi-même des coordonnées sourcées en degrés décimaux. A et B définissent l’axe ; C est facultatif. Aucun lieu ni coordonnées n’est inventé.</p><form id="geoForm"><div class="geom-fields">'+['A','B','C'].map(l=>'<div><strong>Point '+l+'</strong><div class="pair"><label>Latitude <input class="field" name="lat'+l+'" type="number" step="any" min="-90" max="90" '+(l==='C'?'':'required')+' placeholder="48.000000"></label><label>Longitude <input class="field" name="lon'+l+'" type="number" step="any" min="-180" max="180" '+(l==='C'?'':'required')+' placeholder="2.000000"></label></div></div>').join('')+'</div><div class="record-controls"><button class="primary" type="submit">Calculer</button><button id="saveGeometry" type="button" disabled>Créer une fiche d’analyse</button></div><div class="geom-result" id="geoResult" role="status">En attente de coordonnées. Les résultats ne sont pas une preuve d’intention.</div></form></section>'}
function atlas(){const families=['Géométrie','Égyptien','Grec / romain','Chrétien','Hébraïque','Islamique','Hermétique','Astrologie / astronomie','Héraldique','Bestiaire','Végétal','Anatomie','Architecture','Eau / feu / terre / air','Chiffres / lettres','Autre'];return '<section class="panel"><div class="panel-header"><h2>Explorer toutes les familles</h2></div><div class="catalog-grid">'+families.map(x=>'<div class="catalog"><strong>'+escape(x)+'</strong><small>Classe d’inventaire, aucune occurrence présumée</small></div>').join('')+'</div></section>'}
function auditChecklist(){const checks=['Source primaire consultée et cote enregistrée','Époque du plan cohérente avec celle du monument','Point géographique et précision explicités','Symbolisme contextualisé par une source indépendante','Points et tolérances choisis avant le test','Contre-exemples et répétitions recherchés','Hasard et sélection a posteriori considérés','Fait / mesure / hypothèse clairement séparés'];return '<section class="panel"><h2>Checklist de contrôle</h2><p class="micro">Guide méthodologique, pas un résultat d’audit.</p>'+checks.map(x=>'<div class="proof-step"><b>○</b><span>'+escape(x)+'</span></div>').join('')+'</section>'}
function settings(){return '<section class="panel"><h2>Stockage & limites</h2><p>Les fiches sont enregistrées dans le stockage local de ce navigateur, sans connexion automatique à ELOAH, Google Drive, aux archives ni à ChatGPT. Les fichiers et photographies des pages de Thierry Van de Leur ne sont pas chargés automatiquement.</p><p>Le site est public : n’enregistre pas de documents confidentiels ni de données personnelles sensibles. L’export JSON permet une sauvegarde volontaire.</p><p>L’ouvrage <em>Parisis Code</em> est un corpus de recherche ; les fiches conservent des références et des analyses originales, pas une reproduction intégrale de textes protégés.</p><div class="record-controls"><button id="settingsExport">Exporter les fiches</button><button id="settingsChat">Méthode dans ChatGPT ↗</button></div></section>'}
function render(){
$('nav').innerHTML=views.map(v=>'<button type="button" class="'+(active===v.id?'active':'')+'" data-nav="'+v.id+'"><span>'+v.icon+'</span>'+v.title+'</button>').join('');
$('newRecord').hidden=!cfg[active];
let content=active==='overview'?overview():active==='settings'?settings():active==='symboles'?atlas()+layoutRecords():active==='align'?geometry()+layoutRecords():active==='audit'?auditChecklist()+layoutRecords():layoutRecords();
$('view').innerHTML=content;
const filter=$('statusFilter');if(filter)filter.onchange=()=>{const v=filter.value;document.querySelectorAll('#records .record').forEach(card=>{const id=card.querySelector('[data-edit]')?.dataset.edit;const rec=store[active].find(x=>x.id===id);card.hidden=!!v&&rec?.status!==v})};
const form=$('geoForm');if(form)form.onsubmit=calculate;
const saveGeo=$('saveGeometry');if(saveGeo)saveGeo.onclick=()=>{active='align';render();openEditor(null,{title:'Relevé géométrique à vérifier',claim:lastMeasured,status:'À vérifier',notes:'Calcul exploratoire ; valider coordonnées, emprises, sources et contre-tests.'})};
const li=$('legacyImport');if(li)li.onclick=importLegacy;
const sx=$('settingsExport');if(sx)sx.onclick=exportData;
const sc=$('settingsChat');if(sc)sc.onclick=()=>chat(null);
}
function search(){if(cfg[active])render()}
function chat(item){
const name=cfg[active]?.title||'Vue d’ensemble PARISIS ENGINE';
const obj=item?Object.entries(item).filter(([k,v])=>k!=='id'&&v).map(([k,v])=>k+' : '+String(v).slice(0,330)).join('\n'):'Aucun dossier sélectionné';
const context='PARISIS ENGINE — HUMANITIES LAB / HUM-002. Travaille avec les méthodes CLEFS, ALIGN, TOPONYM, BIOGRAPH, SYMBOL, CHRONOS, GEOMETRY, SOLAR, HISTORIA et AUDIT. SYMBOL ATLAS ouvert à toutes les familles de motifs. Corpus de référence : Parisis Code tome 1 de Thierry Van de Leur, pages progressivement transmises ; manuscrit 4Q529 traité séparément, sans lien avec Paris présumé. Distingue F0 fait documenté, F1 symbolisme attesté, F2 mesure reproductible, H hypothèse. Vérifie sources primaires, chronologies, plans anciens, précision des coordonnées, contre-exemples et effets du hasard. Ressemblance ≠ preuve ; alignement ≠ intention. Ne prétends jamais disposer de pages ou de coordonnées non fournies. Fournis une fiche datée avec sources vérifiables, objections et prochaine étape. Aucune action externe sans validation de Sonia.';
const q=context+'\n\nMODULE : '+name+'\nFICHE :\n'+obj+'\nLance l’analyse concrète de ce dossier.';
const a=document.createElement('a');a.href='https://chatgpt.com/?q='+encodeURIComponent(q.slice(0,4000));a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove()
}
function calculate(e){
e.preventDefault();
const f=new FormData(e.target);const read=l=>{const a=f.get('lat'+l),b=f.get('lon'+l);if(a===''||b==='')return null;const lat=Number(a),lon=Number(b);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordonnées invalides pour '+l);return {lat,lon}};
try{
const A=read('A'),B=read('B'),C=read('C');if(!A||!B)throw Error('Renseigne les deux premiers points.');
const rad=Math.PI/180,R=6371008.8;
const toR=x=>x*rad;const hav=(a,b)=>{const dlat=toR(b.lat-a.lat),dlon=toR(b.lon-a.lon),x=Math.sin(dlat/2)**2+Math.cos(toR(a.lat))*Math.cos(toR(b.lat))*Math.sin(dlon/2)**2;return 2*Math.atan2(Math.sqrt(x),Math.sqrt(Math.max(0,1-x)))};
const bearing=(a,b)=>{const la=toR(a.lat),lb=toR(b.lat),d=toR(b.lon-a.lon);return (Math.atan2(Math.sin(d)*Math.cos(lb),Math.cos(la)*Math.sin(lb)-Math.sin(la)*Math.cos(lb)*Math.cos(d))+2*Math.PI)%(2*Math.PI)};
const d=R*hav(A,B),angle=bearing(A,B);if(d<0.01)throw Error('A et B sont confondus.');let result='Distance géodésique A–B : '+(d/1000).toFixed(3)+' km ; azimut initial : '+(angle/rad).toFixed(2)+'°.';
if(C){const ac=hav(A,C),cross=Math.asin(Math.max(-1,Math.min(1,Math.sin(ac)*Math.sin(bearing(A,C)-angle))))*R;result+=' Distance transversale approximative de C au grand cercle A–B : '+Math.abs(cross).toFixed(1)+' m. Ce test ne démontre ni l’appartenance au segment, ni une intention.'}
lastMeasured=result+' Coordonnées : A='+A.lat+','+A.lon+' ; B='+B.lat+','+B.lon+(C?' ; C='+C.lat+','+C.lon:'')+'. Modèle sphérique indicatif ; précision et référentiel à documenter.';
$('geoResult').textContent=lastMeasured;
$('saveGeometry').disabled=false
}catch(err){$('geoResult').textContent='Calcul impossible : '+err.message;$('saveGeometry').disabled=true}
}
function exportData(){
const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({format:'eloah-parisis-v1',exported_at:new Date().toISOString(),modules:store},null,2)],{type:'application/json'}));
a.href=url;a.download='parisis-engine-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),900)
}
function importData(file){
file.text().then(s=>{const data=JSON.parse(s);if(data.format!=='eloah-parisis-v1'||!data.modules)throw Error('Sauvegarde non reconnue');if(!Object.keys(cfg).every(k=>Array.isArray(data.modules[k])))throw Error('Modules incomplets');for(const k of Object.keys(cfg))if(!data.modules[k].every(x=>x&&typeof x.id==='string'&&typeof x.title==='string'))throw Error('Fiches invalides');
if(!confirm('Remplacer les fiches locales PARISIS ENGINE par cette sauvegarde ? Exporte d’abord les données actuelles si nécessaire.'))return;
for(const k of Object.keys(cfg))store[k]=data.modules[k].map(x=>({...x}));save()
}).catch(e=>alert('Restauration impossible : '+e.message))
}
$('nav').onclick=e=>{const b=e.target.closest('[data-nav]');if(b&&views.some(v=>v.id===b.dataset.nav)){active=b.dataset.nav;$('globalSearch').value='';render()}};
$('view').onclick=e=>{const b=e.target.closest('button');if(!b)return;
if(b.dataset.nav){active=b.dataset.nav;render()}
else if(b.dataset.edit)openEditor(b.dataset.edit);
else if(b.dataset.delete){if(confirm('Supprimer cette fiche PARISIS ?')){store[active]=store[active].filter(x=>x.id!==b.dataset.delete);save()}}
else if(b.dataset.chat){const r=store[active].find(x=>x.id===b.dataset.chat);if(r)chat(r)}
else if(b.dataset.chatGlobal)chat(null);
};
$('newRecord').onclick=()=>openEditor(null);
$('askChat').onclick=()=>chat(null);
$('globalSearch').oninput=search;
$('closeEditor').onclick=()=> $('editor').close();
$('cancelEditor').onclick=()=> $('editor').close();
$('editForm').onsubmit=e=>{e.preventDefault();if(!cfg[active])return;const fields=Object.fromEntries(new FormData(e.target));fields.title=String(fields.title||'').trim();if(!fields.title)return;const old=store[active].find(x=>x.id===editing);if(old)Object.assign(old,fields);else store[active].unshift({...fields,id:crypto.randomUUID()});$('editor').close();save()};
$('export').onclick=exportData;
$('import').onclick=()=> $('importFile').click();
$('importFile').onchange=e=>{const file=e.target.files?.[0];if(file)importData(file);e.target.value=''};
render();
})();