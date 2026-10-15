/* ELOAH / PARISIS ENGINE / ALPHA-021 — Nag Hammadi & Valentiniens
   Corpus fermé, éditorial et sourcé. Analyse d'attestations et de divergences,
   NON un lecteur copte automatique, NON une restauration d'original grec.
   Les dates des copies et celles de rédaction restent séparées.
   Aucun accès aux données personnelles, aucun réseau implicite.
 */
(function(root){
"use strict";
const BOOKS=Object.freeze([
 {id:"marcus",label:"Marcus chez Irénée",catalogue:"Adversus Haereses I,14–15",language:"Grec original partiellement préservé ; traduction latine",manuscript:"Transmission indirecte et fragments",period:"Doctrine rapportée vers 180",kind:"témoignage polémique",identity:"Marcus décrit par un adversaire",url:"https://www.newadvent.org/fathers/0103114.htm",relation:"base critique"},
 {id:"ir21",label:"Irénée · variantes de rédemption",catalogue:"Adversus Haereses I,21",language:"Grec/latin selon la transmission",manuscript:"Transmission patristique",period:"Vers 180",kind:"témoignage polémique",identity:"Plusieurs groupes, à ne pas confondre",url:"https://www.newadvent.org/fathers/0103121.htm",relation:"même auteur, pratiques diversifiées"},
 {id:"truth",label:"Évangile de Vérité",catalogue:"Nag Hammadi I,3 ; XII,2 (fragments)",language:"Copte ; original grec non conservé intégralement",manuscript:"Codices coptes des IVe–Ve siècles",period:"Composition antérieure à ces copies ; datation discutée",kind:"traité théologique",identity:"Œuvre apparentée aux traditions valentiniennes, auteur non certain",url:"https://www.gospels.net/truth",relation:"tradition distincte ; thème comparable"},
 {id:"philip",label:"Évangile de Philippe",catalogue:"Nag Hammadi II,3 ; pages 51–86",language:"Copte ; original grec présumé, non conservé ici",manuscript:"Codex II, IVe–Ve siècles",period:"Rédaction antérieure ; date et milieu discutés",kind:"collection de réflexions et traditions",identity:"Œuvre valentinienne, non un écrit autographe de l'apôtre Philippe",url:"https://www.gospels.net/philip",relation:"tradition distincte ; pratiques et symboles"},
 {id:"valex",label:"Exposé valentinien",catalogue:"Nag Hammadi XI,2",language:"Copte sub-akhmîmique / lycopolitain avec influences sahidiques",manuscript:"Codex XI, transmission copte ; texte lacunaire",period:"Original grec hypothétique antérieur",kind:"traité doctrinal lacunaire",identity:"Valentinien, auteur non identifié",url:"https://gnosis.org/naghamm/valex.html",relation:"autre traité valentinien, pas le texte de Marcus"},
 {id:"liturgy",label:"Fragments de baptême et d'eucharistie",catalogue:"Nag Hammadi XI,2a–2e, appendices",language:"Copte ; traductions modernes accessibles",manuscript:"Fragments lacunaires du codex XI",period:"Composition et transmission à contextualiser",kind:"fragments à caractère liturgique",identity:"Provenance de la collection XI, non formule directement attribuée à Marcus",url:"https://www.studylight.org/historical-writings/nag-hammadi/valentinian-exposition.html",relation:"matériaux liturgiques à comparer sans les fusionner"}
]);
const SOURCES=Object.freeze([
 {id:"truth-letters",book:"truth",section:"NHC I,3, p. 22–23",label:"Les lettres de la Vérité ne sont pas de simples voyelles et consonnes",url:"https://www.gospels.net/truth",motifs:["lettres","vérité","connaissance","nom"],evidence:"T · ATTESTÉ DANS LA TRADUCTION",observation:"Le livre vivant est représenté par des lettres de la Vérité, explicitement distinguées des voyelles et des consonnes ordinaires.",contrast:"Chez Marcus, les 24 lettres du grec sont dénombrées ; ici, l'auteur marque une différence entre signes écrits ordinaires et connaissance révélée.",limit:"Image théologique, pas table de graphèmes coptes ou grecque restituable."},
 {id:"truth-name",book:"truth",section:"NHC I,3, p. 21–22 et 38–40",label:"Le nom prononcé appelle la personne à connaître son origine",url:"https://www.gospels.net/truth",motifs:["nom","appel","réponse","connaissance","rédemption"],evidence:"T · ATTESTÉ DANS LA TRADUCTION",observation:"Le Père appelle par le nom, et l'être appelé entend, répond et reconnaît d'où il vient et où il va ; le Fils est présenté comme le Nom du Père.",contrast:"Parallèle avec la distinction marcosienne entre nom sonore et réalité dite cachée, sans emprunt direct prouvé.",limit:"N'identifie pas un rituel des 12 paires grecques."},
 {id:"philip-names",book:"philip",section:"NHC II,3, p. 53–54, 56",label:"Le nom caché, le titre révélé et les noms trompeurs",url:"https://www.gospels.net/philip",motifs:["nom","vérité","caché","connaissance","christ"],evidence:"T · ATTESTÉ DANS LA TRADUCTION",observation:"Le texte distingue un Nom du Père non prononcé, les noms mondains trompeurs, le nom Jésus tenu pour caché et Christ pour révélé.",contrast:"Rapprochement fort de thème avec Marcus, mais la réflexion ne donne pas 24 lettres ni une valeur 888 de Jésus.",limit:"Le vocabulaire « caché / révélé » n'établit pas une relation génétique entre ces œuvres."},
 {id:"philip-five",book:"philip",section:"NHC II,3, p. 67–68",label:"Cinq mystères distingués",url:"https://www.gospels.net/philip",motifs:["baptême","onction","eucharistie","rédemption","chambre-nuptiale"],evidence:"T · ATTESTÉ DANS LA TRADUCTION",observation:"Le texte énumère baptême, chrismation, eucharistie, rédemption et chambre nuptiale, dans une interprétation des mystères.",contrast:"La rédemption n'est pas simplement équivalente à un nombre ni identique à tous les rites listés par Irénée.",limit:"L'énumération n'implique pas cinq cérémonies matériellement uniformes dans toutes les communautés."},
 {id:"philip-chamber",book:"philip",section:"NHC II,3, p. 69–70",label:"La chambre nuptiale et la restauration de l'unité",url:"https://www.gospels.net/philip",motifs:["baptême","onction","rédemption","chambre-nuptiale","unité"],evidence:"T · ATTESTÉ DANS LA TRADUCTION, LACUNES",observation:"Comparaison avec le sanctuaire de Jérusalem ; la chambre nuptiale sert d'image d'une réunion réparant la séparation.",contrast:"Irénée I,21 décrit des figurations nuptiales ; l'identité des pratiques et communautés reste indémontrée.",limit:"Plusieurs mots de cette section sont restitués ou manquants ; ne pas les présenter comme lecture intégralement certaine."},
 {id:"valex-monad",book:"valex",section:"NHC XI,2, début de l'Exposé",label:"Monade, Silence, Dyade et Plérôme",url:"https://gnosis.org/naghamm/valex.html",motifs:["silence","unité","plérôme","éons","connaissance"],evidence:"T · ATTESTÉ DANS UNE ŒUVRE LACUNAIRE",observation:"Un Père ineffable demeure dans le silence et les couples d'émanations sont décrits dans la cosmologie valentinienne.",contrast:"Le langage de Silence et Plérôme est comparable au discours sur Marcus, pas un manuscrit de sa propre méthode.",limit:"Texte endommagé et contexte d'origine incertain."},
 {id:"xi-baptism",book:"liturgy",section:"NHC XI,2, annexe « On Baptism A/B »",label:"Baptême et passage du monde vers l'Éon",url:"https://www.gnosis.org/naghamm/bapta.html",motifs:["baptême","rédemption","connaissance","éons"],evidence:"T · FRAGMENTAIRE",observation:"Les fragments parlent de pardon, de passage et de transformation dans une pensée de rédemption.",contrast:"Parallèle avec les descriptions de baptême chez Irénée, sans correspondance démontrée de la formule rituelle.",limit:"Lacunes majeures ; séquence cérémonielle complète inaccessible."},
 {id:"xi-eucharist",book:"liturgy",section:"NHC XI,2, annexe « On the Eucharist A/B »",label:"Eucharistie, Nom de Jésus et doxologie",url:"https://www.studylight.org/historical-writings/nag-hammadi/valentinian-exposition.html",motifs:["eucharistie","nom","christ","connaissance"],evidence:"T · FRAGMENTAIRE",observation:"Les fragments eucharistiques mentionnent le Nom de Jésus-Christ et des formules de louange.",contrast:"Le nom est utilisé dans un contexte liturgique, mais pas sous la forme de la cascade alphabétique de Marcus.",limit:"Traduction d'un passage fragmentaire ; ne pas restituer les syllabes perdues."},
 {id:"irenee21",book:"ir21",section:"Irénée I,21,3–5",label:"Paroles de rédemption, eau, réponse, onction",url:"https://www.newadvent.org/fathers/0103121.htm",motifs:["baptême","nom","vérité","rédemption","onction","chambre-nuptiale","connaissance"],evidence:"T · RÉCIT POLÉMIQUE",observation:"Les groupes sont décrits avec invocations, onctions, gestes nuptiaux, dialogues ou refus des rites visibles.",contrast:"Contient plusieurs variantes incompatibles ; aucune ne prouve une cérémonie unique de Marcus avec les 12 paires.",limit:"La diversité des groupes interdit d'attribuer l'ensemble à un seul fondateur."},
 {id:"irenee14",book:"marcus",section:"Irénée I,14,2–7",label:"Corps de Vérité, sons, voyelles et Plérôme",url:"https://www.newadvent.org/fathers/0103114.htm",motifs:["lettres","vérité","nom","silence","plérôme","éons","christ","unité"],evidence:"T · RÉCIT POLÉMIQUE",observation:"Marcus est décrit avec 24 lettres, un corps d'Alètheia, des voyelles et un Nom énoncé puis un silence.",contrast:"Le codage est grec dans le récit transmis ; un texte copte ne peut être recalculé comme cet original sans argument philologique.",limit:"Source hostile, non autographe et fondamentalement différente des copies coptes de Nag Hammadi."}
]);
const QUESTIONS=Object.freeze([
 {id:"Q1",title:"Un autre texte parle-t-il de « lettres de la Vérité » ?",ids:["truth-letters","irenee14"],answer:"OUI, deux œuvres utilisent l'image des lettres et de la Vérité, mais l'Évangile de Vérité distingue explicitement ses lettres des voyelles et consonnes ordinaires.",verdict:"PARALLÈLE TEXTUEL, SYSTÈME DISTINCT",missing:"Une citation démontrant qu'elles décrivent la même table des 24 lettres."},
 {id:"Q2",title:"Le Nom et la connaissance sont-ils reliés ?",ids:["truth-name","philip-names","irenee14"],answer:"OUI, l'appel par le Nom, la Vérité et la connaissance participent aux représentations de révélation dans plusieurs écrits.",verdict:"MOTIF PARTAGÉ DANS DES ŒUVRES DISTINCTES",missing:"Un lien de dépendance littéraire précis ou une tradition commune attestée textuellement."},
 {id:"Q3",title:"Le baptême et la rédemption sont-ils décrits en dehors d'Irénée ?",ids:["philip-five","philip-chamber","xi-baptism","irenee21"],answer:"OUI, des écrits coptes présentent des mystères du baptême, de la rédemption et de la chambre nuptiale.",verdict:"PLUSIEURS CONTEXTES TEXTUELS, RITES NON IDENTIQUES",missing:"La documentation permettant d'associer chaque formule à un lieu, un groupe et une date déterminés."},
 {id:"Q4",title:"L'onction et l'eucharistie apparaissent-elles dans ce corpus ?",ids:["philip-five","philip-chamber","xi-eucharist","irenee21"],answer:"OUI, ces thèmes apparaissent, mais pas nécessairement comme une séquence cérémonielle standardisée.",verdict:"THÈMES ATTESTÉS, LACUNES MATÉRIELLES",missing:"Une séquence de rite intégralement conservée et ses variantes."},
 {id:"Q5",title:"La chambre nuptiale correspond-elle à un rite unique de Marcus ?",ids:["philip-chamber","irenee21"],answer:"NON DÉMONTRÉ. Les textes partagent une image de l'union, sans identité du groupe ou de la pratique prouvée.",verdict:"ANALOGIE SANS ATTRIBUTION DIRECTE",missing:"Un texte identifiant formellement la cérémonie de Philippe à celle de Marcus."},
 {id:"Q6",title:"Pouvons-nous décoder le copte par isopséphie grecque ?",ids:["truth-letters","philip-names","irenee14"],answer:"NON. Ces codices sont conservés en copte ; les correspondances grecques nécessitent une édition du grec d'origine, lorsqu'elle existe.",verdict:"DÉCODAGE GREC SUSPENDU",missing:"Un témoin grec authentifié pour le passage analysé, et des choix graphiques justifiés."},
 {id:"Q7",title:"Ces écrits démontrent-ils que Jésus a enseigné la méthode marcosienne ?",ids:["truth-name","philip-five","xi-baptism","irenee14"],answer:"NON. Ces œuvres reflètent des interprétations anciennes de la figure de Jésus et des rites, pas la preuve de l'enseignement historique des douze paires.",verdict:"NON DÉMONTRÉ HISTORIQUEMENT",missing:"Témoignage indépendant, daté et attribuable reliant directement le Jésus historique à ce procédé."}
]);
const INDEX=Object.freeze(Object.fromEntries(SOURCES.map(x=>[x.id,x])));
const BOOK_INDEX=Object.freeze(Object.fromEntries(BOOKS.map(x=>[x.id,x])));
function passage(id){
 const p=INDEX[id];
 if(!p)throw Error("Passage non répertorié.");
 return {...p,bookInfo:BOOK_INDEX[p.book]};
}
function compare(idA,idB){
 const a=passage(idA),b=passage(idB);
 if(idA===idB)throw Error("Choisir deux passages distincts.");
 const set=new Set(b.motifs);
 const motifs=a.motifs.filter(x=>set.has(x));
 return {
  a,b,motifs,
  sameWork:a.book===b.book,
  differentLanguages:a.bookInfo.language!==b.bookInfo.language,
  claim:"Motifs documentaires partagés : "+(motifs.join(", ")||"aucun")+".",
  decision:a.book===b.book?"DEUX PASSAGES D'UNE MÊME ŒUVRE":"COMPARAISON DE DEUX TRADITIONS — PAS DE TRANSMISSION DIRECTE DÉMONTRÉE",
  warning:"Un motif partagé n'est pas une preuve d'emprunt. Les calculs sur 24 lettres grecques ne sont PAS applicables automatiquement au copte."
 };
}
function investigate(id){
 const h=QUESTIONS.find(x=>x.id===id);if(!h)throw Error("Question inconnue");
 const items=h.ids.map(passage);
 return {...h,passages:items,books:[...new Set(items.map(x=>x.book))].map(b=>BOOK_INDEX[b])};
}
function audit(){
 const rules=[
 ["A01",BOOKS.length===6,"Six ensembles bibliographiques différenciés"],
 ["A02",SOURCES.length===10,"Dix passages ou dossiers catalogués"],
 ["A03",QUESTIONS.length===7,"Sept questions historiques"],
 ["A04",SOURCES.every(x=>Boolean(BOOK_INDEX[x.book])),"Tous les passages renvoient à une œuvre"],
 ["A05",SOURCES.every(x=>/^https:\/\//.test(x.url)),"Toutes les références ont une URL"],
 ["A06",BOOK_INDEX.truth.catalogue.includes("I,3")&&BOOK_INDEX.truth.catalogue.includes("XII,2"),"Copies du Gospel of Truth correctement localisées"],
 ["A07",BOOK_INDEX.philip.catalogue.includes("II,3"),"Gospel of Philip localisé en NHC II,3"],
 ["A08",BOOK_INDEX.valex.catalogue.includes("XI,2"),"Exposé valentinien localisé en NHC XI,2"],
 ["A09",BOOK_INDEX.liturgy.catalogue.includes("XI,2a"),"Annexes liturgiques distinguées"],
 ["A10",investigate("Q1").passages.some(x=>x.id==="truth-letters"),"Vérité/lettres documentées"],
 ["A11",investigate("Q6").verdict==="DÉCODAGE GREC SUSPENDU","Pas de calcul grec inventé sur le copte"],
 ["A12",investigate("Q7").verdict==="NON DÉMONTRÉ HISTORIQUEMENT","Absence de transmission par Jésus conservée"],
 ["A13",compare("truth-letters","irenee14").motifs.includes("lettres"),"Rapprochement thématique explicite sans filiation"],
 ["A14",BOOKS.filter(x=>x.id==="truth"||x.id==="philip"||x.id==="valex"||x.id==="liturgy").every(x=>x.language.toLowerCase().includes("copte")),"Langue copte des manuscrits signalée"]
 ];
 return {passed:rules.filter(r=>r[1]).length,total:rules.length,checks:rules.map(r=>({id:r[0],pass:r[1],label:r[2]})),
 note:"Ces tests contrôlent le modèle éditorial et ses distinctions ; ils ne remplacent pas une lecture d'édition critique du copte."};
}
function report(){
 return {version:"ALPHA-021/1.0.0",works:BOOKS,passages:SOURCES,questions:QUESTIONS.map(q=>investigate(q.id)),audit:audit(),
 conclusion:"Les manuscrits coptes de Nag Hammadi offrent des traditions textuelles distinctes sur le Nom, la Vérité, les lettres, l'onction, la rédemption et l'union. Ils ne prouvent ni la pratique des douze paires alphabétiques dans un rite, ni la filiation directe de Marcus, ni la possibilité de calculer une isopséphie grecque à partir de leur traduction.",
 provenance:"Données éditoriales appuyées sur les traductions et éditions indiquées ; les passages ne sont pas des transcriptions diplomatiques du manuscrit copte."};
}
const API=Object.freeze({version:"ALPHA-021/1.0.0",books:BOOKS,passages:SOURCES,questions:QUESTIONS,passage,compare,investigate,audit,report});
if(typeof module!=="undefined"&&module.exports)module.exports=API;
if(root)root.PARISIS_ALPHA_NAGHAMMADI=API;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
