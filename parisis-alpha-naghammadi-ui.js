/* ELOAH · PARISIS ENGINE · ALPHA-021 — enquête comparée, sources coptes.
 * Interface locale, sans réseau ni stockage ; la vérification est une analyse éditoriale.
 */
(function(){
"use strict";
const E=window.PARISIS_ALPHA_NAGHAMMADI;
const main=document.querySelector("main#marcus-live");
if(!E||!main||document.getElementById("alpha-naghammadi"))return;
const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const style=document.createElement("style");
style.textContent=`
#alpha-naghammadi{color:#fff1e3;background:linear-gradient(125deg,#241e2b,#38283c);border:1px solid #9c7e68;border-top:4px solid #eacb96;padding:clamp(16px,3vw,29px);margin:26px 0 45px;font:13px/1.65 system-ui;min-width:0}
#alpha-naghammadi h2,#alpha-naghammadi h3{font-family:Georgia,serif;font-weight:normal}
#alpha-naghammadi h2{font-size:clamp(30px,3.7vw,47px);line-height:1.14;margin:8px 0}
#alpha-naghammadi h3{font-size:clamp(23px,2.7vw,30px);margin:13px 0}
#alpha-naghammadi p{color:#e1d0c5}
#alpha-naghammadi .n-kicker{font:800 11px/1.5 system-ui;letter-spacing:.14em;color:#eed29d}
#alpha-naghammadi .n-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(260px,.8fr);gap:12px;margin:19px 0}
#alpha-naghammadi .n-block{border:1px solid #7b6774;background:#302b37;padding:15px;min-width:0}
#alpha-naghammadi .n-items{display:grid;gap:7px;max-height:480px;overflow:auto}
#alpha-naghammadi button,#alpha-naghammadi select{font:inherit}
#alpha-naghammadi button{background:#4c384f;color:#f5d7b1;border:1px solid #b39172;padding:10px 12px;cursor:pointer;font-size:12px}
#alpha-naghammadi button:hover,#alpha-naghammadi button[aria-pressed=true]{background:#805566;color:#fff1e0}
#alpha-naghammadi button:focus-visible,#alpha-naghammadi a:focus-visible,#alpha-naghammadi select:focus-visible{outline:3px solid #edd194;outline-offset:3px}
#alpha-naghammadi .n-item{text-align:left;display:grid;gap:3px}
#alpha-naghammadi .n-item small{color:#dfc5b0;font-size:10px}
#alpha-naghammadi .n-item strong{font-size:12px}
#alpha-naghammadi .n-info{min-height:260px}
#alpha-naghammadi .n-info .n-loc{color:#edcb98;font-size:11px;font-weight:800;letter-spacing:.06em}
#alpha-naghammadi .n-note{border-left:4px solid #d9b788;background:#433543;padding:12px;margin:13px 0;color:#f9e4ca}
#alpha-naghammadi .n-contrast{border-left:4px solid #b98e94;background:#392f3d;padding:12px;margin:13px 0}
#alpha-naghammadi a{color:#f5d79f;overflow-wrap:anywhere}
#alpha-naghammadi .n-topstats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#alpha-naghammadi .n-topstats>div{background:#3e3242;border:1px solid #846b7a;padding:14px}
#alpha-naghammadi .n-topstats strong{font:30px Georgia,serif;display:block;color:#f8d99c}
#alpha-naghammadi .n-topstats small{color:#decbba;font-size:11px}
#alpha-naghammadi .n-picks{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
#alpha-naghammadi label{font-size:12px;font-weight:750;color:#ebd0a5;display:block}
#alpha-naghammadi select{width:100%;padding:11px;background:#fffaef;color:#282029;margin:6px 0}
#alpha-naghammadi .n-buttons{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0}
#alpha-naghammadi .n-qa{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}
#alpha-naghammadi .n-qa button{text-align:left}
#alpha-naghammadi .n-proof{margin:10px 0;padding:12px;border:1px solid #766376;background:#302a36}
#alpha-naghammadi .n-proof strong{display:block;color:#f3d19e}
#alpha-naghammadi .n-limits{font-size:11px;color:#d4c2b6}
#alpha-naghammadi .n-footer{padding-top:15px;border-top:1px solid #745b70;margin-top:18px;font-size:11px;color:#cdbab0}
@media(max-width:930px){#alpha-naghammadi .n-layout{grid-template-columns:1fr}}
@media(max-width:590px){#alpha-naghammadi .n-qa,#alpha-naghammadi .n-picks{grid-template-columns:1fr}#alpha-naghammadi .n-topstats{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
document.head.appendChild(style);
const panel=document.createElement("section");panel.id="alpha-naghammadi";
panel.innerHTML=`
<div class="n-kicker">HUMANITIES LAB · ALPHA-021 · NAG HAMMADI</div>
<h2>Les lettres de la Vérité. <em style="color:#e8c98d">Pas seulement un alphabet.</em></h2>
<p>Le corpus copte ouvre une autre lecture du Nom, de l'union et de la connaissance. Cherche les passages réels, confronte-les avec Marcus et examine les divergences. Aucune graphie grecque disparue n'est inventée.</p>
<div class="n-topstats"><div><strong>6</strong><small>Ensembles documentaires</small></div><div><strong>10</strong><small>Passages annotés</small></div><div><strong>7</strong><small>Questions historiques</small></div></div>
<h3>01 · Lire le passage et sa provenance</h3>
<div class="n-layout">
<div class="n-block"><div class="n-items" id="nhSources" role="group" aria-label="Passages de Nag Hammadi et sources antiques"></div></div>
<div class="n-block n-info" id="nhPassage" aria-live="polite">Choisis un passage ancien.</div>
</div>
<h3>02 · Comparer deux passages</h3>
<div class="n-picks"><label for="nhA">Premier témoin<select id="nhA"></select></label><label for="nhB">Second témoin<select id="nhB"></select></label></div>
<div class="n-buttons"><button id="nhCompare" type="button">Confronter les motifs</button></div>
<div id="nhComparison" class="n-block" aria-live="polite">Sélectionne deux références distinctes.</div>
<h3>03 · Aller jusqu'à une réponse documentée</h3>
<div class="n-qa" id="nhQuestions" role="group" aria-label="Questions sur les noms, les lettres et les rites"></div>
<div class="n-block" id="nhAnswer" aria-live="polite">Choisis la question à examiner.</div>
<div class="n-buttons"><button id="nhAudit" type="button">Exécuter 14 contrôles</button><button id="nhExport" type="button">Exporter le rapport JSON</button></div>
<div class="n-note" id="nhStatus" role="status" aria-live="polite">Le corpus est indexé, sans analyse automatique de la langue copte.</div>
<div class="n-footer">Éditions consultables : <a href="https://www.gospels.net/truth" target="_blank" rel="noopener noreferrer">Gospel of Truth</a> · <a href="https://www.gospels.net/philip" target="_blank" rel="noopener noreferrer">Gospel of Philip</a> · <a href="https://www.pulaval.com/livres/expose-du-mythe-valentinien-et-textes-liturgiques-nh-xi-2-2a-c-bcnh-textes-no-36" target="_blank" rel="noopener noreferrer">Édition critique de NH XI,2</a>. Les textes conservés sont en copte ; les résumés français sont éditoriaux. Aucune transmission directe de Marcus ni aucune initiation rituelle authentique ne sont certifiées.</div>
<p><a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-021-nag-hammadi.md" target="_blank" rel="noopener noreferrer">Lire le dossier de preuves ALPHA-021 ↗</a></p>
`;
const after=main.querySelector("#alpha-redemption")||main.querySelector("#alpha-provenance")||main.querySelector("#alpha-temoins");
if(after)after.insertAdjacentElement("afterend",panel);else main.append(panel);
const $=id=>panel.querySelector("#"+id);
const books=Object.fromEntries(E.books.map(b=>[b.id,b]));
const options=E.passages.map(p=>'<option value="'+esc(p.id)+'">'+esc(books[p.book].label+" · "+p.section)+'</option>').join("");
$("nhA").innerHTML=options;$("nhB").innerHTML=options;
$("nhA").value="truth-letters";$("nhB").value="irenee14";
$("nhSources").innerHTML=E.passages.map(p=>'<button type="button" class="n-item" data-source="'+esc(p.id)+'" aria-pressed="false"><small>'+esc(books[p.book].label)+' · '+esc(p.section)+'</small><strong>'+esc(p.label)+'</strong></button>').join("");
function showPassage(id){
 let p;try{p=E.passage(id)}catch(e){$("nhPassage").textContent=e.message;return}
 $("nhSources").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.source===id)));
 const b=p.bookInfo;
 $("nhPassage").innerHTML='<div class="n-loc">'+esc(b.catalogue)+' · '+esc(p.section)+'</div>'+
 '<h3>'+esc(p.label)+'</h3><p>'+esc(p.observation)+'</p>'+
 '<div class="n-note"><b>PARALLÈLE / DIVERGENCE :</b> '+esc(p.contrast)+'</div>'+
 '<div class="n-contrast"><b>INCERTITUDE :</b> '+esc(p.limit)+'</div>'+
 '<p><b>Langue :</b> '+esc(b.language)+'<br><b>Copie :</b> '+esc(b.manuscript)+'<br><b>Datation :</b> '+esc(b.period)+
 '<br><b>Statut :</b> '+esc(p.evidence)+'</p>'+
 '<a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">Lire la source et contrôler les lacunes ↗</a>';
}
$("nhSources").addEventListener("click",e=>{
 const b=e.target.closest("[data-source]");if(b)showPassage(b.dataset.source);
});
function showComparison(){
 try{
  const x=E.compare($("nhA").value,$("nhB").value);
  $("nhComparison").innerHTML='<h3>'+esc(x.a.bookInfo.label)+' ↔ '+esc(x.b.bookInfo.label)+'</h3>'+
   '<p><b>Motifs communs contrôlés :</b> '+esc(x.motifs.join(", ")||"aucun")+'</p>'+
   '<div class="n-note">'+esc(x.decision)+'</div><p>'+esc(x.a.observation)+'</p><p>'+esc(x.b.observation)+'</p>'+
   '<div class="n-contrast">'+esc(x.warning)+'</div>';
  $("nhStatus").textContent=x.claim+" Aucun emprunt historique n'est déduit automatiquement.";
 }catch(e){$("nhComparison").textContent=e.message}
}
$("nhCompare").addEventListener("click",showComparison);
$("nhQuestions").innerHTML=E.questions.map(q=>'<button data-question="'+esc(q.id)+'" type="button" aria-pressed="false">'+esc(q.id+" · "+q.title)+'</button>').join("");
function answer(id){
 const q=E.investigate(id);
 $("nhQuestions").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.question===id)));
 $("nhAnswer").innerHTML='<h3>'+esc(q.title)+'</h3>'+
 '<div class="n-note"><b>'+esc(q.verdict)+'</b><p>'+esc(q.answer)+'</p></div>'+
 '<p><b>Pièce manquante :</b> '+esc(q.missing)+'</p>'+
 '<div>'+q.passages.map(p=>'<div class="n-proof"><strong>'+esc(p.bookInfo.label)+' · '+esc(p.section)+'</strong>'+
 '<span>'+esc(p.observation)+'</span><p class="n-limits">'+esc(p.limit)+'</p>'+
 '<a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">Texte source ↗</a></div>').join("")+'</div>';
}
$("nhQuestions").addEventListener("click",e=>{const b=e.target.closest("[data-question]");if(b)answer(b.dataset.question)});
$("nhAudit").addEventListener("click",()=>{
 const r=E.audit();$("nhStatus").textContent=r.passed+" / "+r.total+" contrôles réussis. Ils valident les distinctions du corpus encodé, pas une collation intégrale des manuscrits.";
});
$("nhExport").addEventListener("click",()=>{
 const payload={generated:new Date().toISOString(),...E.report()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
 const uri=URL.createObjectURL(blob),a=document.createElement("a");a.href=uri;a.download="ALPHA-021-Nag-Hammadi.json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),1900);
});
showPassage("truth-letters");showComparison();answer("Q1");
if(location.hash==="#alpha-naghammadi")panel.scrollIntoView({behavior:"auto",block:"start"});
})();
