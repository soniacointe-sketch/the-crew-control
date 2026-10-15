/* ELOAH NUMERA — Synthétiseur WebAudio et export WAV / MIDI
 * Sons créés dans le navigateur : synthèse réelle, pas audio factice ou lecture externe.
 * Aucune requête réseau, aucune capture micro, aucune clé API.
 */
(function(root){
"use strict";
const Engine=root?.ELOAH_NUMERA_ENGINE;
if(!Engine)return;
const midiHz=n=>440*Math.pow(2,(n-69)/12);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function noiseBuffer(ctx,seed,seconds=.45){
 const length=Math.max(1024,Math.floor(ctx.sampleRate*seconds));
 const buf=ctx.createBuffer(1,length,ctx.sampleRate),ch=buf.getChannelData(0);
 let state=(seed|1)>>>0;
 for(let i=0;i<length;i++){state^=state<<13;state^=state>>>17;state^=state<<5;ch[i]=(state/4294967296)*2-1;}
 return buf;
}
function connectGraph(ctx,comp){
 const gain=ctx.createGain(),compressor=ctx.createDynamicsCompressor();
 compressor.threshold.value=-15;compressor.knee.value=13;compressor.ratio.value=3;compressor.attack.value=.003;compressor.release.value=.16;
 gain.gain.value=comp.config.volume*.65;
 gain.connect(compressor);compressor.connect(ctx.destination);
 return {input:gain,compressor};
}
function melodic(ctx,dest,evt,base,beatTime,mode,soft=false){
 const time=base+evt.beat*beatTime,duration=Math.min(evt.duration*beatTime,4.8);
 const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
 const attack=soft?.09:.008,release=soft?.48:.13;
 const note=midiHz(evt.midi);
 osc.type=soft?"sine":evt.wave||mode.wave;
 osc.frequency.setValueAtTime(note,time);
 filter.type="lowpass";filter.frequency.setValueAtTime(soft?950:mode.wave==="sawtooth"?2350:3200,time);
 env.gain.setValueAtTime(.0001,time);
 env.gain.linearRampToValueAtTime((soft?.12:.27)*evt.velocity,time+attack);
 const end=time+Math.max(duration,attack+.05);
 env.gain.setValueAtTime(Math.max(.0002,(soft?.12:.27)*evt.velocity*.75),Math.max(time+attack+.01,end-release));
 env.gain.exponentialRampToValueAtTime(.0001,end+release);
 osc.connect(filter);filter.connect(env);env.connect(dest);
 osc.start(time);osc.stop(end+release+.035);
 return osc;
}
function chord(ctx,dest,c,base,beatTime,mode){
 const time=base+c.beat*beatTime,sec=c.duration*beatTime;
 const output=[];
 for(const midi of c.notes){
  const event={beat:c.beat,duration:c.duration,midi,velocity:Math.min(.85,c.velocity*2.3),wave:mode.accompaniment==="pulse"?"triangle":"sine"};
  output.push(melodic(ctx,dest,event,base,beatTime,mode,true));
 }
 return output;
}
function drum(ctx,dest,d,base,beatTime,seed){
 const time=base+d.beat*beatTime;
 if(d.type==="kick"){
  const osc=ctx.createOscillator(),env=ctx.createGain();
  osc.type="sine";osc.frequency.setValueAtTime(142,time);
  osc.frequency.exponentialRampToValueAtTime(52,time+.12);
  env.gain.setValueAtTime(.0001,time);env.gain.linearRampToValueAtTime(d.velocity*.6,time+.003);
  env.gain.exponentialRampToValueAtTime(.0001,time+.30);
  osc.connect(env);env.connect(dest);osc.start(time);osc.stop(time+.31);return;
 }
 const buf=noiseBuffer(ctx,seed^Math.imul(d.step+1,12371),d.type==="hat"?.16:.26);
 const node=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();
 node.buffer=buf;filter.type=d.type==="hat"?"highpass":"bandpass";
 filter.frequency.value=d.type==="hat"?5800:1250;
 filter.Q.value=d.type==="hat"?.7:.9;
 env.gain.setValueAtTime(Math.max(.0001,d.velocity*.29),time);
 env.gain.exponentialRampToValueAtTime(.0001,time+(d.type==="hat"?.12:.23));
 node.connect(filter);filter.connect(env);env.connect(dest);
 node.start(time);node.stop(time+(d.type==="hat"?.13:.24));
}
function schedule(ctx,comp,base,dest){
 const config=Engine.modes[comp.config.mode],beatTime=comp.beatSeconds;
 for(const n of comp.notes)melodic(ctx,dest,n,base,beatTime,config);
 for(const c of comp.chords)chord(ctx,dest,c,base,beatTime,config);
 for(const d of comp.drumEvents)drum(ctx,dest,d,base,beatTime,comp.seed);
}
let current=null,stopTimer=null,loopTimer=null,serial=0;
async function start(comp,opts={}){
 if(!root.AudioContext&&!root.webkitAudioContext)throw Error("Web Audio n'est pas disponible sur cet appareil.");
 stop();
 const Audio=root.AudioContext||root.webkitAudioContext,ctx=new Audio(),serialId=++serial,graph=connectGraph(ctx,comp);
 current={ctx,comp,base:ctx.currentTime+.12,loop:!!opts.loop,startedAt:Date.now(),stop:()=>stop(),graph};
 await ctx.resume();
 if(serial!==serialId){await ctx.close();return null}
 schedule(ctx,comp,current.base,graph.input);
 const ms=comp.durationSeconds*1000;
 if(current.loop){
  let n=1;
  const tick=()=>{if(!current||serial!==serialId)return;
   schedule(ctx,comp,current.base+n*comp.durationSeconds,graph.input);n++;
   loopTimer=setTimeout(tick,ms);
  };
  loopTimer=setTimeout(tick,Math.max(100,ms-500));
 }else{
  stopTimer=setTimeout(()=>{if(serial===serialId)stop();if(typeof opts.onEnd==="function")opts.onEnd()},ms+700);
 }
 return current;
}
function stop(){
 ++serial;
 if(stopTimer){clearTimeout(stopTimer);stopTimer=null}
 if(loopTimer){clearTimeout(loopTimer);loopTimer=null}
 if(current){
  const ctx=current.ctx;current=null;try{ctx.close()}catch{}
 }
}
function isPlaying(){return Boolean(current)}
function getProgress(){
 if(!current)return 0;
 const elapsed=(Date.now()-current.startedAt)/1000;
 return current.loop?(elapsed%current.comp.durationSeconds)/current.comp.durationSeconds:clamp(elapsed/current.comp.durationSeconds,0,1);
}
function wavBytes(buffer){
 const count=buffer.length,channels=Math.min(2,buffer.numberOfChannels),sampleRate=buffer.sampleRate;
 const bytes=44+count*channels*2;
 const arr=new ArrayBuffer(bytes),view=new DataView(arr),samples=[];
 for(let c=0;c<channels;c++)samples.push(buffer.getChannelData(c));
 function text(o,v){for(let i=0;i<v.length;i++)view.setUint8(o+i,v.charCodeAt(i))}
 text(0,"RIFF");view.setUint32(4,bytes-8,true);text(8,"WAVE");text(12,"fmt ");
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);
 view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*channels*2,true);
 view.setUint16(32,channels*2,true);view.setUint16(34,16,true);
 text(36,"data");view.setUint32(40,count*channels*2,true);
 let p=44;
 for(let i=0;i<count;i++)for(let c=0;c<channels;c++){
  const sample=clamp(samples[c][i],-1,1);
  view.setInt16(p,sample<0?Math.round(sample*32768):Math.round(sample*32767),true);p+=2;
 }
 return arr;
}
async function renderWAV(comp){
 const Offline=root.OfflineAudioContext||root.webkitOfflineAudioContext;
 if(!Offline)throw Error("L'export WAV hors ligne n'est pas disponible dans ce navigateur.");
 const rate=44100,seconds=comp.durationSeconds+1.4,frames=Math.ceil(rate*seconds);
 const ctx=new Offline(2,frames,rate),dest=connectGraph(ctx,comp);
 schedule(ctx,comp,.05,dest.input);
 const buffer=await ctx.startRendering();
 return new Blob([wavBytes(buffer)],{type:"audio/wav"});
}
function vlq(value){
 let n=Math.max(0,Math.floor(value)),out=[n&127];
 while(n>>=7)out.unshift((n&127)|128);
 return out;
}
function midiBytes(comp){
 const ppq=480, events=[];
 const tick=beats=>Math.max(0,Math.round(beats*ppq));
 const push=(beat,priority,data)=>events.push({tick:tick(beat),priority,data});
 const tempo=Math.round(60000000/comp.config.bpm);
 push(0,0,[255,81,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255]);
 push(0,0,[192,80]); // synth lead
 push(0,0,[193,88]); // synth pad
 for(const n of comp.notes){
  push(n.beat,2,[144,n.midi,Math.round(clamp(n.velocity,0,1)*106)]);
  push(n.beat+n.duration,1,[128,n.midi,0]);
 }
 for(const c of comp.chords)for(const midi of c.notes){
  push(c.beat,2,[145,midi,Math.round(c.velocity*100)]);
  push(c.beat+c.duration,1,[129,midi,0]);
 }
 for(const d of comp.drumEvents){
  const note=d.type==="kick"?36:d.type==="snare"?38:42;
  push(d.beat,2,[153,note,Math.round(clamp(d.velocity,0,1)*110)]);
  push(d.beat+.10,1,[137,note,0]);
 }
 events.sort((a,b)=>a.tick-b.tick||a.priority-b.priority);
 const track=[];let last=0;
 for(const event of events){track.push(...vlq(event.tick-last),...event.data);last=event.tick}
 track.push(0,255,47,0);
 const ascii=s=>[...s].map(x=>x.charCodeAt(0));
 const be16=v=>[(v>>8)&255,v&255],be32=v=>[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255];
 return new Uint8Array([...ascii("MThd"),0,0,0,6,...be16(0),...be16(1),...be16(ppq),
   ...ascii("MTrk"),...be32(track.length),...track]);
}
function renderMIDI(comp){return new Blob([midiBytes(comp)],{type:"audio/midi"})}
const api=Object.freeze({start,stop,isPlaying,getProgress,renderWAV,renderMIDI,midiBytes,wavBytes});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.ELOAH_NUMERA_AUDIO=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
