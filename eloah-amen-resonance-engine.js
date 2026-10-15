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
const VERSION="AMEN-RESONANCE/1.0.0";
const LETTERS=[..."ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"];
const VOWELS=[..."ΑΕΗΙΟΥΩ"];
const VOWEL_NAMES=["A","É","È","I","O","OU","Ô"];
const COLORS=["#f5d29e","#e7a8bc","#b6a2e0","#d89ad0","#a5c9d6","#99b9d8","#ead7ad"];
const PAIRS=Array.from({length:12},(_,i)=>Object.freeze({
 number:i+1,first:LETTERS[i],last:LETTERS[23-i],
 rankA:i+1,rankB:24-i,rankSum:25
}));
const PHASES=Object.freeze([
 {id:"accord",number:"05",title:"La note retrouvée",start:0,end:17,description:"La note finale du premier AMEN reprend son souffle et découvre son harmonie.",symbol:"♪"},
 {id:"voyelles",number:"06",title:"Sept couleurs",start:17,end:40,description:"Sept voyelles deviennent des voix distinctes sur une progression d'accords.",symbol:"Α"},
 {id:"miroirs",number:"07",title:"Douze miroirs",start:40,end:74,description:"Douze couples de lettres se répondent : vingt-quatre entrées, en trois vagues 9 + 8 + 7.",symbol:"24"},
 {id:"resonance",number:"08",title:"La Résonance",start:74,end:104,description:"Les hauteurs se rapprochent ; un accord lumineux s'ouvre, puis les voix retrouvent la même note.",symbol:"✦"}
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
 const octave=midi=>rootHz*Math.pow(2,(midi-57)/12);
 // CHAPTER V — An already unified tone, expanded with a harmonic chord.
 const harmonicBeds=[
  [1,[45,52,57]],[11,[45,49,52]],[20,[50,54,57]],
  [34,[52,57,61]],[48,[49,54,57]],[65,[52,56,59]],
  [80,[54,57,61]],[93,[45,52,57]]
 ];
 for(const [at,tones] of harmonicBeds)
  tones.forEach((midi,j)=>pads.push({at,duration:17,hz:octave(midi),gain:.022,pan:[-.48,0,.48][j]}));
 events.push({at:1.2,duration:13,hz:rootHz,vowel:"Ω",gain:.16,attack:1.6,release:3,pan:0,group:"note retrouvée",pair:null});
 events.push({at:5.3,duration:14,hz:rootHz,vowel:"Α",gain:.065,attack:2,release:3,pan:-.24,group:"note retrouvée",pair:null});
 // CHAPTER VI — Seven vowel timbres, separately articulated, layered in harmony.
 const melodicDegrees=[0,4,7,9,7,4,0];
 for(let i=0;i<7;i++){
  const at=16.4+i*3.15,degree=melodicDegrees[i],vowel=VOWELS[i];
  events.push({at,duration:9,hz:rootHz*Math.pow(2,degree/12),vowel,vowelIndex:i,
   gain:.105,attack:1.15,release:2.5,pan:i%2?+.33:-.33,group:"sept couleurs",pair:null});
  bells.push({at:at+.65,duration:5.5,hz:rootHz*Math.pow(2,(degree+12)/12),
   gain:.035,pan:(i-3)/4,vowel});
 }
 // CHAPTER VII — 24 entrances in twelve reflected pairs, three groups of 9,8,7.
 const motif=[0,4,7,5,2,9,7,4,0,2,4,7];
 for(let i=0;i<opt.voices;i++){
  const g=i<9?0:i<17?1:2,within=g===0?i:g===1?i-9:i-17;
  const count=[9,8,7][g],at=[40,51.6,62.3][g]+(within+.18)*[10.8,9.9,10.3][g]/count;
  const p=PAIRS[i%12],vowelIndex=(p.number-1+(i>=12?2:0))%7;
  events.push({at,duration:10.5-(i%4)*.6,
   hz:rootHz*Math.pow(2,motif[p.number-1]/12),
   vowel:VOWELS[vowelIndex],vowelIndex,gain:.052+g*.006,
   attack:1.1,release:3.2,
   pan:(i<12?1:-1)*(-.75+1.5*(p.number-1)/11),
   group:["9 muettes","8 semi-voyelles","7 voyelles"][g],
   pair:p.number,rank:i<12?p.rankA:p.rankB,
   greekLetter:i<12?p.first:p.last});
  if([0,9,17].includes(i))bells.push({at:at+.2,duration:4,hz:rootHz*Math.pow(2,[12,16,19][g]/12),
   gain:.04,pan:[-.45,0,.45][g]});
 }
 // CHAPTER VIII — 18 harmony voices; then all voices converge on A3.
 for(let i=0;i<18;i++){
  const at=75+i*1.03,degree=[0,7,12,16,19,16][i%6];
  events.push({at,duration:10.5,hz:rootHz*Math.pow(2,degree/12),
   vowel:VOWELS[i%7],vowelIndex:i%7,gain:.04,
   pan:-.7+(i%9)*.175,attack:1.4,release:3.6,
   group:"ascension harmonique",pair:i%12+1});
 }
 for(let i=0;i<opt.voices;i++){
  const at=84+(i%12)*.26;
  events.push({at,duration:Math.max(5,18.5-at*.02),hz:rootHz,
   detuneCents:(i-(opt.voices-1)/2)*.22,
   vowel:VOWELS[i%7],vowelIndex:i%7,gain:.028,attack:3.7,release:4.5,
   pan:(i%12-5.5)/9.5,group:"unisson final",pair:i%12+1});
 }
 for(const [at,len,vowel,gain] of [[91,10,"Α",.13],[95.2,8.5,"Ε",.12],[98.3,5.3,"Ω",.10]])
  events.push({at,duration:Math.min(len,104-at),hz:rootHz,vowel,
   vowelIndex:VOWELS.indexOf(vowel),gain,
   attack:1.25,release:2.6,pan:0,group:"amen final",pair:null});
 for(let i=0;i<12;i++){
  const at=43+i*2.15,degree=[12,16,19,16,14,21,19,16,12,14,16,19][i];
  bells.push({at,hz:rootHz*Math.pow(2,degree/12),duration:4.7,
   gain:.028,pan:(i-5.5)/11});
 }
 return {
  version:VERSION,title:"AMEN II · La Résonance",duration:104,options:opt,rootHz,
  events,bells,pads,phases:PHASES,pairs:PAIRS,
  numerology:{
    letters:LETTERS.join(""),pairCount:12,letterCount:24,rankSum:25,
    groups:[9,8,7],ogdoades:[8,8,8],fourEmissions:[4,4,10,12],
    vowels:VOWELS.join(""),
    source:"Irénée, Contre les hérésies, I,14–15",
    status:"La composition transpose ces structures en sons modernes, sans fréquence originelle prétendue."
  },
  disclaimers:[
   "La note finale et les harmonies sont des choix de composition contemporaine.",
   "Les 24 entrées représentent l'alphabet de manière artistique, pas une liturgie de Marcus.",
   "La vocalise et les timbres de voyelles ne sont pas une reconstitution de la prononciation antique."
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
 const sc=composition(),voices=sc.events.filter(x=>x.group==="unisson final");
 const tests=[
  ["24 lettres et 12 paires",LETTERS.length===24&&PAIRS.length===12],
  ["Rangs de paires totalisant 25",PAIRS.every(x=>x.rankSum===25)],
  ["24 voix groupées en 9+8+7",sc.events.filter(x=>x.group==="9 muettes").length===9&&sc.events.filter(x=>x.group==="8 semi-voyelles").length===8&&sc.events.filter(x=>x.group==="7 voyelles").length===7],
  ["7 voyelles en début de mouvement",sc.events.filter(x=>x.group==="sept couleurs").length===7],
  ["24 voix sur une note commune",voices.length===24&&voices.every(x=>x.hz===sc.rootHz)],
  ["Quatre actes continus",PHASES.every((p,i)=>i===0?p.start===0:p.start===PHASES[i-1].end)],
  ["Dure 104 secondes",sc.duration===104&&PHASES[3].end===104],
  ["Chœur large et tonal",sc.pads.length>=20&&sc.bells.length>=10],
  ["Nouvelle note finale configurable",composition({root:"D3"}).rootHz!==sc.rootHz],
  ["16 voix ajustables",composition({voices:16}).events.filter(x=>x.group==="unisson final").length===16],
  ["Distinct d'une partition antique",sc.disclaimers.some(x=>x.includes("composition contemporaine"))]
 ];
 return {passed:tests.filter(x=>x[1]).length,total:tests.length,tests:tests.map(x=>({name:x[0],pass:Boolean(x[1])}))};
}
const API=Object.freeze({version:VERSION,composition,options,phases:PHASES,pairs:PAIRS,
 vowels:VOWELS,vowelNames:VOWEL_NAMES,colors:COLORS,play,pause,stop,playing,progress,wav,audit});
if(typeof module!=="undefined"&&module.exports)module.exports=API;
if(root)root.ELOAH_AMEN_RESONANCE=API;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
