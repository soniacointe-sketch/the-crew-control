/* PARISIS ENGINE — ALPHA | Paroles de Jésus et lecture des lettres
   Sources évangéliques grecques contextualisées, extraits courts.
   Ne pas confondre le texte grec transmis par les évangiles et la langue effectivement parlée par Jésus.
   Aucune interprétation religieuse ni filiation historique déduite d'une somme alphabétique.
*/
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const VERSES=Object.freeze([
 {id:"jn14-6",ref:"Jean 14,6",title:"Le chemin, la vérité et la vie",
  greek:"Ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή.",
  french:"Je suis le chemin, la vérité et la vie.",
  source:"https://www.greekbible.com/john/14/6",
  marker:"ἀλήθεια",focus:"ΑΛΗΘΕΙΑ",
  anchors:["je suis le chemin","chemin verite vie","la verite et la vie","le chemin la verite","je suis la voie la verite","chemin et la verite"],
  context:"Dans l'Évangile de Jean, Jésus répond à Thomas. Le rapprochement avec le corps d'Alètheia chez Marcus concerne la forme grecque du mot « vérité » ; il ne prouve pas une dépendance entre les deux passages."},
 {id:"jn8-12",ref:"Jean 8,12",title:"La lumière du monde",
  greek:"Ἐγώ εἰμι τὸ φῶς τοῦ κόσμου.",
  french:"Je suis la lumière du monde.",
  source:"https://www.greekbible.com/john/8/12",
  marker:"φῶς",focus:"ΦΩΣ",
  anchors:["je suis la lumiere du monde","lumiere du monde","je suis la lumiere","la lumiere du monde"],
  context:"Le discours johannique associe Jésus à la lumière. Les paires corporelles résultent ici du classement mécanique des lettres grecques, sans signification anatomique affirmée par cet Évangile."},
 {id:"mk4-39",ref:"Marc 4,39",title:"Le calme après la tempête",
  greek:"Σιώπα, πεφίμωσο.",
  french:"Silence ! Tais-toi.",
  source:"https://www.greekbible.com/mark/4/39",
  marker:"Σιώπα",focus:"ΣΙΩΠΑ",
  anchors:["silence tais toi","silence","tais toi","calme toi"],
  context:"Le récit de Marc attribue ces mots à Jésus lorsqu'il s'adresse à la mer. Ce sont les mots du texte grec de l'Évangile ; rien ne garantit qu'ils reproduisent mot pour mot la langue originelle de la scène."},
 {id:"mt5-3",ref:"Matthieu 5,3",title:"Les pauvres en esprit",
  greek:"Μακάριοι οἱ πτωχοὶ τῷ πνεύματι.",
  french:"Heureux les pauvres en esprit.",
  source:"https://www.greekbible.com/matthew/5/3",
  marker:"Μακάριοι",focus:"ΜΑΚΑΡΙΟΙ",
  anchors:["heureux les pauvres en esprit","pauvres en esprit","bienheureux les pauvres en esprit"],
  context:"Cette béatitude est présentée par Matthieu dans le Sermon sur la montagne. Les nombres calculés concernent les graphies grecques choisies, non une preuve d'un message secret."}
]);
function normalFrench(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’']/g," ").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
function lookupFrench(text){
 const phrase=normalFrench(text);
 if(!phrase)return [];
 const found=[];
 for(const entry of VERSES){
  const matched=entry.anchors.filter(k=>phrase.includes(k));
  if(matched.length)found.push({id:entry.id,ref:entry.ref,title:entry.title,matched:matched.sort((a,b)=>b.length-a.length)[0],confidence:"correspondance de phrase éditoriale"});
 }
 return found.sort((a,b)=>b.matched.length-a.matched.length);
}
function select(id){
 return VERSES.find(x=>x.id===id)||null;
}
function decode(id){
 const passage=select(id);
 if(!passage)throw Error("Référence inconnue.");
 const analysis=R.analyzeText(passage.greek,{mode:"greek"});
 const focus=R.analyzeWord(passage.marker);
 const pairCounts=R.pairs.map((pair,i)=>{
  const metrics=analysis.pairs[i];
  return {number:pair.number,body:pair.body,first:pair.first,last:pair.last,ranks:pair.ranks,count:metrics.total,firstCount:metrics.first,lastCount:metrics.last,observedBoth:metrics.observedBoth};
 });
 return {reference:passage.ref,id:passage.id,translation:passage.french,greek:passage.greek,focus:focus.normalized,focusNumeral:focus.isopsephy,
  focusOrdinal:focus.alphabetRanksTotal,focusParts:focus.bodyCounts,words:analysis.words,
  pairs:pairCounts,
  stats:analysis.stats,
  distinctBodyParts:pairCounts.filter(x=>x.count>0).length,
  completePairs:pairCounts.filter(x=>x.observedBoth).length,
  source:passage.source,
  caveat:"Résultat d'une opération alphabétique reproductible, non preuve que Jésus enseignait la structure marcosienne."};
}
const api=Object.freeze({version:"ALPHA-PAROLES/1.0.0",verses:VERSES,select,decode,lookupFrench,normalFrench});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_PAROLES=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
