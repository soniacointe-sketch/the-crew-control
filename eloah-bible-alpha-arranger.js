/* ELOAH Bible en musique — ALPHA arrangement musical v3.
 * Les données ALPHA déterminent une mélodie COHÉRENTE et une progression d'accords ;
 * nous ne jouons plus trente bips chromatiques pour trente lettres.
 * Historiquement fondé : rangs, paires 1–24, classes 9–8–7, Ogdoades, voyelles, 64/801/888.
 * Artistique : tonalités, gamme, timbres, tempo et traitements sonores.
 * Aucun réseau, aucun compte privé, pas d'original grec inventé.
 */
(function(root){
"use strict";
const A=root?.ELOAH_BIBLE_ALPHA,N=root?.ELOAH_NUMERA_ENGINE,R=root?.PARISIS_ALPHA_READER;
if(!A||!N||!R)return;
const VERSION="BIBLE-ALPHA-ARRANGEUR/3.0.0";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const SCALE={
 minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],
 dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],pentatonic:[0,3,5,7,10]
};
const CHORDS={
 minor:[[0,3,7],[8,0,3],[3,7,10],[10,2,5]],
 major:[[0,4,7],[9,0,4],[5,9,0],[7,11,2]],
 dorian:[[0,3,7],[5,9,0],[3,7,10],[10,2,5]],
 phrygian:[[0,3,7],[1,5,8],[8,0,3],[10,2,5]],
 pentatonic:[[0,3,7],[8,0,3],[3,7,10],[10,2,5]]
};
function plan(doc,options={}){
 if(!doc?.verses?.length)throw Error("Charge un passage avant de créer la musique.");
 const bpm=clamp(Math.round(Number(options.bpm)||72),52,140),
  rootMidi=clamp(Math.round(Number(options.root)||48),36,66),
  scaleName=SCALE[options.scale]?options.scale:"minor",
  scale=SCALE[scaleName],mode=N.modes[options.mode]?options.mode:"cinematic",
  volume=clamp(Number(options.volume)||.33,.10,.75),
  pad=options.pad!==false,drums=options.drums===true,
  bars=clamp(Math.round(Number(options.barsPerVerse)||4),2,8),
  beats=bars*4;
 // Keep existing ALPHA data, and attach orchestrated musical events.
 const orig=A.compose(doc,{...options,bpm,root:rootMidi,scale:scaleName,mode,
   volume,pad:false,drums:false,barsPerVerse:bars});
 const notes=[],chords=[],drumEvents=[],scenes=[];
 function degreeValue(v){return ((v%scale.length)+scale.length)%scale.length}
 function note(beat,midi,duration,velocity,instrument,tag,verse){
  notes.push({type:"lead",beat,midi:clamp(Math.round(midi),36,94),
   duration:Math.max(.14,duration),velocity:clamp(velocity,.08,.85),
   instrument,wave:"sine",verse,tag});
 }
 for(let vi=0;vi<orig.chapters.length;vi++){
  const scene=orig.chapters[vi],v=doc.verses[vi],start=vi*beats,source=scene.greekText;
  const greek=scene.sourceMode==="greek-alpha";
  const parse=greek?R.analyzeText(source,{mode:"greek"}):null;
  const words=greek?parse.words.filter(x=>x.length):[];
  const letters=greek?words.flatMap(w=>w.letters):[];
  // Critical: diatonic conversion of 12 paired ranks.
  // The 12 anatomical pairs select motif direction, NEVER 12 simultaneous chromatic voices.
  const pairs=scene.pairs;
  const selected=greek?words.map(w=>{
   const freq=w.letters.reduce((a,x)=>a+x.rank,0);
   const center=w.letters[Math.floor(w.letters.length/2)]||w.letters[0];
   return {degree:degreeValue((center.pair-1)+Math.floor(freq/25)),
    velocity:.42+Math.min(.11,w.vowels*.018),isopsephy:w.isopsephy,body:center.body,word:w.normalized};
  }):[0,1,3,4,2,5,3,1].map((d,i)=>({degree:degreeValue(d+(v.number%3)),velocity:.45,body:R.pairs[(d+i)%12].body,word:null}));
  const seed=N.fnv1a((source||v.text)+"|"+v.number),shift=(seed%3);
  // A memorable, repeatable melody: phrases on the four emissions 4+4+10+12.
  const emissionStart=[0,4,8,18].map(n=>n*beats/30);
  const  phrases=[4,4,10,12];
  let last=rootMidi+12+scale[0],iWord=0,motifCount=0;
  for(let ph=0;ph<4;ph++){
   const onset=emissionStart[ph]+.35;
   const until=ph===3?beats-1.5:emissionStart[ph+1]-.25;
   const count=ph===2?3:ph===3?3:2;
   for(let j=0;j<count;j++){
    const pick=selected[iWord%selected.length];iWord++;
    const pulse=onset+j*(Math.max(.45,until-onset)/count);
    let pitch=rootMidi+12+scale[pick.degree];
    // Musical voice-leading: no abrupt multi-octave jumps.
    while(pitch-last>7)pitch-=12;
    while(last-pitch>7)pitch+=12;
    pitch=clamp(pitch,rootMidi+2,rootMidi+22);
    last=pitch;
    note(start+pulse,pitch,clamp((until-onset)/count*.77,.42,1.9),
      pick.velocity+(j===0?.07:0),"piano","pair-"+pick.body,v.number);
    motifCount++;
   }
  }
  // The seven historical vowels are melodic accents, not a 7-note chromatic sweep.
  // Two soft bells per verse, chosen by actual Greek vowel counts when available.
  const vowels=scene.vowels.filter(x=>x.count==null||x.count>0);
  const ranking=vowels.slice().sort((a,b)=>(b.count??0)-(a.count??0)||a.sky-b.sky);
  for(let i=0;i<Math.min(2,ranking.length);i++){
   const vowel=ranking[i],at=start+(i?beats*.75:beats*.30);
   note(at,rootMidi+24+scale[degreeValue(vowel.sky-1)],1.5,.18,"bell",
    "voyelle-"+vowel.letter,v.number);
  }
  // The words tied to 64, 801, 888 become a unique recognizable cadence.
  for(const key of scene.keyWords){
   const digits=key.value===888?[8,80,800]:key.value===801?[1,800]:String(key.value).split("").map(Number);
   for(let j=0;j<Math.min(3,digits.length);j++){
    const pitch=rootMidi+12+scale[degreeValue(digits[j])];
    const beat=start+beats*.72+j*.64;
    note(beat,pitch,.63,.29,"piano","valeur-"+key.value,v.number);
   }
  }
  // Harmonic 8|8|8 : three harmonic arches, smooth minor-mode progression.
  // On 4 bars: I–VI–III–VII with one held, quiet pad chord per measure;
  // the Ogdoades choose the prominent changes at thirds.
  if(pad){
   for(let bar=0;bar<bars;bar++){
    const chord=CHORDS[scaleName][bar%4],tones=chord.map(x=>rootMidi-12+x);
    chords.push({type:"chord",beat:start+bar*4+.06,duration:3.66,
      notes:tones,velocity:.09+(bar%4===0?.02:0),verse:v.number,
      instrument:"pad",tag:"ogdoade-"+(Math.floor(bar*3/bars)+1)});
   }
  }
  // One held bass note per bar, not a noisy kick on every Greek letter.
  for(let bar=0;bar<bars;bar++){
   const chord=CHORDS[scaleName][bar%4],bass=rootMidi-24+chord[0];
   note(start+bar*4+.10,bass,3.3,.34,"bass","octade-basse-"+bar,v.number);
  }
  // 9–8–7 rhythmic architecture kept in the SCORE without mandatory drum noise.
  // When drums are enabled, only the boundaries of the 24-pulse form sound.
  if(drums){
   for(const n of [0,9,17]){
    const beat=start+(n+.20)*beats/24;
    drumEvents.push({type:"kick",beat,velocity:n===0?.24:.14,
     step:Math.floor(beat*4),verse:v.number,tag:"classe-"+(n===0?9:n===9?8:7)});
   }
  }
  scene.noteCount=motifCount;
  scene.arrangement={
   motifNotes:motifCount,melodySource:greek?"Rangs/paires des mots grecs attestés":"Structures ALPHA seulement",
   harmony:"Progression harmonique en "+bars+" mesures, 8|8|8 groupés en trois arches",
   accents:"Voyelles grecques observées + 9|8|7 rythmiques",
   emissions:[4,4,10,12],durationSeconds:beats*60/bpm,
   phrases:4,voiceMix:"Accompagnement discret sous la narration",
   sourceCountGreek:greek?letters.length:0,
   isopsephyKeys:scene.keyWords.map(k=>k.value),
   styles:["piano doux","nappes","cloches légères","basse ronde"]
  };
  scenes.push(scene);
 }
 notes.sort((a,b)=>a.beat-b.beat);
 const totalBeats=beats*scenes.length;
 const oldConfig=N.settings({input:"ALPHA",sourceMode:"text",mode,scale:scaleName,
  bpm,root:rootMidi,bars,volume,pad,drums});
 const greekCount=scenes.filter(s=>s.sourceMode==="greek-alpha").length;
 return {
  ...orig,version:VERSION,config:oldConfig,notes,chords,drumEvents,chapters:scenes,
  timelineLengthBeats:totalBeats,beatSeconds:60/bpm,durationSeconds:totalBeats*60/bpm,
  seed:N.fnv1a(JSON.stringify(scenes.map(s=>s.greekText||s.text))+"|"+scaleName+"|"+bpm),
  stats:{bars:totalBeats/4,steps:totalBeats*4,notes:notes.length,chords:chords.length,
   drums:drumEvents.length,bpm,loopSeconds:Math.round(totalBeats*600/bpm)/10},
  scripture:{...orig.scripture,greekVerses:greekCount,structureOnlyVerses:scenes.length-greekCount},
  orchestration:"Arrangement instrumental narratif : mélodies diatoniques, voix liées, nappes évolutives, basses et cloches discrètes.",
  caution:"Les structures ALPHA déterminent les choix de composition. Les sons et fréquences musicales sont des choix contemporains et non une restitution antique."
 };
}
function audit(){
 const sample={reference:"Jean 14,6",verses:[{number:6,text:"Je suis le chemin, la vérité et la vie."}]};
 const g="Ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή.";
 const a=plan(sample,{greekVerses:{6:g}}),fr=plan(sample,{});
 const tests=[
 ["partition 4 mesures",a.stats.bars===4],
 ["mélodie réduite",a.chapters[0].arrangement.motifNotes<=12],
 ["piano réellement présent",a.notes.some(x=>x.instrument==="piano")],
 ["basse réellement présente",a.notes.some(x=>x.instrument==="bass")],
 ["cloche discrète",a.notes.some(x=>x.instrument==="bell")],
 ["quatre accords cohérents",a.chords.length===4],
 ["formes grecques réelles",a.chapters[0].sourceMode==="greek-alpha"],
 ["vérité = 64 attestée",a.chapters[0].keyWords.some(x=>x.word==="ΑΛΗΘΕΙΑ"&&x.value===64)],
 ["ne fabrique pas 888",!a.chapters[0].keyWords.some(x=>x.value===888)],
 ["pas de grec dans français",fr.chapters[0].sourceMode==="alpha-structure"&&fr.chapters[0].isopsephy===null],
 ["structure audible sans grec",fr.notes.length>5&&fr.chords.length===4],
 ["données déterministes",JSON.stringify(a.notes)===JSON.stringify(plan(sample,{greekVerses:{6:g}}).notes)],
 ["grec différent change mélodie",JSON.stringify(a.notes)!==JSON.stringify(plan(sample,{greekVerses:{6:"ΙΗΣΟΥΣ"}}).notes)],
 ["9|8|7 au rythme",plan(sample,{drums:true}).drumEvents.length===3],
 ["dure plus de 10 secondes",a.durationSeconds>10],
 ["compatibilité WebAudio",a.notes.every(x=>Number.isFinite(x.midi)&&Number.isFinite(x.beat))],
 ["données ALPHA préservées",a.chapters[0].pairs.length===12&&a.chapters[0].vowels.length===7]
 ].map(([name,pass])=>({name,pass:Boolean(pass)}));
 return {passed:tests.filter(x=>x.pass).length,total:tests.length,tests};
}
const API=Object.freeze({version:VERSION,compose:plan,audit});
if(typeof module!=="undefined"&&module.exports)module.exports=API;
if(root)root.ELOAH_BIBLE_ARRANGER=API;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
