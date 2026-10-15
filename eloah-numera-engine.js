/* ELOAH NUMERA — MOTEUR DE COMPOSITION V1.0
 * Alphanumérique → motif musical déterministe. Les correspondances sont des choix
 * de création, NON des fréquences historiques, cosmiques ou médicales.
 * Code pur : aucun réseau, aucun DOM, aucun accès au stockage privé ELOAH.
 */
(function(root){
"use strict";
const VERSION="NUMERA/1.0.0";
const GREEK=Object.freeze({Α:1,Β:2,Γ:3,Δ:4,Ε:5,Ζ:7,Η:8,Θ:9,Ι:10,Κ:20,Λ:30,Μ:40,Ν:50,Ξ:60,Ο:70,Π:80,Ρ:100,Σ:200,Τ:300,Υ:400,Φ:500,Χ:600,Ψ:700,Ω:800});
const SCALES=Object.freeze({
 pentatonic:[0,3,5,7,10],
 minor:[0,2,3,5,7,8,10],
 major:[0,2,4,5,7,9,11],
 dorian:[0,2,3,5,7,9,10],
 phrygian:[0,1,3,5,7,8,10]
});
const MODES=Object.freeze({
 ambient:{name:"Ambient",wave:"sine",gate:1.45,accompaniment:"pad",drums:false,brightness:0.2},
 electro:{name:"Electro",wave:"sawtooth",gate:.68,accompaniment:"pulse",drums:true,brightness:.66},
 cinematic:{name:"Cinématique",wave:"triangle",gate:1.22,accompaniment:"pad",drums:true,brightness:.5},
 mystic:{name:"Mystique",wave:"sine",gate:1.1,accompaniment:"drone",drums:false,brightness:.28}
});
const NOTE_NAMES=["Do","Do♯","Ré","Mi♭","Mi","Fa","Fa♯","Sol","La♭","La","Si♭","Si"];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function cleanNumber(v,min,max,def){const n=Number(v);return Number.isFinite(n)?clamp(n,min,max):def}
function normalize(raw){return String(raw??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\u03C2/g,"Σ").replace(/\u03F9/g,"Σ").trim();}
function fnv1a(s){
 let h=2166136261;
 for(const c of s){h^=c.codePointAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function random32(initial){
 let seed=initial>>>0;
 return ()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296};
}
function source(input,sourceMode="auto"){
 const original=String(input??"").slice(0,1200);
 const normalized=normalize(original);
 if(!normalized)throw Error("Entre des chiffres ou un mot pour créer ta musique.");
 if(sourceMode==="greek"||sourceMode==="auto"&&/[Α-Ω]/.test(normalized)){
  const greek=[...normalized].filter(c=>Object.prototype.hasOwnProperty.call(GREEK,c));
  if(greek.length){
   const sum=greek.reduce((s,c)=>s+GREEK[c],0);
   const tokens=greek.map(c=>({char:c,value:GREEK[c],name:"lettre grecque"}));
   return {input:original,normalized,kind:"greek",tokens,number:sum,digits:String(sum).split("").map(Number),isopsephy:sum,
    explanation:"Chaque lettre grecque porte sa valeur isopséphique historique ; sa conversion en note est notre règle artistique."};
  }
  if(sourceMode==="greek")throw Error("Aucune lettre grecque reconnue.");
 }
 const isNum=sourceMode==="number"||sourceMode==="auto"&&/^[\d\s+.,-]+$/.test(normalized);
 if(isNum){
  const digitChars=[...normalized].filter(c=>c>="0"&&c<="9");
  if(!digitChars.length)throw Error("Ajoute au moins un chiffre entre 0 et 9.");
  const digits=digitChars.map(Number);
  const whole=digits.reduce((a,b)=>((a*10+b)%1000000007),0);
  return {input:original,normalized,kind:"number",tokens:digits.map((v,i)=>({char:digitChars[i],value:v,name:"chiffre"})),number:whole,digits,
   isopsephy:null,explanation:"Les chiffres deviennent des degrés musicaux ; leur ordre et leurs répétitions structurent le rythme."};
 }
 const letters=[...normalized].filter(c=>/[A-ZÀ-ÿΑ-Ω0-9]/iu.test(c));
 if(!letters.length)throw Error("Ajoute des lettres ou des chiffres.");
 const tokens=letters.map(c=>{
  if(Object.prototype.hasOwnProperty.call(GREEK,c))return {char:c,value:GREEK[c],name:"lettre grecque"};
  if(c>="0"&&c<="9")return {char:c,value:Number(c),name:"chiffre"};
  return {char:c,value:c.codePointAt(0)-64,name:"rang latin expérimental"};
 });
 const sum=tokens.reduce((v,x)=>v+x.value,0);
 return {input:original,normalized,kind:"text",tokens,number:sum,digits:String(sum).split("").map(Number),isopsephy:null,
  explanation:"Pour les lettres latines, A=1 à Z=26 est une convention artistique ; ce n'est ni une traduction ni une méthode grecque antique."};
}
function settings(raw={}){
 const cfg={
  input:String(raw.input??"888").slice(0,1200),
  sourceMode:["auto","number","greek","text"].includes(raw.sourceMode)?raw.sourceMode:"auto",
  mode:MODES[raw.mode]?raw.mode:"electro",
  scale:SCALES[raw.scale]?raw.scale:"minor",
  root:Math.round(cleanNumber(raw.root,36,71,48)),
  bpm:Math.round(cleanNumber(raw.bpm,45,220,110)),
  bars:Math.round(cleanNumber(raw.bars,1,8,4)),
  swing:cleanNumber(raw.swing,0,.44,0.09),
  variation:cleanNumber(raw.variation,0,1,.42),
  drums:raw.drums===undefined?true:!!raw.drums,
  pad:raw.pad===undefined?true:!!raw.pad,
  volume:cleanNumber(raw.volume,.05,1,.65)
 };
 return cfg;
}
function midiName(note){return NOTE_NAMES[((note%12)+12)%12]+(Math.floor(note/12)-1)}
function fromSeed(config){
 const cfg=settings(config),src=source(cfg.input,cfg.sourceMode);
 const scale=SCALES[cfg.scale],mode=MODES[cfg.mode],steps=cfg.bars*16;
 const seed=fnv1a([src.normalized,src.kind,cfg.scale,cfg.mode,cfg.root,cfg.bars,cfg.variation].join("|"));
 const rnd=random32(seed),events=[],drums=[],chords=[],pattern=[];
 const values=src.tokens.map(x=>Math.abs(x.value));
 for(let i=0;i<steps;i++){
  const value=values[i%values.length],turn=Math.floor(i/values.length),jitter=Math.floor(rnd()*9);
  const evolve=turn%4;
  const degree=(value + (cfg.variation ? Math.floor(evolve*cfg.variation*2) : 0)+Math.floor(jitter*cfg.variation))%scale.length;
  const shift=(Math.floor((value+2*i)%17/scale.length)%2)*12;
  const midi=clamp(cfg.root+scale[degree]+shift,36,96);
  const rest= cfg.mode==="ambient" ? rnd()<(.12+.08*cfg.variation):((i%8===7||i%16===11)&&rnd()<.65*cfg.variation);
  const accent=i%4===0;
  const velocity=clamp(.49+(value%7)*.05+(accent?.12:0)+(.5-rnd())*.1,.30,.93);
  const start=i*.25+(i%2?cfg.swing*.125:0);
  const dur=(mode.gate/4)*(cfg.mode==="ambient"?(i%4===0?1.6:1):1);
  pattern.push({step:i,sourceChar:src.tokens[i%src.tokens.length].char,sourceValue:value,midi,name:midiName(midi),rest});
  if(!rest)events.push({type:"lead",step:i,beat:start,duration:dur,midi,velocity,wave:mode.wave});
  if(cfg.drums && mode.drums){
   if(i%4===0)drums.push({type:"kick",step:i,beat:i*.25,velocity:i%16===0?.85:.68});
   if(i%16===4||i%16===12)drums.push({type:"snare",step:i,beat:i*.25,velocity:.53});
   if(i%2===0||i%2===1&&rnd()<.36)drums.push({type:"hat",step:i,beat:start,velocity:.23+rnd()*.15});
  }
 }
 if(cfg.pad){
  for(let bar=0;bar<cfg.bars;bar++){
   const value=values[(bar*3)%values.length];
   const root=clamp(cfg.root-12+scale[(value+bar)%scale.length],28,74);
   const intervals=cfg.scale==="major"?[0,4,7]:[0,3,7];
   chords.push({type:"chord",beat:bar*4,duration:3.85,notes:intervals.map(x=>root+x),velocity:mode.accompaniment==="pulse"?.12:.21});
  }
 }
 const durationSeconds=cfg.bars*4*60/cfg.bpm;
 return {
  version:VERSION,config:cfg,source:src,seed,pattern,notes:events,drumEvents:drums,chords,
  scaleNotes:scale.map(n=>midiName(cfg.root+n)),
  durationSeconds,
  beatSeconds:60/cfg.bpm,
  timelineLengthBeats:cfg.bars*4,
  stats:{steps,notes:events.length,drums:drums.length,chords:chords.length,bpm:cfg.bpm,bars:cfg.bars,loopSeconds:Math.round(durationSeconds*10)/10},
  explanation:"Composition algorithmique déterministe fondée sur les chiffres/lettres fournis. Aucune signification spirituelle ou fréquence originelle de Marcus n'est revendiquée."
 };
}
const api=Object.freeze({version:VERSION,source,settings,compose:fromSeed,scales:SCALES,modes:MODES,noteName:midiName,fnv1a,normalize});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.ELOAH_NUMERA_ENGINE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
