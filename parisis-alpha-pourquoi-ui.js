/* PARISIS ENGINE · ALPHA-017 · Explications historiennes par association, sans service externe */
(function(){
"use strict";
const A=window.PARISIS_ALPHA_POURQUOI;
const main=document.querySelector("main#marcus-live");
if(!A||!main||document.getElementById("alpha-pourquoi"))return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");
css.textContent=`
#alpha-pourquoi{color:#fff2e0;background:linear-gradient(120deg,#261f30,#302332);border:1px solid #a9845e;border-top:4px solid #e9cb90;padding:clamp(16px,2.7vw,29px);margin:24px 0 36px;font:13px/1.65 system-ui;min-width:0}
#alpha-pourquoi h2,#alpha-pourquoi h3{font-family:Georgia,serif;font-weight:normal}
#alpha-pourquoi h2{font-size:clamp(29px,3.7vw,46px);margin:6px 0 13px;line-height:1.15}
#alpha-pourquoi h3{font-size:clamp(24px,2.7vw,30px);margin:10px 0}
#alpha-pourquoi p{color:#e6d4c9}
#alpha-pourquoi .ap-overline{font:800 10px system-ui;letter-spacing:.15em;color:#f1d3a4}
#alpha-pourquoi .ap-choice{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:21px 0}
#alpha-pourquoi button{cursor:pointer;border:1px solid #997689;padding:11px 8px;background:#382e40;color:#f2dcc1;font:700 11px/1.4 system-ui}
#alpha-pourquoi button[aria-pressed=true],#alpha-pourquoi button:hover{background:#805268;border-color:#e9c487;color:white}
#alpha-pourquoi button:focus-visible,#alpha-pourquoi a:focus-visible{outline:3px solid #edd096;outline-offset:3px}
#alpha-pourquoi .ap-card{border:1px solid #796274;padding:18px 20px;background:#312b3a;min-height:255px}
#alpha-pourquoi .ap-sections{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
#alpha-pourquoi .ap-sections>div{padding:14px;border-left:3px solid #b99971;background:#382e3e}
#alpha-pourquoi .ap-sections b{color:#f0c98e;font-size:11px;letter-spacing:.06em}
#alpha-pourquoi .ap-sections p{margin:9px 0;color:#eee0d4;line-height:1.65}
#alpha-pourquoi .ap-tag{font-size:11px;color:#e8bfa1;font-weight:800;letter-spacing:.07em}
#alpha-pourquoi .ap-claim{font:19px/1.6 Georgia,serif!important;color:#fff0dc!important;margin:14px 0}
#alpha-pourquoi .ap-links{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}
#alpha-pourquoi .ap-links a{border:1px solid #9d7c70;padding:8px 11px;font-size:12px;text-decoration:none;color:#f2d5a3}
#alpha-pourquoi .ap-proof{border-left:4px solid #e4b87f;background:#463243;padding:13px;margin-top:15px}
#alpha-pourquoi .ap-variants{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
#alpha-pourquoi .ap-variant{background:#362d3c;border:1px solid #806676;padding:16px}
#alpha-pourquoi .ap-variant .ap-total{font:32px Georgia,serif;color:#efcd97}
#alpha-pourquoi .ap-variant strong{display:block;color:#fff0d9}
#alpha-pourquoi .ap-variant small{font-size:11px;color:#d7c3b5}
#alpha-pourquoi .ap-footer{font-size:11px;color:#cdbbb0;border-top:1px solid #77606d;padding-top:16px;margin-top:24px}
#alpha-pourquoi .ap-actions{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0}
#alpha-pourquoi .ap-actions button{background:#e5c58d;color:#231b24;border-color:#e5c58d;padding:11px 15px}
#alpha-pourquoi a{color:#f2d5a3}
@media(max-width:850px){#alpha-pourquoi .ap-choice{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:560px){#alpha-pourquoi .ap-choice{grid-template-columns:repeat(2,minmax(0,1fr))}#alpha-pourquoi .ap-sections,#alpha-pourquoi .ap-variants{grid-template-columns:1fr}#alpha-pourquoi .ap-card{padding:12px}}
`;
document.head.appendChild(css);
const panel=document.createElement("section");panel.id="alpha-pourquoi";
panel.innerHTML=`
<div class="ap-overline">HUMANITIES LAB · ALPHA-017 · POURQUOI CES CHIFFRES ?</div>
<h2>Pour chaque nombre, <em style="color:#edcc91">retrouver sa raison.</em></h2>
<p>La doctrine rapportée par Irénée n'utilisait pas les mêmes règles pour tous les nombres. Choisis une correspondance : le moteur sépare la justification textuelle, le procédé de calcul, l'objection possible et les sources anciennes.</p>
<nav class="ap-choice" id="apChoice" aria-label="Expliquer une correspondance de Marcus"></nav>
<div id="apDetail" class="ap-card" aria-live="polite"></div>
<h3>Le contre-test : une seule lettre change, le résultat aussi</h3>
<div class="ap-variants" id="apVariants"></div>
<div class="ap-proof" id="apConclusion"><strong>CONCLUSION D’ENQUÊTE</strong><p>La fin déclarée de cette construction est une forme de connaissance religieuse. Elle ne fournit pas une loi objective qui révélerait le sens caché de tous les mots grecs.</p></div>
<div class="ap-actions"><button type="button" id="apAudit">Exécuter les contrôles</button><button type="button" id="apExport">Exporter la synthèse JSON</button></div>
<div id="apTests" class="ap-footer" role="status" aria-live="polite">Audit disponible.</div>
<div class="ap-footer">Sources : <a href="https://www.newadvent.org/fathers/0103114.htm" target="_blank" rel="noopener noreferrer">Irénée I,14</a> · <a href="https://www.newadvent.org/fathers/0103115.htm" target="_blank" rel="noopener noreferrer">Irénée I,15</a> · <a href="https://ccel.org/ccel/hippolytus/refutation/anf05.iii.iii.iv.xlii.html" target="_blank" rel="noopener noreferrer">Hippolyte VI,41</a>. Ce dernier est partiellement dépendant de la tradition d'Irénée. Aucun texte privé n'est collecté.</div>
`;
const after=document.querySelector("#alpha-chain");
if(after)after.insertAdjacentElement("afterend",panel);else main.append(panel);
const $=id=>panel.querySelector("#"+id);
const ids=["huitcentquatrevingthuit","mutes","semivoyelles","voyelles","huitcentun","six","douze","vingtquatre","trente","corps","septcieux","silence","connaissance"];
$("apChoice").innerHTML=ids.map(id=>{
 const e=A.entries.find(x=>x.id===id);
 return '<button type="button" data-explain="'+esc(id)+'" aria-pressed="false">'+esc(e?.short||id)+'</button>';
}).join("");
let selected="huitcentquatrevingthuit";
function view(id){
 try{
  const x=A.explain(id);selected=id;
  $("apChoice").querySelectorAll("[data-explain]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.explain===id)));
  const links=x.sourceDocuments.map(d=>'<a href="'+esc(d.url)+'" target="_blank" rel="noopener noreferrer">'+esc(d.label)+' ↗</a>').join("");
  $("apDetail").innerHTML='<div class="ap-tag">'+esc(x.tag)+'</div><h3>'+esc(x.name)+'</h3>'+
   '<p class="ap-claim">'+esc(x.explanation)+'</p>'+
   '<div class="ap-sections"><div><b>POURQUOI CETTE ASSOCIATION ?</b><p>'+esc(x.mechanism)+'</p></div>'+
   '<div><b>CE QU’IL FAUT DISTINGUER</b><p>'+esc(x.distinct)+'</p></div></div>'+
   '<div class="ap-proof"><strong>OBJECTION / LIMITE</strong><p>'+esc(x.limit)+'</p></div>'+
   '<div class="ap-links">'+links+'</div><p class="ap-tag">'+esc(x.whyLevel)+' · '+esc(x.uncertaintyLevel)+'</p>';
 }catch(e){$("apDetail").textContent=e.message}
}
function variants(){
 const v=A.variants();
 const cards=[
  {title:"SILENCE · SIGÊ",left:v.tetrad.reported.join(" + "),right:v.tetrad.standard.join(" + "),before:v.tetrad.reportedCount,after:v.tetrad.standardCount,
   labelA:"Graphie rapportée / 5 lettres",labelB:"Graphie courante / 4 lettres"},
  {title:"CHRIST + FILS",left:v.duodecad.reported.join(" + "),right:v.duodecad.alternate.join(" + "),before:v.duodecad.reportedCount,after:v.duodecad.alternateCount,
   labelA:"ΧΡΕΙΣΤΟΣ (8) + ΥΙΟΣ (4)",labelB:"ΧΡΙΣΤΟΣ (7) + ΥΙΟΣ (4)"}
 ];
 $("apVariants").innerHTML=cards.map(c=>'<div class="ap-variant"><strong>'+esc(c.title)+'</strong>'+
   '<p>'+esc(c.labelA)+' → <span class="ap-total">'+c.before+'</span></p><small>'+esc(c.left)+'</small>'+
   '<p>'+esc(c.labelB)+' → <span class="ap-total">'+c.after+'</span></p><small>'+esc(c.right)+'</small>'+
   '<p>Changer de graphie modifie le résultat. Le système exige donc une critique des témoins, pas une orthographe imposée pour atteindre le total.</p></div>').join("");
}
$("apChoice").addEventListener("click",e=>{
 const b=e.target.closest("[data-explain]");if(b)view(b.dataset.explain);
});
$("apAudit").addEventListener("click",()=>{
 const a=A.audit();
 $("apTests").textContent="Contrôles internes : "+a.passed+" / "+a.total+" réussis. "+a.rules;
});
$("apExport").addEventListener("click",()=>{
 const result={at:new Date().toISOString(),version:A.version,explanation:A.explain(selected),variants:A.variants(),audit:A.audit(),notice:"Provenance : Irénée, témoin hostile ; pas une démonstration de puissance spirituelle."};
 const blob=new Blob([JSON.stringify(result,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="ALPHA-017-pourquoi-marcus.json";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
});
view(selected);variants();
const run=A.audit();$("apTests").textContent="Audit initial : "+run.passed+"/"+run.total+" contrôles réussis. Les données décrivent une doctrine attribuée à Marcus ; l'exactitude des calculs n'en confirme pas la vérité spirituelle.";
if(location.hash==="#alpha-pourquoi")panel.scrollIntoView({behavior:"auto",block:"start"});
})();
