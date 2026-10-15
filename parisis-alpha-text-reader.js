/* ELOAH · PARISIS ENGINE · ALPHA-010 — Lecteur analytique.
   Grec historique : caractères normalisés, 24 rangs, 12 couples d'Irénée I,14,3.
   Mode latin optionnel : substitution expérimentale et NON translittération philologique.
   Zéro service distant, aucun stockage client, aucun diagnostic mystique automatisé.
*/
(function(root){
"use strict";
const ALPHABET=[..."ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"];
const PARTS=["Tête","Cou","Épaules et mains","Poitrine","Diaphragme","Dos","Ventre","Cuisses","Genoux","Jambes","Chevilles","Pieds"];
const NUMBERS={Α:1,Β:2,Γ:3,Δ:4,Ε:5,Ζ:7,Η:8,Θ:9,Ι:10,Κ:20,Λ:30,Μ:40,Ν:50,Ξ:60,Ο:70,Π:80,Ρ:100,Σ:200,Τ:300,Υ:400,Φ:500,Χ:600,Ψ:700,Ω:800};
const LATIN_MAP={A:"Α",B:"Β",C:"Κ",D:"Δ",E:"Ε",F:"Φ",G:"Γ",H:"Η",I:"Ι",J:"Ζ",K:"Κ",L:"Λ",M:"Μ",N:"Ν",O:"Ο",P:"Π",Q:"Κ",R:"Ρ",S:"Σ",T:"Τ",U:"Υ",V:"Β",W:"Ω",X:"Χ",Y:"Υ",Z:"Ζ"};
const ROMAN={Α:"A",Β:"B",Γ:"G",Δ:"D",Ε:"E",Ζ:"Z",Η:"Ê",Θ:"Th",Ι:"I",Κ:"K",Λ:"L",Μ:"M",Ν:"N",Ξ:"X",Ο:"O",Π:"P",Ρ:"R",Σ:"S",Τ:"T",Υ:"Y",Φ:"Ph",Χ:"Kh",Ψ:"Ps",Ω:"Ô"};
const PAIRS=PARTS.map((body,i)=>Object.freeze({number:i+1,body,first:ALPHABET[i],last:ALPHABET[23-i],ranks:[i+1,24-i],rankTotal:25}));
const LETTERS=new Map();
for(const p of PAIRS){
 for(const [g,r] of [[p.first,p.ranks[0]],[p.last,p.ranks[1]]]){
  LETTERS.set(g,Object.freeze({letter:g,rank:r,pair:p.number,body:p.body,partner:g===p.first?p.last:p.first,otherRank:g===p.first?p.ranks[1]:p.ranks[0],value:NUMBERS[g],vowel:"ΑΕΗΙΟΥΩ".includes(g)}));
 }
}
function normalize(text){
 const source=String(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleUpperCase("el");
 return source.replace(/ς/g,"Σ").replace(/Ϲ/g,"Σ");
}
function tokenise(text){
 return Array.from(String(text||"").matchAll(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu),m=>m[0]);
}
function greekLetters(word,latinMode=false){
 const clean=normalize(word);
 const original=[...clean].filter(c=>/\p{L}/u.test(c));
 const converted=[];
 let unknown=[],approximate=false;
 for(const c of original){
  if(LETTERS.has(c)){converted.push(c);continue}
  if(latinMode&&Object.prototype.hasOwnProperty.call(LATIN_MAP,c)){converted.push(LATIN_MAP[c]);approximate=true;continue}
  unknown.push(c);
 }
 return {letters:converted,unknown,approximate,normalized:converted.join("")};
}
function analyzeWord(input,latinMode=false){
 const raw=String(input??"").slice(0,2000),parsed=greekLetters(raw,latinMode);
 const counts=Array(12).fill(0),positions={},present=new Set(),detail=[];
 let ordinalSum=0, numericSum=0,vowelCount=0;
 for(const c of parsed.letters){
  const entry=LETTERS.get(c);detail.push(entry);
  counts[entry.pair-1]++;positions[c]=(positions[c]||0)+1;present.add(c);
  ordinalSum+=entry.rank;numericSum+=entry.value;
  if(entry.vowel)vowelCount++;
 }
 const pairCompletions=PAIRS.filter(p=>present.has(p.first)&&present.has(p.last)).map(p=>p.number);
 const parts=PAIRS.map((p,i)=>({part:p.body,pair:p.number,count:counts[i],letters:p.first+"–"+p.last})).filter(x=>x.count>0);
 const result={
  input:raw,normalized:parsed.normalized,length:parsed.letters.length,
  alphabetRanksTotal:parsed.letters.length?ordinalSum:null,
  isopsephy:parsed.letters.length?numericSum:null,vowels:vowelCount,consonants:parsed.letters.length-vowelCount,
  approximate:parsed.approximate,ignored:parsed.unknown,letters:detail,letterCounts:positions,
  bodyCounts:parts,pairedLetterSets:pairCompletions,
  pairCompletionCount:pairCompletions.length,
  romanization:parsed.letters.map(c=>ROMAN[c]).join("")
 };
 return result;
}
function analyzeText(source,opts={}){
 const text=String(source??"");
 if(text.length>120000)throw Error("Texte trop long : maximum 120 000 caractères.");
 const mode=opts.mode==="latin-experiment"?"latin-experiment":"greek";
 const tokens=tokenise(text),wordLimit=1800;
 if(tokens.length>wordLimit)throw Error("Ce lecteur accepte au maximum 1 800 mots à la fois.");
 const analyzed=tokens.map((w,i)=>({...analyzeWord(w,mode==="latin-experiment"),index:i}));
 const interpreted=analyzed.filter(w=>w.length>0);
 const frequent=new Map(),pairs=Array(12).fill(0),letters=Object.fromEntries(ALPHABET.map(c=>[c,0]));
 let unknownWords=0,estimatedWords=0,totalSymbols=0,totalNumeric=0;
 for(const w of analyzed){
  if(w.ignored.length)unknownWords++;
  if(w.approximate)estimatedWords++;
  if(!w.length)continue;
  totalSymbols+=w.length;totalNumeric+=w.isopsephy;
  const old=frequent.get(w.normalized)||{word:w.normalized,count:0,original:w.input,isopsephy:w.isopsephy};
  old.count++;frequent.set(w.normalized,old);
  for(const a of w.letters){letters[a.letter]++;pairs[a.pair-1]++}
 }
 const frequencies=Array.from(frequent.values()).sort((a,b)=>b.count-a.count||a.word.localeCompare(b.word,"el"));
 const completePairs=PAIRS.map((p,i)=>({body:p.body,pair:i+1,letters:p.first+" — "+p.last,first:letters[p.first],last:letters[p.last],total:pairs[i],observedBoth:letters[p.first]>0&&letters[p.last]>0}));
 const topFrequencies=Object.entries(letters).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]||ALPHABET.indexOf(a[0])-ALPHABET.indexOf(b[0])).slice(0,12);
 return {
  original:text,mode,stats:{characters:[...text].length,tokens:tokens.length,analyzedWords:interpreted.length,unmappedWords:unknownWords,approximateWords:estimatedWords,greekLetters:totalSymbols,wordValueSum:totalSymbols?totalNumeric:null,distinctWords:frequent.size},
  words:analyzed,frequentWords:frequencies,pairs:completePairs,frequentLetters:topFrequencies,
  interpretation:"Il s'agit d'un classement descriptif contemporain fondé sur les correspondances rapportées par Irénée, non d'une traduction ni d'une révélation cachée.",
  warnings:[
   "Le modèle associe les lettres grecques aux douze parties du corps selon Irénée, Contre les hérésies I,14,3 ; les valeurs numériques sont celles de l'isopséphie grecque, différentes des rangs 1–24.",
   "Les accents, esprits et iotas souscrits sont simplifiés lors de la normalisation ; les distinctions linguistiques et grammaticales ne sont pas analysées.",
   ...(estimatedWords?["Le mode latin est une substitution graphique approximative : il ne traduit PAS les mots français ni ne restitue leur étymologie grecque."]:[]),
   ...(unknownWords?["Certains signes alphabétiques du texte n'appartiennent pas aux 24 lettres grecques et sont exclus des totaux correspondants."]:[])
  ]
 };
}
function exportCSV(report){
 const rows=[["mot original","grec normalisé","rang total","isopséphie","voyelles","parties du corps","lettres ignorées","conversion approximative"]];
 for(const w of report.words)rows.push([w.input,w.normalized,w.alphabetRanksTotal??"",w.isopsephy??"",w.vowels,w.bodyCounts.map(p=>p.part+":"+p.count).join(" | "),w.ignored.join(""),w.approximate?"oui":"non"]);
 return "\uFEFF"+rows.map(row=>row.map(s=>'"'+String(s).replace(/"/g,'""')+'"').join(";")).join("\r\n");
}
const api=Object.freeze({version:"ALPHA-LECTEUR/1.0.0",alphabet:ALPHABET,parts:PARTS,pairs:PAIRS,letterInfo:c=>LETTERS.get(normalize(c))||null,normalize,tokenise,greekLetters,analyzeWord,analyzeText,exportCSV,romanization:ROMAN,latinMapping:LATIN_MAP});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_READER=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
