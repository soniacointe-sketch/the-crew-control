/* ALPHA-C8 · moteur d'ingestion et de registre documentaire (sans écriture dans l'ancien stockage ELOAH).
   Les notices Crossref documentent des PUBLICATIONS, non le contenu prouvé des sources antiques.
   Aucun contenu utilisateur n'est envoyé à Crossref : seule une requête bibliographique explicite y est transmise. */
(function(root){
"use strict";
const C7=root?.PARISIS_ALPHA_ENGINE;
const KEY="parisis-alpha-c8-session-v1";
const VERSION="ALPHA-C8/1.0.0";
const MAX_SOURCES=200, MAX_TEXT=12000, MAX_FILE=1024*1024;
const norm=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const clean=(x,max=500)=>String(x??"").trim().slice(0,max);
const safeURL=s=>{try{const u=new URL(String(s));return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:""}catch{return ""}};
const initial=()=>({format:"parisis-alpha-c8",version:VERSION,sources:[],updated:null});
const word=(t,part)=>t.includes(part);
const GREEK={"Α":1,"Β":2,"Γ":3,"Δ":4,"Ε":5,"Ζ":7,"Η":8,"Θ":9,"Ι":10,"Κ":20,"Λ":30,"Μ":40,"Ν":50,"Ξ":60,"Ο":70,"Π":80,"Ρ":100,"Σ":200,"Τ":300,"Υ":400,"Φ":500,"Χ":600,"Ψ":700,"Ω":800};
const MOTIFS=[
 ["sept-voyelles",/(?:sept|7)\s+voyelles|(?:seven|7)\s+vowels|[αεηιουω]{7}/i],
 ["sept-cieux",/(?:sept|7)\s+cieux|(?:seven|7)\s+heavens/i],
 ["sept-tonnerres",/(?:sept|7)\s+tonnerres|(?:seven|7)\s+thunders/i],
 ["alpha-omega",/(?:alpha\s*(?:et|and|[-–—/&+])\s*(?:l['’])?omega)|(?:α\s*(?:[-–—+/]|et)\s*ω)/i],
 ["jesus-enfant",/(?:jesus enfant|enfance de jesus|infancy gospel of thomas)/i],
 ["alpha-beta",/(?:alpha\s*(?:et|and|[-–—/&+])\s*beta)/i],
 ["corps-verite",/(?:corps de (?:la )?verite|body of truth|aletheia)/i],
 ["michel",/(?:archange michel|archangel michael|p\.vindob\.\s*g\s*328|μιχαηλ)/i],
 ["reduction-nom",/(?:reduction du nom|abreviation successive|name diminishing|name reduction)/i],
 ["isopsephie",/(?:isopsephie|isopsephy|[\s(]888[\s).,;]|[\s(]801[\s).,;])/i],
 ["nom-lettres",/(?:nom des lettres|noms des lettres|letter names|delta\s+delta)/i],
 ["colombe",/(?:colombe|dove|περιστερα)/i]
];
const kindSet=new Set(["source primaire","objet matériel","étude moderne","notice bibliographique","autre"]);
function detect(text){
 const str=norm(text);
 return MOTIFS.filter(([k,r])=>r.test(str)).map(([k])=>k);
}
function dates(x){
 const a=x==null||x===""?null:Number(x);
 return Number.isInteger(a)&&a>=-5000&&a<=2100?a:null;
}
function validSource(raw){
 if(!raw||typeof raw!=="object")throw Error("Notice incorrecte.");
 const title=clean(raw.title,240);
 if(title.length<5)throw Error("Titre trop court.");
 const url=clean(raw.url,2000);if(url&&!safeURL(url))throw Error("URL invalide : HTTP(S) uniquement.");
 const sourceText=clean(raw.excerpt,MAX_TEXT),author=clean(raw.author,200);
 const compositionMin=dates(raw.compositionMin),compositionMax=dates(raw.compositionMax);
 if(compositionMin!==null&&compositionMax!==null&&compositionMin>compositionMax)throw Error("Dates de composition inversées.");
 const copyYear=dates(raw.copyYear),publicationYear=dates(raw.publicationYear);
 const kind=kindSet.has(raw.kind)?raw.kind:"autre";
 const doi=clean(raw.doi,160).replace(/^https?:\/\/(?:dx\.)?doi\.org\//i,"").toLowerCase();
 const keywords=detect(sourceText);
 const override=Array.isArray(raw.manuallyConfirmedMotifs)?raw.manuallyConfirmedMotifs.filter(m=>MOTIFS.some(([k])=>k===m)).slice(0,20):[];
 return {id:clean(raw.id,100)||"alpha-local-"+String(Date.now())+"-"+Math.random().toString(36).slice(2,10),
  title,url:safeURL(url),doi,author,kind,excerpt:sourceText,
  publicationYear,compositionMin,compositionMax,copyYear,
  motifs:[...new Set([...keywords,...override])],
  detectedMotifs:keywords,
  manuallyConfirmedMotifs:override,
  materialStatus:clean(raw.materialStatus,80)||"à contrôler",
  stage:raw.stage==="revu"?"revu":"à vérifier",
  provenance:clean(raw.provenance,90)||"saisie manuelle",
  createdAt:clean(raw.createdAt,40)||new Date().toISOString(),
  note:clean(raw.note,1600)};
}
function calculateGreek(s){
 const letters=[...String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/ς/g,"Σ").replace(/[\s.,·;!?\-]/g,"")];
 if(letters.length===0||letters.length>80) return null;
 if(letters.some(l=>!(l in GREEK)))return null;
 const values=letters.map(l=>GREEK[l]);return {text:letters.join(""),values,sum:values.reduce((a,b)=>a+b,0)};
}
function compare(a,b){
 const bMotifs=new Set(b.motifs||[]);
 const shared=(a.motifs||[]).filter(m=>bMotifs.has(m));
 const overlap=shared.filter(m=>!["son","7","nom-lettres"].includes(m));
 const amin=a.compositionMin??a.date?.min??null,amax=a.compositionMax??a.date?.max??null;
 const bmin=b.compositionMin??b.date?.min??null,bmax=b.compositionMax??b.date?.max??null;
 let chronology="datation inconnue";
 if(amin!==null&&amax!==null&&bmin!==null&&bmax!==null){
  if(amin>bmax)chronology="A est nécessairement postérieure à B";
  else if(amax<bmin)chronology="A est antérieure à B (compatibilité seulement)";
  else chronology="périodes chevauchantes ou incertaines";
 }
 return {sourceA:a.id,sourceB:b.id,shared,distinctive:overlap,chronology,
  verdict:"rapprochement documentaire — aucun emprunt direct démontré"};
}
function inspect(raw,others=[]){
 const src=validSource(raw),cores=C7?.corpus?.sources||[];
 const all=[...cores,...others.filter(o=>o.id!==src.id)];
 const links=all.map(item=>({item,comparison:compare(src,item)})).filter(x=>x.comparison.distinctive.length)
  .map(x=>({id:x.item.id,title:x.item.short||x.item.title, ...x.comparison}))
  .sort((a,b)=>b.distinctive.length-a.distinctive.length||a.title.localeCompare(b.title)).slice(0,30);
 const candidates=[];
 const low=norm(src.excerpt);
 if(/(^|\W)888(\W|$)/.test(low))candidates.push("Nombre 888 évoqué : rechercher transcription et édition.");
 if(/(^|\W)801(\W|$)/.test(low))candidates.push("Nombre 801 évoqué : rechercher le calcul dans la source.");
 if(src.kind==="notice bibliographique")candidates.push("Crossref certifie une notice déposée, pas le contenu historique de l'ouvrage.");
 if(!src.excerpt)candidates.push("Aucun passage original fourni : impossible de confirmer ses motifs textuels.");
 if(src.compositionMin===null||src.compositionMax===null)candidates.push("Date de composition ancienne manquante : comparaison chronologique indéterminée.");
 if(!src.url&&!src.doi)candidates.push("Ajouter une cote, un DOI ou une URL bibliographique vérifiable.");
 const evidence=[
  {method:"CORPUS",status:src.title&&(src.url||src.doi)?"renseigné":"incomplet",detail:"Notice, auteur, typologie et référence."},
  {method:"ALPHABET",status:src.motifs.includes("corps-verite")?"piste":"sans occurrence",detail:"Motif du corps d'Alètheia détecté, ou absent."},
  {method:"PHONÉ",status:src.motifs.includes("sept-voyelles")?"piste":"sans occurrence",detail:"Mention des sept voyelles, pas preuve d'usage vocal."},
  {method:"ARITHMOS",status:src.motifs.includes("isopsephie")?"piste":"sans occurrence",detail:"Valeurs 888/801 éventuelles à contrôler sur l'original."},
  {method:"CHRONOS",status:src.compositionMin!=null&&src.compositionMax!=null?"daté":"à dater",detail:"Dates de composition distinctes de la copie et de la publication."},
  {method:"STEMMA",status:links.length?"convergences":"aucun motif distinctif",detail:links.length+" source(s) avec motifs partagés, filiation non démontrée."},
  {method:"AUDIT",status:"à vérifier",detail:"Aucune attestation F0 accordée automatiquement à un extrait ou une notice."}
 ];
 return {source:src,links,evidence,candidates,verdict:"À vérifier — aucune filiation historique validée automatiquement"};
}
function read(){
 try{const x=JSON.parse(sessionStorage.getItem(KEY)||"null"); if(x?.format==="parisis-alpha-c8"&&Array.isArray(x.sources))return {format:"parisis-alpha-c8",version:VERSION,updated:x.updated||null,sources:x.sources.slice(0,MAX_SOURCES).map(validSource)};}
 catch(e){console.warn("ALPHA-C8 : archive locale illisible, session inchangée",e);}
 return initial();
}
function write(x){
 if(!x||!Array.isArray(x.sources)||x.sources.length>MAX_SOURCES)throw Error("Nombre maximal de sources atteint.");
 const validated=x.sources.map(validSource);
 const seen=new Set();
 for(const s of validated){const key=s.doi?"doi:"+s.doi:s.url?"url:"+s.url.toLowerCase():"id:"+s.id;
  if(seen.has(key))throw Error("Référence déjà importée : "+s.title);seen.add(key);}
 const saved={format:"parisis-alpha-c8",version:VERSION,updated:new Date().toISOString(),sources:validated};
 sessionStorage.setItem(KEY,JSON.stringify(saved));
 root.dispatchEvent(new CustomEvent("parisis-alpha-c8-updated",{detail:{count:validated.length}}));
 return saved;
}
function add(row){
 const doc=read(),src=validSource(row);
 if(doc.sources.some(s=>(src.doi&&s.doi===src.doi)||(src.url&&s.url===src.url)))throw Error("Cette référence existe déjà.");
 doc.sources.unshift(src);
 return write(doc);
}
function remove(id){const doc=read(),n=doc.sources.length;doc.sources=doc.sources.filter(s=>s.id!==id);if(n===doc.sources.length)throw Error("Référence introuvable.");return write(doc);}
function importJSON(t){
 if(String(t).length>MAX_FILE)throw Error("Fichier trop volumineux (max. 1 Mo).");
 const incoming=JSON.parse(t);
 if(incoming?.format!=="parisis-alpha-c8"||!Array.isArray(incoming.sources))throw Error("Sauvegarde ALPHA-C8 incompatible.");
 const doc=read(),existing=new Set(doc.sources.map(s=>s.doi?"doi:"+s.doi:s.url?"url:"+s.url.toLowerCase():"id:"+s.id));
 let added=0,skipped=0;
 for(const raw of incoming.sources.slice(0,MAX_SOURCES)){
  const s=validSource(raw),key=s.doi?"doi:"+s.doi:s.url?"url:"+s.url.toLowerCase():"id:"+s.id;
  if(existing.has(key)){skipped++;continue}
  if(doc.sources.length>=MAX_SOURCES)break;
  doc.sources.push(s);existing.add(key);added++;
 }
 write(doc);return {added,skipped};
}
async function searchCrossref(q){
 const term=clean(q,200);if(term.length<4)throw Error("Ajoute au moins quatre caractères.");
 const url="https://api.crossref.org/works?rows=6&query.bibliographic="+encodeURIComponent(term)+"&select=DOI,title,author,published,issued,URL,type";
 const response=await fetch(url,{headers:{"Accept":"application/json"},signal:AbortSignal.timeout?AbortSignal.timeout(12000):undefined});
 if(!response.ok)throw Error("Crossref : HTTP "+response.status);
 const payload=await response.json();
 return (payload.message?.items||[]).slice(0,6).map(d=>{
  const title=clean(d.title?.[0]||"",240);
  const years=d.published?.["date-parts"]?.[0]?.[0]??d.issued?.["date-parts"]?.[0]?.[0]??null;
  const author=(d.author||[]).slice(0,4).map(a=>[a.given,a.family].filter(Boolean).join(" ")).join(", ");
  return {title,author,kind:"notice bibliographique",doi:clean(d.DOI,160),
   url:safeURL(d.URL||("https://doi.org/"+d.DOI)),publicationYear:years,
   excerpt:"",compositionMin:null,compositionMax:null,copyYear:null,provenance:"Crossref (métadonnées)",stage:"à vérifier"};
 }).filter(x=>x.title.length>=5);
}
const api={version:VERSION,key:KEY,read,write,add,remove,validSource,inspect,compare,detect,calculateGreek,importJSON,searchCrossref,maxSources:MAX_SOURCES};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_C8=Object.freeze(api);
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
