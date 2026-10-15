/* ELOAH NUMERA — atelier interactif : générer, écouter, éditer, exporter.
 * Aucun stockage du compte ELOAH. Les exports sont à la demande.
 */
(function(){
"use strict";
const E=window.ELOAH_NUMERA_ENGINE,A=window.ELOAH_NUMERA_AUDIO;
if(!E||!A)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let comp=null,playing=false,visualId=0,wavBusy=false;
const canvas=$("art"),ctx2=canvas.getContext("2d");
const view={width:0,height:0,dpr:1};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const say=message=>{$("status").textContent=message};
function config(){
 return {input:$("source").value,sourceMode:$("sourceMode").value,mode:$("style").value,
  scale:$("scale").value,root:Number($("root").value),bars:Number($("bars").value),
  bpm:Number($("bpm").value),variation:Number($("variation").value)/100,swing:Number($("swing").value)/100,
  volume:Number($("volume").value)/100,drums:$("drums").checked,pad:$("pad").checked};
}
function setControls(c){
 $("source").value=c.input;$("sourceMode").value=c.sourceMode;
 $("style").value=c.mode;$("scale").value=c.scale;$("root").value=String(c.root);
 $("bars").value=String(c.bars);$("bpm").value=String(c.bpm);
 $("variation").value=String(Math.round(c.variation*100));
 $("swing").value=String(Math.round(c.swing*100));$("volume").value=String(Math.round(c.volume*100));
 $("drums").checked=c.drums;$("pad").checked=c.pad;
 displayControls();
}
function displayControls(){
 $("bpmOut").value=$("bpm").value+" BPM";
 $("variationOut").value=$("variation").value+" %";
 $("swingOut").value=$("swing").value+" %";
 $("volumeOut").value=$("volume").value+" %";
}
function visualSize(){
 if(!ctx2)return;
 const d=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();
 const w=Math.max(300,rect.width),h=Math.max(220,rect.height);
 const px=Math.round(w*d),py=Math.round(h*d);
 if(canvas.width!==px||canvas.height!==py){canvas.width=px;canvas.height=py}
 ctx2.setTransform(d,0,0,d,0,0);view.width=w;view.height=h;view.dpr=d;
}
function dotColor(i){
 const swatches=["#f4d3a5","#e88aca","#bc73d9","#dab9ec","#a97fbe","#f6cf91"];
 return swatches[i%swatches.length];
}
function draw(){
 if(!ctx2||!comp)return;
 visualSize();
 const W=view.width,H=view.height,Cx=W*.5,Cy=H*.44,radius=Math.min(W*.29,H*.33);
 const g=ctx2.createLinearGradient(0,0,W,H);g.addColorStop(0,"#1a1128");g.addColorStop(.58,"#241335");g.addColorStop(1,"#100b17");
 ctx2.fillStyle=g;ctx2.fillRect(0,0,W,H);
 const glow=ctx2.createRadialGradient(Cx,Cy,0,Cx,Cy,radius*2.2);
 glow.addColorStop(0,"rgba(180,71,149,0.25)");glow.addColorStop(.55,"rgba(100,48,126,0.10)");glow.addColorStop(1,"rgba(0,0,0,0)");
 ctx2.fillStyle=glow;ctx2.fillRect(0,0,W,H);
 const progress=A.isPlaying()?A.getProgress():0;
 const pattern=comp.pattern;
 const cells=pattern.length;
 ctx2.save();ctx2.translate(Cx,Cy);
 for(let j=0;j<4;j++){
  ctx2.beginPath();ctx2.arc(0,0,radius*(.48+j*.22),0,Math.PI*2);
  ctx2.strokeStyle="rgba(242,197,213,"+(.14-j*.027)+")";ctx2.lineWidth=1;ctx2.stroke();
 }
 ctx2.beginPath();
 for(let i=0;i<cells;i++){
  const node=pattern[i],angle=i/cells*Math.PI*2-Math.PI/2;
  const ringRadius=radius*(.62+(node.midi-36)/60*.6);
  const current=A.isPlaying()?i/cells<=progress: true;
  const x=Math.cos(angle)*ringRadius,y=Math.sin(angle)*ringRadius;
  if(i===0)ctx2.moveTo(x,y);else ctx2.lineTo(x,y);
  if(current&&!node.rest){
   ctx2.fillStyle=dotColor(Math.floor(node.midi/4));
   ctx2.beginPath();ctx2.arc(x,y,Math.max(1.8,Math.min(W,H)/200),0,Math.PI*2);ctx2.fill();
  }
 }
 ctx2.closePath();ctx2.strokeStyle="rgba(224,117,191,.72)";ctx2.lineWidth=1.4;ctx2.stroke();
 const pulse=A.isPlaying()?1+.08*Math.sin(Date.now()/165):1;
 ctx2.beginPath();ctx2.arc(0,0,radius*.41*pulse,0,Math.PI*2);
 ctx2.fillStyle="rgba(69,30,73,.38)";ctx2.fill();ctx2.strokeStyle="rgba(247,207,154,.75)";ctx2.lineWidth=1.4;ctx2.stroke();
 ctx2.font="normal "+Math.round(Math.min(30,H*.12))+"px Georgia,serif";
 ctx2.fillStyle="#f6d6af";ctx2.textAlign="center";ctx2.textBaseline="middle";
 ctx2.fillText(comp.source.isopsephy!=null?String(comp.source.isopsephy):String(comp.source.number),0,0);
 ctx2.restore();
 // constellation dots are deterministic, not a recording of the audio spectrum.
 let state=comp.seed>>>0;
 for(let i=0;i<48;i++){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  const x=((state>>>0)%1000)/1000*W;
  state^=state<<13;state^=state>>>17;state^=state<<5;
  const y=((state>>>0)%1000)/1000*H;
  ctx2.fillStyle="rgba(244,206,230,"+(.1+(i%5)*.045)+")";
  ctx2.beginPath();ctx2.arc(x,y,i%9===0?1.4:.7,0,Math.PI*2);ctx2.fill();
 }
 const index=Math.min(pattern.length-1,Math.floor(progress*pattern.length));
 if(A.isPlaying()){
  const buttons=$("steps").querySelectorAll(".step");
  buttons.forEach((b,i)=>b.classList.toggle("playing",i===index));
  $("progressBar").style.width=(progress*100)+"%";
 }else{$("progressBar").style.width="0%";}
 if(A.isPlaying())visualId=requestAnimationFrame(draw);else visualId=0;
}
function animation(){
 if(!comp||!ctx2)return;
 if(!visualId)visualId=requestAnimationFrame(draw);
}
function renderSteps(){
 if(!comp)return;
 const host=$("steps");host.replaceChildren();
 for(const p of comp.pattern){
  const b=document.createElement("button");b.type="button";b.className="step"+(p.rest?" rest":" active");
  b.dataset.step=p.step;b.dataset.beat=p.step%4===0?0:1;
  const label=document.createElement("small");
  label.textContent=p.rest?"×":p.name.replace(/\d+/,"");
  b.append(label);
  b.title="Pas "+(p.step+1)+" · "+p.name+" · source "+p.sourceChar+" ("+p.sourceValue+") · cliquer pour "+(p.rest?"activer":"couper");
  b.setAttribute("aria-label",b.title);
  if(!p.rest){const line=document.createElement("span");line.className="stepbar";b.append(line);}
  host.append(b);
 }
}
function renderReadout(){
 if(!comp)return;
 const s=comp.source;
 $("heroValue").textContent=s.normalized.slice(0,30);
 $("heroType").textContent=E.modes[comp.config.mode].name.toUpperCase()+" · "+s.kind.toUpperCase()+" → MUSIQUE";
 $("pieceTitle").textContent="Composition "+s.normalized.slice(0,35);
 $("kNotes").textContent=comp.stats.notes;
 $("kTempo").textContent=comp.config.bpm;
 $("kDuration").textContent=comp.stats.loopSeconds+" s";
 $("kValue").textContent=s.isopsephy??s.number;
 $("scaleNotes").textContent=comp.scaleNotes.join("  ·  ");
 $("codeType").textContent=s.kind==="greek"?"Grec":s.kind==="number"?"Chiffres":"Texte";
 $("codeValue").textContent=s.isopsephy??s.number;
 $("codeSeed").textContent=comp.seed;
 $("codeStructure").textContent=comp.config.bars+" × 16 pas";
 $("codeNoteCount").textContent=comp.notes.length;
 $("codeDetails").textContent=s.tokens.map(t=>t.char+" = "+t.value).slice(0,120).join("   ·   ");
 $("explanation").textContent=s.explanation+" Mélodie produite en "+E.scales[comp.config.scale].length+" degrés. "+comp.explanation;
 renderSteps();animation();
}
function compose(announce=true){
 try{
  A.stop();
  playing=false;togglePlay(false);
  comp=E.compose(config());
  renderReadout();
  if(announce)say("Composition créée : "+comp.stats.notes+" notes, "+comp.stats.drums+" frappes rythmiques, "+comp.stats.bars+" mesures. Appuie sur Écouter pour entendre ton œuvre.");
 }catch(e){say("Impossible de composer : "+e.message);}
}
function togglePlay(active){
 playing=active;
 $("play").textContent=active?"♪ Relancer la lecture":"▶ Écouter ma création";
 $("progressBar").style.width=active?"1%":"0%";
 if(!active)for(const b of $("steps").querySelectorAll(".step.playing"))b.classList.remove("playing");
}
async function play(){
 if(!comp)compose(false);
 if(!comp)return;
 const playingComp=comp;
 const loop=$("loop").checked;
 try{
  const task=A.start(playingComp,{loop,onEnd:()=>{togglePlay(false);animation();say("Lecture terminée. Tu peux exporter l’audio ou modifier le morceau.");}});
  togglePlay(true);say("Lecture de la composition : "+playingComp.stats.loopSeconds+" secondes"+(loop?" · répétition activée":"")+".");
  animation();
  await task;
 }catch(e){togglePlay(false);say("Lecture indisponible : "+e.message+". Essaie une interaction directe ou un navigateur compatible Web Audio.");}
}
function stop(){A.stop();togglePlay(false);animation();say("Lecture arrêtée. La partition et les réglages sont conservés.");}
function toggleStep(index){
 if(!comp)return;
 const p=comp.pattern[index];if(!p)return;
 p.rest=!p.rest;
 if(p.rest)comp.notes=comp.notes.filter(n=>n.step!==index);
 else{
  const mode=E.modes[comp.config.mode];
  const start=index*.25+(index%2?comp.config.swing*.125:0);
  comp.notes.push({type:"lead",step:index,beat:start,duration:mode.gate/4,midi:p.midi,velocity:.7,wave:mode.wave});
  comp.notes.sort((a,b)=>a.beat-b.beat);
 }
 comp.stats.notes=comp.notes.length;
 $("kNotes").textContent=comp.notes.length;
 $("codeNoteCount").textContent=comp.notes.length;
 if(A.isPlaying()){A.stop();togglePlay(false);say("Note modifiée : relance la lecture pour entendre la nouvelle version.")}
 else say("Pas "+(index+1)+(p.rest?" coupé.":" activé.")+" Modifications prêtes pour le WAV, le MIDI ou le projet.");
 renderSteps();animation();
}
function dl(blob,name){
 const uri=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=uri;link.download=name;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(uri),3500);
}
function basename(){
 const n=comp?.source.normalized.replace(/[^A-Z0-9Α-Ω]+/g,"-").slice(0,20)||"composition";
 return "ELOAH-NUMERA-"+n;
}
async function exportWAV(){
 if(wavBusy||!comp)return;
 wavBusy=true;$("wav").disabled=true;say("Création du WAV en cours sur ton appareil. Le rendu est calculé avec les mêmes notes et les mêmes instruments.");
 try{const blob=await A.renderWAV(comp);dl(blob,basename()+".wav");say("Audio WAV créé : "+(blob.size/1048576).toFixed(1)+" Mo. Le fichier contient ta propre composition.");}
 catch(e){say("Impossible de générer le WAV sur ce navigateur : "+e.message);}
 finally{wavBusy=false;$("wav").disabled=false;}
}
function exportMIDI(){if(!comp)return;try{dl(A.renderMIDI(comp),basename()+".mid");say("Partition MIDI exportée. Ouvre-la dans ton logiciel de musique.");}catch(e){say("Export MIDI impossible : "+e.message)}}
function exportProject(){
 if(!comp)return;
 const project={format:"eloah-numera-project-1",version:E.version,exportedAt:new Date().toISOString(),
  config:comp.config,mutedSteps:comp.pattern.filter(s=>s.rest).map(s=>s.step),
  explanation:"Sauvegarde de paramètres créatifs. Elle ne contient ni connexion ni donnée de compte ELOAH."};
 dl(new Blob([JSON.stringify(project,null,2)],{type:"application/json;charset=utf-8"}),basename()+".json");
 say("Projet NUMERA exporté. Réimporte le fichier JSON pour retrouver tes réglages et les notes coupées.");
}
async function importProject(file){
 try{
  if(!file||file.size>65536)throw Error("Le projet JSON doit faire moins de 64 Ko.");
  const project=JSON.parse(await file.text());
  if(project?.format!=="eloah-numera-project-1"||!project.config)throw Error("Ce fichier n'est pas un projet NUMERA valide.");
  const cfg=E.settings(project.config);setControls(cfg);compose(false);
  if(Array.isArray(project.mutedSteps)){
   const muted=new Set(project.mutedSteps.filter(n=>Number.isInteger(n)&&n>=0&&n<comp.pattern.length));
   for(const p of comp.pattern)if(p.rest!==muted.has(p.step))toggleStep(p.step);
  }
  renderReadout();say("Projet rouvert : "+comp.source.normalized+". Tu peux écouter ou modifier la composition.");
 }catch(e){say("Échec de l'import : "+e.message);}
}
function exportPNG(){
 if(!comp)return;
 draw();
 const pic=document.createElement("canvas");
 pic.width=1400;pic.height=790;
 const out=pic.getContext("2d");
 const gradient=out.createLinearGradient(0,0,1400,790);gradient.addColorStop(0,"#170f24");gradient.addColorStop(1,"#40183c");
 out.fillStyle=gradient;out.fillRect(0,0,1400,790);
 const side=canvas.width/canvas.height,fullW=1400,fullH=fullW/side;
 out.drawImage(canvas,0,(790-fullH)/2,fullW,fullH);
 const shade=out.createLinearGradient(0,530,0,790);shade.addColorStop(0,"transparent");shade.addColorStop(1,"rgba(12,6,19,.9)");
 out.fillStyle=shade;out.fillRect(0,530,1400,260);
 out.fillStyle="#f5d5a4";out.font="bold 28px system-ui";out.fillText("ELOAH ✦ NUMERA",52,70);
 out.font="48px Georgia,serif";out.fillText(comp.source.normalized.slice(0,45),52,680);
 out.font="20px system-ui";out.fillStyle="#f4d4e1";out.fillText(comp.config.mode+" · "+comp.config.bpm+" BPM · "+comp.stats.notes+" notes",55,723);
 pic.toBlob(blob=>{if(blob)dl(blob,basename()+".png");else say("Export PNG indisponible sur cet appareil.");},"image/png");
 say("Visuel de ta composition préparé.");
}
$("generate").addEventListener("click",()=>compose(true));
$("play").addEventListener("click",play);
$("stop").addEventListener("click",stop);
$("wav").addEventListener("click",exportWAV);
$("midi").addEventListener("click",exportMIDI);
$("project").addEventListener("click",exportProject);
$("png").addEventListener("click",exportPNG);
$("projectFile").addEventListener("change",e=>{importProject(e.target.files?.[0]);e.target.value="";});
$("steps").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(b)toggleStep(Number(b.dataset.step))});
$("presets").addEventListener("click",e=>{const b=e.target.closest("[data-preset]");if(b){$("source").value=b.dataset.preset;$("sourceMode").value="auto";compose();}});
["bpm","variation","swing","volume"].forEach(id=>{
 $(id).addEventListener("input",displayControls);
 $(id).addEventListener("change",()=>compose(false));
});
["style","scale","root","bars","drums","pad","sourceMode"].forEach(id=>$(id).addEventListener("change",()=>compose(true)));
$("source").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();compose()}});
$("source").addEventListener("change",()=>compose(false));
if("ResizeObserver" in window)new ResizeObserver(animation).observe(canvas);
else window.addEventListener("resize",animation);
document.addEventListener("visibilitychange",()=>{if(document.hidden&&A.isPlaying())stop();});
window.addEventListener("pagehide",()=>A.stop());
displayControls();compose(false);
say("Ta première composition est prête. Clique sur Écouter pour l'entendre, ou change les nombres pour créer une nouvelle mélodie.");
})();
