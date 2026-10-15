/* ELOAH / PARISIS · AMEN — L'UNISSON
 * Installation sonore originale. Inspiration : Irénée, Contre les hérésies I,14
 * Silence -> voix -> 24 voix en 12 paires -> réunion vers une note commune.
 * Tout ce qui est acoustique / fréquences / timbres est composition CONTEMPORAINE,
 * pas une restitution antique, ni une assertion de fréquences sacrées.
 * 9|8|7 : groupes successifs de voix. 7 voyelles : timbres vocalisés.
 * AUCUNE requête réseau, compte privé ni ressource externe nécessaire.
 */
(function(root){
"use strict";
const VERSION="AMEN-UNISSON/1.0.0";
const LETTERS=[..."ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"];
const VOWELS=[..."ΑΕΗΙΟΥΩ"];
const VOWEL_NAMES=["A","É","È","I","O","OU","Ô"];
const COLORS=["#f5d29e","#e7a8bc","#b6a2e0","#d89ad0","#a5c9d6","#99b9d8","#ead7ad"];
const PAIRS=Array.from({length:12},(_,i)=>Object.freeze({
 number:i+1,first:LETTERS[i],last:LETTERS[23-i],
 rankA:i+1,rankB:24-i,rankSum:25
}));
const PHASES=Object.freeze([
 {id:"silence",number:"01",title:"Le Silence",start:0,end:6,description:"Avant le premier son : une respiration, presque imperceptible.",symbol:"∅"},
 {id:"one",number:"02",title:"La première voix",start:6,end:24,description:"Une seule voix traverse les sept couleurs vocaliques.",symbol:"Α"},
 {id:"many",number:"03",title:"Les voix se multiplient",start:24,end:55,description:"Vingt-quatre entrées organisées en douze paires et trois groupes : 9, 8, 7.",symbol:"24"},
 {id:"unity",number:"04",title:"Un seul son",start:55,end:78,description:"Les voix quittent leurs hauteurs différentes et rejoignent un centre commun. Vocalise finale inspirée de l'Amen.",symbol:"✦"}
]);
const ROOTS=Object.freeze({
 A3:220,D3:146.8323839587038,C3:130.8127826502993,G3:195.99771799087463
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function options(raw={}){
 return {root:Object.prototype.hasOwnProperty.call(ROOTS,raw.root)?raw.root:"A3",
   intensity:clamp(Number.isFinite(Number(raw.intensity))?Number(raw.intensity):.72,.2,1),
   voices:raw.voices===12?12:raw.voices===16?16:24,
   reverb:raw.reverb===false?false:true};
}
function composition(raw={}){
 const opt=options(raw),rootHz=ROOTS[opt.root],events=[],bells=[],pads=[];
 const chordPitch=[[-12,-5,0],[-16,-9,-4],[-14,-7,-2],[-17,-10,-5],[-16,-9,-4],[-12,-5,0]];
 const chordAt=[6,17,27,39,50,59];
 // Six long harmonic beds: made deliberately quiet below the foreground voice.
 for(let j=0;j<chordAt.length;j++){
   for(let i=0;i<3;i++)pads.push({
     at:chordAt[j],duration:15,
     hz:rootHz*Math.pow(2,chordPitch[j][i]/12),
     gain:.028+(j===5?.006:0),pan:[-.52,0,.52][i]
   });
 }
 // Seven vowel colors; here as distinct timbres, not reconstructed antique pronunciation.
 const first=[
  [6,5.6,-0.10,0,"Α"],[10,5.6,.11,1,"Ε"],
  [13.3,5.6,-.06,2,"Η"],[16.4,5.6,.13,3,"Ι"],
  [19,5.6,-.07,4,"Ο"],[21.2,4.5,.10,5,"Υ"],[22.6,3.9,0,6,"Ω"]
 ];
 const melody=[-12,-9,-7,-5,-7,-9,-12];
 first.forEach((v,i)=>events.push({
   at:v[0],duration:v[1],hz:rootHz*Math.pow(2,melody[i]/12),
   vowel:v[4],vowelIndex:v[3],gain:.105,attack:1.35,release:1.8,
   pan:v[2],group:"première voix",pair:null
 }));
 // Historical grouping 9+8+7 is audible as entrances, total 24 distinct voices.
 const pattern=[-12,-9,-5,-7,-10,-4,-7,-9,-12,-10,-9,-5];
 for(let i=0;i<opt.voices;i++){
   const group=i<9?0:i<17?1:2;
   const index=group===0?i:group===1?i-9:i-17;
   const count=[9,8,7][group],start=[24.1,35.6,46.4][group],width=[10.4,9.5,8.7][group];
   const pair=PAIRS[i%12],firstOrLast=i<12?"first":"last";
   events.push({
     at:start+index*width/count,
     duration:7.5+(i%3),hz:rootHz*Math.pow(2,pattern[pair.number-1]/12),
     vowel:VOWELS[(pair.number-1+2*Math.floor(i/12))%7],
     vowelIndex:(pair.number-1+2*Math.floor(i/12))%7,
     gain:.031+(i%4)*.002,attack:1.15,release:2.6,
     pan:(firstOrLast==="first"?-1:1)*(.8-(pair.number-1)*1.6/11),
     group:["9 muettes","8 semi-voyelles","7 voyelles"][group],
     pair:pair.number,greekLetter:pair[firstOrLast],rank:pair["rank"+(firstOrLast==="first"?"A":"B")]
   });
 }
 const chimeNotes=[0,3,5,7,5,3,0];
 [23.4,28.3,32.4,36.6,41.7,47.1,53].forEach((at,i)=>bells.push({
   at,hz:rootHz*Math.pow(2,(chimeNotes[i]+12)/12),
   duration:3.4,gain:.033,pan:(i-3)/5,vowel:VOWELS[i]
 }));
 // Final unison: 24 unique timbres converge to the SAME musical pitch.
 for(let i=0;i<opt.voices;i++){
   events.push({at:54.5+(i%8)*.34,duration:74.4-(54.5+(i%8)*.34),
     hz:rootHz,detuneCents:(i-(opt.voices-1)/2)*.22,
     vowel:VOWELS[i%7],vowelIndex:i%7,gain:.022,
     pan:(i%12-5.5)/10.5,attack:3.8,release:5.4,
     group:"unisson",pair:i%12+1
   });
 }
 // Vocalise « amen », not a historic chant and not synthesized speech.
 [["Α",64.5,7.4,.075],["Ε",69.2,6.2,.065],["Ω",72.3,5.2,.045]]
   .forEach(v=>events.push({at:v[1],duration:v[2],hz:rootHz,vowel:v[0],
     vowelIndex:VOWELS.indexOf(v[0]),gain:v[3],pan:0,
     attack:1.4,release:2.5,group:"vocalise finale",pair:null}));
 [24.5,36.1,46.9].forEach((at,i)=>bells.push({
   at,hz:rootHz*Math.pow(2,[0,-2,3][i]/12),duration:4,
   gain:.042,pan:[-.4,0,.4][i],marker:["9","8","7"][i]
 }));
 return {
  version:VERSION,title:"AMEN · L'Unisson",duration:78,options:opt,
  rootHz,events,bells,pads,phases:PHASES,pairs:PAIRS,
  numerology:{
   letters:LETTERS.join(""),pairCount:12,letterCount:24,
   rankSum:25,groups:[9,8,7],ogdoades:[8,8,8],
   fourEmissions:[4,4,10,12],vowels:VOWELS.join(""),
   source:"Irénée, Contre les hérésies, Livre I, chapitre 14",
   status:"Structures numériques du témoignage ancien ; partition et timbres créés en 2026."
  },
  disclaimers:[
   "Les 24 entrées sont une convention de composition d'après l'alphabet grec.",
   "Les sept voyelles sont représentées par des couleurs sonores construites aujourd'hui.",
   "L'unisson et la vocalise Amen sont une interprétation artistique du récit ; ni hauteur ni air antiques n'ont été préservés."
  ]
 };
}
const vowelFormants=Object.freeze({
 Α:[800,1200],Ε:[540,1720],Η:[620,1540],Ι:[330,2250],
 Ο:[520,920],Υ:[360,1090],Ω:[510,1000]
});
function makeImpulse(ctx,seconds=2.2){
 const rate=ctx.sampleRate,len=Math.floor(rate*seconds),buffer=ctx.createBuffer(2,len,rate);
 for(let ch=0;ch<2;ch++){
  let seed=(ch+3)*49013,arr=buffer.getChannelData(ch);
  for(let i=0;i<len;i++){
   seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
   const x=((seed>>>0)/4294967295)*2-1,t=i/rate;
   arr[i]=Math.pow(Math.max(0,1-t/seconds),2.4)*x*.18;
  }
 }
 return buffer;
}
function master(ctx,score){
 const mix=ctx.createGain(),output=ctx.createDynamicsCompressor();
 output.threshold.value=-15;output.knee.value=18;output.ratio.value=2.4;
 output.attack.value=.012;output.release.value=.22;
 const level=ctx.createGain();level.gain.value=score.options.intensity*.86;
 mix.connect(level);level.connect(output);output.connect(ctx.destination);
 if(score.options.reverb&&ctx.createConvolver){
  const verb=ctx.createConvolver(),wet=ctx.createGain(),low=ctx.createBiquadFilter();
  verb.buffer=makeImpulse(ctx);low.type="lowpass";low.frequency.value=3400;wet.gain.value=.22;
  mix.connect(verb);verb.connect(low);low.connect(wet);wet.connect(output);
 }
 return mix;
}
function panNode(ctx,pan,dest){
 if(ctx.createStereoPanner){const node=ctx.createStereoPanner();node.pan.value=clamp(pan||0,-1,1);node.connect(dest);return node;}
 return dest;
}
function envelope(gain,time,duration,amp,attack,release){
 const end=time+duration;
 const a=Math.min(Math.max(attack,.08),duration*.37),
 r=Math.min(Math.max(release,.18),duration*.51);
 gain.setValueAtTime(.00001,time);
 gain.linearRampToValueAtTime(amp,time+a);
 gain.setValueAtTime(amp*.85,Math.max(time+a+.01,end-r));
 gain.exponentialRampToValueAtTime(.00001,end);
}
function addVoice(ctx,mix,e,at,duration,from=0){
 if(duration<=.05)return;
 const group=ctx.createGain(),color=e.vowel||"Α";
 const tint=vowelFormants[color]||vowelFormants["Α"];
 const base=e.hz*Math.pow(2,(e.detuneCents||0)/1200);
 const out=panNode(ctx,e.pan,mix);
 group.connect(out);
 const gain=e.gain||.025;
 envelope(group.gain,at,duration,Math.min(.3,gain),e.attack||.8,e.release||1.2);
 const harmonics=[1,2,3,4,5,6,7,8,10,12];
 // Static filter to choose vowel color. It is an artistic sound design, not
 // a recovered historical vocal tract model.
 for(let j=0;j<harmonics.length;j++){
   const partial=harmonics[j],freq=base*partial;
   if(freq>9000)break;
   const proximity=x=>Math.exp(-.5*Math.pow((freq-x)/(x<1000?260:580),2));
   const factor=(.26+.70*proximity(tint[0])+.37*proximity(tint[1]))/Math.pow(partial,1.16);
   const osc=ctx.createOscillator(),g=ctx.createGain();
   osc.type="sine";osc.frequency.value=freq;
   g.gain.value=factor*.25;
   osc.connect(g);g.connect(group);
   osc.start(at);osc.stop(at+duration+.02);
 }
}
function addPad(ctx,mix,e,at,duration){
 const out=panNode(ctx,e.pan,mix),gain=ctx.createGain();
 gain.connect(out);envelope(gain.gain,at,duration,e.gain||.03,1.65,2.3);
 for(const [r,v] of [[1,.60],[2,.22],[3,.08]]){
   const osc=ctx.createOscillator(),g=ctx.createGain();
   osc.type="sine";osc.frequency.value=e.hz*r;g.gain.value=v;
   osc.connect(g);g.connect(gain);osc.start(at);osc.stop(at+duration+.03);
 }
}
function addBell(ctx,mix,e,at,duration){
 const out=panNode(ctx,e.pan,mix),g=ctx.createGain();
 g.connect(out);
 const end=at+duration;
 g.gain.setValueAtTime(.00001,at);
 g.gain.linearRampToValueAtTime(e.gain||.03,at+.015);
 g.gain.exponentialRampToValueAtTime(.00001,end);
 for(const [r,v] of [[1,.60],[2.02,.23],[3.92,.07]]){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type="sine";osc.frequency.value=e.hz*r;gain.gain.value=v;
  osc.connect(gain);gain.connect(g);osc.start(at);osc.stop(end+.02);
 }
}
function schedule(ctx,score,from=0){
 const bus=master(ctx,score),t0=ctx.currentTime+.08;
 let n=0;
 const add=(e,type)=>{
  const finish=e.at+e.duration;if(finish<from+.05)return;
  const begin=Math.max(from,e.at),start=t0+(begin-from),remaining=finish-begin;
  if(type==="v")addVoice(ctx,bus,e,start,remaining,begin-e.at);
  else if(type==="p")addPad(ctx,bus,e,start,remaining);
  else addBell(ctx,bus,e,start,remaining);
  n++;
 };
 score.pads.forEach(x=>add(x,"p"));
 score.events.forEach(x=>add(x,"v"));
 score.bells.forEach(x=>add(x,"b"));
 return {t0,sources:n};
}
let active=null,rafTimer=0;
async function play(raw={},offset=0){
 stop();
 const score=composition(raw),Audio=root.AudioContext||root.webkitAudioContext;
 if(!Audio)throw Error("Web Audio n'est pas disponible sur cet appareil.");
 const ctx=new Audio();
 await ctx.resume();
 const seconds=clamp(Number(offset)||0,0,score.duration-1);
 const scheduled=schedule(ctx,score,seconds);
 active={ctx,score,offset:seconds,t0:scheduled.t0,paused:false};
 return {score,offset:seconds};
}
function progress(){
 if(!active)return 0;
 return Math.min(active.score.duration,Math.max(0,active.offset+active.ctx.currentTime-active.t0));
}
function pause(){
 if(!active)return false;
 if(active.paused){active.ctx.resume();active.paused=false;}
 else{active.ctx.suspend();active.paused=true;}
 return active.paused;
}
function stop(){
 if(active){const c=active.ctx;active=null;c.close().catch(()=>{});}
 if(rafTimer&&typeof cancelAnimationFrame==="function"){cancelAnimationFrame(rafTimer);rafTimer=0;}
}
function playing(){return Boolean(active)}
async function wav(raw={}){
 const score=composition(raw),Offline=root.OfflineAudioContext||root.webkitOfflineAudioContext;
 if(!Offline)throw Error("Le rendu WAV hors ligne n'est pas disponible.");
 // Mono? 2 channels at 22050 preserves reasonable mobile memory.
 const rate=22050,ctx=new Offline(2,Math.ceil((score.duration+.6)*rate),rate);
 schedule(ctx,score,0);
 const rendered=await ctx.startRendering(),length=rendered.length,channels=2;
 const rawBytes=new ArrayBuffer(44+length*channels*2),d=new DataView(rawBytes);
 function write(i,s){for(let k=0;k<s.length;k++)d.setUint8(i+k,s.charCodeAt(k));}
 write(0,"RIFF");d.setUint32(4,rawBytes.byteLength-8,true);write(8,"WAVE");write(12,"fmt ");
 d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,channels,true);
 d.setUint32(24,rate,true);d.setUint32(28,rate*channels*2,true);
 d.setUint16(32,channels*2,true);d.setUint16(34,16,true);
 write(36,"data");d.setUint32(40,length*channels*2,true);
 const L=rendered.getChannelData(0),R=rendered.getChannelData(1);
 let j=44;
 for(let i=0;i<length;i++){
  for(const n of [L[i],R[i]]){
   const v=clamp(n,-1,1),pcm=Math.round(v<0?v*32768:v*32767);
   d.setInt16(j,pcm,true);j+=2;
  }
 }
 return new Blob([rawBytes],{type:"audio/wav"});
}
function audit(){
 const s=composition(),one=s.events.filter(e=>e.group==="première voix"),
  ranks=s.pairs.every(p=>p.rankSum===25),
  groups=s.events.filter(e=>e.group==="9 muettes").length===9&&
   s.events.filter(e=>e.group==="8 semi-voyelles").length===8&&
   s.events.filter(e=>e.group==="7 voyelles").length===7,
  unity=s.events.filter(e=>e.group==="unisson");
 const tests=[
  ["24 lettres",LETTERS.length===24],
  ["12 paires symétriques",s.pairs.length===12&&ranks],
  ["9+8+7 entrées exactes",groups],
  ["7 voyelles présentes",one.length===7],
  ["24 voix rejoignent une même hauteur",unity.length===24&&unity.every(e=>e.hz===s.rootHz)],
  ["quatre mouvements continus",PHASES.every((p,i)=>i===0?p.start===0:p.start===PHASES[i-1].end)],
  ["78 secondes réelles",PHASES[3].end===78],
  ["vocalise Amen distinguée",s.events.filter(e=>e.group==="vocalise finale").length===3],
  ["aucune prétention ancienne",s.disclaimers.join("").includes("contemporain")||s.disclaimers.join("").includes("artistique")],
  ["16 voix possibles",composition({voices:16}).events.filter(e=>e.group==="unisson").length===16],
  ["chaque groupe donne une partie du corps",s.events.filter(e=>e.pair).every(e=>e.pair>=1&&e.pair<=12)]
 ];
 return {passed:tests.filter(x=>x[1]).length,total:tests.length,tests:tests.map(x=>({name:x[0],pass:x[1]}))};
}
const API=Object.freeze({version:VERSION,composition,options,phases:PHASES,pairs:PAIRS,
 vowels:VOWELS,vowelNames:VOWEL_NAMES,colors:COLORS,play,pause,stop,playing,progress,wav,audit});
if(typeof module!=="undefined"&&module.exports)module.exports=API;
if(root)root.ELOAH_AMEN_UNISSON=API;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
