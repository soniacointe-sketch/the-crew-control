/* ELOAH / HUMANITIES LAB · ALPHA Comparateur v1
   Analyse deux textes grecs par caractères et mots normalisés.
   Aucune conclusion d'emprunt automatisée. Aucun stockage ou service réseau.
*/
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const LIMIT_MATCHES=120;
function safeWords(text,mode){
 const analysis=R.analyzeText(text,{mode});
 return {analysis,words:analysis.words.filter(w=>w.length>0)};
}
function frequency(words){
 const f=new Map();
 for(const w of words){
  const old=f.get(w.normalized)||{word:w.normalized,original:w.input,count:0,value:w.isopsephy};
  old.count++;f.set(w.normalized,old);
 }
 return f;
}
function comparison(sourceA,sourceB,opts={}){
 const mode=opts.mode==="latin-experiment"?"latin-experiment":"greek";
 const a=safeWords(sourceA,mode),b=safeWords(sourceB,mode);
 const fa=frequency(a.words),fb=frequency(b.words);
 const shared=[],onlyA=[],onlyB=[];
 for(const entry of fa.values()){
  const right=fb.get(entry.word);
  if(right)shared.push({word:entry.word,exampleA:entry.original,exampleB:right.original,countA:entry.count,countB:right.count,value:entry.value});
  else onlyA.push(entry);
 }
 for(const entry of fb.values())if(!fa.has(entry.word))onlyB.push(entry);
 shared.sort((x,y)=>Math.min(y.countA,y.countB)-Math.min(x.countA,x.countB)||x.word.localeCompare(y.word,"el"));
 onlyA.sort((x,y)=>y.count-x.count||x.word.localeCompare(y.word,"el"));
 onlyB.sort((x,y)=>y.count-x.count||x.word.localeCompare(y.word,"el"));
 const d=fa.size+fb.size-shared.length;
 const overlap=d?Math.round(shared.length/d*1000)/10:0;
 const pairDiff=R.pairs.map((p,i)=>{
  const pa=a.analysis.pairs[i],pb=b.analysis.pairs[i];
  return {pair:p.number,body:p.body,first:p.first,last:p.last,sourceA:pa.total,sourceB:pb.total,
    difference:pa.total-pb.total,
    bothTexts:pa.total>0&&pb.total>0};
 });
 return {
  version:"ALPHA-COMPARATEUR/1.0.0",mode,
  sourceA:{tokens:a.analysis.stats.tokens,recognized:a.analysis.stats.analyzedWords,distinct:fa.size,unmapped:a.analysis.stats.unmappedWords},
  sourceB:{tokens:b.analysis.stats.tokens,recognized:b.analysis.stats.analyzedWords,distinct:fb.size,unmapped:b.analysis.stats.unmappedWords},
  shared,onlyA,onlyB,overlapPct:overlap,pairs:pairDiff,
  limitations:[
   "Correspondances de formes graphiques normalisées, pas une preuve de traduction ni de dépendance historique.",
   "Les accents et esprits sont ignorés ; les flexions grecques et les lemmes ne sont pas identifiés.",
   "Une ressemblance linguistique est fréquente même entre deux textes indépendants."
  ]
 };
}
function concordance(text,query,opts={}){
 const mode=opts.mode==="latin-experiment"?"latin-experiment":"greek";
 const needle=R.greekLetters(String(query||""),mode==="latin-experiment").normalized;
 if(!needle)return {query:String(query||""),needle:"",hits:[],total:0,notice:"Aucune lettre grecque reconnue dans la recherche."};
 const matches=Array.from(String(text||"").matchAll(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu));
 if(matches.length>1800)throw Error("Trop de mots : maximum 1 800.");
 const hits=[];
 let total=0;
 for(let i=0;i<matches.length;i++){
  const token=matches[i][0];
  const norm=R.greekLetters(token,mode==="latin-experiment").normalized;
  if(norm!==needle)continue;
  total++;
  if(hits.length<LIMIT_MATCHES){
   const min=Math.max(0,i-4),max=Math.min(matches.length,i+5);
   hits.push({word:token,wordIndex:i+1,charIndex:matches[i].index,
    before:matches.slice(min,i).map(x=>x[0]).join(" "),
    after:matches.slice(i+1,max).map(x=>x[0]).join(" ")});
  }
 }
 return {query:String(query||""),needle,hits,total,notice:"Recherche sur les formes normalisées ; non lemmatisée."};
}
function csv(data){
 const rows=[["mot grec normalisé","occurrences A","occurrences B","isopséphie"]];
 for(const s of data.shared)rows.push([s.word,s.countA,s.countB,s.value??""]);
 const quote=x=>'"'+String(x).replace(/"/g,'""')+'"';
 return "\uFEFF"+rows.map(x=>x.map(quote).join(";")).join("\r\n");
}
const api=Object.freeze({version:"ALPHA-COMPARATEUR/1.0.0",compare:comparison,concordance,csv});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_COMPARATOR=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
