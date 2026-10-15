/* ALPHA-018 · Grec d'Épiphane, Irénée et Hippolyte : rendre la dépendance documentaire visible. */
(function(){
"use strict";
const A=window.PARISIS_ALPHA_TEMOINS;
const main=document.querySelector("main#marcus-live");
if(!A||!main||document.getElementById("alpha-temoins"))return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const styles=document.createElement("style");
styles.textContent=`
#alpha-temoins{color:#fcf1e2;background:linear-gradient(135deg,#27212d,#322537);border:1px solid #9a806d;border-top:4px solid #edc990;padding:clamp(16px,3vw,28px);margin:25px 0 45px;font:13px/1.65 system-ui;min-width:0}
#alpha-temoins h2,#alpha-temoins h3{font-family:Georgia,serif;font-weight:normal}
#alpha-temoins h2{font-size:clamp(30px,3.8vw,44px);margin:9px 0}
#alpha-temoins h3{font-size:clamp(21px,2.4vw,29px)}
#alpha-temoins p{color:#e5d5c5}
#alpha-temoins .t-eyebrow{color:#f5d49a;letter-spacing:.14em;font-size:11px;font-weight:850}
#alpha-temoins .t-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:17px 0}
#alpha-temoins .t-witness{border:1px solid #765d70;background:#382f3e;padding:14px}
#alpha-temoins .t-witness strong{display:block;color:#fce3b2;font:22px Georgia,serif;margin:7px 0}
#alpha-temoins .t-witness small{display:block;font-size:11px;color:#dec9bb}
#alpha-temoins .t-witness span{display:inline-flex;color:#f0cb91;font-weight:800;font-size:10px;margin:7px 0}
#alpha-temoins a{color:#f4d7ab;text-underline-offset:3px;overflow-wrap:anywhere}
#alpha-temoins button{cursor:pointer;background:#4b374d;color:#f6d6a3;border:1px solid #b4967a;padding:10px 13px;font:700 12px system-ui}
#alpha-temoins button[aria-pressed=true],#alpha-temoins button:hover{background:#7a4d67;color:#fff2e0;border-color:#f1cf98}
#alpha-temoins button:focus-visible{outline:3px solid #f2d297;outline-offset:3px}
#alpha-temoins .t-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
#alpha-temoins .t-board{border:1px solid #7b6775;background:#302b37;padding:18px;min-height:230px}
#alpha-temoins .t-board h3{color:#ffe5b9;margin:5px 0}
#alpha-temoins .t-step{border-left:3px solid #dcb47f;background:#413240;padding:12px;margin:12px 0}
#alpha-temoins .t-signs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
#alpha-temoins .t-band{background:#382e3d;border:1px solid #765e70;padding:13px}
#alpha-temoins .t-glyphs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin:9px 0}
#alpha-temoins .t-glyph{border:1px solid #847181;padding:5px;text-align:center}
#alpha-temoins .t-glyph strong{font:24px Georgia,serif;color:#ffe3b1}
#alpha-temoins .t-glyph small{font-size:10px;display:block;color:#d6c1af}
#alpha-temoins .t-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:16px 0}
#alpha-temoins .t-kpi{background:#413244;border:1px solid #765e70;padding:12px}
#alpha-temoins .t-kpi strong{color:#fbe1ab;font:28px Georgia,serif;display:block}
#alpha-temoins .t-kpi small{color:#d9c4b2;font-size:11px}
#alpha-temoins .t-actions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}
#alpha-temoins .t-status{color:#f0d8b6;padding:12px;border-left:3px solid #f1d098;background:#453544}
#alpha-temoins .t-footer{margin-top:17px;font-size:11px;color:#d4bdba}
@media(max-width:930px){#alpha-temoins .t-row,#alpha-temoins .t-signs{grid-template-columns:1fr}#alpha-temoins .t-options{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:550px){#alpha-temoins .t-kpis{grid-template-columns:1fr 1fr}#alpha-temoins .t-glyphs{grid-template-columns:repeat(8,minmax(0,1fr))}#alpha-temoins .t-glyph strong{font-size:18px}}
`;
document.head.appendChild(styles);
const section=document.createElement("section");
section.id="alpha-temoins";
section.innerHTML=`
<div class="t-eyebrow">HUMANITIES LAB · ALPHA-018 · CONFRONTATION DES TÉMOINS</div>
<h2>Qui transmet le système de Marcus ?</h2>
<p>Irénée, Hippolyte et Épiphane ne forment pas automatiquement trois confirmations indépendantes. Le grec transmis par Épiphane permet surtout de contrôler les graphies et les constructions numériques.</p>
<div class="t-row" id="tWitnesses"></div>
<h3>Six passages à examiner</h3>
<div class="t-options" id="tCases" role="group" aria-label="Choisir la pièce documentaire"></div>
<div class="t-board" id="tCase" aria-live="polite"></div>
<h3>Le détail qui change le code : 24 lettres ≠ 27 signes numériques</h3>
<div class="t-signs" id="tSigns"></div>
<div class="t-kpis" id="tNumbers"></div>
<div class="t-step">Le grec alphabétique compte 24 lettres, réparties ici en trois bandes de 8. La notation numérique emploie en outre les signes Ϛ (6), Ϟ (90) et Ϡ (900). Ne confonds pas le <b>huitième rang de Θ</b> avec sa <b>valeur 9</b>, ni le <b>neuvième rang de Ι</b> avec sa <b>valeur 10</b>.</div>
<div class="t-actions"><button type="button" id="tAudit">Vérifier les 10 contrôles</button><button type="button" id="tExport">Exporter le dossier JSON</button></div>
<div class="t-status" id="tStatus" aria-live="polite">Sélectionne un passage grec.</div>
<p><a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-018-temoins-grecs.md" target="_blank" rel="noopener noreferrer">Consulter ALPHA-018 · Le dossier et ses sources ↗</a></p>
<p class="t-footer">Corpus limité de textes conservés et de traductions accessibles ; absence d'une collation manuscrite exhaustive. Les comparaisons décrivent la dépendance documentaire, pas la validité spirituelle d'une doctrine.</p>
`;
const prev=main.querySelector("#alpha-pourquoi")||main.querySelector("#alpha-chain")||main.querySelector(".mv-work");
if(prev)prev.insertAdjacentElement("afterend",section);else main.append(section);
const $=id=>section.querySelector("#"+id);
const data=A.analyze();
$("tWitnesses").innerHTML=data.witnesses.map(w=>
 '<article class="t-witness"><small>'+esc(w.period)+'</small><strong>'+esc(w.name)+'</strong><span>'+esc(w.status)+'</span>'+
 '<p>'+esc(w.summary)+'</p><small>'+esc(w.transmission)+'</small><a target="_blank" rel="noopener noreferrer" href="'+esc(w.url)+'">Accéder au texte ↗</a></article>'
).join("");
$("tCases").innerHTML=data.findings.map(x=>'<button type="button" data-case="'+esc(x.id)+'" aria-pressed="false">'+esc(x.title)+'</button>').join("");
function showCase(id){
 const c=data.findings.find(x=>x.id===id);if(!c)return;
 $("tCases").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.case===id)));
 $("tCase").innerHTML='<div class="t-eyebrow">ÉPIPHANE · PANARION '+esc(c.epiph)+' · IRÉNÉE '+esc(c.irenee)+'</div>'+
 '<h3>'+esc(c.title)+'</h3><p style="font:25px Georgia,serif;color:#f5d69f">'+esc(c.greek)+'</p>'+
 '<p>'+esc(c.words)+'</p><div class="t-step"><b>OBSERVABLE :</b> '+esc(c.claim)+'</div>'+
 '<div class="t-step"><b>CONTRE-LECTURE :</b> '+esc(c.critical)+'</div>'+
 '<div class="t-actions"><a href="https://www.sophiascriptura.com/fathers/epiphanius-panarion/34-9-1/#p-34-'+esc(c.epiph.split("–")[0].split(".").join("-"))+'" target="_blank" rel="noopener noreferrer">Voir le passage grec d'Épiphane ↗</a><a href="https://www.newadvent.org/fathers/0103115.htm" target="_blank" rel="noopener noreferrer">Consulter Irénée ↗</a></div>'+
 '<small>STATUT : '+esc(c.status)+' · même tradition textuelle principalement transmise, non deux témoins marcosiens autonomes.</small>';
 $("tStatus").textContent="Extrait "+c.epiph+" · "+c.title+" · origine documentaire contrôlée.";
}
$("tCases").addEventListener("click",e=>{const b=e.target.closest("[data-case]");if(b)showCase(b.dataset.case)});
$("tSigns").innerHTML=data.numeralBands.map(b=>'<div class="t-band"><strong>'+esc(b.label)+' · '+b.count+' lettres</strong>'+
 '<div class="t-glyphs">'+b.letters.map(c=>'<div class="t-glyph"><strong>'+esc(c.letter)+'</strong><small>rang '+c.ordinal+'</small><small>val. '+c.numeric+'</small></div>').join("")+'</div></div>').join("");
const k=data.known;
$("tNumbers").innerHTML=[
 [k.jesusValue,"ΙΗΣΟΥΣ en isopséphie"],[k.jesusCreation,"8 + 80 + 800"],[k.tetractys,"1 + 2 + 3 + 4"],[k.iotaOrdinal+" / "+k.iotaNumeral,"Rang / valeur de Ι"],[k.thetaOrdinal+" / "+k.thetaValue,"Rang / valeur de Θ"],[data.numeralMarkers.map(x=>x.value).join(" · "),"Trois signes numéraux supplémentaires"]
].map(x=>'<div class="t-kpi"><strong>'+esc(x[0])+'</strong><small>'+esc(x[1])+'</small></div>').join("");
$("tAudit").addEventListener("click",()=>{$("tStatus").textContent=data.audit.passed+" / "+data.audit.total+" contrôles réussis. Ces tests valident les opérations encodées, pas l'indépendance de sources dérivées."});
$("tExport").addEventListener("click",()=>{
 const body=JSON.stringify({date:new Date().toISOString(),...data},null,2);
 const blob=new Blob([body],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="ALPHA-018-temoins-grecs.json";
 document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1600);
});
showCase("888");
if(location.hash==="#alpha-temoins")section.scrollIntoView({behavior:"auto",block:"start"});
})();
