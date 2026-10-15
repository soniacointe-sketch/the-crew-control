/* ELOAH NUMERA · ALPHA OPUS — Suite des 12 tableaux (2026)
 * Partitions originales issues des structures documentées dans PARISIS ALPHA-010…021.
 * Résultats artistiques : NE CONSTITUENT PAS des fréquences, chants ni rites antiques.
 * Composition déterministe, sans données privées ni accès distant.
 */
(function(root){
"use strict";
const N=root?.ELOAH_NUMERA_ENGINE,R=root?.PARISIS_ALPHA_READER,M=root?.PARISIS_ALPHA_MARCUS,C=root?.PARISIS_ALPHA_CHAINE,P=root?.PARISIS_ALPHA_PAROLES;
if(!N||!R||!M||!C||!P)return;
const beatMod=(n,m)=>((n%m)+m)%m, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const VOWELS=[..."ΑΕΗΙΟΥΩ"];
const PAIRS=R.pairs;
const chapters=Object.freeze([
 {id:"silence",roman:"I",title:"Le Silence",subtitle:"Le nom encore imprononcé",alpha:"ALPHA-014",input:"441012",sourceMode:"number",mode:"mystic",scale:"phrygian",rootOffset:-7,
  code:"4 + 4 + 10 + 12 = 30",evidence:"Quatre émissions du Nom · Irénée I,14,1",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#9276b5",story:"Une note naît dans le silence : les quatre émissions du Nom forment le premier souffle."},
 {id:"body",roman:"II",title:"Le corps d’Alètheia",subtitle:"Douze réponses, vingt-quatre lettres",alpha:"ALPHA-010",input:PAIRS.map(p=>p.first+p.last).join(""),sourceMode:"greek",mode:"cinematic",scale:"minor",rootOffset:0,
  code:"12 paires · 24 lettres · rangs complémentaires = 25",evidence:"Corps alphabétique de la Vérité · Irénée I,14,3",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#f0c88a",story:"Chaque paire chante et lui répond, de Α–Ω jusqu’aux deux lettres centrales Μ–Ν."},
 {id:"aeons",roman:"III",title:"Les Éons",subtitle:"Neuf · Huit · Sept",alpha:"ALPHA-016",input:"987",sourceMode:"number",mode:"electro",scale:"phrygian",rootOffset:-2,
  code:"9 muettes + 8 semi-voyelles + 7 voyelles = 24",evidence:"Classification selon Irénée I,14,5",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#df6a9c",story:"Trois pulsations de tailles différentes se répondent : 9, puis 8, puis 7."},
 {id:"ogdoades",roman:"IV",title:"Les Trois Ogdoades",subtitle:"L’équilibre de l’Octave",alpha:"ALPHA-016",input:"888",sourceMode:"number",mode:"electro",scale:"dorian",rootOffset:2,
  code:"8 + 8 + 8 = 24",evidence:"Égalisation symbolique en trois octades · Irénée I,14,5",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#d47ae3",story:"Trois cycles de huit impulsions dessinent une nouvelle symétrie."},
 {id:"delta",roman:"V",title:"La lettre qui engendre",subtitle:"Δ devient ΔΕΛΤΑ",alpha:"ALPHA-014",input:"ΔΕΛΤΑ",sourceMode:"greek",mode:"electro",scale:"minor",rootOffset:5,
  code:"Δ → ΔΕΛΤΑ → noms des lettres de ΔΕΛΤΑ",evidence:"Expansion des noms de lettres · Irénée I,14,2",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#eb8fa0",story:"Un motif simple se déploie et revient, comme la lettre donnant naissance à son nom."},
 {id:"vowels",roman:"VI",title:"Les Sept Cieux",subtitle:"Α · Ε · Η · Ι · Ο · Υ · Ω",alpha:"ALPHA-011",input:VOWELS.join(""),sourceMode:"greek",mode:"ambient",scale:"dorian",rootOffset:7,
  code:"7 voyelles dans leur ordre rapporté",evidence:"Correspondance des sept cieux · Irénée I,14,7",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#95b9ed",story:"Sept hauteurs créées par NUMERA : une mélodie ascendante de ciel en ciel, sans prétention d'intonation antique."},
 {id:"dove",roman:"VII",title:"La Colombe",subtitle:"Alpha et Oméga · 801",alpha:"ALPHA-016",input:"ΠΕΡΙΣΤΕΡΑ",sourceMode:"greek",mode:"ambient",scale:"pentatonic",rootOffset:9,
  code:"Α(1) + Ω(800) = ΠΕΡΙΣΤΕΡΑ = 801",evidence:"Rapprochement isopséphique · Irénée I,14,6",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#d8d8f3",story:"Deux notes extrêmes se répondent, puis leur thème s’élève en une mélodie lumineuse."},
 {id:"jesus",roman:"VIII",title:"Le Nom",subtitle:"Ἰησοῦς · 888",alpha:"ALPHA-017",input:"ΙΗΣΟΥΣ",sourceMode:"greek",mode:"cinematic",scale:"major",rootOffset:7,
  code:"ΙΗΣΟΥΣ = 888 ; 8 + 80 + 800 = 888",evidence:"Deux constructions du nombre · Irénée I,15,2",source:"https://www.newadvent.org/fathers/0103115.htm",accent:"#f5d5a7",story:"Le thème 888 devient une fanfare mélodique et un retour de l’Ogdóade, sans reproduire un chant chrétien ancien."},
 {id:"truth",roman:"IX",title:"La Vérité",subtitle:"Ἀλήθεια · 64",alpha:"ALPHA-013",input:"ΑΛΗΘΕΙΑ",sourceMode:"greek",mode:"cinematic",scale:"minor",rootOffset:0,
  code:"ΑΛΗΘΕΙΑ = 64 ; six régions du corps",evidence:"Jean 14,6 et le corps d’Alètheia · Irénée I,14,3–4",source:"https://www.greekbible.com/john/14/6",accent:"#e8a8d3",story:"Le mot Vérité recompose, note par note, les fragments déjà entendus du corps alphabétique."},
 {id:"answer",roman:"X",title:"L’Appel et la Réponse",subtitle:"La parole partagée",alpha:"ALPHA-020",input:"ΟΝΟΜΑ",sourceMode:"greek",mode:"cinematic",scale:"dorian",rootOffset:2,
  code:"Une voix · une réponse · une assemblée",evidence:"Formules dialoguées attribuées à des groupes valentiniens · Irénée I,21",source:"https://www.newadvent.org/fathers/0103121.htm",accent:"#d694bc",story:"Une phrase mélodique reçoit un écho, puis une réponse plus grave. C’est une composition originale, non un rite reconstitué."},
 {id:"gnosis",roman:"XI",title:"Les Lettres de la Vérité",subtitle:"Nag Hammadi · le Nom et la connaissance",alpha:"ALPHA-021",input:"21",sourceMode:"number",mode:"mystic",scale:"pentatonic",rootOffset:5,
  code:"NHC I,3 · II,3 · XI,2 · dossier ALPHA-021",evidence:"Textes coptes : Vérité, Nom, onction, union ; comparaisons sans filiation prouvée",source:"https://www.gospels.net/truth",accent:"#a4cbbb",story:"Les lettres deviennent une image de la connaissance. La source musicale est le numéro 21 du dossier, PAS une fausse translittération grecque du copte."},
 {id:"amen",roman:"XII",title:"Une seule voix",subtitle:"Amen · retour au silence",alpha:"ALPHA-014",input:"ΑΜΗΝ",sourceMode:"greek",mode:"ambient",scale:"major",rootOffset:0,
  code:"Πολλαί φωναί → Ἀμήν (image éditoriale)",evidence:"Convergence des voix dans la doctrine rapportée · Irénée I,14,2",source:"https://www.newadvent.org/fathers/0103114.htm",accent:"#f4dbb2",story:"Les thèmes convergent vers un accord final. Le dernier temps revient au silence."}
]);
function options(raw={}){
 return {
  format:raw.format==="grand"?"grand":"essentiel",
  bpm:Math.round(clamp(Number.isFinite(Number(raw.bpm))?Number(raw.bpm):106,65,155)),
  root:Math.round(clamp(Number.isFinite(Number(raw.root))?Number(raw.root):48,41,60)),
  density:clamp(Number.isFinite(Number(raw.density))?Number(raw.density):.58,0,1),
  volume:clamp(Number.isFinite(Number(raw.volume))?Number(raw.volume):.7,.12,1),
  percussion:raw.percussion===false?false:true,
  harmonies:raw.harmonies===false?false:true
 };
}
function compose(raw={}){
 const opt=options(raw),bars=opt.format==="grand"?4:2,quarter=bars*4,segments=[],scoreNotes=[],scoreDrums=[],scoreChords=[];
 let globalBeat=0;
 const values={};
 const Eons=C.analyze({word:"ΙΗΣΟΥΣ"});
 const bodyPairs=PAIRS.map(p=>({first:p.first,last:p.last,number:p.number,body:p.body,ranks:p.ranks}));
 const testimony={classes:Eons.original,ogdoades:Eons.ogdoades,heavens:Eons.heavens,body:bodyPairs,
  truthIsopsephy:R.analyzeWord("ΑΛΗΘΕΙΑ").isopsephy,jesusIsopsephy:R.analyzeWord("ΙΗΣΟΥΣ").isopsephy,
  doveIsopsephy:R.analyzeWord("ΠΕΡΙΣΤΕΡΑ").isopsephy,alphaOmegaIsopsephy:R.analyzeWord("ΑΩ").isopsephy,
  deltaExpansion:M.expand("Δ",2).stages.map(s=>s.length)};
 function noteAt(arr,beat,midi,velocity=.65,duration=.3,wave="triangle"){
  if(beat>=0&&beat<quarter+.01)arr.push({type:"lead",beat,step:Math.floor(beat*4),midi:clamp(midi,36,95),velocity:clamp(velocity,.1,.98),duration,wave});
 }
 for(let si=0;si<chapters.length;si++){
  const c=chapters[si];
  const rootMidi=clamp(opt.root+c.rootOffset,36,78);
  const conf={input:c.input,sourceMode:c.sourceMode,mode:c.mode,scale:c.scale,root:rootMidi,
   bpm:opt.bpm,bars,variation:opt.density*.82+.07,swing:si===2||si===3?.14:.04,
   drums:opt.percussion&&["aeons","ogdoades","delta","jesus","answer"].includes(c.id),
   pad:opt.harmonies,volume:opt.volume};
  const part=N.compose(conf),notes=part.notes.map(x=>({...x})),chords=part.chords.map(x=>({...x})),drums=part.drumEvents.map(x=>({...x}));
  if(c.id==="silence"){notes.splice(0,notes.length,...notes.filter(x=>x.beat>=quarter*.38&&Math.floor(x.beat*4)%4===0));}
  if(c.id==="body"){
   notes.length=0;
   for(let p=0;p<12;p++){
    const pair=bodyPairs[p],base=(p+.5)*quarter/12,scale=N.scales[c.scale];
    const a=clamp(rootMidi+scale[(pair.ranks[0]-1)%scale.length]+12,36,90);
    const b=clamp(rootMidi+scale[(pair.ranks[1]-1)%scale.length],36,90);
    noteAt(notes,base,a,.55,.18,"triangle");noteAt(notes,base+Math.min(.25,quarter/28),b,.48,.20,"sine");
   }
  }
  if(c.id==="aeons"){
   notes.length=0;
   const groups=[9,8,7];let k=0;
   for(let g=0;g<groups.length;g++)for(let j=0;j<groups[g];j++){
    const beat=(k+.2)*quarter/24;noteAt(notes,beat,rootMidi+N.scales[c.scale][(j+g*2)%7]+(g===1?12:0),.63,.14,g===2?"sine":"sawtooth");k++;
   }
  }
  if(c.id==="ogdoades"){
   notes.length=0;
   for(let k=0;k<24;k++){
    const group=Math.floor(k/8),i=k%8,beat=(k+.15)*quarter/24;
    noteAt(notes,beat,rootMidi+N.scales[c.scale][(i+group)%7]+(group===2?12:0),.57+group*.07,.18,group===0?"triangle":group===1?"sawtooth":"sine");
   }
  }
  if(c.id==="delta"){
   const expanded=M.expand("Δ",2).stages[2].text||"ΔΕΛΤΑ";
   const values=[...expanded].map(l=>R.letterInfo(l)?.value||1);
   notes.length=0;
   for(let i=0;i<Math.min(24,values.length);i++){
    const scale=N.scales[c.scale],v=values[i],at=(i+.12)*quarter/24;
    noteAt(notes,at,rootMidi+scale[(v+i)%scale.length]+(i>11?12:0),.55,.16,i%3===0?"sawtooth":"triangle");
   }
  }
  if(c.id==="vowels"){
   notes.length=0;
   const s=N.scales[c.scale];
   for(let i=0;i<7;i++){
    const beat=(i+.25)*quarter/7,mid=rootMidi+s[i]+12;
    noteAt(notes,beat,mid,.66,Math.min(1.8,quarter/7*.9),"sine");
    if(opt.density>.4)noteAt(notes,beat+.18,mid-12,.22,.8,"triangle");
   }
  }
  if(c.id==="dove"){
   notes.length=0;
   const s=N.scales[c.scale];
   for(let j=0;j<16;j++){
    let v=j%8,beat=(j+.2)*quarter/16;
    noteAt(notes,beat,rootMidi+s[v%s.length]+(j%8===0?0:12),.47,.37,"sine");
   }
   noteAt(notes,.05,rootMidi,.8,1.7,"triangle");noteAt(notes,quarter*.55,rootMidi+24,.58,1.55,"sine");
  }
  if(c.id==="jesus"){
   const scale=N.scales[c.scale];
   for(let k=0;k<3;k++)for(let j=0;j<8;j++){
    const at=(k*8+j+.1)*quarter/24;
    noteAt(notes,at,rootMidi+scale[j%scale.length]+(k===2?12:0),.34,.12,k===2?"sawtooth":"triangle");
   }
  }
  if(c.id==="truth"){
   const truth=R.analyzeWord("ΑΛΗΘΕΙΑ"),s=N.scales[c.scale];
   notes.length=0;
   for(let i=0;i<truth.letters.length;i++){
    const l=truth.letters[i],beat=(i+.22)*quarter/truth.letters.length;
    noteAt(notes,beat,rootMidi+s[(l.rank+i)%s.length]+12,.66,.45,"triangle");
   }
  }
  if(c.id==="answer"){
   notes.length=0;
   const seed=R.analyzeWord("ΟΝΟΜΑ").letters,scale=N.scales[c.scale];
   for(let i=0;i<seed.length;i++){
    const v=seed[i].value,at=.16+i*quarter/(seed.length+1);
    const midi=rootMidi+scale[v%scale.length]+12;
    noteAt(notes,at,midi,.61,.26,"triangle");
    noteAt(notes,at+Math.min(.25,quarter/(seed.length+1)/2),midi-12,.40,.33,"sine");
   }
  }
  if(c.id==="gnosis"){
   notes.splice(0,notes.length,...notes.filter((n,i)=>i%3===0&&n.beat>quarter*.1));
   for(const n of notes){n.wave="sine";n.duration=Math.max(.35,n.duration*2);}
  }
  if(c.id==="amen"){
   notes.length=0;
   const s=N.scales[c.scale];
   for(let i=0;i<6;i++){const beat=(i+.15)*quarter/8;noteAt(notes,beat,rootMidi+s[i%s.length]+12,.44,.55,"sine");}
   // Silence at the end, while the final chord decays naturally.
   chords.length=0;
   if(opt.harmonies)chords.push({type:"chord",beat:quarter*.45,duration:Math.min(quarter*.3,2.9),notes:[rootMidi-12,rootMidi-5,rootMidi,rootMidi+4,rootMidi+7],velocity:.17});
  }
  // Trim overly continuous fragments and retain user-selected density.
  const shaped=notes.filter((n,i)=>c.id==="body"||c.id==="aeons"||c.id==="ogdoades"||c.id==="delta"||c.id==="vowels"||c.id==="truth"||c.id==="answer"||c.id==="amen"?true:(i%7!==6||opt.density>.55));
  shaped.sort((a,b)=>a.beat-b.beat);
  const sceneStart=globalBeat;
  for(const n of shaped)scoreNotes.push({...n,beat:n.beat+sceneStart,step:Math.floor((n.beat+sceneStart)*4),section:si});
  for(const n of drums)scoreDrums.push({...n,beat:n.beat+sceneStart,step:Math.floor((n.beat+sceneStart)*4),section:si});
  for(const n of chords)scoreChords.push({...n,beat:n.beat+sceneStart,section:si});
  const sectionAudio={...part,
   config:{...part.config,mode:c.mode,volume:opt.volume},
   notes:shaped,drumEvents:drums,chords,
   durationSeconds:quarter*60/opt.bpm,
   beatSeconds:60/opt.bpm,timelineLengthBeats:quarter,
   stats:{...part.stats,notes:shaped.length,drums:drums.length,chords:chords.length,loopSeconds:Math.round(quarter*60/opt.bpm*10)/10}};
  segments.push({...c,index:si+1,startBeat:sceneStart,endBeat:sceneStart+quarter,
   startSeconds:sceneStart*60/opt.bpm,
   durationSeconds:quarter*60/opt.bpm,
   notes:shaped.length,drums:drums.length,chords:chords.length,
   sourceSum:part.source.isopsephy??part.source.number,
   audio:sectionAudio});
  globalBeat+=quarter;
 }
 const full={
  version:"ALPHA-OPUS/1.0.0",
  config:{...N.settings({input:"ΑΛΦΑ",sourceMode:"greek",bars:8,root:opt.root,bpm:opt.bpm,mode:"cinematic",volume:opt.volume}),mode:"cinematic",volume:opt.volume},
  source:{kind:"alpha-opus",normalized:"ALPHA OPUS",input:"12 TABLEAUX",number:24,isopsephy:null,tokens:[]},
  seed:N.fnv1a("ALPHA-OPUS|"+JSON.stringify(opt)),
  notes:scoreNotes,drumEvents:scoreDrums,chords:scoreChords,
  pattern:[],scaleNotes:[],beatSeconds:60/opt.bpm,
  timelineLengthBeats:globalBeat,
  durationSeconds:globalBeat*60/opt.bpm,
  stats:{bars:globalBeat/4,steps:globalBeat*4,notes:scoreNotes.length,drums:scoreDrums.length,chords:scoreChords.length,bpm:opt.bpm,loopSeconds:Math.round(globalBeat*60/opt.bpm*10)/10},
  explanation:"ALPHA Opus : composition originale en douze tableaux, inspirée des structures textuelles documentées par PARISIS. Ni chant antique ni protocole sacré reconstitués."
 };
 return {version:"ALPHA-OPUS/1.0.0",title:"ALPHA · De la lettre à la voix",subtitle:"Une suite originale en douze tableaux",
  config:opt,sourceData:testimony,movements:segments,audio:full,notes:full.stats.notes,
  totalSeconds:full.durationSeconds,
  notice:"Les chiffres antiques structurent une création actuelle ; les sons et leurs fréquences sont inventés par ELOAH NUMERA. Les manuscrits coptes ne sont pas rétro-traduits en grec."};
}
function inspect(){
 const result=compose(),checks=[],rule=(name,pass)=>checks.push({name,pass:Boolean(pass)});
 rule("12 tableaux de l'œuvre",chapters.length===12&&result.movements.length===12);
 rule("12 paires du corps",PAIRS.length===12);
 rule("Tout couple totalise 25 en rangs",PAIRS.every(p=>p.ranks[0]+p.ranks[1]===25));
 rule("Trois classes de lettres 9+8+7",result.sourceData.classes.join(",")==="9,8,7");
 rule("Trois Ogdoades 8+8+8",result.sourceData.ogdoades.join(",")==="8,8,8");
 rule("Sept voyelles",result.sourceData.heavens.length===7);
 rule("ALETHEIA vaut 64",result.sourceData.truthIsopsephy===64);
 rule("JESUS vaut 888",result.sourceData.jesusIsopsephy===888);
 rule("COLOMBE et ALPHA OMEGA valent 801",result.sourceData.doveIsopsephy===801&&result.sourceData.alphaOmegaIsopsephy===801);
 rule("Expansion réelle de DELTA",result.sourceData.deltaExpansion[1]===5);
 rule("12 sections contiguës",result.movements.every((m,i)=>i===0?m.startBeat===0:m.startBeat===result.movements[i-1].endBeat));
 rule("Durée calculée",Math.abs(result.audio.durationSeconds-result.movements.reduce((a,b)=>a+b.durationSeconds,0))<.01);
 rule("Toutes les notes dans un tableau",result.audio.notes.every(n=>n.section>=0&&n.section<12&&n.beat>=0&&n.beat<result.audio.timelineLengthBeats));
 rule("Sections à écouter séparément",result.movements.every(x=>x.audio.notes.length>0&&x.audio.durationSeconds>0));
 rule("Nag Hammadi n'est pas rétro-traduit en grec",result.movements[10].sourceMode==="number");
 return {passed:checks.filter(x=>x.pass).length,total:checks.length,checks};
}
const api=Object.freeze({version:"ALPHA-OPUS/1.0.0",chapters,compose,audit:inspect});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.ELOAH_ALPHA_OPUS=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
