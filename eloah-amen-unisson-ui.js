/* AMEN · L'Unisson — commandes de lecture et visualisation des 24 entrées.
 * L'image suit la structure du morceau : silence, 1 voix, 24 voix, unisson.
 */
(function(){
"use strict";
const E=window.ELOAH_AMEN_UNISSON;
if(!E)return;
const $=x=>document.getElementById(x);
const canvas=$("amenVisual"),context=canvas.getContext("2d");
let score=null,raf=0,stage=-1,playToken=0,exporting=false,stoppedAt=0;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fmt=x=>{let s=Math.floor(Math.max(0,x));return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
const announce=t=>{$("status").textContent=t};
const showExport=t=>{$("exportStatus").textContent=t};
function cfg(){return {root:$("root").value,voices:Number($("voices").value),
  intensity:Number($("intensity").value)/100,reverb:$("reverb").checked};}
function rebuild(){
 if(E.playing())stop(false);
 score=E.composition(cfg());
 $("intensityValue").value=Math.round(score.options.intensity*100)+" %";
 $("amenPairs").innerHTML=score.pairs.map(p=>
 '<div class="pair"><b>'+p.first+' · '+p.last+'</b><small>Rangs '+p.rankA+' + '+p.rankB+' = '+p.rankSum+'</small></div>'
 ).join("");
 $("amenVowels").innerHTML=E.vowels.map((v,i)=>
 '<div class="vowel" style="border-color:'+E.colors[i]+'"><b>'+v+'</b><small>'+E.vowelNames[i]+'</small></div>'
 ).join("");
 $("amenPhases").innerHTML=score.phases.map((p,i)=>
 '<button class="phase" type="button" data-phase="'+i+'" aria-label="Écouter '+p.title+'"><span class="symbol">'+p.symbol+'</span><strong>'+p.number+' · '+p.title+'</strong><small>'+fmt(p.start)+' — '+fmt(p.end)+'</small></button>'
 ).join("");
 showPhase(0,false);
 draw(0);
 announce("La création est prête. Départ volontairement silencieux pendant quelques secondes.");
}
function phaseAt(t){return score.phases.findIndex((p,i)=>t>=p.start&&t<p.end||i===score.phases.length-1&&t>=p.end);}
function showPhase(i,scroll=false){
 const p=score?.phases[i];if(!p)return;
 stage=i;$("phaseCover").textContent=p.title;
 $("phaseSubtitle").textContent=p.description;
 $("movementInfo").innerHTML='<div class="eyebrow">MOUVEMENT '+p.number+' · '+fmt(p.start)+'—'+fmt(p.end)+'</div><h3>'+p.title+'</h3><p>'+p.description+'</p>'+
 (i===0?'<p>Le son n’est pas encore né : le silence fait partie de la partition.</p>':
  i===1?'<p>Sept voyelles grecques deviennent sept couleurs vocaliques successives.</p>':
  i===2?'<p>Douze couples, soit vingt-quatre éléments, entrent en trois groupes sonores : 9 + 8 + 7.</p>':
  '<p>Les voix abandonnent leurs hauteurs différentes et se rejoignent sur la note choisie. La vocalise finale suggère « Amen ».</p>');
 $("amenPhases").querySelectorAll(".phase").forEach((node,j)=>node.classList.toggle("active",j===i));
}
function visual(t){
 const ratio=Math.min(2,window.devicePixelRatio||1),
  box=canvas.getBoundingClientRect(),W=Math.max(270,box.width),H=Math.max(230,box.height);
 if(canvas.width!==Math.round(W*ratio)||canvas.height!==Math.round(H*ratio)){
  canvas.width=Math.round(W*ratio);canvas.height=Math.round(H*ratio);
 }
 context.setTransform(ratio,0,0,ratio,0,0);
 const grd=context.createRadialGradient(W*.5,H*.5,6,W*.5,H*.5,Math.max(W,H)*.72);
 grd.addColorStop(0,"#4c2e50");grd.addColorStop(.5,"#21162e");grd.addColorStop(1,"#0c0915");
 context.fillStyle=grd;context.fillRect(0,0,W,H);
 const cx=W*.5,cy=H*.47,r=Math.min(W*.30,H*.31);
 const voices=t<6?0:t<24?1:t<55?Math.max(1,score.events.filter(e=>e.group!=="unisson"&&e.pair&&e.at<=t).length):score.options.voices;
 const unity=clamp((t-55)/18,0,1);
 const spin=t*.008;
 context.save();context.translate(cx,cy);
 for(let j=0;j<4;j++){
  context.beginPath();context.arc(0,0,r*(.48+j*.23),0,Math.PI*2);
  context.strokeStyle="rgba(239,205,223,"+(.20-j*.035)+")";context.lineWidth=1;context.stroke();
 }
 const count=Math.min(24,voices);
 for(let i=0;i<count;i++){
  const theta=2*Math.PI*i/Math.max(1,count)-Math.PI/2+spin*(1-unity);
  const pair=(i%12),tint=E.colors[(i+pair)%7],spread=1-unity*.86,
   rad=r*(.68+.43*(i%3)/3)*spread;
  const x=Math.cos(theta)*rad,y=Math.sin(theta)*rad;
  context.beginPath();context.arc(x,y,4+(i%4===0?1.2:0),0,Math.PI*2);
  context.fillStyle=tint;context.fill();
  if(t>24&&t<75){
   context.beginPath();context.moveTo(x,y);context.lineTo(0,0);
   context.strokeStyle="rgba(236,192,220,"+(.04+.23*unity)+")";context.lineWidth=.7;context.stroke();
  }
 }
 const core=clamp(t<6?(t-2)/6:t<55?.50+(t-24)*.006:.68+unity*.26,0,.95);
 const pulse=(t>6&&t<75)?.035*Math.sin(t*1.7):0;
 context.beginPath();context.arc(0,0,r*(.20+core*.26+pulse),0,Math.PI*2);
 context.fillStyle="rgba(40,17,49,.74)";context.fill();
 context.strokeStyle="rgba(254,221,167,.88)";context.lineWidth=1.6;context.stroke();
 context.font=Math.min(38,r*.25)+"px Georgia,serif";context.fillStyle="#ffead1";
 context.textAlign="center";context.textBaseline="middle";
 context.fillText(t<6?"∅":t<24?"Α":t<55?String(count):"✦",0,0);
 context.restore();
 return {voices,unity};
}
function draw(t){
 if(!context||!score)return;
 const meter=clamp(t/score.duration,0,1);
 visual(t);
 $("amenProgressBar").style.width=meter*100+"%";
 $("amenProgress").setAttribute("aria-valuenow",String(Math.round(meter*100)));
 $("timeNow").textContent=fmt(t);
 const index=score.phases.findIndex(p=>t>=p.start&&t<p.end);
 if(index>=0&&index!==stage)showPhase(index);
}
function tick(){
 if(E.playing()){
  let t=E.progress();
  draw(t);
  if(t<score.duration+.2){raf=requestAnimationFrame(tick);return;}
  E.stop();
  $("play").textContent="▶ Recommencer l’expérience";
  $("pause").textContent="Ⅱ Pause";
  announce("L’unisson s’est éteint. Retour au silence.");
 }
 raf=0;
}
async function start(offset=0){
 const token=++playToken;
 if(!score)rebuild();
 try{
  $("play").disabled=true;
  await E.play(cfg(),offset);
  if(token!==playToken){E.stop();return;}
  $("play").textContent="♪ Réécouter depuis le début";
  $("pause").textContent="Ⅱ Pause";
  announce("Lecture en cours · "+score.phases.find(p=>p.start<=offset&&p.end>offset)?.title+". Les premières secondes sont volontairement silencieuses.");
  if(raf)cancelAnimationFrame(raf);
  tick();
 }catch(e){announce("Audio indisponible : "+e.message+". Essaie de cliquer sur Écouter dans un navigateur prenant en charge Web Audio.");}
 finally{$("play").disabled=false;}
}
function stop(msg=true){
 ++playToken;E.stop();
 if(raf)cancelAnimationFrame(raf);raf=0;
 draw(0);
 $("pause").textContent="Ⅱ Pause";$("play").textContent="▶ Écouter l’expérience";
 if(msg)announce("Lecture arrêtée. Les calculs ALPHA restent visibles.");
}
function pause(){
 if(!E.playing()){announce("Commence la lecture avant de la mettre en pause.");return;}
 const paused=E.pause();
 $("pause").textContent=paused?"▶ Reprendre":"Ⅱ Pause";
 announce(paused?"Lecture suspendue.":"Lecture reprise.");
}
function save(blob,name){
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),9000);
}
async function exportWAV(){
 if(exporting||!score)return;exporting=true;$("wav").disabled=true;
 showExport("Fabrication de l’audio dans ton navigateur… Le mix de 78 secondes peut prendre de la mémoire sur téléphone.");
 try{const file=await E.wav(cfg());
  save(file,"ELOAH-AMEN-UNISSON.wav");
  showExport("WAV généré : "+(file.size/1048576).toFixed(1)+" Mo, 78 secondes. La synthèse en ligne peut être différente du mix MP3 partagé dans ChatGPT.");
 }catch(err){showExport("Export WAV indisponible : "+err.message);}
 finally{exporting=false;$("wav").disabled=false;}
}
function exportJSON(){
 if(!score)return;
 save(new Blob([JSON.stringify(score,null,2)],{type:"application/json;charset=utf-8"}),
  "ELOAH-AMEN-UNISSON-partition.json");
 showExport("Partition et provenance exportées avec les 24 entrées vocales.");
}
$("play").addEventListener("click",()=>start(0));
$("pause").addEventListener("click",pause);
$("stop").addEventListener("click",()=>stop(true));
$("recompose").addEventListener("click",()=>rebuild());
$("amenPhases").addEventListener("click",e=>{
 const btn=e.target.closest("[data-phase]");if(!btn)return;
 const i=Number(btn.dataset.phase);if(!score?.phases[i])return;
 showPhase(i);start(score.phases[i].start);
});
$("wav").addEventListener("click",exportWAV);
$("json").addEventListener("click",exportJSON);
$("intensity").addEventListener("input",()=>{
 $("intensityValue").value=$("intensity").value+" %";
});
window.addEventListener("pagehide",()=>stop(false));
document.addEventListener("visibilitychange",()=>{if(document.hidden&&E.playing())pause();});
if("ResizeObserver" in window)new ResizeObserver(()=>draw(E.playing()?E.progress():0)).observe(canvas);
rebuild();
const result=E.audit();
showExport("ALPHA vérifié : "+result.passed+"/"+result.total+" contrôles des lettres, groupes et mouvements réussis. Export WAV disponible.");
})();
