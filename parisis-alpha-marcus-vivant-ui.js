/* ELOAH · ALPHA-015 · Interface interactive de reconstitution analytique (Irénée I,14–15). */
(function(){
"use strict";
const E=window.PARISIS_ALPHA_VIVANT;
const R=window.PARISIS_ALPHA_READER;
const P=window.PARISIS_ALPHA_PAROLES;
if(!E||!R||!P)return;
const root=document.getElementById("marcus-live");
if(!root)return;
const $=id=>root.querySelector("#"+id);
const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let state=null,step=0,letter="Δ",depth=2;
const stageNames=["LA VOIX","LES NOMS","LE CORPS","LES SEPT CIEUX","L’UNITÉ"];
const examples={jesus:"Ἰησοῦς",truth:"ἀλήθεια",logos:"λόγος",omega:"ΑΩ"};
function say(t){$("mvStatus").textContent=t}
function init(){
 $("mvVerse").innerHTML=P.verses.map(v=>'<option value="'+esc(v.id)+'">'+esc(v.ref+" · "+v.title)+'</option>').join("");
 $("mvVerse").value="jn14-6";
 $("mvWord").value="ἀλήθεια";
 $("mvLetter").innerHTML=R.alphabet.map(c=>'<option value="'+c+'"'+(c==="Δ"?" selected":"")+'>'+c+'</option>').join("");
 draw();
}
function strong(s){return '<strong>'+esc(s)+'</strong>'}
function source(label,url){return '<a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">'+esc(label)+' ↗</a>'}
function drawStage(){
 const stage=state.stages[step],w=state.word,body=state.body;
 let content='';
 if(step===0){
  content='<p class="mv-greek">'+esc(state.input)+'</p>'+
  '<div class="mv-stats">'+[
   [w.length,"lettres écrites"],[w.alphabetRanksTotal,"somme des rangs"],[w.isopsephy,"isopséphie"],[body.filter(p=>p.complete).length,"paires complètes"]
  ].map(([n,title])=>'<div><strong>'+esc(n)+'</strong><small>'+esc(title)+'</small></div>').join("")+'</div>'+
  '<p>Alètheia prononce « Christ Jésus », puis se tait, selon Irénée. Marcus distingue le <b>son</b> du nom et sa <b>puissance</b> religieuse alléguée. Notre programme calcule le premier : il ne prétend pas vérifier la seconde.</p>'+
  '<div class="mv-feature">Nom à 30 éléments décrit séparément dans le même témoignage : <strong>4 + 4 + 10 + 12 = 30</strong>. Les trente caractères exacts ne sont pas transmis par ce passage.</div>';
 }else if(step===1){
  content='<p>L’exemple ancien est celui de la lettre Delta : <b>Δ → ΔΕΛΤΑ</b>. Chaque lettre de ce nom reçoit à son tour son propre nom. Le développement peut recommencer.</p>'+
   '<div class="mv-inline"><label>Lettre<select id="mvLetterInline">'+R.alphabet.map(l=>'<option value="'+l+'"'+(l===letter?" selected":"")+'>'+l+'</option>').join("")+'</select></label>'+
   '<label>Profondeur<select id="mvDepthInline">'+[1,2,3,4].map(x=>'<option value="'+x+'"'+(x===depth?" selected":"")+'>'+x+'</option>').join("")+'</select></label>'+
   '<button id="mvExpand" type="button">Engendrer les noms</button></div>'+
   '<div id="mvExpansion" class="mv-expansion" role="status"></div>'+
   '<p class="mv-small">L’algorithme emploie des noms grecs modernes standardisés. Les résultats après ΔΕΛΤΑ sont des simulations modernes, non des transcriptions attribuables à Marcus.</p>';
 }else if(step===2){
  content='<p>Le corps d’Alètheia décrit par Irénée contient <b>l’alphabet grec entier</b>. Les parties surlignées correspondent aux lettres de ton nom. Clique une paire pour voir ses lettres et ses rangs.</p>'+
    '<div class="mv-pairs">'+body.map(p=>'<button type="button" data-pair="'+p.number+'" class="'+(p.count?"mv-present":"")+'" aria-pressed="false">'+
    '<span class="mv-pair-symbol">'+p.left+" — "+p.right+'</span><strong>'+esc(p.name)+'</strong><small>'+p.ranks.join(" + ")+
    ' = 25 · '+p.count+' occ.</small></button>').join("")+'</div>'+
    '<div id="mvPairInfo" class="mv-feature" role="status">Les paires grisées ne sont pas complètes dans le mot étudié.</div>'+
    '<p>Ce nom touche '+body.filter(x=>x.count>0).length+' parties sur 12, et réunit '+body.filter(x=>x.complete).length+' paires complètes. Aucune symbolique corporelle propre au mot n’est prouvée par ce calcul.</p>';
 }else if(step===3){
  content='<p>Dans la cosmologie rapportée, les sept cieux font entendre les sept voyelles dans cet ordre. Tu peux explorer chaque ciel et faire lire la séquence avec la voix moderne du navigateur.</p>'+
   '<div class="mv-vowels">'+state.vowels.map(v=>'<button type="button" data-sky="'+v.sky+'"><strong>'+v.letter+'</strong><small>Ciel '+v.sky+'</small><small>'+v.count+' dans le nom</small></button>').join("")+'</div>'+
   '<div class="mv-feature" id="mvSkyInfo" role="status">Les sons ne sont pas les fréquences musicales des planètes : le texte ne fournit aucune telle table mesurable.</div>'+
   '<button type="button" id="mvVowelsSpeak">Faire entendre Α Ε Η Ι Ο Υ Ω</button>';
 }else{
  content='<p class="mv-greek" style="text-align:center">Ἀμήν</p>'+
   '<p>Chez Marcus tel que le rapporte Irénée, une multiplicité de noms et de voix est pensée comme issue d’une unité et orientée vers une voix commune. Le silence demeure une composante de son récit.</p>'+
   '<div class="mv-feature"><b>Réponse de l’expérience :</b> '+esc(state.verdict.answer)+'</div>'+
   '<div class="mv-conclusions">'+[
     ["OBSERVÉ",state.verdict.observed],["ATTESTÉ PAR IRÉNÉE",state.verdict.attested],["NON DÉMONTRÉ",state.verdict.notEstablished]
   ].map(([k,v])=>'<section><small>'+esc(k)+'</small><p>'+esc(v)+'</p></section>').join("")+'</div>'+
   '<button id="mvAmen" type="button">Écouter « Amen »</button>';
 }
 return '<div class="mv-stage-source">'+esc(stage.source)+'</div><h2>'+esc(stage.title)+'</h2>'+
   '<p class="mv-small">'+esc(stage.isAttested)+'</p>'+content;
}
function draw(){
 if(!state){$("mvCurrent").innerHTML='<h2>Choisis une parole. Lance le mécanisme.</h2><p>Le parcours suit cinq opérations décrites ou suggérées dans le témoignage d’Irénée. Tous les résultats doivent être distingués des interprétations religieuses.</p>';return}
 $("mvStageList").innerHTML=state.stages.map((stage,i)=>
  '<button type="button" class="'+(i===step?"active":"")+'" data-step="'+i+'" aria-current="'+(i===step?"step":"false")+'"><span>'+(i+1)+'</span>'+esc(stageNames[i])+'</button>').join("");
 $("mvCurrent").innerHTML=drawStage();
 $("mvPrev").disabled=step===0;
 $("mvNext").disabled=step===4;
 $("mvNext").textContent=step===3?"Aller à la réponse →":"Étape suivante →";
 $("mvProgress").textContent="ÉTAPE "+(step+1)+" / 5 · "+stageNames[step];
 $("mvProgressBar").style.width=((step+1)*20)+"%";
 say("Méthode exécutée sur « "+state.input+" » · "+state.verse.reference+" · étape "+(step+1)+"/5.");
 if(step===1)renderExpansion();
}
function setStage(n){if(!state)return;step=Math.max(0,Math.min(4,n));draw();}
function start(){
 try{
  state=E.fullRun({verseId:$("mvVerse").value,word:$("mvWord").value,expansionLetter:letter,depth});
  step=0;
  $("mvVerseGreek").textContent=state.verse.greek;
  $("mvVerseFrench").textContent=state.verse.french;
  $("mvVerseSource").href=state.verse.url;
  draw();
 }catch(e){say("Analyse impossible : "+e.message)}
}
function renderExpansion(){
 const box=$("mvExpansion");if(!box)return;
 try{
  const rs=E.expand(letter,depth);
  box.innerHTML=rs.stages.map(s=>'<div><span>Niveau '+s.level+'</span>'+
    '<strong>'+esc(s.length==null?"limite atteinte":s.length+" caractères")+'</strong>'+
    '<p>'+esc(s.preview)+'</p></div>').join("");
 }catch(e){box.textContent="Développement impossible : "+e.message}
}
function speak(value){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){say("Synthèse vocale indisponible.");return}
 const msg=new SpeechSynthesisUtterance(value);
 msg.lang="el-GR";msg.rate=.72;
 const greek=window.speechSynthesis.getVoices().find(x=>x.lang?.toLowerCase().startsWith("el"));
 if(greek)msg.voice=greek;
 window.speechSynthesis.cancel();
 window.speechSynthesis.speak(msg);
 say("Voix du navigateur lancée ; prononciation contemporaine, pas son du IIe siècle.");
}
function exportResult(){
 if(!state)return;
 const report={created:new Date().toISOString(),engine:E.version,...state,
  readingNote:"Simulation analytique. Ne démontre pas le sens divin d'un nom ni la pratique de Jésus historique."};
 const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="PARISIS-ALPHA-015-Marcus.json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$("mvVerse").innerHTML=P.verses.map(v=>'<option value="'+esc(v.id)+'">'+esc(v.ref+" · "+v.title)+'</option>').join("");
$("mvVerse").value="jn14-6";
$("mvWord").value="ἀλήθεια";
$("mvVerse").addEventListener("change",()=>{
 const verse=P.select($("mvVerse").value);
 if(verse){$("mvWord").value=verse.marker;start();}
});
$("mvRun").addEventListener("click",start);
$("mvPrev").addEventListener("click",()=>setStage(step-1));
$("mvNext").addEventListener("click",()=>setStage(step+1));
$("mvFinish").addEventListener("click",()=>{if(!state)start();setStage(4)});
$("mvExport").addEventListener("click",exportResult);
root.querySelectorAll("[data-word-example]").forEach(btn=>btn.addEventListener("click",()=>{
 $("mvWord").value=examples[btn.dataset.wordExample]||"Ἰησοῦς";start();
}));
root.addEventListener("click",event=>{
 const s=event.target.closest("[data-step]");
 if(s){setStage(Number(s.dataset.step));return}
 const p=event.target.closest("[data-pair]");
 if(p){
  const x=state?.body[Number(p.dataset.pair)-1];
  if(x){root.querySelectorAll("[data-pair]").forEach(el=>el.setAttribute("aria-pressed",String(el===p)));
   const box=$("mvPairInfo");if(box)box.textContent=x.name+" : "+x.left+" + "+x.right+" ; rangs "+x.ranks.join(" + ")+" = 25. Lettres observées dans le mot : "+x.count+". Paire complète : "+(x.complete?"oui":"non")+".";
  }return;
 }
 const sky=event.target.closest("[data-sky]");
 if(sky){const v=state?.vowels[Number(sky.dataset.sky)-1];const el=$("mvSkyInfo");
  if(v&&el)el.textContent="Ciel "+v.sky+", voyelle "+v.letter+". Le mot en contient "+v.count+". Irénée associe cette voyelle à une puissance céleste, sans fournir de hauteur musicale.";
  root.querySelectorAll("[data-sky]").forEach(el=>el.setAttribute("aria-pressed",String(el===sky)));return;
 }
 if(event.target.closest("#mvVowelsSpeak"))speak("Α Ε Η Ι Ο Υ Ω");
 if(event.target.closest("#mvAmen"))speak("Ἀμήν");
 if(event.target.closest("#mvExpand")){
  letter=$("mvLetterInline")?.value||"Δ";
  depth=Number($("mvDepthInline")?.value||2);renderExpansion();
 }
});
root.querySelector("#mvStop").addEventListener("click",()=>{if(window.speechSynthesis)window.speechSynthesis.cancel();say("Lecture arrêtée.")});
window.addEventListener("pagehide",()=>window.speechSynthesis?.cancel());
start();
})();
