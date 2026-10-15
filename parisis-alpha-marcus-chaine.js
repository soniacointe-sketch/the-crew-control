/* ELOAH · PARISIS ENGINE · ALPHA-016
   Chaîne des Éons, sons, lettres, Ogdoades, Épisémon et voix selon Irénée I,14.
   Simulation critique : opérations numériques attestées dans le témoignage, pas mécanisme
   de création du monde démontré. Ne lit aucune donnée personnelle.
*/
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const SOURCE="https://www.newadvent.org/fathers/0103114.htm";
const EDITION="https://ccel.org/ccel/irenaeus/against_heresies_i/anf01.ix.ii.xv.html";
const GROUPS=Object.freeze([
 {key:"mutes",name:"Muettes",letters:[..."ΠΚΤΒΓΔΦΧΘ"],pairs:"Pater · Alètheia",ref:"I,14,5",size:9},
 {key:"semivowels",name:"Semi-voyelles",letters:[..."ΛΜΝΡΣΖΞΨ"],pairs:"Logos · Zoè",ref:"I,14,5",size:8},
 {key:"vowels",name:"Voyelles",letters:[..."ΑΕΗΙΟΥΩ"],pairs:"Anthropos · Ekklèsia",ref:"I,14,5–7",size:7}
]);
const DOUBLES=Object.freeze([{letter:"Ζ",comment:"ζ — lettre dite double dans la note éditoriale"},{letter:"Ξ",comment:"ξ — lettre dite double dans la note éditoriale"},{letter:"Ψ",comment:"ψ — lettre dite double dans la note éditoriale"}]);
const AEON_TERMS=Object.freeze(["Éons","Mots","Racines","Semences","Plénitudes","Fruits"]);
const STAGES=Object.freeze([
 {id:"origine",number:1,title:"Les noms sont dits Éons",ref:"I,14,2",
  observation:"Irénée rapporte que Marcus réunit Éons, paroles, racines, semences, plénitudes et fruits sous le nom d’Ecclesia.",
  warning:"Les six étiquettes de ce passage ne sont pas un dénombrement supplémentaire de six Éons indépendants."},
 {id:"emanation",number:2,title:"Le dernier son et sa propagation",ref:"I,14,2",
  observation:"Dans le récit, la dernière lettre émet un son, le son engendre des éléments ; une lettre remonte à sa syllabe tandis que le son demeure en bas.",
  warning:"C'est une description cosmologique imagée, non un phénomène acoustique observable au moyen de ce programme."},
 {id:"alphabet",number:3,title:"Les trois classes de lettres",ref:"I,14,5",
  observation:"Neuf muettes, huit semi-voyelles et sept voyelles : trois classes de grammaire grecque ancienne mises en relation avec des couples d’Éons.",
  warning:"Catégories historiques ; à ne pas substituer à la phonétique contemporaine."},
 {id:"ogdoades",number:4,title:"Le rééquilibrage en trois Ogdoades",ref:"I,14,5",
  observation:"La doctrine rapporte que la division de sept reçoit la puissance de huit et que l’ensemble devient trois Ogdoades totalisant vingt-quatre.",
  warning:"Le passage exprime une égalisation symbolique ; notre schéma arithmétique 9−1, 8, 7+1 n’est pas une nouvelle classification attestée lettre par lettre."},
 {id:"episemon",number:5,title:"L'Épisémon et le passage au trente",ref:"I,14,5–6",
  observation:"Irénée associe le six, les lettres dites doubles et l'Épisémon à la complétion symbolique de 24 en 30.",
  warning:"Ne pas ajouter six lettres réelles au grec : les 24 caractères restent l’alphabet de base. Le signe numéral pour six et les trois lettres doubles sont des notions distinctes."},
 {id:"colombe",number:6,title:"Alpha, Oméga et la colombe",ref:"I,14,6",
  observation:"L’association Alpha–Oméga à la colombe repose sur une égalité isopséphique de 801, accompagnée d’exégèses du sixième jour et de la sixième heure.",
  warning:"L'identité numérique est vérifiable ; l'interprétation théologique appartient à la doctrine rapportée."},
 {id:"cieux",number:7,title:"Sept voyelles et sept cieux",ref:"I,14,7",
  observation:"Sept puissances célestes prononcent successivement Α Ε Η Ι Ο Υ Ω et leur chant est présenté comme source de formation.",
  warning:"Il ne s'agit ni d'une table des fréquences planétaires ni d'une partition musicale conservée."},
 {id:"cri",number:8,title:"Nouveau-nés, oméga et voix commune",ref:"I,14,8 et I,14,1–2",
  observation:"Irénée rapporte une analogie entre la plainte des nouveau-nés, le son Ω et l'ordre céleste ; la diversité des voix est ramenée symboliquement à l’Amen.",
  warning:"Les cris de nourrissons ne prouvent pas cette cosmologie. Amen est un symbole de voix unanime, pas le résultat acoustique d'un algorithme."}
]);
function num(word){
 const w=R.analyzeWord(word);
 if(!w.length||w.ignored.length)throw Error("Mot grec incorrect.");
 return w.isopsephy;
}
function analyze(opts={}){
 const input=String(opts.word||"Ἰησοῦς").trim();
 if(input.length>160)throw Error("Mot grec trop long.");
 const word=R.analyzeWord(input);
 if(!word.length||word.ignored.length)throw Error("Choisis un nom grec composé des 24 lettres connues.");
 const mutes=GROUPS[0],semis=GROUPS[1],vowels=GROUPS[2];
 const original=[mutes.size,semis.size,vowels.size];
 const ogdoades=[8,8,8];
 const distribution=GROUPS.map(g=>({key:g.key,name:g.name,letters:g.letters.join(" "),count:g.size,associated:g.pairs,observed:word.letters.filter(x=>g.letters.includes(x.letter)).length}));
 const doubles=DOUBLES.map(d=>({...d,found:word.letters.filter(x=>x.letter===d.letter).length}));
 const vox=[..."ΑΕΗΙΟΥΩ"].map((l,i)=>({letter:l,heaven:i+1,present:word.letterCounts[l]||0}));
 const body=R.pairs.map(p=>({
  number:p.number,body:p.body,left:p.first,right:p.last,ranks:p.ranks,
  count:word.bodyCounts.find(x=>x.pair===p.number)?.count||0,
  completed:word.pairedLetterSets.includes(p.number)
 }));
 return {
  word:word.normalized,characters:word.length,isopsephy:word.isopsephy,ordinalSum:word.alphabetRanksTotal,
  partsUsed:body.filter(x=>x.count>0).length,completePairs:body.filter(x=>x.completed).length,
  original,ogdoades,distributions:distribution,doubles,heavens:vox,body,
  schema:{
   fourEmissions:[4,4,10,12],fourEmissionSum:30,
   threeElements:3,threePowers:3,tetradMultiplier:4,analogyProduct:(3+3)*4,
   episemonValue:6,symbolicSupplement:24+6,
   alphaOmega:num("ΑΩ"),dove:num("ΠΕΡΙΣΤΕΡΑ"),jesus:num("ΙΗΣΟΥΣ")
  },
  aeonTerms:[...AEON_TERMS],stages:STAGES,
  cautions:[
   "24 → 30 est une opération symbolique explicitée dans le récit ; l’alphabet grec ne devient pas physiquement un alphabet de trente lettres.",
   "Les trois lettres dites doubles (ζ, ξ, ψ) ne sont pas six caractères supplémentaires ; le signe numéral Épisémon et ces lettres sont distingués.",
   "Le schéma d'égalisation 9/8/7 → 8/8/8 est une représentation arithmétique du récit, pas une redistribution de phonèmes validée lettre par lettre.",
   "Les consonnes, semi-voyelles et voyelles reflètent des catégories antiques et non l'analyse phonologique actuelle."
  ]
 };
}
function audit(){
 const r=analyze({word:"Ἰησοῦς"});
 const check=(id,pass,kind)=>({id,pass:Boolean(pass),kind});
 const union=GROUPS.flatMap(x=>x.letters);
 const out=[
 check("G01 · 24 caractères classés sans double compte",union.length===24&&new Set(union).size===24&&union.every(c=>R.alphabet.includes(c)),"formal"),
 check("G02 · Répartition 9–8–7",GROUPS.map(g=>g.size).join(",")==="9,8,7","formal"),
 check("G03 · Ogdoades 8+8+8=24",r.ogdoades.reduce((a,b)=>a+b,0)===24,"formal"),
 check("G04 · Six éléments quadruplés",r.schema.analogyProduct===24,"formal"),
 check("G05 · Episemon 24+6=30",r.schema.symbolicSupplement===30,"formal"),
 check("G06 · Trois doubles ≠ six lettres",r.doubles.length===3&&r.doubles.every(x=>GROUPS[1].letters.includes(x.letter)),"categorical"),
 check("G07 · 4+4+10+12=30",r.schema.fourEmissionSum===30,"formal"),
 check("G08 · Alpha-Omega 801",r.schema.alphaOmega===801,"isopsephy"),
 check("G09 · Colombe 801",r.schema.dove===801,"isopsephy"),
 check("G10 · Jésus 888",r.schema.jesus===888,"isopsephy"),
 check("G11 · 7 voyelles distinctes",r.heavens.length===7&&r.heavens.map(x=>x.letter).join("")==="ΑΕΗΙΟΥΩ","categorical"),
 check("G12 · 12 paires de rangs 25",r.body.length===12&&r.body.every(x=>x.ranks[0]+x.ranks[1]===25),"formal")
 ];
 return {passed:out.filter(x=>x.pass).length,total:out.length,checks:out,
  message:"Ces tests vérifient notre implémentation du témoignage et ses calculs, pas la vérité scientifique de la cosmologie."};
}
const api=Object.freeze({version:"ALPHA-016/1.0.0",analyze,audit,stages:STAGES,groups:GROUPS,doubles:DOUBLES,source:SOURCE,edition:EDITION});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_CHAINE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
