/* ELOAH BIBLE MUSIC · MOTEUR ALPHA SONORE V2
 * Les notes sont issues des opérations ALPHA (24 lettres, 12 couples, rangs opposés,
 * isopséphie des mots grecs transmis, groupes 9/8/7, 7 voyelles, motifs 64/801/888).
 * Les valeurs sont historiques, LEUR ATTRIBUTION À DES HAUTEURS ET RYTHMES EST CRÉATIVE.
 * Sans original grec, mode "structure" : ni faux texte grec, ni isopséphie du français.
 * Aucune donnée ELOAH privée, aucun réseau.
 */
(function(root){
"use strict";
const N=root?.ELOAH_NUMERA_ENGINE,R=root?.PARISIS_ALPHA_READER,C=root?.PARISIS_ALPHA_CHAINE;
if(!N||!R||!C)return;
const VOWELS=[..."ΑΕΗΙΟΥΩ"],KEYS=["ΑΛΗΘΕΙΑ","ΙΗΣΟΥΣ","ΠΕΡΙΣΤΕΡΑ","ΑΩ","ΛΟΓΟΣ","ΖΩΗ"];
const ANCHORS=Object.freeze({ΑΛΗΘΕΙΑ:64,ΙΗΣΟΥΣ:888,ΠΕΡΙΣΤΕΡΑ:801,ΑΩ:801,ΛΟΓΟΣ:373,ΖΩΗ:815});
const STRUCTURE=Object.freeze({
 greekLetters:24,pairs:12,pairRankSum:25,vowels:7,
 classes:[9,8,7],ogdoades:[8,8,8],thirty:[4,4,10,12],
 numerals:{truth:64,dove:801,alphaOmega:801,jesus:888},
 source:"Irénée, Contre les hérésies I,14–15"
});
const GOLD="Sources : Irénée I,14–15 · correspondances musicales conçues par ELOAH NUMERA.";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const slug=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
function normalizeOptions(options={}){
 const n=Number(options.bpm),root=Number(options.root),volume=Number(options.volume);
 return {
  mode:N.modes[options.mode]?options.mode:"mystic",
  scale:N.scales[options.scale]?options.scale:"dorian",
  bpm:clamp(Number.isFinite(n)&&n>0?Math.round(n):76,45,180),
  root:clamp(Number.isFinite(root)&&root>0?Math.round(root):48,36,72),
  volume:clamp(Number.isFinite(volume)&&volume>0?volume:.42,.08,1),
  pad:options.pad!==false,
  drums:options.drums===true,
  barsPerVerse:clamp(Math.round(Number(options.barsPerVerse)||2),1,4),
  greekVerses:options.greekVerses&&typeof options.greekVerses==="object"?options.greekVerses:null,
  preferGreek:options.preferGreek===true||Boolean(options.greekVerses)
 };
}
function profile(original){
 const a=R.analyzeText(original,{mode:"greek"});
 const sequence=a.words.flatMap(w=>w.letters.map(l=>({...l,word:w.normalized})));
 const words=a.words.filter(w=>w.length).map(w=>({
  greek:w.normalized,letters:w.length,isopsephy:w.isopsephy,
  pairs:w.pairedLetterSets,
  parts:w.bodyCounts.map(p=>p.part)
 }));
 const counts=Object.fromEntries(R.alphabet.map(x=>[x,0]));
 for(const l of sequence)counts[l.letter]++;
 const groups=C.groups.map(g=>({category:g.name,expected:g.size,
   present:sequence.filter(l=>g.letters.includes(l.letter)).length,
   letters:g.letters.join("")}));
 const pairs=R.pairs.map(p=>({number:p.number,body:p.body,first:p.first,last:p.last,
  rankA:p.ranks[0],rankB:p.ranks[1],complement:p.ranks[0]+p.ranks[1],
  firstCount:counts[p.first],lastCount:counts[p.last],
  hasBoth:counts[p.first]>0&&counts[p.last]>0}));
 const vowels=VOWELS.map((letter,i)=>({letter,sky:i+1,count:counts[letter],
  musicDegree:i}));
 const anchors=words.filter(w=>Object.prototype.hasOwnProperty.call(ANCHORS,w.greek)&&w.isopsephy===ANCHORS[w.greek])
  .map(w=>({word:w.greek,value:w.isopsephy,rule:w.greek==="ΙΗΣΟΥΣ"?"8 + 80 + 800 = 888":w.greek==="ΑΩ"||w.greek==="ΠΕΡΙΣΤΕΡΑ"?"1 + 800 = 801":"Somme grecque des lettres"}));
 return {kind:"greek",sourceText:String(original),letters:sequence.length,words,
  pairs,groups,vowels,anchors,sequence,counts,
  vowelTotal:vowels.reduce((a,v)=>a+v.count,0),
  observedGreekValue:words.reduce((a,w)=>a+w.isopsephy,0),
  caveat:"Valeurs isopséphiques uniquement sur graphies grecques effectivement disponibles ; composition musicale originale."};
}
function fallbackProfile(fr,number){
 const v=String(fr||"");
 const wordCount=v.trim().split(/\s+/).filter(Boolean).length;
 const initials=v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z ]/g,"").split(/\s+/).filter(Boolean);
 // Number and lengths are only numeric seeds; words are never transliterated to Greek.
 const values=[number,wordCount,...initials.slice(0,24).map(x=>x.length)];
 const pairs=R.pairs.map(p=>({number:p.number,body:p.body,first:p.first,last:p.last,
   rankA:p.ranks[0],rankB:p.ranks[1],complement:25,firstCount:null,lastCount:null,hasBoth:false}));
 return {kind:"structural",sourceText:v,letters:0,words:[],pairs,
  groups:C.groups.map(g=>({category:g.name,expected:g.size,present:null,letters:g.letters.join("")})),
  vowels:VOWELS.map((letter,i)=>({letter,sky:i+1,count:null,musicDegree:i})),
  anchors:[],sequence:[],values,counts:null,vowelTotal:null,observedGreekValue:null,
  caveat:"Mode structure seulement : 12 couples, 9–8–7 et 7 voyelles structurent la musique ; aucune lettre du français n'est déclarée grecque."};
}
function makeVerse(v,opts,beatOffset){
 const greek=opts.greekVerses?.[v.number];
 const originalGreek=typeof greek==="string"&&/[\u0370-\u03ff\u1f00-\u1fff]/u.test(greek);
 const profileData=originalGreek?profile(greek):fallbackProfile(v.text,v.number);
 const scale=N.scales[opts.scale],bars=opts.barsPerVerse,beats=bars*4,lead=[],chords=[],drums=[];
 const base=opts.root,seed=N.fnv1a(String(v.number)+"|"+(originalGreek?greek:v.text));
 const startEnd=beat=>clamp(beat,0,beats-.13);
 function addNote(beat,midi,velocity=.6,duration=.2,accent="letter"){
  const local=startEnd(beat);
  lead.push({type:"lead",beat:local+beatOffset,step:Math.floor((beatOffset+local)*4),
    midi:clamp(Math.round(midi),36,96),velocity:clamp(velocity,.14,.91),
    duration:Math.max(.08,Math.min(duration,beats-local-.07)),wave:N.modes[opts.mode].wave,tag:accent,verse:v.number});
 }
 const events=originalGreek?profileData.sequence:[];
 if(events.length){
  // Every actual Greek character has a body pair. Maximum 48 sounding letters per verse.
  const limit=Math.min(48,events.length);
  for(let i=0;i<limit;i++){
   const letter=events[Math.floor(i*events.length/limit)];
   const pair=letter.pair-1,firstHalf=letter.rank<=12;
   const pitchClass=(pair)%12; // the TWELVE body-pairs become 12 semitone positions
   const octave=firstHalf?12:0; // mirrored lower/higher alphabet position -> antiphonal register
   const beat=(i+.18)*beats/(limit+1);
   const accented=i%9===0||i%8===0;
   addNote(beat,base+pitchClass+octave,accented?.69:.46,Math.min(.35,beats/limit*.68),"corps-"+letter.body);
  }
 }else{
  // No Greek attested. Compose from historical STRUCTURE, with verse number/word count only
  // selecting rotation and durations, never fictitious Greek letters.
  const rotation= (v.number+profileData.values[1])%12;
  for(let i=0;i<12;i++){
   const p=R.pairs[(rotation+i)%12];
   const m=base+((p.number-1)%12)+(i%2?0:12);
   const beat=(i+.26)*beats/13;
   addNote(beat,m,.42,beats/18,"structure-"+p.body);
  }
 }
 // SEVEN celestial vowels become seven scale degrees; include only vowels actually
 // present in Greek, otherwise a neutral 7-note framework visibly labeled as such.
 const voweled=originalGreek?profileData.vowels.filter(x=>x.count>0):profileData.vowels;
 for(let i=0;i<voweled.length;i++){
  const v0=voweled[i],pos=(i+.3)*beats/(voweled.length+1);
  const note=base+scale[v0.musicDegree%scale.length]+(opts.mode==="ambient"?12:0);
  addNote(pos,note,originalGreek?.19:.12,Math.min(.55,beats/voweled.length*.6),"voyelle-"+v0.letter);
 }
 // A Greek key word genuinely present may trigger its attested NUMBER motif.
 for(const a of profileData.anchors){
  const number=a.value,values=number===888?[8,80,800]:number===801?[1,800]:String(number).split("").map(Number);
  for(let j=0;j<values.length;j++){
   const beat=beats*.61+(j+.18)*(beats*.35)/(values.length+1);
   const pitch=base+scale[values[j]%scale.length]+12;
   addNote(beat,pitch,.72,.30,"mot-"+a.word+"-"+number);
  }
 }
 // 9|8|7 : three audible accents anchored to the historical ancient classes.
 // Even without percussion the listener hears these three cells in the lead.
 const classBoundaries=[0,9,17],classLengths=[9,8,7];
 for(let g=0;g<3;g++){
  const beat=(classBoundaries[g]+.1)*beats/24;
  addNote(beat,base-12+scale[(classLengths[g]-1)%scale.length],.43,.43,
    "classe-"+classLengths[g]);
 }
 // Three Ogdoades of eight = three airy chimes; this is a CREATIVE analogy,
 // not a literal transcription of an ancient ritual melody.
 for(let g=0;g<3;g++){
  const beat=(g*8+.6)*beats/24;
  addNote(beat,base+scale[(8+g)%scale.length]+12,.29,.6,"ogdoade-"+(g+1));
 }
 // Four emissions 4+4+10+12=30 define four phrase starts.
 // They are a known Marcosian number structure, used here only as musical timing.
 const emissions=[4,4,10,12];let emitted=0;
 for(let i=0;i<emissions.length;i++){
  const beat=(emitted+.35)*beats/30;
  addNote(beat,base+scale[(emissions[i]+i)%scale.length]+(i%2?12:0),.33,.45,
    "emission-"+emissions[i]);
  emitted+=emissions[i];
 }
 if(opts.drums){
  // The 24-pulse cycle is articulated in three groups 9|8|7, never claimed to
  // be an ancient historical rhythm.
  const boundaries=new Set([0,9,17]);
  for(let i=0;i<24;i++){
   const beat=beatOffset+(i+.1)*beats/24;
   if(boundaries.has(i))drums.push({type:"kick",beat,step:Math.floor(beat*4),velocity:.45+(i===0?.18:0),verse:v.number});
   if(i%3===0||boundaries.has(i))drums.push({type:"hat",beat,step:Math.floor(beat*4),velocity:.17,verse:v.number});
   if(i===12)drums.push({type:"snare",beat,step:Math.floor(beat*4),velocity:.3,verse:v.number});
  }
 }
 if(opts.pad){
  const roots=[base-12,base-5,base,base+scale[4%scale.length]].map(x=>clamp(x,32,84));
  // 8|8|8 harmonic cells: the accompaniment shifts every third of the verse.
  for(let g=0;g<3;g++){
   const local=beats*g/3+.04,notes=roots.map((n,i)=>clamp(n+(g===1&&i>1?2:g===2&&i%2===0?7:0),32,90));
   chords.push({type:"chord",beat:beatOffset+local,duration:Math.max(.2,beats/3-.1),
    notes,velocity:opts.mode==="electro"?.11:.15,verse:v.number,tag:"ogdoade-"+(g+1)});
  }
 }
 const countsByBody=profileData.pairs.map(p=>({
  pair:p.number,body:p.body,letterPair:p.first+" — "+p.last,rankSum:p.complement,
  occurrences:p.firstCount===null?null:p.firstCount+p.lastCount,
  complete:p.hasBoth
 }));
 const scene={
  verse:v.number,text:v.text,
  greekText:originalGreek?greek:null,
  sourceMode:originalGreek?"greek-alpha":"alpha-structure",
  beats,beatStart:beatOffset,noteCount:lead.length,
  isopsephy:originalGreek?profileData.observedGreekValue:null,
  pairs:countsByBody,vowels:profileData.vowels,classes:profileData.groups,
  keyWords:profileData.anchors,
  notesPreview:lead.slice(0,10).map(n=>({midi:n.midi,beat:n.beat,tag:n.tag})),
  sonicRules:[
   {numbers:"24 = 12 × 2",operation:"12 paires du corps",audible:"12 positions chromatiques / registres opposés"},
   {numbers:"9 | 8 | 7",operation:"Trois classes des lettres",audible:"trois accents distincts même sans percussion"},
   {numbers:"8 | 8 | 8",operation:"Trois Ogdoades",audible:"trois appels de cloches et trois nappes d'accords"},
   {numbers:"4 | 4 | 10 | 12",operation:"Quatre émissions, total 30",audible:"quatre attaques qui découpent la phrase"},
   {numbers:"Α Ε Η Ι Ο Υ Ω",operation:"Sept cieux, sept voyelles",audible:"sept positions mélodiques documentées"},
   {numbers:"64 · 801 · 888",operation:"Valeurs isopséphiques connues",audible:"motif uniquement lorsque la graphie grecque correspondante apparaît"}
  ],
  explanation:originalGreek?
    "Lettres grecques → douze paires/parties du corps → 12 hauteurs, rangs opposés → registres, voyelles → sept degrés, chiffres 64/801/888 seulement si le mot grec est présent.":
    "Texte grec absent : composition fondée sur la structure ALPHA 12 paires, groupes 9–8–7 et sept degrés ; aucun chiffre isopséphique n'est attribué au français.",
  warning:profileData.caveat
 };
 return {scene,lead,drums,chords};
}
function compose(doc,options={}){
 if(!doc?.verses?.length)throw Error("Charge au moins un verset.");
 const opt=normalizeOptions(options),scenes=[],notes=[],drumEvents=[],chords=[];
 let beat=0;
 for(const v of doc.verses.slice(0,120)){
  const res=makeVerse(v,opt,beat);
  scenes.push(res.scene);notes.push(...res.lead);drumEvents.push(...res.drums);chords.push(...res.chords);
  beat+=opt.barsPerVerse*4;
 }
 notes.sort((a,b)=>a.beat-b.beat);
 const time=beat*60/opt.bpm;
 const greekCount=scenes.filter(x=>x.sourceMode==="greek-alpha").length;
 const missing=scenes.length-greekCount;
 const config={...N.settings({input:"ΑΛΦΑ",sourceMode:"greek",mode:opt.mode,scale:opt.scale,root:opt.root,bpm:opt.bpm,
  volume:opt.volume,pad:opt.pad,drums:opt.drums,bars:Math.min(8,opt.barsPerVerse)}),volume:opt.volume};
 return {
  version:"BIBLE-ALPHA/2.0.0",
  config,source:{kind:"bible-alpha",input:doc.reference,normalized:doc.reference,number:scenes.length,isopsephy:null,tokens:[]},
  seed:N.fnv1a(doc.reference+"|"+scenes.map(s=>s.greekText||s.text).join("|")),
  notes,drumEvents,chords,chapters:scenes,
  pattern:[],scaleNotes:[],beatSeconds:60/opt.bpm,timelineLengthBeats:beat,durationSeconds:time,
  stats:{bars:beat/4,steps:beat*4,notes:notes.length,drums:drumEvents.length,chords:chords.length,
    bpm:opt.bpm,loopSeconds:Math.round(time*10)/10},
  scripture:{reference:doc.reference,book:doc.book,chapter:doc.chapter,credit:doc.credit,
    provider:doc.provider,version:doc.version,greekSource:greekCount?"Textus Receptus transmis; vérifier la variante exacte":null,
    verseCount:scenes.length,greekVerses:greekCount,structureOnlyVerses:missing,
    originalGreekComplete:greekCount===scenes.length,
    disclaimer:missing?"Certains versets n'ont pas de grec attesté dans la source chargée : analyse de lettres grecques désactivée pour eux.":null},
  structure:STRUCTURE,
  caution:"Les 24 lettres, leurs rangs et l'isopséphie sont documentés historiquement. Les hauteurs, durées et timbres attribués aux lettres sont de la création musicale NUMERA, pas la musique originelle des Écritures."
 };
}
function audit(){
 const tests=[],verify=(name,v)=>tests.push({name,pass:Boolean(v)});
 const greek=profile("Ἰησοῦς ἀλήθεια περιστερά Λόγος");
 const verse={reference:"Jean 14,6",book:"John",chapter:14,verses:[{number:6,text:"Je suis le chemin, la vérité et la vie."}]};
 const opts={greekVerses:{6:"Ἐγώ εἰμι ἡ ὁδὸς καὶ ἡ ἀλήθεια καὶ ἡ ζωή."}};
 const score=compose(verse,opts),fallback=compose(verse,{});
 verify("24 lettres grecques",R.alphabet.length===24);
 verify("12 paires",R.pairs.length===12);
 verify("Chaque paire = 25 en rangs",R.pairs.every(x=>x.ranks[0]+x.ranks[1]===25));
 verify("Les trois classes = 9,8,7",C.groups.map(x=>x.size).join(",")==="9,8,7");
 verify("7 voyelles pour sept degrés",VOWELS.length===7&&VOWELS.every((x,i)=>score.chapters[0].vowels[i].letter===x));
 verify("888 exact sur Jésus",greek.anchors.some(x=>x.word==="ΙΗΣΟΥΣ"&&x.value===888));
 verify("64 exact sur Vérité",greek.anchors.some(x=>x.word==="ΑΛΗΘΕΙΑ"&&x.value===64));
 verify("801 exact sur colombe",greek.anchors.some(x=>x.word==="ΠΕΡΙΣΤΕΡΑ"&&x.value===801));
 verify("Mot-clé Vérité réellement présent dans Jean 14,6",score.chapters[0].keyWords.some(x=>x.word==="ΑΛΗΘΕΙΑ"&&x.value===64));
 verify("12 couples comptés sur grec fourni",score.chapters[0].pairs.length===12);
 verify("Notes 24 paires réellement structurées",score.notes.some(n=>n.tag.startsWith("corps-")));
 verify("Sept degrés réellement structurés",score.notes.some(n=>n.tag.startsWith("voyelle-")));
 verify("Aucun 888 inventé si le mot Jésus absent",!score.chapters[0].keyWords.some(x=>x.value===888));
 verify("Mode français ne simule pas des lettres grecques",fallback.chapters[0].sourceMode==="alpha-structure"&&fallback.chapters[0].isopsephy===null);
 verify("Pas de conversion alphabétique française A1Z26",fallback.chapters[0].keyWords.length===0);
 verify("Mode structure 12 paires",fallback.chapters[0].pairs.length===12);
 verify("9|8|7 sert de grille rythmique réelle",compose(verse,{drums:true}).drumEvents.some(x=>x.step>=0));
 verify("9|8|7 audible sans percussions",fallback.notes.filter(n=>n.tag.startsWith("classe-")).length===3);
 verify("8|8|8 audible sans percussions",fallback.notes.filter(n=>n.tag.startsWith("ogdoade-")).length===3);
 verify("4|4|10|12 audible sans percussions",fallback.notes.filter(n=>n.tag.startsWith("emission-")).length===4);
 verify("Trois cellules harmoniques distinctes",fallback.chords.length===3);
 verify("Partition reproductible",JSON.stringify(score.notes)===JSON.stringify(compose(verse,opts).notes));
 verify("Source grecque différente donne musique différente",JSON.stringify(score.notes)!==JSON.stringify(compose(verse,{greekVerses:{6:"Ἰησοῦς"}}).notes));
 verify("Pas de données externes requises pour une partition locale",Boolean(fallback.notes.length));
 return {passed:tests.filter(x=>x.pass).length,total:tests.length,tests};
}
const api=Object.freeze({version:"BIBLE-ALPHA/2.0.0",structure:STRUCTURE,profile,makeVerse,compose,audit,anchors:ANCHORS});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.ELOAH_BIBLE_ALPHA=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
