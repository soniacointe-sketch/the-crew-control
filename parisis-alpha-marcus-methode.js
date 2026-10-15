/* ELOAH · PARISIS ENGINE · ALPHA-014 · Reconstruction du système attribué à Marcus.
 * Lecture critique d'Irénée, Contre les hérésies I,14–15 (vers 180).
 * Ce n'est ni un écrit autographe de Marcus, ni un décodeur des intentions de Jésus.
 * Règles philologiques : longueur, ordre alphabétique, isopséphie = opérations distinctes.
 */
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const SOURCES=Object.freeze([
{id:"I14-1",label:"Irénée I,14,1",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"Nom divin énoncé en quatre émissions de 4, 4, 10 et 12 lettres."},
{id:"I14-2",label:"Irénée I,14,2",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"Un nom de lettre, tel Delta, engendre d'autres noms ; convergence finale vers une voix commune symbolisée par Amen."},
{id:"I14-3",label:"Irénée I,14,3",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"Alètheia personnifiée : 24 lettres réparties en douze parties à deux lettres."},
{id:"I14-4",label:"Irénée I,14,4",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"La Vérité prononce « Christ Jésus » ; connaître le son ne signifie pas connaître toute sa puissance."},
{id:"I14-5",label:"Irénée I,14,5",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"9 muettes + 8 semi-voyelles + 7 voyelles, et spéculation sur trois octades."},
{id:"I14-7",label:"Irénée I,14,7–8",url:"https://www.newadvent.org/fathers/0103114.htm",summary:"Sept cieux énoncent Α Ε Η Ι Ο Υ Ω ; cris des nourrissons utilisés comme analogie spéculative."},
{id:"I15-1",label:"Irénée I,15,1",url:"https://www.newadvent.org/fathers/0103115.htm",summary:"Quatre noms de longueurs 7+5+5+7 selon une graphie particulière du nom de Silence."},
{id:"I15-4",label:"Irénée I,15,4–5",url:"https://www.newadvent.org/fathers/0103115.htm",summary:"Réfutation : un alphabet historiquement évolutif ne saurait être tenu sans examen pour la forme éternelle de la Vérité."}
]);
const SOURCEMAP=Object.fromEntries(SOURCES.map(x=>[x.id,x]));
const LEGACY=[
{name:"Arrhêtos",greek:"ΑΡΡΗΤΟΣ",count:7,meaning:"Ineffable"},
{name:"Seigê",greek:"ΣΕΙΓΗ",count:5,meaning:"Silence (graphie comptée dans la source)"},
{name:"Patêr",greek:"ΠΑΤΗΡ",count:5,meaning:"Père"},
{name:"Alêtheia",greek:"ΑΛΗΘΕΙΑ",count:7,meaning:"Vérité"}
];
const GREEK_NAMES={
"Α":"ΑΛΦΑ","Β":"ΒΗΤΑ","Γ":"ΓΑΜΜΑ","Δ":"ΔΕΛΤΑ","Ε":"ΕΨΙΛΟΝ","Ζ":"ΖΗΤΑ","Η":"ΗΤΑ","Θ":"ΘΗΤΑ",
"Ι":"ΙΩΤΑ","Κ":"ΚΑΠΠΑ","Λ":"ΛΑΜΒΔΑ","Μ":"ΜΥ","Ν":"ΝΥ","Ξ":"ΞΙ","Ο":"ΟΜΙΚΡΟΝ","Π":"ΠΙ",
"Ρ":"ΡΩ","Σ":"ΣΙΓΜΑ","Τ":"ΤΑΥ","Υ":"ΥΨΙΛΟΝ","Φ":"ΦΙ","Χ":"ΧΙ","Ψ":"ΨΙ","Ω":"ΩΜΕΓΑ"
};
function countLetters(word){return R.greekLetters(word,false).letters.length}
function isopsephy(word){return R.analyzeWord(word).isopsephy}
function calculate(){
 const pairs=R.pairs.map(p=>({pair:p.number,part:p.body,greek:p.first+" — "+p.last,ranks:p.ranks,rankSum:p.ranks[0]+p.ranks[1],source:"I14-3"}));
 const tetrad=LEGACY.map(x=>({...x,calculated:countLetters(x.greek)}));
 const commonSilence={greek:"ΣΙΓΗ",length:countLetters("ΣΙΓΗ")};
 return {
  version:"ALPHA-MARCUS/1.0.0",
  nameOfThirty:{segments:[4,4,10,12],sum:4+4+10+12,source:"I14-1",notice:"Quatre émissions de longueurs déclarées ; ne fournit pas la transcription des trente lettres."},
  alphabetBody:{pairs,sumOfAllRanks:24*25/2,totalLetters:24,allPairs25:pairs.every(x=>x.rankSum===25),source:"I14-3"},
  tetrad:{names:tetrad,total:tetrad.reduce((a,x)=>a+x.calculated,0),reportedCount:24,commonSilence,
    commonTetradTotal:7+4+5+7,source:"I15-1",
    warning:"Le résultat 24 dépend notamment de la forme rapportée ΣΕΙΓΗ (5), alors que ΣΙΓΗ (4) conduirait à 23. Les variantes de graphie doivent être documentées."},
  languageClasses:{mutes:9,semivowels:8,vowels:7,total:9+8+7,octads:3*8,source:"I14-5",
    warning:"L'égalisation en octades appartient au raisonnement du texte, pas à un classement phonétique moderne."},
  heavens:{vowels:[..."ΑΕΗΙΟΥΩ"],count:7,source:"I14-7"},
  jesus:{form:"ΙΗΣΟΥΣ",letters:countLetters("ΙΗΣΟΥΣ"),value:isopsephy("ΙΗΣΟΥΣ"),source:"I14-4"},
  epistemology:{
    heardName:"Christ Jésus",
    claim:"La Tétrade distingue le son accessible du nom et sa puissance supposée.",
    historicalStatus:"Doctrine attribuée à Marcus par Irénée, non affirmation scientifique démontrable",
    source:"I14-4"
  },
  sourceLimit:"Corpus médiatisé par l'adversaire Irénée. Pas de livre autographe de Marcus conservé qui confirmerait indépendamment les paroles."
 };
}
function expand(letter,depth=2,limit=10000){
 const normalized=R.normalize(letter);
 if([...normalized].length!==1||!GREEK_NAMES[normalized])throw Error("Choisir une seule lettre grecque de l'alphabet.");
 if(!Number.isInteger(depth)||depth<0||depth>4)throw Error("Profondeur permise : 0 à 4.");
 let current=normalized,stages=[{level:0,length:1,text:normalized,preview:normalized}],truncated=false;
 for(let i=1;i<=depth;i++){
  let next="";
  for(const l of current){
   const name=GREEK_NAMES[l];
   if(!name)throw Error("Lettre grecque non couverte par les noms modernes du simulateur.");
   next+=name;
   if(next.length>limit){truncated=true;break}
  }
  if(truncated){stages.push({level:i,length:null,text:null,preview:"Développement interrompu à la limite de "+limit+" caractères"});break}
  current=next;
  stages.push({level:i,length:current.length,text:current.length<=250?current:null,preview:current.slice(0,250)});
 }
 return {letter:normalized,depth,stages,truncated,
   source:"I14-2",
   warning:"L'expansion illustre l'idée de Marcus, mais emploie ici les noms GRECS MODERNES standardisés des lettres, dont les graphies peuvent différer dans l'Antiquité. Les longueurs obtenues aux niveaux supérieurs ne sont pas attestées comme résultats de Marcus."};
}
function wordReport(word){
 const w=R.analyzeWord(word);
 return {form:word,normalized:w.normalized,length:w.length,ordinalSum:w.alphabetRanksTotal,isopsephy:w.isopsephy,
  parts:w.bodyCounts,letterPairs:w.pairedLetterSets,
  note:"Nom prononcé, nombre calculé et sens/puissance alléguée sont trois notions différentes. Aucune vérité historique ou théologique n'est déduite de la seule valeur."};
}
function audit(){
 const r=calculate();
 const tests=[
  {id:"C1",name:"24 lettres regroupées en 12 paires",pass:r.alphabetBody.pairs.length===12&&r.alphabetBody.totalLetters===24},
  {id:"C2",name:"Toutes les paires de rangs totalisent 25",pass:r.alphabetBody.allPairs25},
  {id:"C3",name:"4 + 4 + 10 + 12 = 30",pass:r.nameOfThirty.sum===30},
  {id:"C4",name:"7 + 5 + 5 + 7 = 24 selon les graphies retenues",pass:r.tetrad.total===24&&r.tetrad.names.every(n=>n.calculated===n.count)},
  {id:"C5",name:"Graphie courante ΣΙΓΗ = 4, non 5",pass:r.tetrad.commonSilence.length===4&&r.tetrad.commonTetradTotal===23},
  {id:"C6",name:"9 + 8 + 7 = 24",pass:r.languageClasses.total===24},
  {id:"C7",name:"ΙΗΣΟΥΣ = 888",pass:r.jesus.value===888},
  {id:"C8",name:"Sept voyelles dans la séquence rapportée",pass:r.heavens.count===7&&r.heavens.vowels.join("")==="ΑΕΗΙΟΥΩ"}
 ];
 return {version:r.version,checks:tests,passed:tests.filter(t=>t.pass).length,total:tests.length,result:r,
  observations:[
   {level:"T",text:"Irénée présente un système où l'unité de la voix donne lieu à une multitude de lettres, noms, puissances et figures.",sourceIds:["I14-1","I14-2"]},
   {level:"T",text:"Le corps de la Vérité mobilise l'alphabet entier, pas seulement les lettres du mot ΑΛΗΘΕΙΑ.",sourceIds:["I14-3"]},
   {level:"T",text:"La Vérité prononce Christ Jésus puis se tait ; le texte distingue le son du nom et sa puissance.",sourceIds:["I14-4"]},
   {level:"N",text:"Le quadruple nom compte 30 éléments et les quatre noms de la Tétrade sont donnés pour 24 lettres.",sourceIds:["I14-1","I15-1"]},
   {level:"CRITIQUE",text:"La correspondance 24 des quatre noms est sensible à la graphie de Silence, et ne doit pas être attribuée indistinctement à toutes les formes grecques.",sourceIds:["I15-1"]},
   {level:"H",text:"Aucun manuscrit autographe de Marcus ni preuve que Jésus ait enseigné personnellement ce système n'a été identifié.",sourceIds:["I14-3","I14-4"]}
  ],
  sources:SOURCES,
  conclusion:"Ce système tente de représenter comment la parole et les noms rendent visible l'invisible, du multiple vers l'unité, à travers des correspondances alphabétiques. Il s'agit d'une cosmologie rapportée par Irénée, pas d'une méthode objectivement validée pour décoder les intentions d'un texte ou de Jésus."
 };
}
const api=Object.freeze({version:"ALPHA-MARCUS/1.0.0",sources:SOURCES,calculate,audit,expand,wordReport,letterNames:Object.freeze({...GREEK_NAMES})});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_MARCUS=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
