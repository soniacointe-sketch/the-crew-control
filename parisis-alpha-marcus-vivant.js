/* PARISIS ENGINE · ALPHA-015 — Rejouer les opérations attribuées à Marcus.
 * Simulation analytique actuelle d'après Irénée I,14–15.
 * Ne prétend pas reproduire un rituel d'époque ni révéler une puissance divine.
 */
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
const M=root?.PARISIS_ALPHA_MARCUS;
const P=root?.PARISIS_ALPHA_PAROLES;
if(!R||!M||!P)return;
const ALPHABET=R.alphabet;
const VOYELLES=[..."ΑΕΗΙΟΥΩ"];
const SOURCES=Object.freeze([
 {label:"Irénée I,14,1–2 — Émissions et noms des lettres",url:"https://www.newadvent.org/fathers/0103114.htm"},
 {label:"Irénée I,14,3–4 — Corps d’Alètheia, Christ Jésus et Silence",url:"https://www.newadvent.org/fathers/0103114.htm"},
 {label:"Irénée I,14,7–8 — Sept voyelles et voix",url:"https://www.newadvent.org/fathers/0103114.htm"},
 {label:"Irénée I,15,1 — Les 24 lettres de la Tétrade",url:"https://www.newadvent.org/fathers/0103115.htm"},
 {label:"Jean 14,6 — Texte grec transmis de l’Évangile",url:"https://www.greekbible.com/john/14/6"}
]);
function prepare(opts={}){
 const verseId=opts.verseId||"jn14-6",verse=P.select(verseId);
 if(!verse)throw Error("Passage évangélique non reconnu.");
 const raw=(opts.word||verse.marker);
 const parsed=R.greekLetters(raw,false);
 if(!parsed.letters.length||parsed.unknown.length||parsed.letters.length>80)throw Error("Choisir un mot écrit avec les lettres grecques reconnues (1 à 80 lettres).");
 const greek=parsed.normalized;
 const word=R.analyzeWord(greek);
 const present=new Set(word.letters.map(x=>x.letter));
 const anatomy=M.calculate();
 const corpus=R.analyzeText(verse.greek,{mode:"greek"});
 const body=R.pairs.map((p,i)=>({
  number:p.number,name:p.body,left:p.first,right:p.last,ranks:p.ranks,
  count:word.bodyCounts.find(x=>x.pair===p.number)?.count||0,
  hasLeft:present.has(p.first),hasRight:present.has(p.last),
  complete:present.has(p.first)&&present.has(p.last),
  verseCount:corpus.pairs[i].total
 }));
 const vowels=VOYELLES.map((l,i)=>({letter:l,sky:i+1,heardInName:present.has(l),count:word.letterCounts[l]||0}));
 const stages=[
  {id:"voix",title:"01 · Le nom énoncé",source:"Irénée I,14,4",isAttested:"Irénée présente un nom prononcé par Alètheia et distingue le son entendu de la puissance alléguée."},
  {id:"lettres",title:"02 · Les lettres engendrent des noms",source:"Irénée I,14,2",isAttested:"Le Delta illustre des noms de lettres développés en noms successifs."},
  {id:"corps",title:"03 · Le corps de la Vérité",source:"Irénée I,14,3",isAttested:"Les 24 lettres grecques constituent douze paires attribuées à des parties corporelles."},
  {id:"cieux",title:"04 · Le chant des sept cieux",source:"Irénée I,14,7",isAttested:"Sept cieux prononcent les voyelles Α Ε Η Ι Ο Υ Ω dans cet ordre."},
  {id:"unite",title:"05 · Le retour à l'unité",source:"Irénée I,14,2–4",isAttested:"Les sons sont pensés comme multiples, mais convergents, avec l'Amen et le silence symboliques."}
 ];
 const sources=[...SOURCES,{label:verse.ref+" — Référence de l'extrait étudié",url:verse.source}];
 return {
  version:"ALPHA-015/1.0.0",
  verse:{id:verse.id,reference:verse.ref,french:verse.french,greek:verse.greek,url:verse.source},
  input:greek,word,body,vowels,stages,sources,
  name:{letters:word.length,ordinalTotal:word.alphabetRanksTotal,isopsephy:word.isopsephy,
    completePairs:body.filter(x=>x.complete).length,partsVisited:body.filter(x=>x.count>0).length},
  thirty:anatomy.nameOfThirty.segments,
  nameExpansionNote:"Les noms de lettres générés utilisent une graphie grecque moderne normalisée. Il s'agit d'une SIMULATION des opérations décrites, pas d'une reconstitution manuscrite.",
  verdict:{
   observed:"Le nom "+greek+" possède "+word.length+" lettres grecques, touche "+body.filter(x=>x.count>0).length+
    " des douze parties et réunit "+body.filter(x=>x.complete).length+" paires complètes.",
   attested:"Irénée rapporte une théorie de la voix, des noms qui engendrent des lettres, du corps alphabétique de la Vérité et des sept voyelles.",
   notEstablished:"Ce procédé ne démontre pas que Jésus utilisait ces correspondances, qu'elles forment une langue cachée, ni que leurs nombres dévoilent la nature divine du nom.",
   answer:"Nous pouvons REPRODUIRE la mécanique attribuée à Marcus ; nous ne pouvons pas établir par calcul le sens spirituel qu'il lui prêtait. Le son et le signe sont analysables, la « puissance » invoquée relève de sa doctrine religieuse."
  }
 };
}
function expand(letter,depth=2){
 return M.expand(letter,depth,5000);
}
function expandWholeName(raw,depth=1){
 const parsed=R.greekLetters(raw,false);
 if(!parsed.letters.length||parsed.unknown.length||parsed.letters.length>80)throw Error("Nom grec invalide.");
 if(!Number.isInteger(depth)||depth<1||depth>3)throw Error("Profondeur de nom entre 1 et 3.");
 const rows=parsed.letters.map((letter,index)=>{
  const stream=M.expand(letter,depth,8000);
  const final=stream.stages[stream.stages.length-1];
  return {index:index+1,letter,level:final.level,
   finalLength:final.length,preview:final.preview,truncated:stream.truncated};
 });
 const total=rows.reduce((n,x)=>n+(x.finalLength||0),0);
 return {name:parsed.normalized,originalLength:parsed.letters.length,depth,
  rows,totalGeneratedLetters:total,truncated:rows.some(x=>x.truncated),
  warning:"Développement moderne des noms de lettres, inspiré du raisonnement rapporté par Irénée I,14,2. La chaîne complète n'est pas attestée en ces graphies."};
}
function fullRun(opts={}){
 const data=prepare(opts);
 const selected=opts.expansionLetter||[...data.input][0];
 const expansion=expand(selected,opts.depth??2);
 return {...data,expansion};
}
function audit(){
 const tests=[];
 const verify=(id,condition)=>tests.push({id,pass:Boolean(condition)});
 const r=prepare({verseId:"jn14-6",word:"Ἰησοῦς"});
 verify("24 lettres de base",ALPHABET.length===24);
 verify("12 paires",r.body.length===12);
 verify("Somme 25",r.body.every(x=>x.ranks[0]+x.ranks[1]===25));
 verify("7 voyelles",r.vowels.length===7&&r.vowels.map(x=>x.letter).join("")==="ΑΕΗΙΟΥΩ");
 verify("Iesous = 888",r.name.isopsephy===888);
 verify("Cinq étapes",r.stages.length===5);
 verify("Expansion Delta",expand("Δ",1).stages[1].text==="ΔΕΛΤΑ");
 verify("Jean référence",r.verse.reference==="Jean 14,6");
 verify("Aucune association inventée",r.verdict.notEstablished.includes("ne démontre pas"));
 return {passed:tests.filter(x=>x.pass).length,total:tests.length,tests};
}
const api=Object.freeze({version:"ALPHA-015/1.1.0",prepare,expand,expandWholeName,fullRun,audit,sources:SOURCES});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_VIVANT=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
