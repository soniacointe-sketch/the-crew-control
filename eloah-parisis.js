(()=>{
'use strict';
const KEY='eloah-parisis-research-v1',SEEDKEY=KEY+'-seeded';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const views=[
{id:'overview',title:'Accueil · découvertes',icon:'⌂'},
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
const recoveredCorpus={"corpus":[["Photographie de *Parisis Code*, page 16 — Le code de la Bible","Thierry Van de Leur","p. 16","Photo du livre fournie par Sonia","Présentation d'affirmations sur les codes bibliques et Eliyahu Rips. Évaluer l'existence des textes et la validité statistique des interprétations."],["Photographie de *Parisis Code*, page 19 — anatomie et iconographie","Thierry Van de Leur","p. 19","Photo du livre fournie par Sonia","Comparaisons d'images de Michel-Ange et structures anatomiques. Distinguer ressemblance et intention de l'artiste."],["Photographie de *Parisis Code*, page 33 — Le Parisis Code","Thierry Van de Leur","p. 33","Photo du livre fournie par Sonia","L'auteur évoque ses recherches, Thierry Namur et From Hell, avec jalons de 2005 à 2007."],["Photographie de *Parisis Code*, page 43 — Mode d'emploi","Thierry Van de Leur","p. 43","Photo du livre fournie par Sonia","Exemple autour d'Abel Gance, Napoléon et de l'emplacement des rues ; séparer méthode de l'auteur et histoire vérifiée."],["Photographie du livre — Les clefs symboliques du code","Thierry Van de Leur","Pagination à relever","Photo du livre fournie par Sonia","Opéra Garnier, boulevard des Capucines, boulevard des Italiens, avenue de l'Opéra, photographies aériennes. Numéro de page à confirmer."],["Photographie du livre — Localiser une adresse dans Paris","Thierry Van de Leur","Pagination à relever","Photo du livre fournie par Sonia","Arc de Triomphe, tour Eiffel, Palais de la Légion d'honneur, Louvre et carte Michelin n°55. Numéro de page à confirmer."],["Photographie du livre — Rue Abel Gance / Trocadéro","Thierry Van de Leur","Pagination à relever","Photo du livre fournie par Sonia","Rue Abel Gance, Invalides, Musée du Cinéma, Palais de Chaillot ; relevé et datation à faire."],["Dossier manuscrit araméen 4Q529 — Paroles de Michel","Émile Puech / Michaël Langlois / chercheurs modernes","4Q529 fragments ; pages bibliographiques à vérifier","RAPPORT_ARC001_4Q529.md et registre de preuves CSV, fichiers antérieurs","Grotte 4 de Qumrân, Michel, trois fragments dans une édition numérique ; relation 4Q571 à étudier ; 6Q23 attribution prudente ; aucun lien prouvé avec Paris."],["PARISIS ENGINE V4 — ancien état du moteur","Projet de recherche antérieur","V4, archive HTML","PARISIS_ENGINE_V4.html — fichier retrouvé dans la bibliothèque","Archive avec 8 lieux, 10 sources, 7 fiches de résultat ; importer les informations selon leur niveau de preuve. Ne pas confondre inventaire d'archive avec vérification indépendante."]],"lieux":[["Sainte-Chapelle","Paris","Chapelle / reliques","Référence institutionnelle Centre des monuments nationaux","Acquisition de la Couronne d'épines par Louis IX en 1239 et fonction reliquaire ; hypothèses d'alignement distinctes."],["Tour Saint-Jacques","Paris","Monument","PARISIS ENGINE V4, coordonnées indicatives seulement","Étudier son histoire et ses transformations avant calcul d'axe."],["Petit Palais","Paris","Monument / iconographie","Ancien test Toison d'Or / Jason, sources à recouper","Œuvres liées à Jason : point candidat à mesurer avec Orsay et Cluny sans supposer intention."],["Musée d'Orsay","Paris","Musée / iconographie","Ancien test Jason / Médée, sources à recouper","Candidat de l'analyse Toison d'Or ; écarts calculés antérieurement dépendent de la définition des points."],["Musée de Cluny","Paris","Musée / iconographie","Ancien test Toison d'Or, relation iconographique non confirmée","Troisième point candidat ; ne pas valider la piste avant documentation."]],"align":[["Toison d'Or — Petit Palais / Orsay / Cluny","Petit Palais – Musée d'Orsay – Musée de Cluny","Anciens tests géographiques ; coordonnées à retrouver","Tests antérieurs mentionnent des écarts variables selon les positions choisies : environ 17 m dans une configuration et d'autres résultats dans d'autres calculs ; mesure à reproduire, aucune intention démontrée."],["Rue Abel Gance et repères de Paris","Rue Abel Gance / Invalides / Trocadéro / lieux de cinéma","Parisis Code page 43 et photographie sans page identifiée","Chaîne de références présentée par l'auteur ; contrôler les lieux, l'histoire des noms et les dates."]],"preuves":[["4Q529, fragment 1 — argent et or","H - Hypothèse","Rapport ARC001 et édition scientifique à vérifier","Thème textuel attesté dans les éditions ; rapprochement avec la Toison d'Or ou Paris non établi."],["Toison d'Or et monuments parisiens","H - Hypothèse","Tests PARISIS antérieurs, œuvres Jason/Médée","Présence d'iconographie ≠ implantation volontaire selon un motif secret."],["Code biblique, page 16","H - Hypothèse","Parisis Code tome 1, p. 16","Présence de l'argument chez l'auteur ; efficacité des prédictions et significations cryptographiques non établie ici."],["Opéra Garnier et clef principale","H - Hypothèse","Parisis Code, photographie Les clefs symboliques du code","L'auteur présente Garnier comme pivot ; intention codée indépendante non démontrée."],["Sainte-Chapelle, reliques de la Passion","F0 - Fait attesté","Centre des monuments nationaux — source à consulter","Fonction reliquaire documentée. Aucun réseau caché démontré."],["Inauguration du Palais Garnier, 1875","F0 - Fait attesté","Opéra national de Paris — archives institutionnelles","Date du 5 janvier 1875 signalée et sourcée dans l'archive V4, à recouper au besoin."]],"sources":[["Archive PARISIS ENGINE V4","Dossier de travail interne","2026","Archive HTML V4","","Archive importable en lecture et à rapprocher des nouvelles fiches."],["ARC001 registre de preuves — 4Q529","Dossier scientifique interne","2026","CSV, références C01…","","Distingue notice institutionnelle, édition numérique, analyses et hypothèses."],["RAPPORT ARC001 — 4Q529","Dossier scientifique interne","2026","Rapport Markdown","","Détaille fragments et limites de la collation ; une partie non réévaluée directement."],["Puech — 4Q529, DJD XXXI","Émile Puech","2001","DJD XXXI, p. 1–8","","Édition scientifique à consulter pour justifier les lectures."],["La Bibliothèque de Qumrân — 4Q529","Michaël Langlois et coll.","2008","Tome 1, p. 245–248","","Edition française du manuscrit, pages à consulter."],["Manuscrits de la mer Morte — Archive IAA","Israel Antiquities Authority","","4Q529-1","https://www.deadseascrolls.org.il/explore-the-archive/manuscript/4Q529-1","Cote documentaire et images institutionnelles à examiner."],["Histoire de la Sainte-Chapelle","Centre des monuments nationaux","","Notice historique","https://www.sainte-chapelle.fr/decouvrir/histoire-de-la-sainte-chapelle","Source institutionnelle figurant dans PARISIS ENGINE V4."],["Élément décoratif pomme de pin, Garnier","Ministère de la Culture — POP","","MAT0002108","https://pop.culture.gouv.fr/notice/palissy/MAT0002108","Notice patrimoniale : motif documenté, interprétation cachée non établie."]],"audit":[["Revoir photos Parisis Code, pages identifiées","Répertorier p.16, 19, 33, 43 et photos non paginées ; contrôler les légendes et rétablir l'ordre."],["Reproduire les calculs Toison d'Or","Repérer les emprises exactes, unités, coordonnées datées, écarts et valeurs contradictoires."],["Contrôler bibliographie de 4Q529","Distinguer Puech 2001, Langlois 2008, édition numérique 2026 et hypothèses 4Q571 / 6Q23."],["Séparer Paris et Qumrân","Ne pas transformer un écho lexical (argent/or, ville, montagne) en lien historique sans preuve."],["Vérifier pages photographiées du livre","Les pages non lisibles ou non numérotées ne doivent pas être affectées à une page fictive."]]};
function seedRecoveredCorpus(){
 const marker=KEY+'-recovered-20261012-v1';if(localStorage.getItem(marker))return;
 let count=0;
 for(const [module,rows] of Object.entries(recoveredCorpus)){
  const ids=new Set(store[module].map(x=>x.id));
  rows.forEach((a,i)=>{
   const id='recovered-'+module+'-'+i;if(ids.has(id))return;
   let r={id,title:a[0],status:'À vérifier',notes:'Dossier retrouvé dans les travaux antérieurs. Sources originales et validation à contrôler.'};
   if(module==='corpus')Object.assign(r,{author:a[1],pages:a[2],reference:a[3],claim:a[4]});
   if(module==='lieux')Object.assign(r,{place:a[1],type:a[2],reference:a[3],claim:a[4]});
   if(module==='align')Object.assign(r,{place:a[1],reference:a[2],claim:a[3]});
   if(module==='preuves')Object.assign(r,{level:a[1],reference:a[2],claim:a[3],status:a[1].startsWith('H')?'Non démontré':'À vérifier'});
   if(module==='sources')Object.assign(r,{author:a[1],date:a[2],pages:a[3],url:a[4],notes:a[5],status:'À vérifier'});
   if(module==='audit')Object.assign(r,{claim:a[1],status:'À faire'});
   store[module].push(r);count++;
  });
 }
 try{localStorage.setItem(KEY,JSON.stringify(store));localStorage.setItem(marker,'1')}catch(e){console.warn('Registre retrouvé non enregistré',e)}
}
seedRecoveredCorpus();
const v4Reference={"places":[["Palais Garnier","48.8719, 2.3316","Inauguration 5 janvier 1875"],["Notre-Dame de Paris","48.8530, 2.3499","Cathédrale, île de la Cité"],["Sainte-Chapelle","48.8554, 2.3450","Chapelle des reliques de la Passion"],["Musée du Louvre","48.8606, 2.3376","Ancien palais et musée"],["Arc de Triomphe","48.8738, 2.2950","Place Charles-de-Gaulle"],["Tour Eiffel","48.8584, 2.2945","Champ-de-Mars"],["Tour Saint-Jacques","48.8581, 2.3488","Vestige religieux"],["Cimetière du Père-Lachaise","48.8614, 2.3933","Site funéraire"]],"sources":[["Référentiel archéologique de Paris (R&CAP)","Ville de Paris","https://opendata.paris.fr/explore/dataset/referentiel-archeologique-de-paris/"],["Plaques commémoratives","Ville de Paris","https://opendata.paris.fr/explore/dataset/plaques_commemoratives/table/"],["Bâtiments patrimoniaux protégés","Ville de Paris","https://opendata.paris.fr/explore/dataset/plub_surf_pvp/"],["Biens inscrits au patrimoine mondial","Ville de Paris","https://opendata.paris.fr/explore/dataset/plu-annexes-biens-inscrits-au-patrimoine-mondial/"],["Commission du Vieux Paris","Ville de Paris","https://opendata.paris.fr/explore/dataset/commission-du-vieux-paris-adresses-instruites/"],["L’Opéra au XIXe siècle","Opéra national de Paris","https://www.operadeparis.fr/apropos/histoire/lopera-au-19e-siecle"],["Pomme de pin — MAT0002108","Ministère de la Culture POP","https://pop.culture.gouv.fr/notice/palissy/MAT0002108"],["Histoire de la Sainte-Chapelle","Centre des monuments nationaux","https://www.sainte-chapelle.fr/decouvrir/histoire-de-la-sainte-chapelle"],["Grand Armorial équestre de la Toison d’Or — Arsenal 4790","Bibliothèque nationale de France","https://expositions.bnf.fr/livres/armorial/grand/ars_4790_149v.htm"],["Histoire de l’ordre de la Toison d’Or","Bibliothèque nationale de France / Gallica","https://gallica.bnf.fr/ark:/12148/bpt6k122996c"]],"findings":[["Inauguration du Palais Garnier — 5 janvier 1875","F0 - Fait attesté","Date présentée comme documentée par le site de l’Opéra ; ne démontre aucun alignement."],["Sainte-Chapelle et Couronne d’épines","F0 - Fait attesté","Louis IX et l’acquisition de la Couronne en 1239 ; fonction reliquaire ; pas de réseau secret démontré."],["Pomme de pin décorative au Palais Garnier","F1 - Sens documenté","Notice patrimoniale MAT0002108 à consulter ; fonction initiatique non démontrée."],["Toison d’Or — armorial de Philippe le Bon","F0 - Fait attesté","Ms Arsenal 4790 et ordre fondé en 1430 ; ne démontre pas de tracé parisien."],["R&CAP — source archéologique à explorer","H - Hypothèse","Jeu de données officiel repéré ; dépouillement systématique encore à réaliser."],["Ânkh dans les formes de Garnier ?","H - Hypothèse","Piste de ressemblance issue des recherches, sans intention attestée ni géométrie reproductible."],["Réseau d’alignements parisiens ?","H - Hypothèse","Tester avec points et tolérances prédéfinis et simulations d’hypothèse nulle."]]};
function seedV4Archive(){const marker=KEY+"-v4-archive-v1";if(localStorage.getItem(marker))return;const add=(module,row)=>{if(!store[module].some(x=>x.id===row.id))store[module].push(row)};v4Reference.places.forEach((a,i)=>add("lieux",{id:"v4-place-"+i,title:a[0],place:a[1],type:"Monument",reference:"PARISIS ENGINE V4 — archive antérieure, WGS84 indicatif ≈100 m",claim:a[2],status:"À vérifier",notes:"Coordonnées uniquement indicatives ; les points exacts doivent être mesurés avant analyse."}));v4Reference.sources.forEach((a,i)=>add("sources",{id:"v4-source-"+i,title:a[0],author:a[1],url:a[2],pages:"Archive V4",status:"À vérifier",notes:"URL et référence issues de l’archive de recherche ; disponibilité et contenu à recontrôler."}));v4Reference.findings.forEach((a,i)=>add("preuves",{id:"v4-finding-"+i,title:a[0],level:a[1],reference:"PARISIS ENGINE V4 — résultat archivé",claim:a[2],status:a[1].startsWith("H")?"Non démontré":"À vérifier",notes:"Niveau de preuve reconstruit depuis V4 ; pas de nouvelle vérification indépendante."}));try{localStorage.setItem(KEY,JSON.stringify(store));localStorage.setItem(marker,"1")}catch(e){console.warn("Archive non sauvegardée",e)}}
seedV4Archive();
const researchCrossIndex={"corpus":[["Atlas Archange Michel — dossier HUM-003","Corpus transversal de Michel, iconographie, textes anciens et lieux ; séparer les traditions historiques, les manuscrits et les rapprochements modernes."],["Toison d’Or — dossier d’étude","Analyse croisée des œuvres Jason / Médée, de la fondation de l’ordre en 1430 et de sites parisiens ; aucun réseau intentionnel établi."],["Pentateuque et lecture comparée des textes","Dossier de questions sur la Torah et les traditions textuelles ; examiner textes et contextes historiques avant interprétations symboliques."],["Nouvelle Jérusalem — sources et iconographie","Comparer textes, plans, représentations et traditions, sans projet parisien présumé."]],"symboles":[["Archange Michel — iconographie","Chrétien","Comparer l’épée, la balance, le dragon, les lieux et les périodes ; ne pas attribuer une signification unique à toutes les représentations."],["Toison d’Or — symboles distincts","Héraldique","Distinguer Jason et Médée, ordre bourguignon, armoriaux et usages postérieurs."],["Pomme de pin","Végétal","Notice POP rattachée à Garnier ; sens du motif à contextualiser historiquement."],["Nouvelle Jérusalem","Architecture","Distinguer texte religieux, représentation iconographique et hypothèse cartographique."]],"toponym":[["Rue Abel Gance — chaîne cinéma / Napoléon","La méthode présentée dans Parisis Code doit être comparée aux délibérations municipales et aux dates de dénomination."],["Thierry Namur et piste From Hell","Généalogie intellectuelle présentée dans Parisis Code p.33 ; vérifier livres, auteurs, publications et dates."],["René Boyvin — rue du Temple vers 1562","Ancienne piste sur gravures et atelier parisien. Adresse et datation à contrôler dans les notices d’estampes."]],"chronos":[["Ordre de la Toison d’Or — 1430","Chronologie historique institutionnelle distincte des monuments bâtis au XIXe siècle."],["Palais Garnier — 5 janvier 1875","Date d’inauguration, point chronologique seulement."],["Sainte-Chapelle — 1239","Acquisition de la Couronne d’épines par Louis IX ; ne détermine aucun axe cartographique."],["Monuments aux morts d’Orchies — 1899 / 1922 / 1951","Dossier local hors Paris, à géolocaliser et dater séparément avant toute interprétation."]],"audit":[["Test Toison d’Or — différents écarts calculés","Un ancien calcul mentionne ~17 m, d’autres mesures environ 27 m ou 3,7 m ; l’écart dépend des coordonnées. Réexécuter avant tout verdict."],["4Q529 — relations textuelles avec 4Q571 et 6Q23","4Q571 dispose d’un chevauchement rapporté ; 6Q23 reste une attribution à traiter prudemment. Aucun lien spatial avec Paris."],["Orchies : monuments aux morts","Ne pas confondre dates et usages des monuments 1899, 1922 et 1951 ; interprétation « passage/mémoire » reste symbolique."],["Contrôle des noms anciens et des étymologies","Ne pas déduire un sens du découpage phonétique d’un toponyme sans étymologie documentée."]]};
function seedCrossIndex(){const mark=KEY+"-cross-index-v1";if(localStorage.getItem(mark))return;for(const [module,rows] of Object.entries(researchCrossIndex)){rows.forEach((x,i)=>{const id="cross-"+module+"-"+i;if(store[module].some(y=>y.id===id))return;const r={id,title:x[0],status:module==="audit"?"À faire":"À vérifier",notes:"Recherche antérieure retrouvée ; sources et affirmations à recouper."};if(module==="corpus")Object.assign(r,{author:"Recherche PARISIS ENGINE antérieure",pages:"Dossier à localiser",claim:x[1]});if(module==="symboles")Object.assign(r,{family:x[1],claim:x[2]});if(module==="toponym")Object.assign(r,{place:"Lieu ou archive à vérifier",claim:x[1]});if(module==="chronos")Object.assign(r,{date:"Chronologie dans le titre",claim:x[1]});if(module==="audit")r.claim=x[1];store[module].push(r)})}try{localStorage.setItem(KEY,JSON.stringify(store));localStorage.setItem(mark,"1")}catch(e){console.warn("Index transversal non enregistré",e)}}
seedCrossIndex();
// Corpus ALPHA-001 — recherche Jésus enfant, Alpha/Aleph, lettres et création.
// Les fiches sont ajoutées sans écraser les données enregistrées par Sonia dans le navigateur.
const alphaResearch20261012={
  "corpus": [
    {
      "id": "alpha-001-jesus-enfant",
      "title": "ALPHA-001 · Jésus enfant, Alpha et Aleph — dossier maître",
      "author": "HUMANITIES LAB · PARISIS ENGINE",
      "pages": "Luc 2,41-52 ; Évangile de l’enfance selon Thomas, épisode du maître Zachée ; Irénée, Contre les hérésies I,20",
      "reference": "https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-aleph-lettres-creation.md",
      "claim": "Comparer la parole de Jésus à 12 ans dans Luc aux épisodes apocryphes de l’enfance et à la question : « si tu ignores la nature de l’alpha, comment enseigner le bêta ? ». Attestation littéraire ≠ parole historiquement prononcée.",
      "status": "Source trouvée",
      "notes": "Dossier de référence : corpus/parisis-alpha-aleph-lettres-creation.md. Les variations manuscrites et traductions seront contrôlées édition par édition."
    },
    {
      "id": "alpha-001-papyrus",
      "title": "ALPHA-001A · P.Hamb.Graec. 1011 — oiseaux d’argile",
      "author": "Lajos Berkes et Gabriel Nocchi Macedo",
      "pages": "ZPE 229 (2024), p. 68–74 ; papyrus IVe–Ve siècle",
      "reference": "https://orbi.uliege.be/handle/2268/311682",
      "claim": "Le plus ancien témoin manuscrit actuellement connu de l’Évangile de l’enfance selon Thomas conserve une partie de l’épisode des oiseaux d’argile. Ce n’est pas un témoignage contemporain de Jésus.",
      "status": "Source trouvée",
      "notes": "Distinguer les lettres visibles sur le fragment de la reconstitution éditoriale par comparaison avec d’autres témoins."
    },
    {
      "id": "alpha-001-bereshit",
      "title": "ALPHA-001B · Aleph, Beth et Bereshit",
      "author": "Genèse 1,1 ; Exode 20,2 ; Bereshit Rabbah 1,10",
      "pages": "Bereshit Rabbah 1,10",
      "reference": "https://www.sefaria.org/Bereshit_Rabbah.1.10",
      "claim": "La Genèse commence par Beth (ב), dans Bereshit. Le Midrash associe Beth à berakhah (bénédiction) et fait parler Aleph jusqu’à l’ouverture du Décalogue par Anokhi.",
      "status": "Source trouvée",
      "notes": "Récit rabbinique interprétatif rédigé après l’époque de Jésus ; ne pas y lire une étymologie universelle ni un enseignement de Jésus."
    },
    {
      "id": "alpha-001-shabbat104",
      "title": "ALPHA-001C · Les enfants et les lettres — Shabbat 104a",
      "author": "Talmud de Babylone",
      "pages": "Shabbat 104a",
      "reference": "https://www.sefaria.org/Shabbat.104a",
      "claim": "De jeunes élèves interprètent Aleph-Beth comme l’apprentissage de la sagesse et Guimel-Daleth comme l’aide aux pauvres, expliquée par la forme des lettres.",
      "status": "Source trouvée",
      "notes": "Parallèle thématique avec l’enfant savant des apocryphes ; ne pas affirmer de filiation textuelle sans étude chronologique."
    },
    {
      "id": "alpha-001-seferyetsirah",
      "title": "ALPHA-001D · Sefer Yetsirah — 22 lettres et trois mères",
      "author": "Sefer Yetsirah — versions textuelles diverses",
      "pages": "Chapitres 1–3, en particulier 2,1–4 et 3,3",
      "reference": "https://www.sefaria.org/Sefer_Yetzirah.2.1",
      "claim": "Le texte organise vingt-deux lettres en trois mères (א מ ש), sept doubles et douze simples ; associe les mères à air, eau, feu ; évoque 231 portes et dix sefirot / 32 voies.",
      "status": "Source trouvée",
      "notes": "Datation et variantes débattues ; ne pas attribuer ce texte à Jésus. Distinguer les sefirot ici des systèmes kabbalistiques médiévaux."
    },
    {
      "id": "alpha-001-comparaisons",
      "title": "ALPHA-001E · Textes comparés — Verbe, création et Coran",
      "author": "Jean 1,1 ; Apocalypse 22,13 ; Coran 19,29–33 et 3,49",
      "pages": "Passages comparés",
      "reference": "https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-aleph-lettres-creation.md",
      "claim": "Comparer le Logos, Alpha et Oméga, Jésus nourrisson parlant et l’oiseau d’argile, dans leurs cadres théologiques distincts.",
      "status": "À vérifier",
      "notes": "Ressemblance de motifs ≠ démonstration d’emprunt ni événement historique prouvé."
    }
  ],
  "symboles": [
    {
      "id": "alpha-001-symbol-aleph",
      "title": "ALPHA-001 · Aleph / Alpha",
      "family": "Chiffres / lettres",
      "place": "Alphabets sémitiques, phénicien, hébreu, grec",
      "reference": "Évolution alphabétique ; Genèse 1,1 ; Exode 20,2 ; Bereshit Rabbah 1,10",
      "claim": "Aleph (א) et Alpha (Α) sont historiquement apparentés par transmission alphabétique. La valeur 1 et les lectures de l’unité ou du commencement relèvent de contextes distincts.",
      "status": "Documenté",
      "notes": "Ne pas inférer un code d’urbanisme parisien à partir de la seule ressemblance."
    },
    {
      "id": "alpha-001-symbol-beth",
      "title": "ALPHA-001 · Beth — lettre et maison",
      "family": "Chiffres / lettres",
      "place": "Genèse 1,1 ; tradition rabbinique",
      "reference": "https://www.sefaria.org/Bereshit_Rabbah.1.10",
      "claim": "Beth (ב), seconde lettre et valeur 2 ; ouvre Bereshit. Son association étymologique à la maison et sa lecture comme bénédiction sont à distinguer.",
      "status": "Documenté",
      "notes": "L’interprétation de la forme de Beth dans le Midrash n’est pas un sens linguistique obligatoire."
    },
    {
      "id": "alpha-001-symbol-gimel-dalet",
      "title": "ALPHA-001 · Guimel et Daleth",
      "family": "Chiffres / lettres",
      "place": "Talmud de Babylone Shabbat 104a",
      "reference": "https://www.sefaria.org/Shabbat.104a",
      "claim": "Guimel (ג) et Daleth (ד), valeurs 3 et 4 ; lecture morale de leurs formes : donner et préserver la dignité de la personne aidée.",
      "status": "Documenté",
      "notes": "Exégèse rabbinique datée, et non code graphique universel."
    },
    {
      "id": "alpha-001-symbol-mothers",
      "title": "ALPHA-001 · Trois lettres mères אמש",
      "family": "Chiffres / lettres",
      "place": "Sefer Yetsirah, chapitre 3",
      "reference": "https://www.sefaria.org/Sefer_Yetzirah.3.3",
      "claim": "Aleph א = air/souffle ; Mem מ = eau ; Shin ש = feu. Cosmologie symbolique avec équilibre entre opposés.",
      "status": "Documenté",
      "notes": "Les correspondances dépendent des versions et traductions ; pas une théorie physique."
    },
    {
      "id": "alpha-001-symbol-231",
      "title": "ALPHA-001 · Roue des 231 portes",
      "family": "Géométrie",
      "place": "Sefer Yetsirah 2,4",
      "reference": "https://www.sefaria.org/Sefer_Yetzirah.2.4",
      "claim": "22 lettres combinées en paires distinctes : 22 × 21 ÷ 2 = 231 ; modèle combinatoire de l’alphabet.",
      "status": "Documenté",
      "notes": "Aucun lien mesuré avec un plan de Paris ; toute transposition est à tester, sans présumer d’intention."
    }
  ],
  "sources": [
    {
      "id": "alpha-001-src-burke",
      "title": "Évangile de l’enfance selon Thomas — traduction critique",
      "author": "Tony Burke, spécialiste du christianisme ancien",
      "date": "Traduction moderne ; œuvre apocryphe généralement située au IIe siècle",
      "pages": "Épisode de l’enseignant Zachée / Alpha-Bêta",
      "url": "https://www.tonyburke.ca/infancy-gospel-of-thomas/the-childhood-of-the-saviour-infancy-gospel-of-thomas-a-new-translation/",
      "status": "Consulté",
      "notes": "Comparer les versions ; la traduction critique reconstitue un état ancien et ne garantit pas l’historicité du récit."
    },
    {
      "id": "alpha-001-src-irenaeus",
      "title": "Contre les hérésies I,20 — le maître et Alpha",
      "author": "Irénée de Lyon",
      "date": "Fin du IIe siècle",
      "pages": "Livre I, chapitre 20, paragraphe 1",
      "url": "https://www.newadvent.org/fathers/0103120.htm",
      "status": "Consulté",
      "notes": "Témoignage ancien et critique d’un récit utilisé dans certains milieux. Son auteur n’approuve pas la lecture symbolique qu’il rapporte."
    },
    {
      "id": "alpha-001-src-hamburg",
      "title": "Papyrus P.Hamb.Graec. 1011 — édition scientifique",
      "author": "Lajos Berkes ; Gabriel Nocchi Macedo",
      "date": "2024 ; manuscrit IVe–Ve siècle",
      "pages": "Zeitschrift für Papyrologie und Epigraphik 229, p. 68–74",
      "url": "https://orbi.uliege.be/handle/2268/311682",
      "status": "Consulté",
      "notes": "Premier témoin papyrologique connu ; épisode des oiseaux d’argile ; compléter avec examen de l’édition et de la photographie."
    },
    {
      "id": "alpha-001-src-bereshit",
      "title": "Bereshit Rabbah 1,10 — Beth et Aleph",
      "author": "Tradition rabbinique",
      "date": "Compilation antique tardive",
      "pages": "Bereshit Rabbah 1,10",
      "url": "https://www.sefaria.org/Bereshit_Rabbah.1.10",
      "status": "Consulté",
      "notes": "Midrash sur bénédiction, malédiction, forme de Beth et protestation d’Aleph jusqu’au Sinaï."
    },
    {
      "id": "alpha-001-src-shabbat",
      "title": "Shabbat 104a — interprétation des lettres par les enfants",
      "author": "Talmud de Babylone",
      "date": "Compilation tardo-antique",
      "pages": "Shabbat 104a",
      "url": "https://www.sefaria.org/Shabbat.104a",
      "status": "Consulté",
      "notes": "Aleph-Beth apprendre, Guimel-Daleth donner ; morale de la discrétion."
    },
    {
      "id": "alpha-001-src-yetsirah",
      "title": "Sefer Yetsirah — vingt-deux lettres et 231 portes",
      "author": "Sefer Yetsirah — auteur et datation débattus",
      "date": "Datation disputée",
      "pages": "2,1–4 ; 3,3",
      "url": "https://www.sefaria.org/Sefer_Yetzirah.2.1",
      "status": "Consulté",
      "notes": "Vérifier les variantes des traductions ; ne pas assimiler sans nuance les dix sefirot aux représentations kabbalistiques ultérieures."
    },
    {
      "id": "alpha-001-src-luc",
      "title": "Luc 2,41–52 — Jésus à douze ans",
      "author": "Évangile selon Luc",
      "date": "Texte chrétien du Ier siècle",
      "pages": "2,41–52",
      "url": "",
      "status": "À vérifier",
      "notes": "Parole canonique de Jésus au Temple ; distincte des apocryphes."
    },
    {
      "id": "alpha-001-src-cross",
      "title": "Textes comparés — Jean, Apocalypse et Coran",
      "author": "Jean ; Apocalypse ; Coran",
      "date": "Textes d’époques distinctes",
      "pages": "Jean 1,1 ; Apocalypse 22,13 ; Coran 19,29–33 et 3,49",
      "url": "",
      "status": "À vérifier",
      "notes": "Comparaison intertextuelle ; respecter les divergences théologiques."
    }
  ],
  "preuves": [
    {
      "id": "alpha-001-prf-attestation",
      "title": "ALPHA-001 · Le récit Alpha/Bêta était connu au IIe siècle",
      "level": "F0 - Fait attesté",
      "reference": "Irénée, Contre les hérésies I,20,1 ; https://www.newadvent.org/fathers/0103120.htm",
      "claim": "Irénée cite la scène d’enseignement de l’Alpha à Jésus enfant et sa lecture par d’autres groupes.",
      "status": "Corroboré",
      "notes": "Établit la circulation du motif au IIe siècle, non la véracité des paroles attribuées à Jésus."
    },
    {
      "id": "alpha-001-prf-22",
      "title": "ALPHA-001 · 22 lettres, 3 mères, 7 doubles, 12 simples",
      "level": "F0 - Fait attesté",
      "reference": "Sefer Yetsirah 2,1 ; https://www.sefaria.org/Sefer_Yetzirah.2.1",
      "claim": "Cette classification apparaît dans le texte transmis du Sefer Yetsirah.",
      "status": "Corroboré",
      "notes": "Fait textuel, pas description scientifique du monde."
    },
    {
      "id": "alpha-001-prf-mothers",
      "title": "ALPHA-001 · Air, eau et feu : symbolisme des lettres",
      "level": "F1 - Sens documenté",
      "reference": "Sefer Yetsirah 3,3 ; https://www.sefaria.org/Sefer_Yetzirah.3.3",
      "claim": "Les lettres mères sont associées aux trois éléments dans la cosmologie du texte.",
      "status": "Corroboré",
      "notes": "Symbolisme religieux documenté, pas vérité physique."
    },
    {
      "id": "alpha-001-prf-hypothesis",
      "title": "ALPHA-001 · Jésus connaissait Sefer Yetsirah",
      "level": "H - Hypothèse",
      "reference": "Comparaison moderne de textes de datation différente",
      "claim": "Aucun témoignage ancien ne démontre que Jésus ait connu ce traité.",
      "status": "Non démontré",
      "notes": "Ne pas présenter comme fait. La datation du Sefer Yetsirah est disputée et des formes transmises sont postérieures."
    },
    {
      "id": "alpha-001-prf-paris",
      "title": "ALPHA-001 · Lettres cachées dans le plan de Paris",
      "level": "H - Hypothèse",
      "reference": "SYMBOL ATLAS / module géométrie — aucun relevé fourni",
      "claim": "Aucune correspondance topographique intentionnelle n’est établie entre ces lettres et Paris.",
      "status": "Non démontré",
      "notes": "Ne créer aucune cartographie ni prédiction de tracés sans critères fixés à l’avance, coordonnées et contre-tests."
    },
    {
      "id": "alpha-001-prf-historical",
      "title": "ALPHA-001 · Paroles historiques de Jésus à cinq ans",
      "level": "H - Hypothèse",
      "reference": "Évangile de l’enfance selon Thomas ; papyrus P.Hamb.Graec. 1011",
      "claim": "Les textes attestent des récits et leur transmission, mais ne prouvent pas que ces épisodes ont eu lieu.",
      "status": "Non démontré",
      "notes": "Ne jamais confondre datation d’un manuscrit et datation d’un événement raconté."
    }
  ],
  "audit": [
    {
      "id": "alpha-001-audit-textes",
      "title": "ALPHA-001 · Comparer les versions grecques et anciennes",
      "reference": "Tony Burke ; témoins grec, syriaque, latin et éthiopien",
      "claim": "Relever ce que chaque version dit de la lettre Alpha et du maître Zachée ; identifier les variantes et les passages reconstruits.",
      "status": "À faire",
      "notes": "Documenter la leçon exacte, sa traduction et la cote du manuscrit pour chaque citation."
    },
    {
      "id": "alpha-001-audit-dates",
      "title": "ALPHA-001 · Chronologie et transmission des sources",
      "reference": "Irénée IIe siècle ; P.Hamb.Graec. 1011 IVe–Ve ; tradition rabbinique et Sefer Yetsirah",
      "claim": "Établir les terminus et la datation des versions, sans imaginer un enseignement commun antérieur à toutes.",
      "status": "À faire",
      "notes": "Conserver datation proposée, incertitudes, langues et familles de manuscrits."
    },
    {
      "id": "alpha-001-audit-symboles",
      "title": "ALPHA-001 · Contrôle des rapprochements symboliques",
      "reference": "HUMANITIES LAB / SYMBOL ATLAS",
      "claim": "Séparer parenté alphabétique, commentaire exégétique, analogie iconographique et hypothèse d’intention.",
      "status": "À faire",
      "notes": "Aucune « preuve » tirée d’une simple ressemblance de formes ou de chiffres."
    }
  ],
  "chronos": [
    {
      "id": "alpha-001-chronos-irenee",
      "title": "ALPHA-001 · Irénée et le récit Alpha-Bêta",
      "date": "Fin du IIe siècle",
      "reference": "Contre les hérésies I,20",
      "claim": "Témoignage littéraire ancien ; atteste la circulation d’un motif, sans attester l’événement.",
      "status": "Documenté",
      "notes": "Chronologie de rédaction approximative ; contrôle par édition critique à poursuivre."
    },
    {
      "id": "alpha-001-chronos-papyrus",
      "title": "ALPHA-001 · Plus ancien papyrus conservé de l’Enfance selon Thomas",
      "date": "IVe–Ve siècle ; identifié et publié en 2024",
      "reference": "Berkes & Nocchi Macedo, ZPE 229 (2024), 68–74",
      "claim": "P.Hamb.Graec. 1011 : tradition manuscrite des oiseaux d’argile.",
      "status": "Documenté",
      "notes": "Date du support, pas date du récit."
    }
  ]
};
function seedAlphaResearch20261012(){
 const marker=KEY+'-alpha-001-20261012-v1';
 if(localStorage.getItem(marker))return;
 for(const [module,rows] of Object.entries(alphaResearch20261012)){
  if(!Array.isArray(store[module]))continue;
  const present=new Set(store[module].map(item=>item.id));
  for(const row of rows)if(!present.has(row.id))store[module].push({...row});
 }
 try{localStorage.setItem(KEY,JSON.stringify(store));localStorage.setItem(marker,'1')}
 catch(e){console.warn('ALPHA-001 non persisté dans ce navigateur',e)}
}
seedAlphaResearch20261012();
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
const pagedCorpus=[{"page":"16","heading":"Le code de la Bible","claim":"Présentation des affirmations relatives à Eliyahu Rips, la Torah et aux codes bibliques.","places":[],"symbols":["lettres hébraïques","codage biblique"],"checks":"Retrouver étude citée, protocole statistique et objections.","ref":"Photo de page, bibliothèque personnelle, p.16"},{"page":"19","heading":"Analogies anatomiques","claim":"Comparaisons proposées entre détails d'œuvres de Michel-Ange et formes anatomiques.","places":[],"symbols":["anatomie","iconographie"],"checks":"Documenter l'œuvre et la datation, comparer hypothèses concurrentes.","ref":"Photo de page, bibliothèque personnelle, p.19"},{"page":"33","heading":"Le Parisis Code","claim":"Présentation du parcours de recherche de l'auteur et références à Thierry Namur et From Hell.","places":["Paris"],"symbols":["méthodologie"],"checks":"Vérifier dates, références bibliographiques et citations.","ref":"Photo de page, bibliothèque personnelle, p.33"},{"page":"43","heading":"Mode d'emploi du Parisis Code","claim":"Exemple utilisant Abel Gance, Napoléon et une dénomination de rue.","places":["rue Abel Gance","Paris"],"symbols":["toponymie"],"checks":"Comparer dates, emplacement réel, délibérations et plan d'époque.","ref":"Photo de page, bibliothèque personnelle, p.43"},{"page":"à identifier A","heading":"Les clefs symboliques du code","claim":"Opéra Garnier présenté comme clef avec avenues et boulevards attenants.","places":["Opéra Garnier","boulevard des Capucines","boulevard des Italiens","avenue de l'Opéra"],"symbols":["géométrie urbaine"],"checks":"Identifier page, édition et vérifier le plan aérien utilisé.","ref":"Photo de page, bibliothèque personnelle, pagination absente"},{"page":"à identifier B","heading":"Déterminer l'emplacement exact d'une adresse","claim":"Étude de repères parisiens et mention de carte Michelin n°55.","places":["Arc de Triomphe","tour Eiffel","Louvre","Palais de la Légion d'honneur"],"symbols":["cartographie"],"checks":"Identifier page et contrôler chaque localisation.","ref":"Photo de page, bibliothèque personnelle, pagination absente"},{"page":"à identifier C","heading":"Rue Abel Gance et repères","claim":"Rapprochement proposé avec Invalides, Musée du Cinéma, Palais de Chaillot et Trocadéro.","places":["rue Abel Gance","Invalides","Trocadéro"],"symbols":["toponymie","alignement"],"checks":"Vérifier tracés, adresses et dates.","ref":"Photo de page, bibliothèque personnelle, pagination absente"}];
function normalizeRef(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")}
const LINK_STORE_KEY=KEY+"-relation-review-v1";
let relationReviews={};
try{const v=JSON.parse(localStorage.getItem(LINK_STORE_KEY)||"{}");if(v&&typeof v==="object"&&!Array.isArray(v))relationReviews=v}catch{}
function relationKey(page,module,id){return normalizeRef(page.heading)+"|"+module+"|"+id}
function relationLabel(page,module,id){return relationReviews[relationKey(page,module,id)]?.level||"L0 · Rapprochement lexical"}
function pageRelations(p){
 const tokens=[...p.places,...p.symbols].map(normalizeRef).filter(x=>x.length>3);
 const matches=[];
 for(const module of ["lieux","symboles","preuves","sources","corpus","audit"]){
 for(const item of store[module]){
 const target=normalizeRef([item.title,item.place,item.family,item.claim].filter(Boolean).join(" "));
 const common=tokens.filter(t=>target.includes(t)||t.includes(normalizeRef(item.title)));
 if(common.length)matches.push({module,item,why:common.join(", ")});
 }}
 return matches.slice(0,12);
}
function pageLinks(p){
 const matches=pageRelations(p);
 return '<div class="page-relations"><strong>Fiches associées · rapprochements lexicaux, non preuves</strong>'+(matches.length?'<div class="record-controls">'+matches.map(m=>'<button type="button" data-related-module="'+m.module+'" data-related-id="'+escape(m.item.id)+'">'+escape(m.item.title)+' ↗</button><span class="pill">'+escape(relationLabel(p,m.module,m.item.id))+'</span>'+'<button type="button" data-review-page="'+escape(p.page)+'" data-review-module="'+escape(m.module)+'" data-review-id="'+escape(m.item.id)+'">Évaluer</button>').join("")+'</div>':'<p class="micro">Aucune fiche associée automatiquement. Indexation à compléter.</p>')+'</div>';
}
let proofTarget=null;
function reviewRelation(button){
 const page=pagedCorpus.find(p=>p.page===button.dataset.reviewPage),module=button.dataset.reviewModule,id=button.dataset.reviewId;
 const item=store[module]?.find(x=>x.id===id);if(!page||!item)return;
 proofTarget={page,module,id};const key=relationKey(page,module,id),d=relationReviews[key]||{},form=$("proofForm");
 form.reset();$("proofContext").textContent="Page "+page.page+" · "+page.heading+" → "+item.title;
 const oldLevel=String(d.level||"L0").slice(0,2);form.elements.level.value=["L0","L1","L2"].includes(oldLevel)?oldLevel:"L0";
 for(const k of ["source","date","relationType","method","objections","countertest","decision","notes"]){
  if(d[k]!==undefined&&form.elements[k])form.elements[k].value=d[k];
 }
 $("proofDialog").showModal();
}
function storeProof(e){
 e.preventDefault();if(!proofTarget)return;
 const {page,module,id}=proofTarget,form=$("proofForm"),d=Object.fromEntries(new FormData(form)),source=String(d.source||"").trim();
 if(d.level!=="L0"&&!source){alert("Pour L1 ou L2, une référence documentaire est obligatoire.");form.elements.source.focus();return}
 if(d.level==="L2"&&(!String(d.method||"").trim()||!String(d.countertest||"").trim())){alert("Pour L2, indique une méthode et un contre-test. Cela ne valide pas la relation automatiquement.");return}
 const previous=relationReviews[relationKey(page,module,id)]||{};
 relationReviews[relationKey(page,module,id)]={...previous,...d,source,level:d.level+" · "+({L0:"Correspondance non vérifiée",L1:"Source identifiée — non auditée",L2:"Dossier renseigné — à auditer"}[d.level]),reviewedAt:new Date().toISOString(),verified:false};
 try{localStorage.setItem(LINK_STORE_KEY,JSON.stringify(relationReviews));$("proofDialog").close();render()}catch(err){alert("Sauvegarde locale impossible : "+err.message)}
}
function auditPage(index){
 const p=pagedCorpus[index];if(!p)return;
 active="audit";render();openEditor(null,{title:"Audit de page "+p.page+" — "+p.heading,reference:p.ref,claim:"Examiner l’affirmation : "+p.claim+" ; lieux : "+p.places.join(", ")+" ; symboles : "+p.symbols.join(", "),status:"À faire",notes:p.checks+" Vérifier la provenance des documents, les contre-exemples et les datations."});
}
function pageAtlas(){return '<section class="panel"><div class="panel-header"><div><div class="eyebrow">INDEX DE PAGES</div><h2>Parisis Code · Photographies retrouvées</h2></div><span class="pill">'+pagedCorpus.length+' références</span></div><p class="micro">Références des images partagées, non hébergées sur ce site. Résumés analytiques et pistes de vérification, sans reproduction du livre.</p>'+pagedCorpus.map((x,i)=>'<article class="record"><div class="record-top"><div><span class="smallmeta">PAGE '+escape(x.page)+'</span><h3>'+escape(x.heading)+'</h3></div><span class="pill guess">Lecture à recouper</span></div><p>'+escape(x.claim)+'</p><p><b>Lieux :</b> '+escape(x.places.join(", ")||"Non précisés")+'</p><p><b>Symboles / sujets :</b> '+escape(x.symbols.join(", "))+'</p><p><b>Contrôle :</b> '+escape(x.checks)+'</p>'+pageLinks(x)+'<div class="record-controls"><button data-page-audit="'+i+'">Préparer un audit</button><button data-page-chat="'+i+'">Analyser cette page dans ChatGPT ↗</button></div></article>').join("")+'</section>'}
function overview(){
const total=Object.values(store).reduce((n,a)=>n+a.length,0);
const dossiers=[
{id:'PAR-001',name:'L’axe historique de Paris',label:'LIAISON DOCUMENTÉE',tone:'grounded',question:'Cette ligne entre les monuments était-elle réellement voulue ?',found:'La perspective des Tuileries vers la Concorde et les Champs-Élysées est un aménagement historique réel. Son évolution s’étend sur plusieurs siècles.',limit:'Les coordonnées génériques des monuments ne sont pas les points exacts de l’axe de perspective.',next:'Relever les points d’axe sur des plans datés, puis mesurer leurs écarts.',href:'parisis-cartography-lab.html',link:'Voir les tracés',source:'Centre des monuments nationaux · Axe historique',sourceUrl:'https://www.monuments-nationaux.fr/de/editions-du-patrimoine/les-ouvrages/l-arc-de-triomphe-de-l-etoile'},
{id:'PAR-002',name:'Les deux parcours de Victor Hugo',label:'SOURCE LITTÉRAIRE IDENTIFIÉE',tone:'grounded',question:'Quelles voies reliaient les trois parties du Paris médiéval ?',found:'Deux parcours de Hugo sont tracés ; huit repères historiques ont une source ciblée et six corridors de rues anciennes disposent désormais de notices documentaires. Les anciennes portes Saint-Martin et Saint-Denis sont replacées sur leurs emplacements médiévaux approximatifs.',limit:'Les six corridors sont documentés par des textes historiques mais leur géométrie reste schématique. Ponts, chaussées et noms ont parfois changé entre 1482, 1551 et 1844 ; aucun calage métrique certifié.',next:'Confronter la Cité (1827) et le Palais (1828) et tester la proximité des parcelles seulement après chargement réel des données ALPAGE.',href:'parisis-vasserot-1810-1836.html?v=chapitre4#chapitre-quatre-la-distance',link:'Lire les quatre chapitres et vérifier les distances',source:'Texte intégral de Hugo',sourceUrl:'https://fr.wikisource.org/wiki/Notre-Dame_de_Paris/Texte_entier'},
{id:'PAR-003',name:'Le rempart de Philippe Auguste',label:'VESTIGES ATTESTÉS',tone:'grounded',question:'Peut-on retrouver dans les rues actuelles la frontière médiévale ?',found:'Des vestiges existent rue Clovis et rue des Jardins-Saint-Paul ; la Ville de Paris documente plusieurs tronçons et traces urbaines.',limit:'Relier directement deux vestiges éloignés ne restitue pas le tracé du mur.',next:'Reporter les segments vérifiés sur un plan d’époque et distinguer sites, hypothèses et restitutions.',href:'parisis-sources-liaisons.html',link:'Voir les sources des remparts',source:'Ville de Paris · enceinte médiévale',sourceUrl:'https://www.paris.fr/pages/sur-la-piste-de-l-enceinte-medievale-philippe-auguste-rive-gauche-episode-2-2-21081'},
{id:'PAR-004',name:'ἈΝΆΓΚΗ · Le mot de Notre-Dame',label:'TÉMOIGNAGE · EN SUSPENS',tone:'open',question:'Le mot grec décrit par Hugo a-t-il réellement été gravé dans une tour ?',found:'La préface de 1831 contient le récit de l’inscription. D’autres inscriptions de Notre-Dame sont attestées indépendamment.',limit:'Aucun relevé indépendant de cette gravure grecque n’a été authentifié. Les travaux de 1820 ne démontrent pas sa disparition.',next:'Conserver l’inventaire dans Foi & spiritualité ; ne reprendre l’enquête matérielle que lorsqu’une source nouvelle apparaît.',href:'foi-control.html#ananke-archives-1820-suite',link:'Lire le dossier ANANKÈ',source:'Préface de Hugo (1831)',sourceUrl:'https://fr.wikisource.org/wiki/Notre-Dame_de_Paris/Pr%C3%A9face'},
{id:'PAR-005',name:'Paris sur le plan de Turgot (1739)',label:'DOCUMENT À COMPARER',tone:'open',question:'Quelles rues et constructions ont changé entre 1739 et aujourd’hui ?',found:'Le plan de Turgot est une représentation historique précieuse de Paris, en vue cavalière.',limit:'Ce n’est pas une carte moderne à coordonnées directement superposables : aucun calage métrique vérifié dans notre outil.',next:'Choisir des bâtiments stables et documenter des transformations avant tout calcul de coïncidence.',href:'parisis-cartography-lab.html',link:'Ouvrir le laboratoire des cartes',source:'Corpus de documents historiques',sourceUrl:'parisis-sources-liaisons.html'},
{id:'PAR-006',name:'Dagobert et l’Estrée : les manuscrits',label:'SOURCES CROISÉES',tone:'grounded',question:'Pourquoi les trois martyrs et Dagobert sont-ils représentés près de Saint-Denis ?',found:'La scène du refuge est transmise dans un manuscrit du XIIIe siècle (BnF NAF 1098, f. 51v), puis chez Fouquet vers 1460 (français 6465, f. 57). L’église actuelle de l’Estrée date du XIXe siècle et fait face à la basilique.',limit:'Les manuscrits transmettent un récit, ils ne documentent pas l’édifice du VIIe siècle. Les fondations attribuées à Dagobert sont historiographiquement contestées.',next:'Comparer NAF 1098 f. 51v, Fouquet f. 57 et Français 24948 f. 17r–18 ; distinguer récit, paysages et édifices.',href:'parisis-dagobert-manuscrits-comparaison.html',link:'Comparer les enluminures en images',source:'Biblissima · Manuscrit NAF 1098',sourceUrl:'https://portail.biblissima.fr/fr/ark:/43093/ifdatab94ebf1c4eeec9a1bbf3d88b7f19502e649b9d2f'},
{id:'PAR-007',name:'Fouquet : deux panoramas du Paris médiéval',label:'COMPARAISON SCIENTIFIQUE',tone:'grounded',question:'Quels bâtiments voit-on dans le paysage peint derrière Dagobert ?',found:'Biblissima associe Palais de la Cité, Louvre et tour de Nesle au folio BnF 6465 f. 57. Le Met compare le panorama de Dagobert à une autre vue urbaine peinte par Fouquet depuis l’ouest.',limit:'Les identifications détaillées du Met concernent une miniature différente. Nous ne connaissons pas la position exacte de toutes les silhouettes sur l’image de Dagobert.',next:'Comparer visuellement les silhouettes et les plans anciens, sans reporter automatiquement les identifications d’une œuvre à l’autre.',href:'parisis-fouquet-panoramas.html',link:'Comparer les deux panoramas',source:'Met · Étude de Fouquet',sourceUrl:'https://www.metmuseum.org/art/collection/search/459207'}
];
const lead='<section class="mission-lead" aria-label="Mission de PARISIS ENGINE"><div class="eyebrow">NOUVEAU POINT DE DÉPART · HUMANITIES LAB</div><h2>Que cherchons-nous, exactement ?</h2><p><strong>Retrouver des liens historiques que les documents permettent de démontrer.</strong> Cartes, textes, monuments, symboles et inscriptions : nous partons d’une question précise, nous consultons une source, puis nous formulons une conclusion avec ses limites.</p><div class="mission-steps"><span>1 · Une question</span><span>2 · Une source</span><span>3 · Une conclusion</span></div><p class="micro">Pas de mystère inventé pour remplir la carte. Les figures géométriques choisies au hasard restent des expériences, jamais des preuves historiques.</p></section>';
const cards='<section class="mission-collection" aria-labelledby="mission-heading"><div class="mission-title"><div><div class="eyebrow">ATLAS DES ENQUÊTES</div><h2 id="mission-heading">Ce que nous avons découvert</h2></div><span class="pill">7 dossiers de synthèse · résultats à différents niveaux de preuve</span></div><div class="mission-grid">'+dossiers.map(d=>'<article class="mission-card"><div class="mission-kicker"><span>'+escape(d.id)+'</span><span class="mission-status '+escape(d.tone)+'">'+escape(d.label)+'</span></div><h3>'+escape(d.name)+'</h3><p class="mission-question">'+escape(d.question)+'</p><dl><dt>Ce que les sources montrent</dt><dd>'+escape(d.found)+'</dd><dt>Ce que nous ne pouvons pas affirmer</dt><dd>'+escape(d.limit)+'</dd><dt>Prochaine action utile</dt><dd>'+escape(d.next)+'</dd></dl><div class="mission-links"><a class="mission-primary" href="'+escape(d.href)+'">'+escape(d.link)+' ↗</a><a class="mission-secondary" href="'+escape(d.sourceUrl)+'" '+(d.sourceUrl.startsWith('https://')?'target="_blank" rel="noopener noreferrer"':'')+'>'+escape(d.source)+' ↗</a></div></article>').join('')+'</div></section>';
const compass='<section class="panel mission-next"><div class="panel-header"><div><div class="eyebrow">PROCHAINE ENQUÊTE PRIORITAIRE</div><h2>Les rues de Hugo face aux plans anciens</h2></div><span class="pill">Étude vérifiable</span></div><p>Notre priorité n’est plus le devis de 1820. Elle consiste à prendre un des deux parcours décrits par Hugo, identifier chaque pont et chaque rue sur des plans datés, puis dessiner ce parcours en suivant les voies réellement attestées.</p><div class="mission-links"><a class="mission-primary" href="parisis-hugo-notre-dame.html">Lire les deux parcours ↗</a><a class="mission-secondary" href="parisis-cartography-lab.html">Ouvrir la carte ↗</a></div></section>';
const tools='<section class="panel mission-library"><div class="panel-header"><div><div class="eyebrow">BIBLIOTHÈQUES ET OUTILS</div><h2>Tout le reste est conservé</h2></div></div><div class="mission-toolgrid"><a href="parisis-vasserot-1810-1836.html">↗ Vasserot · Cité 1827</a><a href="parisis-axe-spirituel-nord-sud.html">↗ Cardo romain, pèlerins & rois</a><a href="parisis-hugo-1551-comparaison.html">↗ Hugo 1482 × Plan 1551</a><a href="parisis-hugo-axes.html?all=1&amp;v=atlas-complet-20261013">↗ CARTE COMPLÈTE · Toutes les enquêtes et liaisons</a><a href="parisis-cartography-lab.html">↗ Cartes & tracés d’origine</a><a href="parisis-text-atlas.html">↗ Text Atlas</a><a href="parisis-ghost-trace.html">↗ Ghost Trace</a><a href="parisis-sources-liaisons.html">↗ Documents historiques</a><a href="foi-control.html#ananke-archives-1820-suite">↗ Foi & spiritualité</a><a href="eloah-projet.html?projet=PARISIS%20ENGINE">↗ Espace projet ELOAH</a><button type="button" data-nav="sources">↗ HISTORIA · Sources</button><button type="button" data-nav="preuves">↗ Hypothèses & preuves</button><button type="button" data-nav="audit">↗ Audit</button></div></section>';
const stats='<details class="panel mission-details"><summary>Inventaire de mes fiches de recherche</summary><p class="micro">Fiches sauvegardées localement sur cet appareil. Les enquêtes ci-dessus sont des dossiers éditoriaux et ne remplacent aucune note personnelle.</p><p><strong>'+total+'</strong> fiches conservées dans les modules, dont <strong>'+store.lieux.length+'</strong> lieux candidats et <strong>'+store.preuves.length+'</strong> fiches d’hypothèses et de preuve.</p><button data-nav="corpus" type="button">Ouvrir le corpus</button></details>';
return lead+cards+compass+tools+stats+legacyPanel();
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
let content=active==='overview'?overview():active==='settings'?settings():active==='corpus'?pageAtlas()+layoutRecords():active==='symboles'?atlas()+layoutRecords():active==='align'?geometry()+layoutRecords():active==='audit'?auditChecklist()+layoutRecords():layoutRecords();
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
if(b.dataset.reviewPage!==undefined){reviewRelation(b)}
else if(b.dataset.pageAudit!==undefined){auditPage(Number(b.dataset.pageAudit))}
else if(b.dataset.relatedModule){active=b.dataset.relatedModule;render();const el=document.querySelector('[data-edit="'+CSS.escape(b.dataset.relatedId)+'"]');el?.closest(".record")?.scrollIntoView({behavior:"smooth",block:"center"});el?.closest(".record")?.classList.add("related-focus")}
else if(b.dataset.pageChat!==undefined){const p=pagedCorpus[Number(b.dataset.pageChat)];if(p)chat({title:p.heading,claim:'Page '+p.page+'. '+p.claim+' Lieux : '+p.places.join(', ')+'. Symboles : '+p.symbols.join(', ')+'. À vérifier : '+p.checks,reference:p.ref})}
else if(b.dataset.nav){active=b.dataset.nav;render()}
else if(b.dataset.edit)openEditor(b.dataset.edit);
else if(b.dataset.delete){if(confirm('Supprimer cette fiche PARISIS ?')){store[active]=store[active].filter(x=>x.id!==b.dataset.delete);save()}}
else if(b.dataset.chat){const r=store[active].find(x=>x.id===b.dataset.chat);if(r)chat(r)}
else if(b.dataset.chatGlobal)chat(null);
};
$("proofForm").onsubmit=storeProof;
$("closeProof").onclick=()=>$("proofDialog").close();
$("cancelProof").onclick=()=>$("proofDialog").close();
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