/* PARISIS ENGINE · ALPHA-020 · Interface d'enquête, pas reconstitution liturgique.
 * L'utilisateur sélectionne une pratique, compare des sources, et consulte les objections.
 */
(function(){
"use strict";
const E=window.PARISIS_ALPHA_REDEMPTION;
const main=document.querySelector("main#marcus-live");
if(!E||!main||document.getElementById("alpha-redemption"))return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const styles=document.createElement("style");
styles.textContent=`
#alpha-redemption{color:#fff0e0;background:linear-gradient(125deg,#241e2c,#37283b);border:1px solid #a98b71;border-top:4px solid #edc991;padding:clamp(16px,3vw,28px);margin:28px 0 40px;font:13px/1.65 system-ui;min-width:0}
#alpha-redemption h2,#alpha-redemption h3{font-family:Georgia,serif;font-weight:normal}
#alpha-redemption h2{font-size:clamp(32px,3.7vw,47px);margin:10px 0 12px}
#alpha-redemption h3{font-size:clamp(22px,2.6vw,29px);margin:13px 0}
#alpha-redemption p{color:#e5d5c9;max-width:1000px}
#alpha-redemption .r-eyebrow{font:800 11px system-ui;letter-spacing:.16em;color:#e9cb97}
#alpha-redemption .r-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}
#alpha-redemption .r-stat{border:1px solid #786371;background:#3a303f;padding:12px}
#alpha-redemption .r-stat strong{font:30px Georgia,serif;display:block;color:#f7d29a}
#alpha-redemption .r-stat small{font-size:11px;color:#d7c4b8}
#alpha-redemption button,#alpha-redemption select{font:inherit}
#alpha-redemption button{padding:9px 11px;background:#4d384c;color:#f5d9b5;border:1px solid #bda07c;cursor:pointer;font-size:12px}
#alpha-redemption button:hover,#alpha-redemption button[aria-pressed=true]{background:#7b5267;color:#fff3df}
#alpha-redemption button:focus-visible,#alpha-redemption a:focus-visible,#alpha-redemption select:focus-visible{outline:3px solid #f4d79e;outline-offset:3px}
#alpha-redemption .r-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:13px 0}
#alpha-redemption .r-board{padding:clamp(13px,2.4vw,23px);background:#312c37;border:1px solid #796778;min-height:210px}
#alpha-redemption .r-board strong{color:#f1d0a1}
#alpha-redemption .r-line{display:grid;grid-template-columns:140px 1fr;gap:12px;border-bottom:1px solid #796774;padding:9px 0}
#alpha-redemption .r-line b{color:#f0d29c}
#alpha-redemption .r-alert{border-left:4px solid #ebbc81;padding:11px 13px;background:#483747;margin:12px 0;color:#ffe5c7}
#alpha-redemption .r-section{margin:22px 0;border-top:1px solid #816d7a;padding-top:12px}
#alpha-redemption .r-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:13px 0}
#alpha-redemption .r-panel{background:#342e3d;border:1px solid #816a7c;padding:14px;margin:12px 0}
#alpha-redemption .r-panel ul{padding-left:19px}
#alpha-redemption .r-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}
#alpha-redemption .r-sources{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}
#alpha-redemption a{color:#f5d5a5;overflow-wrap:anywhere}
#alpha-redemption .r-small{font-size:11px;color:#cdbab7}
@media(max-width:880px){#alpha-redemption .r-tabs{grid-template-columns:repeat(3,1fr)}#alpha-redemption .r-options{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){#alpha-redemption .r-line{grid-template-columns:1fr}#alpha-redemption .r-grid{grid-template-columns:repeat(2,1fr)}#alpha-redemption .r-tabs{grid-template-columns:repeat(2,1fr)}#alpha-redemption .r-options{grid-template-columns:1fr}}
`;
document.head.append(styles);
const panel=document.createElement("section");panel.id="alpha-redemption";
panel.innerHTML=`
<div class="r-eyebrow">PARISIS ENGINE · ALPHA-020 · RÉDEMPTION ET PAROLES</div>
<h2>Quand le Nom devient <em style="color:#efca94">une parole prononcée.</em></h2>
<p>Irénée décrit des invocations avec eau, des réponses et des onctions. La <em>Réfutation</em> parle d'une transmission orale réservée ; Théodote rapproche purification et connaissance. Parcours les attestations sans les fusionner en un rite unique.</p>
<div class="r-grid"><div class="r-stat"><strong>10</strong><small>Pratiques et situations distinguées</small></div><div class="r-stat"><strong>4</strong><small>Unités de source analysées</small></div><div class="r-stat"><strong>6</strong><small>Questions historiques testées</small></div></div>
<h3>1 · Quelle forme de rédemption est décrite ?</h3>
<div class="r-tabs" role="group" id="rOperations" aria-label="Choisir une pratique historique"></div>
<div class="r-board" id="rOperation" aria-live="polite"></div>
<div class="r-section"><h3>2 · Les trois voix rapportées en I,21,3</h3>
<p>Dans une variante décrite par Irénée, les paroles sont distribuées entre un officiant, la personne initiée et l'assemblée. Ce schéma présente des <strong>rôles documentaires</strong>, pas une cérémonie à reproduire.</p>
<div class="r-grid"><div class="r-stat"><strong>01</strong><small>Officiant : invocation</small></div><div class="r-stat"><strong>02</strong><small>Personne initiée : réponse</small></div><div class="r-stat"><strong>03</strong><small>Assistants : parole de paix</small></div></div>
<div class="r-alert">Autre variante dans le même chapitre : certains rejettent totalement l'eau et les onctions, considérant la connaissance seule comme rédemption. C'est une contradiction de pratiques, non une erreur de calcul.</div></div>
<div class="r-section"><h3>3 · Tester les six hypothèses</h3>
<div class="r-options" role="group" id="rHypotheses"></div>
<div class="r-panel" id="rAnswer" aria-live="polite"></div></div>
<div class="r-section"><h3>4 · Confronter deux pratiques</h3>
<div class="r-actions"><label>Premier texte<select id="rFirst"></select></label><label>Second texte<select id="rSecond"></select></label><button type="button" id="rCompare">Comparer</button></div>
<div class="r-panel" id="rComparison" aria-live="polite">Sélectionne deux descriptions historiques.</div></div>
<div class="r-actions"><button id="rAudit" type="button">Exécuter l'audit</button><button id="rExport" type="button">Exporter le registre JSON</button></div>
<div class="r-alert" id="rStatus" role="status" aria-live="polite">La parole est attestée comme composante de certains rites rapportés ; la récitation des douze paires reste non démontrée.</div>
<div class="r-sources" id="rSources"></div>
<p><a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-020-voix-redeption.md" target="_blank" rel="noopener noreferrer">Lire ALPHA-020 · Dossier critique et citations ↗</a></p>
<p class="r-small">Étude historique. Aucune initiation proposée, aucun nom secret attribué arbitrairement à Marcus, aucune donnée privée ELOAH consultée.</p>
`;
const after=main.querySelector("#alpha-provenance")||main.querySelector("#alpha-temoins")||main.querySelector(".mv-work");
if(after)after.insertAdjacentElement("afterend",panel);else main.append(panel);
const $=id=>panel.querySelector("#"+id);
const doc=E.report();
const options=doc.operations.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.title)+'</option>').join("");
$("rFirst").innerHTML=options;$("rSecond").innerHTML=options;
$("rFirst").value="water";$("rSecond").value="knowledge";
$("rSources").innerHTML=doc.sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.short)+' ↗</a>').join("");
$("rOperations").innerHTML=doc.operations.map(x=>'<button type="button" data-operation="'+esc(x.id)+'" aria-pressed="false">'+esc(x.title)+'</button>').join("");
function show(id){
 const x=E.readOperation(id);
 $("rOperations").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.operation===id)));
 $("rOperation").innerHTML='<h3>'+esc(x.title)+'</h3><p>'+esc(x.report)+'</p>'+
 [['Passage',x.sourceDocument.short+", "+x.section],['Attribution',x.group],['Voix ou parole',x.voice],
 ['Rôles',x.roles.join(" → ")],['Eau',x.water==null?"non précisée":x.water?"présente":"absente"],
 ['Onction',x.anointing==null?"non précisée":x.anointing?"présente":"absente"]].map(a=>
 '<div class="r-line"><b>'+esc(a[0])+'</b><span>'+esc(a[1])+'</span></div>').join("")+
 '<div class="r-alert"><b>Indice :</b> '+esc(x.point)+'</div><p class="r-small"><b>Réserve :</b> '+esc(x.caution)+'</p>'+
 '<a href="'+esc(x.sourceDocument.url)+'" target="_blank" rel="noopener noreferrer">Lire la référence historique ↗</a>';
}
$("rOperations").addEventListener("click",e=>{const b=e.target.closest("[data-operation]");if(b)show(b.dataset.operation)});
$("rHypotheses").innerHTML=doc.hypotheses.map(h=>'<button type="button" data-h="'+esc(h.id)+'">'+esc(h.id+" · "+h.question)+'</button>').join("");
function hypothesis(id){
 const h=E.investigate(id);
 $("rHypotheses").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.h===id)));
 $("rAnswer").innerHTML='<h3>'+esc(h.question)+'</h3>'+
 '<div class="r-alert"><b>'+esc(h.status)+'</b></div><p>'+esc(h.limit)+'</p>'+
 '<p><b>Passages pris en compte :</b> '+h.operations.map(o=>esc(o.sourceDocument.short+" "+o.section)).join(" · ")+'</p>';
}
$("rHypotheses").addEventListener("click",e=>{const b=e.target.closest("[data-h]");if(b)hypothesis(b.dataset.h)});
$("rCompare").addEventListener("click",()=>{
 if($("rFirst").value===$("rSecond").value){$("rComparison").textContent="Choisis deux descriptions différentes.";return}
 const c=E.compare($("rFirst").value,$("rSecond").value);
 const label=value=>value==null?"Non précisé":value?"Oui":"Non";
 $("rComparison").innerHTML='<h3>'+esc(c.a.title)+' ↔ '+esc(c.b.title)+'</h3>'+
 '<div class="r-line"><b>Présence d’eau</b><span>'+esc(label(c.a.water))+' / '+esc(label(c.b.water))+'</span></div>'+
 '<div class="r-line"><b>Onction</b><span>'+esc(label(c.a.anointing))+' / '+esc(label(c.b.anointing))+'</span></div>'+
 '<div class="r-line"><b>Forme</b><span>'+esc(c.a.mode)+" / "+esc(c.b.mode)+'</span></div>'+
 '<div class="r-line"><b>Rôles communs</b><span>'+esc(c.sharedRoles.join(", ")||"aucun")+'</span></div>'+
 '<div class="r-alert">'+esc(c.conclusion)+'</div>';
});
$("rAudit").addEventListener("click",()=>{$("rStatus").textContent=doc.audit.passed+" / "+doc.audit.total+" tests du moteur réussis ; ils vérifient les distinctions encodées, pas l'historicité indépendante des rites."});
$("rExport").addEventListener("click",()=>{
 const blob=new Blob([JSON.stringify({generatedAt:new Date().toISOString(),...E.report()},null,2)],{type:"application/json;charset=utf-8"});
 const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="PARISIS-ALPHA-020-redeption.json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
});
show("water");hypothesis("H6");
if(location.hash==="#alpha-redemption")panel.scrollIntoView({behavior:"auto",block:"start"});
})();
