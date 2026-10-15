/* ELOAH · PARISIS · lecteur 24 lettres — interface sans backend ni stockage. */
(function(){
"use strict";
const A=window.PARISIS_ALPHA_READER;
if(!A){console.warn("Moteur ALPHA-LECTEUR non chargé");return;}
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const examples={
 jesus:"Ἰησοῦς",
 aletheia:"Ἀλήθεια",
 body:A.alphabet.join(" "),
 french:"L’Alpha et l’Oméga, le commencement et la fin. La Vérité est-elle un corps de lettres ?"
};
let report=null,selectedWord=null,selectedLetter=null;
const maxDisplay=180,MODE_TEXT={"greek":"lettres grecques présentes","latin-experiment":"transposition approximative, non philologique"};
function status(text){$("alphaStatus").textContent=text;}
function setText(id,value){$(id).textContent=value;}
function download(content,name,type){
 const blob=new Blob([content],{type:type||"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function statusBar(r){
 const s=r.stats;
 setText("stWords",s.tokens.toLocaleString("fr-FR"));
 setText("stGreek",s.greekLetters.toLocaleString("fr-FR"));
 setText("stUnique",s.distinctWords.toLocaleString("fr-FR"));
 setText("stSum",s.wordValueSum==null?"—":s.wordValueSum.toLocaleString("fr-FR"));
 const warn=[];
 if(s.unmappedWords)warn.push(s.unmappedWords+" mot(s) contiennent des caractères hors alphabet grec.");
 if(s.approximateWords)warn.push(s.approximateWords+" mot(s) traités en conversion graphique expérimentale.");
 warn.unshift(s.analyzedWords+" mots avec lettres interprétées / "+s.tokens+" mots découpés.");
 status(warn.join(" ")+" · Mode : "+MODE_TEXT[r.mode]+".");
}
function renderBody(r){
 const host=$("alphaParts");host.replaceChildren();
 const max=Math.max(1,...r.pairs.map(x=>x.total));
 r.pairs.forEach(p=>{
  const el=document.createElement("div");el.className="part";
  const d=document.createElement("div");d.className="line";
  const name=document.createElement("span");name.className="name";name.textContent=String(p.pair).padStart(2,"0")+" · "+p.body;
  const pair=document.createElement("span");pair.className="pair";pair.textContent=p.letters;
  d.append(name,pair);
  const meta=document.createElement("div");meta.className="meta";
  meta.textContent=p.first+" + "+p.last+" = "+p.total+" occurrence(s) dans le texte · rangs "+p.pair+" + "+(25-p.pair)+" = 25";
  const track=document.createElement("div");track.className="track";track.setAttribute("role","img");track.setAttribute("aria-label",p.total+" occurrences");
  const bar=document.createElement("div");bar.className="bar";bar.style.width=(100*p.total/max)+"%";track.append(bar);
  el.append(d,track,meta);host.append(el);
 });
}
function renderWordTokens(r){
 const host=$("alphaWords");host.replaceChildren();
 const count=Math.min(maxDisplay,r.words.length);
 for(let i=0;i<count;i++){
  const w=r.words[i],button=document.createElement("button");
  button.type="button";button.dataset.index=i;
  button.textContent=w.input;
  if(!w.length)button.classList.add("invalid");
  button.setAttribute("aria-pressed",String(selectedWord===i));
  button.setAttribute("title",w.length?w.normalized+" · "+w.length+" lettres":"Pas de lettre grecque reconnue");
  const label=document.createElement("span");label.textContent=w.isopsephy??"—";button.append(label);
  host.append(button);
 }
 $("wordLimit").textContent=count<r.words.length?"Affichage des "+count+" premiers mots sur "+r.words.length+" analysés.":count+" mot(s)";
}
function inspectWord(index){
 if(!report||index<0||index>=report.words.length)return;
 selectedWord=index;
 const w=report.words[index];
 for(const btn of $("alphaWords").querySelectorAll("button[data-index]"))btn.setAttribute("aria-pressed",String(Number(btn.dataset.index)===index));
 const host=$("alphaWordDetails");
 if(!w.length){
  host.innerHTML='<div class="greek-head">'+esc(w.input)+'</div><p class="sub">Aucune lettre grecque dans ce mot. Le lecteur a reconnu le mot dans le passage mais ne lui attribue pas artificiellement de corps grec. Pour un essai graphique, choisis « Latin : correspondance expérimentale ».</p>';
  return;
 }
 const details=w.letters.map((e,i)=>'<button type="button" class="char" data-char="'+esc(e.letter)+'" title="Examiner '+esc(e.letter)+'"><strong>'+esc(e.letter)+'</strong><small>rang '+e.rank+' / '+e.value+'</small></button>').join("");
 const body=w.bodyCounts.map(b=>'<span class="c8-tag" style="display:inline-block;border:1px solid #846b70;color:#f3d39c;padding:4px 7px;margin:3px">'+esc(b.part)+' ('+b.count+')</span>').join("");
 host.innerHTML='<div class="greek-head">'+esc(w.input)+' → '+esc(w.normalized)+'</div>'+
 '<div class="greek-sub">'+w.length+' lettres · Rangs additionnés : '+w.alphabetRanksTotal+' · Isopséphie : '+w.isopsephy+
 ' · '+w.vowels+' voyelles · '+w.consonants+' consonnes</div>'+
 '<div class="chars">'+details+'</div>'+
 '<p style="margin:7px 0">Parties présentes : '+(body||"Aucune")+'</p>'+
 '<p class="sub">Paires entièrement présentes : '+(w.pairedLetterSets.length?w.pairedLetterSets.join(", "):"aucune")+
 '. Cette cartographie ne traduit pas le sens du mot.</p>'+
 (w.approximate?'<p class="notice">Mot latin transformé par un tableau d’équivalences graphiques approximatif. Ce résultat n’est pas du grec ancien.</p>':"")+
 (w.ignored.length?'<p class="sub">Caractères alphabétiques exclus : '+esc(w.ignored.join(" "))+'</p>':"");
}
function inspectLetter(l){
 const e=A.letterInfo(l);if(!e)return;
 selectedLetter=l;
 $("alphaAlphabet").querySelectorAll("button").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.letter===l)));
 $("alphaLetterDetail").innerHTML='<div class="greek-head">'+esc(l)+' — '+esc(e.partner)+'</div>'+
 '<div class="greek-sub">Partie du corps : '+esc(e.body)+' · paire n° '+e.pair+'</div>'+
 '<div class="chars"><span class="char"><strong>'+esc(l)+'</strong><small>rang '+e.rank+'</small></span>'+
 '<span class="char"><strong>'+esc(e.partner)+'</strong><small>rang '+e.otherRank+'</small></span></div>'+
 '<p>Rangs complémentaires : '+e.rank+' + '+e.otherRank+' = 25. Valeur numérique grecque de '+esc(l)+' : '+e.value+
 '. Classe : '+(e.vowel?"voyelle":"autre lettre")+'.</p>'+
 '<p class="sub">L’opposition des rangs ne correspond pas à une opposition de valeurs isopséphiques.</p>';
}
function renderAlphabet(){
 const host=$("alphaAlphabet");
 for(const l of A.alphabet){
  const button=document.createElement("button");button.type="button";button.dataset.letter=l;button.textContent=l;
  button.setAttribute("aria-label","Analyser la lettre "+l);button.setAttribute("aria-pressed","false");host.append(button);
 }
}
function renderTables(r){
 $("alphaFrequency").innerHTML=r.frequentWords.slice(0,40).map(w=>
  "<tr><td>"+esc(w.original)+"</td><td>"+w.count+"</td><td>"+(w.isopsephy??"—")+"</td></tr>"
 ).join("")||'<tr><td colspan="3">Aucun mot grec.</td></tr>';
 $("alphaFrequencyLetters").innerHTML=r.frequentLetters.map(([char,count])=>{
  const e=A.letterInfo(char);
  return "<tr><td>"+esc(char)+"</td><td>"+count+"</td><td>"+esc(e.body)+"</td></tr>";
 }).join("")||'<tr><td colspan="3">Aucune lettre grecque.</td></tr>';
 $("frequencySummary").textContent="Statistiques établies sur "+r.stats.greekLetters+" lettres associées.";
 $("alphaWarnings").textContent=r.warnings.join(" ");
}
function run(){
 try{
  report=A.analyzeText($("alphaInput").value,{mode:$("alphaMode").value});
  selectedWord=report.words.length?0:null;
  statusBar(report);renderBody(report);renderWordTokens(report);renderTables(report);
  if(selectedWord!==null)inspectWord(selectedWord);
  else $("alphaWordDetails").textContent="Aucun mot trouvé.";
  if(selectedLetter===null)inspectLetter("Α");else inspectLetter(selectedLetter);
 }catch(e){status("Analyse impossible : "+e.message);}
}
function listen(input){
 if(!("speechSynthesis" in window)||!window.SpeechSynthesisUtterance){
  status("Lecture vocale non prise en charge par ce navigateur.");return;
 }
 const text=String(input||"").trim();
 if(!text){status("Il n'y a aucun texte à lire.");return}
 const maxLength=3500;
 const spoken=text.slice(0,maxLength);
 window.speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(spoken);
 const isGreek=/[\u0370-\u03ff\u1f00-\u1fff]/u.test(spoken);
 const lang=isGreek?"el-GR":"fr-FR";
 const voices=window.speechSynthesis.getVoices();
 const best=voices.find(v=>String(v.lang).toLowerCase().startsWith(isGreek?"el":"fr"));
 if(best)utterance.voice=best;
 utterance.lang=best?.lang||lang;
 utterance.rate=0.85;
 utterance.onend=()=>status("Lecture vocale terminée. La prononciation dépend de la voix moderne du navigateur.");
 utterance.onerror=()=>status("La lecture vocale a échoué. Vérifie les voix installées et les autorisations audio.");
 window.speechSynthesis.speak(utterance);
 status("Lecture vocale en cours"+(best?" · voix "+best.name:" · voix du navigateur")+"."+
 (spoken.length<text.length?" Seuls les "+maxLength+" premiers caractères sont lus.":"")+
 (isGreek?" Prononciation moderne, pas reconstitution antique.":""));
}
$("alphaAnalyze").addEventListener("click",run);
$("alphaMode").addEventListener("change",run);
$("alphaInput").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();run()}});
$("alphaWords").addEventListener("click",e=>{const btn=e.target.closest("button[data-index]");if(btn)inspectWord(Number(btn.dataset.index))});
$("alphaAlphabet").addEventListener("click",e=>{const b=e.target.closest("button[data-letter]");if(b)inspectLetter(b.dataset.letter)});
$("alphaWordDetails").addEventListener("click",e=>{const b=e.target.closest("button[data-char]");if(b){inspectLetter(b.dataset.char);$("alphaLetterDetail").scrollIntoView({behavior:"smooth",block:"nearest"})}});
$("alphaSpeak").addEventListener("click",()=>listen($("alphaInput").value));
$("alphaSpeakWord").addEventListener("click",()=>{if(report&&selectedWord!==null)listen(report.words[selectedWord].input)});
$("alphaStop").addEventListener("click",()=>{if("speechSynthesis" in window){window.speechSynthesis.cancel();status("Lecture interrompue.")}});
$("alphaClear").addEventListener("click",()=>{$("alphaInput").value="";if("speechSynthesis" in window)window.speechSynthesis.cancel();run()});
$("alphaFile").addEventListener("change",async function(){
 const f=this.files?.[0];if(!f)return;
 try{
  if(f.size>240000)throw Error("Fichier trop volumineux (max. 240 Ko).");
  if(!/\.(txt|md|csv)$/i.test(f.name))throw Error("Ce lecteur accepte TXT, MD et CSV.");
  const content=await f.text();
  if(content.length>120000)throw Error("Texte dépassant 120 000 caractères.");
  $("alphaInput").value=content;
  run();
  status("Fichier « "+f.name+" » chargé et analysé uniquement dans ce navigateur.");
 }catch(e){status("Import impossible : "+e.message)}
 this.value="";
});
$("alphaCsv").addEventListener("click",()=>{if(report)download(A.exportCSV(report),"ALPHA-LECTEUR-mots.csv","text/csv;charset=utf-8")});
$("alphaJson").addEventListener("click",()=>{if(report)download(JSON.stringify({generated:new Date().toISOString(),engine:A.version,...report},null,2),"ALPHA-LECTEUR-analyse.json","application/json;charset=utf-8")});
document.querySelectorAll("button[data-example]").forEach(b=>b.addEventListener("click",()=>{
 const x=examples[b.dataset.example];if(x!=null){$("alphaMode").value="greek";$("alphaInput").value=x;run();}
}));
window.addEventListener("pagehide",()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel()});
renderAlphabet();run();
})();
