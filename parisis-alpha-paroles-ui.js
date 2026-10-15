/* PARISIS ALPHA · GO LE CODE : les paroles attribuées à Jésus, en grec transmis.
 * Sans IA distante, sans stockage, sans création de pseudo-traduction.
 */
(function(){
"use strict";
const P=window.PARISIS_ALPHA_PAROLES, R=window.PARISIS_ALPHA_READER;
if(!P||!R)return;
const main=document.querySelector("main.wrap");
if(!main)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");
css.textContent=`
#alpha-jesus{--jgold:#eac47f;--jline:#735c67;background:linear-gradient(127deg,#291f2f,#24202b 70%,#3b283c);color:#f9f0e5;border:1px solid #977357;border-top:4px solid #eac47f;padding:clamp(17px,3vw,29px);margin:0 0 23px;font:14px/1.7 system-ui,-apple-system,sans-serif}
#alpha-jesus h2,#alpha-jesus h3{font-family:Georgia,serif;font-weight:normal}
#alpha-jesus h2{font-size:clamp(29px,4vw,48px);line-height:1.13;margin:8px 0 11px}
#alpha-jesus h3{font-size:23px;margin:18px 0 8px}
#alpha-jesus p{color:#dfcebe;font-size:13px;margin:8px 0 15px}
#alpha-jesus .j-eyebrow{color:#eac47f;font-size:11px;letter-spacing:.16em;font-weight:800}
#alpha-jesus .j-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px}
#alpha-jesus label{display:block;font-size:12px;color:#efd8b7;font-weight:700}
#alpha-jesus select,#alpha-jesus textarea{display:block;width:100%;color:#28212b;background:#fff9f0;border:1px solid #b7a6a3;padding:11px;margin:7px 0;font:14px/1.5 system-ui;border-radius:3px}
#alpha-jesus textarea{min-height:85px;resize:vertical}
#alpha-jesus button{background:#4b344e;color:#f4dbad;border:1px solid #c49a69;padding:11px 15px;font-weight:750;cursor:pointer}
#alpha-jesus button:hover{background:#654366}
#alpha-jesus button.j-go{background:#e9c481;color:#241d23;border-color:#e9c481}
#alpha-jesus .j-actions{display:flex;gap:9px;flex-wrap:wrap;margin:10px 0}
#alpha-jesus .j-alert{border-left:3px solid #e8bb74;background:#3e303d;color:#f4e2c7;padding:11px 15px;margin:12px 0;font-size:12px}
#alpha-jesus .j-result[hidden]{display:none!important}
#alpha-jesus .j-source{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;margin:10px 0}
#alpha-jesus .j-source a{color:#f0d095;text-underline-offset:4px}
#alpha-jesus .j-greek{font:clamp(22px,3vw,36px)/1.5 Georgia,serif;color:#fff3dc;background:#302a34;padding:15px 20px;border:1px solid #685360;margin:10px 0;overflow-wrap:anywhere}
#alpha-jesus .j-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}
#alpha-jesus .j-stats>div{padding:12px;background:#322d36;border:1px solid #756274}
#alpha-jesus .j-stats strong{font:normal 30px Georgia,serif;color:#f0d090;display:block}
#alpha-jesus .j-stats small{display:block;color:#d6c1ba;font-size:10px}
#alpha-jesus .j-words{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
#alpha-jesus .j-words button{min-width:95px;text-align:left;display:grid;gap:3px;padding:10px 12px;background:#342f3a}
#alpha-jesus .j-words button[aria-pressed=true]{background:#674660;border-color:#eed097}
#alpha-jesus .j-words button strong{font:20px Georgia,serif;color:#fff2dd}
#alpha-jesus .j-words button small{color:#e1c18f;font-size:10px}
#alpha-jesus .j-detail{padding:15px;background:#302a36;border-left:3px solid #e8c27f;min-height:100px}
#alpha-jesus .j-charline{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
#alpha-jesus .j-letter{display:grid;gap:2px;text-align:center;min-width:55px;background:#423545;border:1px solid #927784;padding:7px}
#alpha-jesus .j-letter strong{font:24px Georgia,serif}
#alpha-jesus .j-letter small{color:#ecd0a7;font-size:9px}
#alpha-jesus .j-pairgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:11px 0}
#alpha-jesus .j-pair{border:1px solid #67545b;background:#2c2931;padding:9px}
#alpha-jesus .j-pair strong{font:21px Georgia,serif;color:#f0d1a7}
#alpha-jesus .j-pair span{font-size:10px;color:#dfcbbb;display:block}
#alpha-jesus .j-foot{color:#d8c6b8;font-size:11px;padding-top:11px;border-top:1px solid #695362;margin-top:18px}
@media(max-width:880px){#alpha-jesus .j-pairgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){#alpha-jesus .j-controls{grid-template-columns:1fr}#alpha-jesus .j-stats{grid-template-columns:repeat(2,minmax(0,1fr))}#alpha-jesus .j-pairgrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
document.head.appendChild(css);
const div=document.createElement("section");
div.id="alpha-jesus";
div.setAttribute("aria-label","Décodeur d'extraits évangéliques");
div.innerHTML=`
<div class="j-eyebrow">ELOAH · PARISIS ENGINE · PAROLES DE JÉSUS · 24 LETTRES</div>
<h2>Une parole de Jésus. <em style="color:#eac47f">GO · LE CODE.</em></h2>
<p>Choisis un passage des Évangiles ou colle une citation française connue. Le programme retrouve son court extrait grec documenté, puis applique les douze paires du corps d’Alètheia. Clique ensuite chaque mot pour ouvrir ses lettres, leurs partenaires, leurs rangs et les valeurs numériques.</p>
<div class="j-controls">
<label for="jVerse">Extrait évangélique étudié<select id="jVerse"></select></label>
<label for="jQuote">Colle une parole française (ou un texte grec)<textarea id="jQuote" spellcheck="false" maxlength="12000" placeholder="Exemple : Je suis le chemin, la vérité et la vie."></textarea></label>
</div>
<div class="j-actions"><button type="button" id="jGo" class="j-go">✦ GO · DÉCODER CETTE PAROLE</button><button type="button" id="jFull">Voir dans le lecteur complet ↓</button><button type="button" id="jReset">Extrait de Jean 14,6</button></div>
<div id="jStatus" class="j-alert" role="status" aria-live="polite">Le programme démarre sur « Je suis le chemin, la vérité et la vie » (Jean 14,6).</div>
<div id="jResult" class="j-result">
<div class="j-source"><strong id="jRef"></strong><a id="jSourceLink" href="https://www.greekbible.com/john/14/6" target="_blank" rel="noopener noreferrer">Contrôler le grec à la source ↗</a></div>
<div id="jGreek" class="j-greek"></div><p id="jFrench"></p>
<div class="j-stats" id="jStats"></div><div class="j-alert" id="jFocusInsight"></div>
<h3>Le code, mot par mot</h3>
<div class="j-words" id="jWords" role="group" aria-label="Sélectionner un mot grec"></div>
<div class="j-detail" id="jWordDetail" aria-live="polite">Choisis un mot du texte grec.</div>
<h3>Les douze parties du corps</h3>
<div class="j-pairgrid" id="jPairs"></div>
<div class="j-foot" id="jContext"></div>
</div>
<div class="j-foot">Important : les Évangiles transmettent ces paroles en grec. Jésus parlait probablement principalement araméen ; les calculs concernent la forme grecque des récits conservés. Une égalité numérique ou corporelle ne prouve pas l'existence d'un code voulu par Jésus.</div>`;
main.insertBefore(div,main.firstChild);
const $=id=>div.querySelector("#"+id);
const options=P.verses.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.ref+" · "+x.title)+'</option>').join("");
$("jVerse").innerHTML=options;
let current=null,chosen=0,greekInput=false;
function renderWord(n){
 if(!current||n<0||n>=current.words.length)return;
 chosen=n;
 const w=current.words[n];
 $("jWords").querySelectorAll("button").forEach(el=>el.setAttribute("aria-pressed",String(Number(el.dataset.i)===n)));
 $("jWordDetail").innerHTML=
 '<div><strong style="font:26px Georgia,serif;color:#f5d5a5">'+esc(w.input)+'</strong> → '+esc(w.normalized)+'</div>'+
 '<p>Rangs additionnés : <b>'+esc(w.alphabetRanksTotal)+'</b> · Isopséphie : <b>'+esc(w.isopsephy)+'</b> · '+w.length+' lettres</p>'+
 '<div class="j-charline">'+w.letters.map(l=>'<div class="j-letter"><strong>'+esc(l.letter)+'</strong><small>rang '+l.rank+'</small><small>opposée '+esc(l.partner)+'</small><small>'+esc(l.body)+'</small><small>valeur '+l.value+'</small></div>').join("")+'</div>'+
 '<p>Parties présentes : '+esc(w.bodyCounts.map(x=>x.part+" ("+x.count+")").join(", ")||"aucune")+
 '. Paires complètes dans ce mot : '+(w.pairedLetterSets.join(", ")||"aucune")+'.</p>';
}
function render(result){
 current=result;chosen=0;
 $("jResult").hidden=false;
 $("jRef").textContent=result.reference;
 $("jGreek").textContent=result.greek;
 $("jFrench").textContent=result.translation;
 $("jSourceLink").href=result.source||"https://www.greekbible.com/john/14/6";
 $("jSourceLink").hidden=!result.source;
 const metrics=[
 [result.stats.tokens,"Mots grecs"],[result.stats.greekLetters,"Lettres examinées"],
 [result.stats.wordValueSum??"—","Somme isopséphique"],[result.completePairs+"/12","Paires présentes"]
 ];
 $("jStats").innerHTML=metrics.map(x=>'<div><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+'</small></div>').join("");
 const focus=R.analyzeWord(result.focus||"");
 $("jFocusInsight").textContent=result.focus&&focus.length?"MOT CLÉ · "+result.focus+" : "+focus.length+" lettres, valeur grecque "+focus.isopsephy+", rangs cumulés "+focus.alphabetRanksTotal+". Ce calcul dépend de cette graphie grecque et ne prouve pas un code secret voulu par le personnage historique.":"Analyse par mot : aucune signification cachée déduite automatiquement.";
 $("jWords").innerHTML=result.words.map((w,i)=>
 '<button type="button" data-i="'+i+'" aria-pressed="'+String(i===0)+'"><strong>'+esc(w.input)+'</strong><small>Σ '+esc(w.isopsephy)+'</small></button>'
 ).join("");
 $("jPairs").innerHTML=result.pairs.map(p=>'<div class="j-pair"><strong>'+esc(p.first)+' — '+esc(p.last)+'</strong><span>'+esc(p.body)+'</span><span>'+p.ranks.join(" + ")+' = 25 · '+p.count+' lettre(s) observée(s)</span></div>').join("");
 $("jContext").textContent=result.context||result.caveat;
 if(result.words.length){const preferred=result.words.findIndex(w=>w.normalized===result.focus);renderWord(preferred>=0?preferred:0);}
}
function fromGreek(text){
 const a=R.analyzeText(text,{mode:"greek"});
 const focusWord=a.words.find(w=>w.length>0)||null;
 return {id:"manual",reference:"Texte grec fourni · référence non vérifiée",greek:text,translation:"Texte grec personnel — aucune traduction automatique.",source:"",
 words:a.words.filter(w=>w.length>0),pairs:R.pairs.map((p,i)=>({first:p.first,last:p.last,body:p.body,ranks:p.ranks,count:a.pairs[i].total})),
 stats:a.stats,completePairs:a.pairs.filter(x=>x.observedBoth).length,
 context:"Analyse purement formelle d'un texte grec non authentifié comme parole de Jésus. Fournis une cote et une édition avant de l'attribuer historiquement."};
}
function execute(){
 const input=$("jQuote").value.trim();
 const hasGreek=/[\u0370-\u03ff\u1f00-\u1fff]/u.test(input);
 if(hasGreek){
  try{const r=fromGreek(input);render(r);greekInput=true;$("jStatus").textContent="Texte grec fourni analysé. L'attribution à Jésus n'est pas établie automatiquement.";return;}
  catch(e){$("jStatus").textContent=e.message;return;}
 }
 if(input){
  const matches=P.lookupFrench(input);
  if(!matches.length){
   $("jStatus").textContent="Je ne reconnais pas cette phrase dans les quatre extraits référencés. Choisis un passage dans la liste : le programme ne fabrique pas de grec ancien à partir du français.";
   return;
  }
  $("jVerse").value=matches[0].id;
  if(matches.length>1){
   $("jStatus").textContent="Plusieurs références possibles : "+matches.map(m=>m.ref).join(", ")+". La première correspondance est sélectionnée ; vérifie sa source.";
  }
 }
 const id=$("jVerse").value;
 try{
  const result=P.decode(id);result.context=P.select(id).context;
  render(result);greekInput=false;
  $("jStatus").textContent="GO · "+result.reference+" : "+result.stats.tokens+" mots décomposés, "+result.stats.greekLetters+" lettres, "+result.completePairs+" paire(s) complètes. Ce sont des correspondances formelles à contrôler.";
 }catch(e){$("jStatus").textContent="Erreur d'analyse : "+e.message}
}
$("jWords").addEventListener("click",e=>{
 const button=e.target.closest("button[data-i]");
 if(button)renderWord(Number(button.dataset.i));
});
$("jVerse").addEventListener("change",()=>{
 const verse=P.select($("jVerse").value);
 if(verse){$("jQuote").value=verse.french;execute();}
});
$("jGo").addEventListener("click",execute);
$("jReset").addEventListener("click",()=>{
 $("jVerse").value="jn14-6";$("jQuote").value=P.select("jn14-6").french;execute();
});
$("jFull").addEventListener("click",()=>{
 if(!current)return;
 const textarea=document.getElementById("alphaInput"),mode=document.getElementById("alphaMode"),button=document.getElementById("alphaAnalyze");
 if(textarea&&mode&&button){
  textarea.value=current.greek;mode.value="greek";button.click();
  document.getElementById("lecture")?.scrollIntoView({behavior:"smooth",block:"start"});
 }
});
$("jQuote").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();execute()}});
$("jQuote").value=P.select("jn14-6").french;
execute();
})();
