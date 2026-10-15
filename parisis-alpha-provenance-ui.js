/* PARISIS · ALPHA-019 — réseau de provenance et degrés d'indépendance, sans accès aux données privées. */
(function(){
"use strict";
const E=window.PARISIS_ALPHA_PROVENANCE,main=document.querySelector("main#marcus-live");
if(!E||!main||document.getElementById("alpha-provenance"))return;
const esc=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const style=document.createElement("style");
style.textContent=`
#alpha-provenance{color:#f8ebdb;background:linear-gradient(130deg,#2b242e,#38273b);border:1px solid #a68b72;border-top:4px solid #e8c48d;margin:25px 0 40px;padding:clamp(16px,2.8vw,30px);font:13px/1.65 system-ui;min-width:0}
#alpha-provenance h2,#alpha-provenance h3{font-family:Georgia,serif;font-weight:normal}
#alpha-provenance h2{font-size:clamp(30px,3.5vw,43px);margin:6px 0 10px}
#alpha-provenance h3{font-size:26px;margin:8px 0}
#alpha-provenance p{color:#e1cfc2}
#alpha-provenance .apv-eyebrow{color:#ebc890;font-size:11px;font-weight:850;letter-spacing:.16em}
#alpha-provenance .apv-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:19px 0}
#alpha-provenance .apv-kpis div{background:#403343;border:1px solid #786674;padding:13px}
#alpha-provenance .apv-kpis strong{display:block;color:#f8d79f;font:30px Georgia,serif}
#alpha-provenance .apv-kpis small{font-size:11px;color:#d7c4b5}
#alpha-provenance .apv-claims{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}
#alpha-provenance button{cursor:pointer;font:700 12px system-ui;background:#4c354c;border:1px solid #b69978;padding:10px 13px;color:#f1d6b2}
#alpha-provenance button:hover,#alpha-provenance button[aria-pressed=true]{background:#7b5268;color:#fff3e0}
#alpha-provenance button:focus-visible{outline:3px solid #ead098;outline-offset:3px}
#alpha-provenance .apv-board{border:1px solid #796779;background:#302a38;padding:16px;min-height:190px}
#alpha-provenance .apv-status{border-left:4px solid #dfb97d;background:#433443;padding:12px 15px;color:#f6e1c3;margin-top:13px}
#alpha-provenance .apv-witnesses{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:11px 0}
#alpha-provenance .apv-source{border:1px solid #755e6c;background:#372f3b;padding:12px}
#alpha-provenance .apv-source b{display:block;color:#f1d3aa;font-size:13px}
#alpha-provenance .apv-source small{font-size:11px;color:#d2c1b6;display:block}
#alpha-provenance .apv-source span{color:#f4d2a8;font-size:10px}
#alpha-provenance .apv-relations{display:grid;gap:8px;margin:12px 0}
#alpha-provenance .apv-relation{padding:12px;background:#342d39;border:1px solid #746371}
#alpha-provenance .apv-relation b{color:#f1d09b;display:block}
#alpha-provenance .apv-relation small{color:#d8c5b6}
#alpha-provenance a{color:#f3d7a5;overflow-wrap:anywhere}
#alpha-provenance .apv-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
#alpha-provenance .apv-footer{font-size:11px;color:#cfbcb0;border-top:1px solid #76616c;padding-top:12px;margin-top:19px}
@media(max-width:900px){#alpha-provenance .apv-witnesses{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){#alpha-provenance .apv-witnesses{grid-template-columns:1fr}#alpha-provenance .apv-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;
document.head.appendChild(style);
const el=document.createElement("section");el.id="alpha-provenance";
el.innerHTML=`
<div class="apv-eyebrow">ALPHA-019 · STEMMA · DÉPENDANCE DES SOURCES</div>
<h2>Sept documents. <em style="color:#efcf91">Combien de preuves indépendantes ?</em></h2>
<p>La répétition d'un récit n'est pas une confirmation supplémentaire. Choisis une affirmation pour découvrir quels textes en parlent, s'ils se copient et ce qu'ils apportent réellement.</p>
<div class="apv-kpis"><div><strong>7</strong><small>Documents identifiés</small></div><div><strong>5</strong><small>Affirmations examinées</small></div><div><strong>1</strong><small>Lignée principale pour l'alphabet de Marcus</small></div></div>
<div class="apv-claims" id="apvClaims" role="group" aria-label="Choisir une affirmation historique"></div>
<div class="apv-board" id="apvBoard" aria-live="polite"></div>
<h3>Cartographie des relations documentaires</h3>
<div class="apv-relations" id="apvRelations"></div>
<h3>Les témoins et leur provenance</h3>
<div class="apv-witnesses" id="apvWitnesses"></div>
<div class="apv-actions"><button id="apvAudit">Exécuter les 10 contrôles</button><button id="apvExport">Exporter le réseau JSON</button></div>
<div id="apvStatus" class="apv-status" role="status" aria-live="polite">Le moteur examine les dépendances, pas seulement les mots qui se ressemblent.</div>
<p><a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-019-sources-derriere-sources.md" target="_blank" rel="noopener noreferrer">Lire ALPHA-019 · Rapport d'enquête et sources ↗</a></p>
<div class="apv-footer">Clément d'Alexandrie transmet des parallèles théologiques, mais pas nécessairement une doctrine écrite par Marcus. Le programme ne certifie aucun contact historique sans source explicite. Aucun accès aux espaces privés ELOAH.</div>
`;
const after=main.querySelector("#alpha-temoins")||main.querySelector("#alpha-pourquoi")||main.querySelector("#alpha-chain");
if(after)after.insertAdjacentElement("afterend",el);else main.append(el);
const $=id=>el.querySelector("#"+id);
const data=E.analyze();
const sm=Object.fromEntries(data.witnesses.map(w=>[w.id,w]));
$("apvClaims").innerHTML=data.claims.map(c=>'<button data-claim="'+esc(c.claim)+'" aria-pressed="false">'+esc(c.label)+'</button>').join("");
$("apvRelations").innerHTML=data.relations.map(link=>
 '<article class="apv-relation"><b>'+esc(sm[link.from].short)+' → '+esc(sm[link.to].short)+'</b>'+
 '<div>'+esc(link.description)+'</div><small>'+esc(link.type)+' · '+esc(link.confidence)+'</small></article>'
).join("");
$("apvWitnesses").innerHTML=data.witnesses.map(s=>
 '<article class="apv-source"><b>'+esc(s.short)+'</b><small>'+esc(s.period)+' · '+esc(s.kind)+'</small>'+
 '<p>'+esc(s.note)+'</p><span>Famille : '+esc(s.family)+'</span><p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Lire ce texte ↗</a></p></article>'
).join("");
function draw(id){
 let out;try{out=E.study(id)}catch(e){$("apvBoard").textContent=e.message;return}
 $("apvClaims").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.claim===id)));
 const refs=out.refs.map(s=>'<div class="apv-source"><b>'+esc(s.short)+'</b><small>'+esc(s.kind)+'</small>'+
 '<p>'+esc(s.note)+'</p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Lire ↗</a></div>').join("");
 $("apvBoard").innerHTML='<h3>'+esc(out.label)+'</h3>'+
 '<div class="apv-kpis"><div><strong>'+out.countDocuments+'</strong><small>Livres cités</small></div>'+
 '<div><strong>'+out.countFamilies+'</strong><small>Familles textuelles</small></div>'+
 '<div><strong>'+out.links.length+'</strong><small>Liens explicites ou documentaires</small></div></div>'+
 '<div class="apv-witnesses">'+(refs||'<p>Aucun document autographe identifié.</p>')+'</div>'+
 '<div class="apv-status"><b>CE QUE L’ENQUÊTE PERMET :</b> '+esc(out.verdict)+'</div>'+
 '<p>'+esc(out.disclaimer)+'</p>';
 $("apvStatus").textContent=out.status+". Le décompte des familles est un outil de provenance, pas un calcul de probabilité.";
}
$("apvClaims").addEventListener("click",e=>{const b=e.target.closest("[data-claim]");if(b)draw(b.dataset.claim)});
$("apvAudit").addEventListener("click",()=>{
 $("apvStatus").textContent=data.audit.passed+" / "+data.audit.total+" contrôles logiciels réussis. Le logiciel distingue copies, enquêtes alléguées, autres traditions et absences d'attestation.";
});
$("apvExport").addEventListener("click",()=>{
 const payload={created:new Date().toISOString(),...data};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
 const uri=URL.createObjectURL(blob),a=document.createElement("a");a.href=uri;a.download="ALPHA-019-provenance.json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),1500);
});
draw("alphabet24");
if(location.hash==="#alpha-provenance")el.scrollIntoView({behavior:"auto",block:"start"});
})();
