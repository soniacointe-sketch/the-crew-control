/* ELOAH NUMERA · BIBLE EN MUSIQUE · Moteur de versets et partition
 * Textes Louis Segond 1910 (domaine public) via API Midvash ou bibliothèque locale (repli).
 * Les valeurs des lettres françaises sont CONVENTIONS MUSICALES (A=1...Z=26).
 * Des valeurs grecques ne sont calculées que si le texte réellement fourni est grec.
 * Aucun texte de compte privé n'est envoyé ; appel externe limité au passage biblique demandé.
 */
(function(root){
"use strict";
const N=root?.ELOAH_NUMERA_ENGINE;if(!N)return;
const BASE="https://api.midvash.com/v1/lsg";
const FALLBACK="https://raw.githubusercontent.com/midvash/bible-data/main/versions/fr/lsg/books/";
const books=[
["Gen","Genèse",50],["Exod","Exode",40],["Lev","Lévitique",27],["Num","Nombres",36],["Deut","Deutéronome",34],
["Josh","Josué",24],["Judg","Juges",21],["Ruth","Ruth",4],["1Sam","1 Samuel",31],["2Sam","2 Samuel",24],
["1Kgs","1 Rois",22],["2Kgs","2 Rois",25],["1Chr","1 Chroniques",29],["2Chr","2 Chroniques",36],
["Ezra","Esdras",10],["Neh","Néhémie",13],["Esth","Esther",10],["Job","Job",42],["Ps","Psaumes",150],
["Prov","Proverbes",31],["Eccl","Ecclésiaste",12],["Song","Cantique des cantiques",8],["Isa","Ésaïe",66],
["Jer","Jérémie",52],["Lam","Lamentations",5],["Ezek","Ézéchiel",48],["Dan","Daniel",12],
["Hos","Osée",14],["Joel","Joël",3],["Amos","Amos",9],["Obad","Abdias",1],["Jonah","Jonas",4],
["Mic","Michée",7],["Nah","Nahum",3],["Hab","Habacuc",3],["Zeph","Sophonie",3],["Hag","Aggée",2],
["Zech","Zacharie",14],["Mal","Malachie",4],
["Matt","Matthieu",28],["Mark","Marc",16],["Luke","Luc",24],["John","Jean",21],["Acts","Actes",28],
["Rom","Romains",16],["1Cor","1 Corinthiens",16],["2Cor","2 Corinthiens",13],["Gal","Galates",6],
["Eph","Éphésiens",6],["Phil","Philippiens",4],["Col","Colossiens",4],["1Thess","1 Thessaloniciens",5],
["2Thess","2 Thessaloniciens",3],["1Tim","1 Timothée",6],["2Tim","2 Timothée",4],["Titus","Tite",3],
["Phlm","Philémon",1],["Heb","Hébreux",13],["Jas","Jacques",5],["1Pet","1 Pierre",5],
["2Pet","2 Pierre",3],["1John","1 Jean",5],["2John","2 Jean",1],["3John","3 Jean",1],
["Jude","Jude",1],["Rev","Apocalypse",22]
].map((b,i)=>Object.freeze({code:b[0],name:b[1],chapters:b[2],slug:b[0].toLowerCase(),testament:i<39?"ancien":"nouveau"}));
const INDEX=Object.fromEntries(books.map(x=>[x.code,x]));
const SPECIAL=Object.freeze([
 {label:"La Création",book:"Gen",chapter:1,start:1,end:12},
 {label:"Le berger",book:"Ps",chapter:23,start:1,end:null},
 {label:"Au commencement était la Parole",book:"John",chapter:1,start:1,end:14},
 {label:"La Vérité et la Vie",book:"John",chapter:14,start:1,end:17},
 {label:"L'Alpha et l'Oméga",book:"Rev",chapter:1,start:1,end:8},
 {label:"Les Béatitudes",book:"Matt",chapter:5,start:1,end:12}
]);
const BIBLICAL_SAMPLES=Object.freeze({
 "Gen:1":Object.freeze([
 {number:1,text:"Au commencement, Dieu créa les cieux et la terre."},
 {number:2,text:"La terre était informe et vide: il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux."},
 {number:3,text:"Dieu dit: Que la lumière soit! Et la lumière fut."}
 ]),
 "Ps:23":Object.freeze([
 {number:1,text:"L'Éternel est mon berger: je ne manquerai de rien."}
 ]),
 "John:14":Object.freeze([
 {number:6,text:"Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi."}
 ])
});
function normalizeVerses(raw,book,chapter){
 let payload=raw?.data??raw;
 if(!payload)throw Error("Réponse biblique vide.");
 // v1: data object with verses. Alternative data services: arrays or a chapter object.
 let arr=Array.isArray(payload)?payload:
  Array.isArray(payload.verses)?payload.verses:
  Array.isArray(payload.chapter?.verses)?payload.chapter.verses:
  Array.isArray(payload.chapters)?payload.chapters.find(c=>Number(c.chapter)===Number(chapter))?.verses:
  Array.isArray(payload.book?.chapters)?payload.book.chapters.find(c=>Number(c.chapter)===Number(chapter))?.verses:
  null;
 if(!arr&&payload.text&&typeof payload.text==="string"){
  arr=[{number:payload.verse||1,text:payload.text}];
 }
 if(!arr&&payload.verses&&typeof payload.verses==="object"){
  arr=Object.entries(payload.verses).map(([number,text])=>({number,text}));
 }
 if(!arr)throw Error("Le fournisseur a renvoyé un format de chapitre inconnu.");
 const result=arr.map((entry,i)=>{
  const number=Number(entry.number??entry.verse??entry.verseNumber??entry.verse_number??i+1);
  const text=typeof entry.text==="string"?entry.text:typeof entry.content==="string"?entry.content:typeof entry.verse==="string"?entry.verse:"";
  return {number,text:String(text).replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim()};
 }).filter(x=>Number.isInteger(x.number)&&x.number>0&&x.number<=200&&x.text.length>0);
 const seen=new Set();const out=result.filter(v=>{if(seen.has(v.number))return false;seen.add(v.number);return true});
 out.sort((a,b)=>a.number-b.number);
 if(!out.length)throw Error("Aucun verset lisible dans la réponse.");
 return out.slice(0,200);
}
function chapterKey(book,chapter){return book+":"+chapter}
function validateReference(book,chapter){
 const b=INDEX[book];if(!b)throw Error("Livre biblique non reconnu.");
 const c=Number(chapter);if(!Number.isInteger(c)||c<1||c>b.chapters)throw Error("Chapitre hors limites pour "+b.name+".");
 return {book:b,chapter:c,reference:b.name+" "+c};
}
async function fetchChapter(bookCode,chapter,fetchImpl){
 const ref=validateReference(bookCode,chapter);
 const fetcher=fetchImpl||root.fetch?.bind(root);
 if(typeof fetcher!=="function")throw Error("Connexion biblique indisponible.");
 const apiURL=BASE+"/"+encodeURIComponent(ref.book.slug)+"/"+ref.chapter;
 let lastError=null;
 const read=async url=>{
  const controller=typeof AbortController!=="undefined"?new AbortController():null;
  const timer=controller?setTimeout(()=>controller.abort(),12000):null;
  try{
   const response=await fetcher(url,{method:"GET",signal:controller?.signal,headers:{Accept:"application/json"}});
   if(!response.ok)throw Error("HTTP "+response.status);
   return await response.json();
  }finally{if(timer)clearTimeout(timer)}
 };
 try{
  const raw=await read(apiURL);
  const verses=normalizeVerses(raw,ref.book.code,ref.chapter);
  return {reference:ref.reference,book:bookCode,chapter:ref.chapter,verses,provider:"Midvash",version:raw?.data?.version||"lsg",credit:raw?.meta?.copyright||"Louis Segond 1910 · domaine public",url:apiURL,complete:true};
 }catch(e){lastError=e}
 try{
  const bookJson=await read(FALLBACK+encodeURIComponent(ref.book.code)+".json");
  const selected=Array.isArray(bookJson?.chapters)?bookJson.chapters.find((x,i)=>Number(x.chapter??i+1)===ref.chapter):null;
  if(!selected)throw Error("Chapitre absent de la copie biblique.");
  const verses=normalizeVerses(selected,ref.book.code,ref.chapter);
  return {reference:ref.reference,book:bookCode,chapter:ref.chapter,verses,provider:"Corpus Midvash / GitHub",version:"lsg",credit:"Louis Segond 1910 · domaine public",url:FALLBACK+encodeURIComponent(ref.book.code)+".json",complete:true};
 }catch(error){
  const builtin=BIBLICAL_SAMPLES[chapterKey(bookCode,ref.chapter)];
  if(builtin)return {reference:ref.reference,book:bookCode,chapter:ref.chapter,verses:builtin.map(x=>({...x})),provider:"Extraits embarqués",version:"lsg",credit:"Louis Segond 1910 · domaine public",url:"https://ebible.org/Scriptures/details.php?id=fraLSG",complete:false,
   warning:"Connexion indisponible ; seuls quelques versets locaux sont affichés. Le chapitre complet n'a PAS été chargé."};
  throw Error("Impossible de charger le chapitre (service principal : "+(lastError?.message||"erreur")+" ; alternative : "+error.message+"). Tu peux coller son texte manuellement.");
 }
}
function fromManual(text,opts={}){
 const str=String(text||"").trim();
 if(!str)throw Error("Colle un texte biblique.");
 if(str.length>30000)throw Error("Texte trop long : 30 000 caractères maximum.");
 const rows=str.split(/\n+/).map(s=>s.trim()).filter(Boolean);
 const verses=rows.map((line,i)=>{
  const m=line.match(/^\s*(?:v(?:erset)?\.?\s*)?(\d{1,3})\s*[.:)\-]?\s+(.*)$/i);
  return {number:m?Number(m[1]):i+1,text:m?m[2]:line};
 }).filter(x=>x.number>=1&&x.number<=200&&x.text.length>0).slice(0,200);
 return {reference:String(opts.reference||"Passage personnel").slice(0,100),book:null,chapter:null,verses,provider:"Texte collé par l’utilisateur",version:"personnelle",credit:"Vérifie les droits de la traduction copiée.",complete:false,url:null};
}
function selectRange(doc,start=1,end=null){
 if(!doc||!Array.isArray(doc.verses))throw Error("Passage non chargé.");
 const first=Number(start)||1,last=end==null?Infinity:Number(end);
 if(!Number.isFinite(first)||first<1||last<first)throw Error("Plage de versets incorrecte.");
 const verses=doc.verses.filter(v=>v.number>=first&&v.number<=last);
 if(!verses.length)throw Error("Aucun verset pour cette plage.");
 return {...doc,verses,reference:doc.reference+(Number.isFinite(last)?":"+first+"-"+last:first===1?"":":"+first+"-fin")};
}
function deriveMusic(doc,options={}){
 if(!doc?.verses?.length)throw Error("Aucun verset à composer.");
 const mode=N.modes[options.mode]?options.mode:"ambient";
 const bpm=Math.max(45,Math.min(180,Math.round(Number(options.bpm)||76)));
 const rootMidi=Math.max(36,Math.min(72,Math.round(Number(options.root)||48)));
 const volume=Math.max(.08,Math.min(1,Number(options.volume)||.46));
 const scale=N.scales[options.scale]?options.scale:"dorian";
 const drums=options.drums===true;
 const pad=options.pad!==false;
 const allNotes=[],allDrums=[],allChords=[],chapters=[];
 let offset=0;
 const bars=Math.min(2,Math.max(1,Math.round(Number(options.barsPerVerse)||1)));
 const useVerses=doc.verses.slice(0,120);
 for(let i=0;i<useVerses.length;i++){
  const v=useVerses[i];
  const c=N.compose({input:String(v.number)+" "+v.text.slice(0,900),sourceMode:"text",mode,scale,root:rootMidi,bpm,bars,
   variation:Math.max(.1,Math.min(.87,Number(options.variation)??.35)),swing:.045,drums,pad,volume});
  const noteEvents=c.notes.map(n=>({...n,beat:n.beat+offset,verse:v.number}));
  const chordEvents=c.chords.map(n=>({...n,beat:n.beat+offset,verse:v.number}));
  const drumEvents=c.drumEvents.map(n=>({...n,beat:n.beat+offset,verse:v.number}));
  allNotes.push(...noteEvents);allChords.push(...chordEvents);allDrums.push(...drumEvents);
  chapters.push({verse:v.number,text:v.text,beatStart:offset,beats:bars*4,noteCount:c.notes.length,sourceValue:c.source.number,
   previewNotes:c.notes.slice(0,8).map(x=>x.midi)});
  offset+=bars*4;
 }
 const duration=offset*60/bpm;
 return {
  version:"BIBLE-MUSIC/1.0.0",scripture:{reference:doc.reference,book:doc.book,chapter:doc.chapter,credit:doc.credit,
   provider:doc.provider,url:doc.url,complete:doc.complete,verseCount:useVerses.length},
  config:{...N.settings({input:"BIBLE",sourceMode:"text",mode,scale,root:rootMidi,bpm,bars:8,volume,drums,pad}),volume},
  source:{kind:"bible-text",normalized:doc.reference,input:doc.reference,number:useVerses.length,isopsephy:null,tokens:[]},
  seed:N.fnv1a(doc.reference+":"+useVerses.map(v=>v.text).join("|").slice(0,2000)),
  notes:allNotes,drumEvents:allDrums,chords:allChords,
  chapters,pattern:[],scaleNotes:[],beatSeconds:60/bpm,
  timelineLengthBeats:offset,durationSeconds:duration,
  stats:{bars:offset/4,steps:offset*4,notes:allNotes.length,drums:allDrums.length,chords:allChords.length,bpm,
   loopSeconds:Math.round(duration*10)/10},
  caution:"La conversion du français en notes est créative. Ce score n'est ni une mélodie retrouvée dans la Bible ni une conversion hébraïque/grecque."
 };
}
function audit(){
 const tests=[],push=(n,v)=>tests.push({label:n,pass:Boolean(v)});
 const doc=fromManual("1 Au commencement, Dieu créa les cieux et la terre.\n2 La lumière fut.",{reference:"Genèse 1"});
 const music=deriveMusic(doc,{mode:"mystic",bpm:82,drums:false});
 push("66 livres du canon protestant Segond 1910",books.length===66);
 push("Genèse compte 50 chapitres",INDEX.Gen.chapters===50);
 push("Psaumes compte 150 chapitres",INDEX.Ps.chapters===150);
 push("Jean compte 21 chapitres",INDEX.John.chapters===21);
 push("Apocalypse compte 22 chapitres",INDEX.Rev.chapters===22);
 push("Lecture manuelle par versets",doc.verses.length===2&&doc.verses[0].number===1);
 push("Composition du verset 1 et 2",music.chapters.length===2&&music.stats.bars===2);
 push("Notes de chaque verset",music.notes.some(x=>x.verse===1)&&music.notes.some(x=>x.verse===2));
 push("Batterie désactivée dans une lecture méditative",music.drumEvents.length===0);
 push("Respect du français sans faux isopséphisme grec",music.caution.includes("créative")&&music.source.isopsephy===null);
 push("Filtre de plage respecte versets",selectRange(doc,2,2).verses.length===1);
 push("Format chapitre normalisé",normalizeVerses({data:{verses:[{number:1,text:"Début"},{number:2,text:"Suite"}]}},"Gen",1).length===2);
 return {passed:tests.filter(t=>t.pass).length,total:tests.length,checks:tests};
}
const api=Object.freeze({version:"BIBLE-MUSIC/1.0.0",books,specials:SPECIAL,validateReference,normalizeVerses,fetchChapter,fromManual,selectRange,deriveMusic,audit,builtIn:BIBLICAL_SAMPLES});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.ELOAH_BIBLE_MUSIC=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
