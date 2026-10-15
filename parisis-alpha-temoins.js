/* PARISIS ENGINE · ALPHA-018 · Le texte, ses témoins et les erreurs qu'un simple calcul masquerait
 * Les URLs mènent à des éditions publiques, et l'absence de témoignage indépendant est signalée.
 * Corpus analytique borné, non collation exhaustive des manuscrits.
 * Aucune lecture du stockage ELOAH privé. */
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const IRENEE="https://www.newadvent.org/fathers/0103115.htm";
const HIPPO="https://www.newadvent.org/fathers/050106.htm";
const EPIPH="https://www.sophiascriptura.com/fathers/epiphanius-panarion/34-9-1/";
const TEXTS=Object.freeze([
 {id:"irenee",name:"Irénée de Lyon",work:"Contre les hérésies I,15",period:"Vers 180",role:"Auteur du témoignage polémique",transmission:"Original grec partiellement conservé ; traduction latine ancienne ; extraits grecs cités par des auteurs postérieurs.",url:IRENEE,independentForMarcus:false,summary:"Témoin fondateur de la description du système. Le contexte est explicitement critique des marcosiens.",status:"source de base et adversaire"},
 {id:"hippolyte",name:"Hippolyte / Réfutation",work:"Réfutation des hérésies VI,37 et 41–46",period:"IIIe siècle",role:"Reprend Irénée, annonce avoir examiné certaines pratiques",transmission:"Texte grec ancien, accessible par une traduction moderne ; citations et reformulations d'Irénée.",url:HIPPO,independentForMarcus:false,summary:"Au chapitre VI,37, l'auteur nomme Irénée comme son prédécesseur ; le rapprochement n'est donc pas une corroboration indépendante par défaut.",status:"témoin dérivé, à évaluer"},
 {id:"epiphane",name:"Épiphane de Salamine",work:"Panarion 34,9–11",period:"Vers 374–377",role:"Conserve en grec une reprise de passages d'Irénée",transmission:"Grec transmis dans le Panarion, édité par K. Holl (GCS 31, 1922) ; une édition numérique corrige des erreurs de reconnaissance typographique.",url:EPIPH,independentForMarcus:false,summary:"Précieux témoin grec de la transmission d'Irénée, sans valider indépendamment le système ou la vision de Marcus.",status:"transmission grecque dépendante"}
]);
const FINDINGS=Object.freeze([
 {id:"888",title:"Pourquoi le chiffre 888 revient deux fois",greek:"Ἰησοῦς",epiph:"34.9.2–4",irenee:"I,15,2",hippolyte:"VI,41–45",words:"Épiphane transmet une explication par l'Ogdóade et la Décade, ainsi qu'une lecture du nom Jésus par ses lettres.",claim:"Deux méthodes (généalogie 8+80+800 et isopséphie ΙΗΣΟΥΣ) produisent la même valeur.",critical:"Ne pas prendre deux formulations d'Irénée recopiées par Épiphane pour deux confirmations indépendantes.",status:"dépendance explicite",refs:["irenee","epiphane"]},
 {id:"iota",title:"L'Iota naît du 1 + 2 + 3 + 4",greek:"ἰῶτα",epiph:"34.9.5",irenee:"I,15,2",hippolyte:"VI,41–45",words:"La première Tétrade 1+2+3+4 donne 10 ; dix est la valeur numérale de Iota, initiale du nom Jésus.",claim:"Le Iota relie une Tétrade (4 termes) à un signe de valeur 10.",critical:"Le signe Iota a rang 9 dans l'alphabet, mais valeur isopséphique 10 ; ne pas confondre.",status:"raison numérique détaillée",refs:["irenee","epiphane"]},
 {id:"twelve",title:"Χρειστός : huit lettres, puis Υἱός : quatre",greek:"Χρειστός",epiph:"34.9.6–7",irenee:"I,15,2",hippolyte:"VI,41–45",words:"L'orthographe Χρειστός sert à représenter l'Ogdóade ; associée à Υἱός, elle forme la Duodécade.",claim:"ΧΡΕΙΣΤΟΣ (8) + ΥΙΟΣ (4) = 12.",critical:"La forme plus habituelle ΧΡΙΣΤΟΣ comporte 7 lettres : avec ΥΙΟΣ (4), on obtient 11.",status:"variante attestée dans le grec repris",refs:["irenee","epiphane"]},
 {id:"ignorance",title:"L'objectif : supprimer l'ignorance",greek:"ἀγνοίας",epiph:"34.9.8–10",irenee:"I,15,2",hippolyte:"VI,41–45",words:"Le récit décrit le nom révélé comme un chemin vers le Père de Vérité et associe connaissance et passage de la mort à la vie.",claim:"Les correspondances numériques s'inscrivent dans une cosmologie de salut par la connaissance, non dans un simple jeu de chiffres.",critical:"La présentation est polémique ; l'enseignement historique de Jésus n'est pas établi par cette doctrine.",status:"but théologique explicité",refs:["irenee","epiphane"]},
 {id:"objection",title:"Le contre-argument sur l'alphabet grec",greek:"ἀλφάβητον",epiph:"34.11.1–3",irenee:"I,15,4",hippolyte:"VI,41–45",words:"L'objection attribuée à Irénée reproche au système de faire dépendre la Vérité d'un alphabet grec historiquement modifié.",claim:"Le système doit répondre à la variation historique des lettres ; le nombre 24 n'est pas universel dans toutes les écritures.",critical:"Les détails antiques racontés sur Cadmos et Palamède sont des traditions anciennes, non une datation archéologique fiable.",status:"critique explicite",refs:["irenee","epiphane"]},
 {id:"silence",title:"La contradiction du Silence qui parle",greek:"Σιγή",epiph:"34.11.4–6",irenee:"I,15,5",hippolyte:"VI,41–45",words:"Irénée tourne en dérision Sigê : le Silence qui révèle l'ineffable et présente Dieu comme un être à voix et syllabes.",claim:"Une critique interne souligne la tension entre l'inexprimable et sa représentation en lettres.",critical:"C'est la position polémique d'Irénée et ne prouve pas à elle seule ce que les marcosiens répondaient.",status:"objection polémique",refs:["irenee","epiphane"]}
]);
const NUMERAL_MARKERS=Object.freeze([
 {glyph:"Ϛ",value:6,comment:"signe numéral six (épisémon / stigma, selon les périodes)"},
 {glyph:"Ϟ",value:90,comment:"koppa numéral"},
 {glyph:"Ϡ",value:900,comment:"sampi numéral"}
]);
function test(){
 const claim=FINDINGS.find(x=>x.id==="888");
 const h=FINDINGS.find(x=>x.id==="iota");
 const name=R.analyzeWord("ΙΗΣΟΥΣ");
 const iota=R.letterInfo("Ι");
 const short=R.analyzeWord("ΧΡΙΣΤΟΣ").length,long=R.analyzeWord("ΧΡΕΙΣΤΟΣ").length;
 const alpha=R.alphabet;
 const rows=[
 {id:"NUM888",ok:name.isopsephy===888&&8+80+800===888,description:"Somme des lettres et généalogie 8 + 80 + 800"},
 {id:"IOTA",ok:iota.rank===9&&iota.value===10&&1+2+3+4===10,description:"Rang 9 différent de valeur 10 pour Iota"},
 {id:"CHREISTOS",ok:long===8&&short===7&&R.analyzeWord("ΥΙΟΣ").length===4,description:"ΧΡΕΙΣΤΟΣ + ΥΙΟΣ = 12, forme habituelle = 11"},
 {id:"GREEK24",ok:alpha.length===24,description:"Alphabet de base = 24 caractères"},
 {id:"EXTRA3",ok:NUMERAL_MARKERS.length===3&&!NUMERAL_MARKERS.some(m=>alpha.includes(m.glyph)),description:"Les 3 signes numéraux supplémentaires ne changent pas la taille de l'alphabet de base"},
 {id:"GREEK27",ok:alpha.length+NUMERAL_MARKERS.length===27,description:"Alphabet de base 24 + 3 signes numéraux = 27 signes du système numérique"},
 {id:"BAND8",ok:["ΑΒΓΔΕΖΗΘ","ΙΚΛΜΝΞΟΠ","ΡΣΤΥΦΧΨΩ"].every(x=>[...x].length===8),description:"Huit lettres dans chacune des trois bandes alphabétiques"},
 {id:"THETA9",ok:R.letterInfo("Θ").rank===8&&R.letterInfo("Θ").value===9,description:"La 8e lettre Θ ne vaut pas 8, mais 9"},
 {id:"CONTEXT",ok:claim.refs.includes("epiphane")&&h.epiph==="34.9.5",description:"Liens éditoriaux corrects vers les passages grecs"},
 {id:"NOTINDEPENDENT",ok:TEXTS.every(x=>x.independentForMarcus===false),description:"Aucun des trois témoins retenus n'est considéré indépendant pour le récit de Marcus"}
 ];
 return {passed:rows.filter(x=>x.ok).length,total:rows.length,rows};
}
function analyze(){
 const originalBand=["ΑΒΓΔΕΖΗΘ","ΙΚΛΜΝΞΟΠ","ΡΣΤΥΦΧΨΩ"];
 return {
  version:"ALPHA-018/1.0.0",witnesses:TEXTS,findings:FINDINGS,numeralMarkers:NUMERAL_MARKERS,
  numeralBands:originalBand.map((word,i)=>({
   label:["unités","dizaines","centaines"][i],
   letters:[...word].map(ch=>({letter:ch,ordinal:R.letterInfo(ch).rank,numeric:R.letterInfo(ch).value})),
   count:8
  })),
  known:{
   jesusWord:"ΙΗΣΟΥΣ",jesusValue:R.analyzeWord("ΙΗΣΟΥΣ").isopsephy,
   jesusCreation:8+80+800,
   iotaOrdinal:R.letterInfo("Ι").rank,
   iotaNumeral:R.letterInfo("Ι").value,
   tetractys:1+2+3+4,
   thetaOrdinal:R.letterInfo("Θ").rank,
   thetaValue:R.letterInfo("Θ").value,
   chreistosLength:R.analyzeWord("ΧΡΕΙΣΤΟΣ").length,
   christosLength:R.analyzeWord("ΧΡΙΣΤΟΣ").length,
   huiosLength:R.analyzeWord("ΥΙΟΣ").length
  },
  audit:test(),limitations:[
   "Épiphane conserve une reprise grecque d'Irénée, pas un témoin indépendant de Marcus.",
   "Hippolyte cite explicitement Irénée ; l'indépendance des informations doit être démontrée passage par passage.",
   "Les 24 lettres d'un alphabet et les 27 signes utiles au système numéral grec sont des ensembles différents.",
   "La transcription numérique d'un passage grec peut avoir souffert d'erreurs d'édition ou de numérisation ; chaque graphie exige une vérification sur édition fiable."
  ]
 };
}
const api=Object.freeze({version:"ALPHA-018/1.0.0",analyze,audit:test,findings:FINDINGS,witnesses:TEXTS,numeralMarkers:NUMERAL_MARKERS});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_TEMOINS=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
