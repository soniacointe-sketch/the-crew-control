/* ALPHA-016 · Interface de la chaîne des Éons et des 24 lettres, en complément d'ALPHA-015. */
(function(){
"use strict";
const E=window.PARISIS_ALPHA_CHAINE;
if(!E)return;
const parent=document.querySelector("main#marcus-live");
if(!parent||document.getElementById("alpha-chain"))return;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const style=document.createElement("style");
style.textContent=`
#alpha-chain{margin:26px 0 40px;padding:clamp(16px,3vw,30px);background:linear-gradient(123deg,#25232c,#362739);color:#f8eee0;border:1px solid #9a7762;border-top:4px solid #ecd092;min-width:0;font:14px/1.65 system-ui,-apple-system,sans-serif}
#alpha-chain h2,#alpha-chain h3{font-family:Georgia,serif;font-weight:normal}
#alpha-chain h2{font-size:clamp(29px,3.6vw,45px);margin:6px 0}
#alpha-chain h3{font-size:27px;margin:12px 0}
#alpha-chain p{color:#e0cfc7;max-width:900px}
#alpha-chain .ch-sub{color:#d3bcaf;font-size:12px}
#alpha-chain .ch-gold{color:#edd099}
#alpha-chain .ch-line{height:1px;background:#776275;margin:19px 0}
#alpha-chain .ch-head{display:flex;justify-content:space-between;align-items:start;gap:18px;flex-wrap:wrap}
#alpha-chain .ch-buttons{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}
#alpha-chain button{cursor:pointer;background:#51364d;color:#f7d6aa;border:1px solid #bea279;padding:10px 13px;font-size:12px;font-weight:750}
#alpha-chain button:hover,#alpha-chain button[aria-pressed=true]{background:#7d5069;color:#fff2d9}
#alpha-chain button:disabled{opacity:.45;cursor:not-allowed}
#alpha-chain .ch-primary{background:#edcb90;color:#241b23}
#alpha-chain input{display:block;background:#fff7ed;border:1px solid #b79a9c;color:#261f25;border-radius:3px;padding:10px;min-width:min(290px,100%);max-width:100%}
#alpha-chain label{font-size:12px;color:#e6c69c;font-weight:800}
#alpha-chain .ch-nav{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
#alpha-chain .ch-nav button{min-height:50px;padding:10px 7px;background:#2d2933;border:1px solid #786472;text-align:center}
#alpha-chain .ch-nav button.active{background:#634259;border-color:#f2d291}
#alpha-chain .ch-board{padding:clamp(13px,2.7vw,24px);border:1px solid #776575;background:#292731;min-height:230px;margin-top:14px}
#alpha-chain .ch-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}
#alpha-chain .ch-card{padding:13px;border:1px solid #776273;background:#362f3d;min-width:0}
#alpha-chain .ch-card strong{font:30px Georgia,serif;color:#f5d397;display:block}
#alpha-chain .ch-card span{font-size:12px;color:#e1cdbe;display:block}
#alpha-chain .ch-card small{color:#d7c1b9;font-size:10px}
#alpha-chain .ch-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
#alpha-chain .ch-steps span{font:22px Georgia,serif;text-align:center;padding:9px;background:#503950;color:#f9ddaa}
#alpha-chain .ch-vowels{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin:12px 0}
#alpha-chain .ch-vowels div{text-align:center;padding:10px 3px;background:#3d3140;border:1px solid #715b6f}
#alpha-chain .ch-vowels strong{font:29px Georgia,serif;color:#f8d5a0}
#alpha-chain .ch-vowels small{font-size:10px;display:block;color:#e1c7b4}
#alpha-chain .ch-letters{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
#alpha-chain .ch-letters span{display:inline-block;padding:9px 11px;border:1px solid #725a72;background:#362f3f;font:22px Georgia,serif}
#alpha-chain .ch-muted{border-left:3px solid #e2b67d;background:#3d303d;padding:11px 14px;margin:12px 0;color:#f6dec8}
#alpha-chain .ch-proof{padding:11px 0;border-bottom:1px solid #73606b}
#alpha-chain .ch-proof a{color:#f8d7aa}
#alpha-chain .ch-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
#alpha-chain .ch-highlight{font:32px Georgia,serif;color:#f1c787}
#alpha-chain .ch-prog{height:5px;background:#534050;overflow:hidden;margin:10px 0}
#alpha-chain #chProgress{height:100%;width:12.5%;background:#edca8a;transition:width .22s}
#alpha-chain .ch-links{display:flex;gap:13px;flex-wrap:wrap;font-size:12px}
#alpha-chain a{color:#f3d6a6}
@media(max-width:830px){#alpha-chain .ch-nav{grid-template-columns:repeat(2,minmax(0,1fr))}#alpha-chain .ch-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){#alpha-chain .ch-steps{grid-template-columns:repeat(2,minmax(0,1fr))}#alpha-chain .ch-vowels{gap:2px}#alpha-chain .ch-vowels strong{font-size:20px}#alpha-chain .ch-vowels small{font-size:8px}}
@media(prefers-reduced-motion:reduce){#alpha-chain #chProgress{transition:none}}
`;
document.head.appendChild(style);
const el=document.createElement("section");el.id="alpha-chain";
el.innerHTML=`
<div class="ch-head"><div><div class="kicker">ALPHA-016 · ANALYSE INTÉGRALE DU PASSAGE §2–§9</div>
<h2>De l'Éon au monde. <em class="ch-gold">24 → 30 → 7.</em></h2>
<p>Rejoue huit opérations décrites par Irénée, de l'émission d'une voix aux sept cieux. Les nombres sont recalculés : aucune nouvelle lettre ni preuve d'une cause cosmique n'est inventée.</p></div>
<div><label for="chWord">Mot grec étudié<input id="chWord" type="text" spellcheck="false" maxlength="150" value="Ἰησοῦς"></label>
<div class="ch-buttons"><button id="chRun" class="ch-primary">GO · Exécuter</button><button id="chExport">Exporter l'audit</button></div></div></div>
<div id="chStatus" class="ch-muted" role="status" aria-live="polite">Le programme est prêt.</div>
<div class="ch-nav" id="chNav" role="navigation" aria-label="Huit étapes de la doctrine"></div>
<div class="ch-board"><div class="ch-summary"><span id="chPosition" class="kicker"></span><span id="chTotal" class="ch-highlight"></span></div>
<div class="ch-prog"><div id="chProgress"></div></div><div id="chContent" aria-live="polite"></div></div>
<div class="ch-buttons"><button id="chPrev">← Précédent</button><button id="chNext" class="ch-primary">Continuer →</button><button id="chFinish">Voir la synthèse des preuves</button><button id="chSpeak" type="button">Entendre les voyelles</button><button id="chStop">Stop</button></div>
<details style="margin-top:15px"><summary style="cursor:pointer;color:#efcb95">Registre des 12 contrôles reproductibles</summary><div id="chTests"></div></details>
<div class="ch-line"></div>
<div class="ch-links"><a href="https://www.newadvent.org/fathers/0103114.htm" target="_blank" rel="noopener noreferrer">Source Irénée I,14 ↗</a>
<a href="https://ccel.org/ccel/irenaeus/against_heresies_i/anf01.ix.ii.xv.html" target="_blank" rel="noopener noreferrer">Édition avec notes sur ζ, ξ et ψ ↗</a>
<a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-016-chaine-eons-episemon.md" target="_blank" rel="noopener noreferrer">Rapport ALPHA-016 ↗</a></div>
<p class="ch-sub">Source adverse : Irénée réfute la doctrine. Toutes les cartes « Éons », « Ogdoades », « Épisémon » représentent des correspondances religieuses attribuées à Marcus, non des lois du monde.</p>
`;
const location=parent.querySelector(".mv-work");
if(location)location.insertAdjacentElement("afterend",el);else parent.append(el);
const $=id=>el.querySelector("#"+id);
let state=null,step=0;
const statCard=(num,name,small="")=>'<div class="ch-card"><strong>'+esc(num)+'</strong><span>'+esc(name)+'</span><small>'+esc(small)+'</small></div>';
function drawContent(){
 const st=state.stages[step],data=state;
 let content="";
 if(st.id==="origine"){
  content='<p>Selon le récit, les éléments nommables sont réunis sous Ecclesia, y compris les termes suivants. Ce sont des qualifications, pas six étiquettes automatiquement égales à six êtres indépendants.</p>'+
  '<div class="ch-grid">'+data.aeonTerms.map((n,i)=>statCard(String(i+1),n)).join("")+'</div>'+
  '<p class="ch-muted">« Chaque élément possède ce qui lui est propre » : dans ce vocabulaire, le nom n’est pas seulement un mot, mais un ensemble doctrinal.</p>';
 }else if(st.id==="emanation"){
  content='<div class="ch-grid">'+statCard("01","Une lettre émet un son")+statCard("02","Le son produit des éléments")+statCard("03","La lettre rejoint sa syllabe")+'</div>'+
   '<div class="ch-muted">Le son demeure « en bas » dans le récit cosmologique. Cela ne décrit pas une opération de propagation sonore mesurable.</div>'+
   '<p>Le développement de Δ en ΔΕΛΤΑ, puis en noms de lettres supplémentaires, est proposé dans ALPHA-015. Il illustre l’expansion potentielle des signes, sans preuve d’une expansion littéralement infinie dans un document matériel.</p>';
 }else if(st.id==="alphabet"){
  content='<div class="ch-grid">'+data.distributions.map(g=>statCard(g.count,g.name,g.associated+" · "+g.observed+" lettres dans "+data.word)).join("")+'</div>'+
   '<p>Répartition attestée dans le témoignage d’Irénée : <b>9 + 8 + 7 = 24</b>. Cette classification est historique.</p>'+
   data.distributions.map(g=>'<p><b>'+esc(g.name)+': </b><span style="letter-spacing:.18em">'+esc(g.letters)+'</span></p>').join("");
 }else if(st.id==="ogdoades"){
  content='<p>Le récit attribue la « puissance de huit » au groupe de sept. Notre schéma compare les comptes initiaux et leur égalisation symbolique.</p>'+
   '<div class="ch-grid">'+statCard("9 → 8","Muettes","–1 dans le schéma")+
   statCard("8 → 8","Semi-voyelles","Sans changement")+
   statCard("7 → 8","Voyelles","+1 symbolique")+'</div>'+
   '<div class="ch-muted">Résultat : <b>8 + 8 + 8 = 24</b>. Aucune lettre grecque n’a changé effectivement de classe dans le tableau original : on représente seulement l’égalisation décrite.</div>';
 }else if(st.id==="episemon"){
  content='<div class="ch-grid">'+statCard("3 + 3","Éléments et puissances","×4 = 24")+
   statCard("24 + 6","Complément symbolique","= 30")+
   statCard("3","Lettres dites doubles","Ζ · Ξ · Ψ")+'</div>'+
   '<p>L’Épisémon appartient ici au symbolisme du <b>six</b> ; il ne faut pas le confondre avec les trois lettres « doubles » dont les éditeurs détaillent les lectures, ni dire que l’alphabet ordinaire possédait trente lettres.</p>'+
   '<div class="ch-letters">'+data.doubles.map(x=>'<span>'+esc(x.letter)+'</span>').join("")+'</div>'+
   '<div class="ch-muted">La formule des émissions du nom est distincte : <b>4 + 4 + 10 + 12 = 30</b>. Le témoignage ne donne pas toutes les lettres de ce nom.</div>';
 }else if(st.id==="colombe"){
  content='<div class="ch-grid">'+statCard(data.schema.alphaOmega,"Α + Ω","1 + 800")+
   statCard(data.schema.dove,"ΠΕΡΙΣΤΕΡΑ","Nom de la colombe")+
   statCard(data.schema.jesus,"ΙΗΣΟΥΣ","Nom de Jésus")+'</div>'+
   '<div class="ch-muted"><b>801 = 801</b> pour l’Alpha–Oméga et la colombe. 888 pour Jésus. Les calculs se vérifient ; l’association au sixième jour, à la Transfiguration ou à la crucifixion est une exégèse propre au système rapporté.</div>';
 }else if(st.id==="cieux"){
  content='<p>Chaque ciel prononce une voyelle dans un ordre fixe. Les chiffres sous les lettres montrent leur présence dans <b>'+esc(data.word)+'</b>.</p>'+
   '<div class="ch-vowels">'+data.heavens.map(h=>'<div><strong>'+h.letter+'</strong><small>Ciel '+h.heaven+'</small><small>'+h.present+'× dans le mot</small></div>').join("")+'</div>'+
   '<div class="ch-muted">Le quatrième ciel fait entendre Ι (iota). Le passage relie ces voix à la création, mais ne donne pas de fréquence physique ou musicale à mesurer.</div>';
 }else{
  content='<p>Irénée rapporte que Marcus utilisait les premiers cris et l’exclamation « Ω » comme illustrations de son système céleste, et attribuait au chant des puissances une efficacité cosmique.</p>'+
   '<div class="ch-grid">'+statCard("Ω","Cri invoqué comme exemple","Non vérifié comme loi des nouveau-nés")+
   statCard("Ἀμήν","Retour symbolique à l’unité","Voix commune, non signal acoustique")+
   statCard(data.word,data.isopsephy+" en isopséphie","Nombre calculé, sens non établi")+'</div>'+
   '<div class="ch-muted"><b>Réponse :</b> nous pouvons retrouver la logique interne des nombres et des lettres ; nous ne pouvons pas prouver que ces sons ont créé le monde ou que Jésus connaissait et employait le procédé.</div>';
 }
 return '<div class="kicker">IRÉNÉE · '+esc(st.ref)+'</div><h3>'+esc(st.title)+'</h3>'+
  '<p class="ch-sub">'+esc(st.observation)+'</p>'+content+
  '<div class="ch-muted"><b>Limite :</b> '+esc(st.warning)+'</div>';
}
function draw(){
 if(!state)return;
 $("chNav").innerHTML=state.stages.map((s,i)=>
  '<button data-step="'+i+'" type="button" class="'+(i===step?"active":"")+'" aria-pressed="'+String(i===step)+'">'+(i+1)+'. '+esc(s.title.replace(/^Les |^Le |^La /,""))+'</button>').join("");
 $("chContent").innerHTML=drawContent();
 $("chProgress").style.width=(100*(step+1)/state.stages.length)+"%";
 $("chPosition").textContent="ÉTAPE "+(step+1)+" / "+state.stages.length;
 $("chTotal").textContent=state.word;
 $("chPrev").disabled=step===0;$("chNext").disabled=step===state.stages.length-1;
 $("chStatus").textContent="Mot : "+state.word+" · "+state.characters+" lettres · "+state.ordinalSum+" en rangs · "+state.isopsephy+" en isopséphie · Étape "+(step+1)+"/8.";
}
function run(){
 try{
  state=E.analyze({word:$("chWord").value.trim()});
  step=0;draw();
 }catch(e){$("chStatus").textContent="Impossible de lire ce mot : "+e.message;}
}
function speak(str){
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
  $("chStatus").textContent="Voix grecque indisponible dans ce navigateur.";return;
 }
 window.speechSynthesis.cancel();
 const msg=new SpeechSynthesisUtterance(str);msg.lang="el-GR";msg.rate=.85;
 const v=window.speechSynthesis.getVoices().find(x=>x.lang?.toLowerCase().startsWith("el"));
 if(v)msg.voice=v;
 window.speechSynthesis.speak(msg);
 $("chStatus").textContent="Lecture en grec moderne sur cet appareil, pas restitution sonore antique.";
}
function download(){
 if(!state)return;
 const payload={version:E.version,created:new Date().toISOString(),audit:E.audit(),analysis:state,
  warning:"Simulation critique de la doctrine transmise par Irénée, aucune preuve de création physique ou de transmission par Jésus."};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
 const uri=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=uri;a.download="ALPHA-016-chaine-marcus.json";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(uri),3000);
}
const audits=E.audit();
$("chTests").innerHTML=audits.checks.map(x=>'<div class="ch-proof">'+esc(x.pass?"✓":"ÉCHEC")+' '+esc(x.id)+'</div>').join("")+
 '<div class="ch-muted">'+esc(audits.message)+'</div>';
$("chRun").addEventListener("click",run);
$("chPrev").addEventListener("click",()=>{step=Math.max(0,step-1);draw()});
$("chNext").addEventListener("click",()=>{step=Math.min(state.stages.length-1,step+1);draw()});
$("chFinish").addEventListener("click",()=>{if(!state)run();step=state.stages.length-1;draw()});
$("chExport").addEventListener("click",download);
$("chNav").addEventListener("click",e=>{const b=e.target.closest("[data-step]");if(b){step=Number(b.dataset.step);draw()}});
$("chSpeak").addEventListener("click",()=>speak("Α Ε Η Ι Ο Υ Ω"));
$("chStop").addEventListener("click",()=>{window.speechSynthesis?.cancel();$("chStatus").textContent="Lecture interrompue."});
$("chWord").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();run()}});
window.addEventListener("pagehide",()=>window.speechSynthesis?.cancel());
run();
})();
