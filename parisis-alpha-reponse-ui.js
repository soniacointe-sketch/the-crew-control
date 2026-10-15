/* ELOAH · PARISIS ALPHA — panneau de réponse historique.
   Règles auditées et textes éditoriaux sourcés. Aucune requête serveur. */
(function(){
"use strict";
const V=window.PARISIS_ALPHA_REPONSE,P=window.PARISIS_ALPHA_PAROLES;
const base=document.getElementById("alpha-jesus");
if(!V||!P||!base)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const styles=document.createElement("style");
styles.textContent=`
#alpha-jesus #jAnswerPanel{border-top:2px solid #e3bc84;margin-top:25px;padding-top:23px;color:#f8f0e4}
#alpha-jesus #jAnswerPanel h3{font:normal clamp(25px,3.5vw,37px) Georgia,serif;color:#fff2df}
#alpha-jesus #jAnswerPanel h4{font:normal 22px Georgia,serif;color:#f9dbac;margin:18px 0 7px}
#alpha-jesus #jAnswerPanel p,#alpha-jesus #jAnswerPanel li{font:13px/1.75 system-ui;color:#e9dbc9}
#alpha-jesus .jA-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:18px 0}
#alpha-jesus .jA-num{border:1px solid #6c5c63;background:#312d37;padding:14px 12px;min-width:0}
#alpha-jesus .jA-num strong{font:normal 31px Georgia,serif;color:#f9d696;display:block}
#alpha-jesus .jA-num small{font-size:11px;color:#d3c0ad}
#alpha-jesus .jA-proof{border-bottom:1px solid #5f525c;padding:11px 0;display:grid;gap:6px}
#alpha-jesus .jA-proof b{font-size:11px;color:#edcc9c;letter-spacing:.04em}
#alpha-jesus .jA-proof span{font-size:13px;line-height:1.55}
#alpha-jesus #jAnswerPanel .jA-answer{border-left:4px solid #e9bd75;background:#392e3a;color:#ffeedb;padding:16px 20px;font-size:15px;line-height:1.8}
#alpha-jesus #jAnswerPanel .jA-sources{display:grid;gap:9px}
#alpha-jesus #jAnswerPanel .jA-source{border:1px solid #725f69;padding:12px;background:#2d2934}
#alpha-jesus #jAnswerPanel a{color:#f5d49f;overflow-wrap:anywhere}
#alpha-jesus #jAnswerPanel .jA-muted{color:#d4bfb6;font-size:12px}
#alpha-jesus #jAnswerPanel ul{padding-left:18px}
#alpha-jesus #jAnswerPanel details{margin-top:16px;background:#302b35;padding:12px;border:1px solid #735f67}
#alpha-jesus #jAnswerPanel summary{font-size:12px;color:#e9c786;cursor:pointer}
@media(max-width:640px){#alpha-jesus .jA-grid{grid-template-columns:1fr 1fr}#alpha-jesus #jAnswerPanel .jA-answer{padding:13px}}
`;
document.head.appendChild(styles);
const root=document.createElement("section");
root.id="jAnswerPanel";
root.setAttribute("aria-labelledby","jAnswerHeading");
root.innerHTML=`
<div class="j-eyebrow">ÉTAPE FINALE · SOURCES → CALCUL → CONTRE-PREUVE → CONCLUSION</div>
<h3 id="jAnswerHeading">Jusqu'à la réponse.</h3>
<p>Le programme confronte les résultats du code à la source évangélique et au témoignage d'Irénée. Il ne transforme pas automatiquement une correspondance numérique en preuve historique.</p>
<div id="jAnswerSummary" role="status" aria-live="polite">Choisis un passage référencé pour lancer la recherche historique.</div>
<p><a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-013-reponse-jean14-aletheia.md" target="_blank" rel="noopener noreferrer">Consulter l’enquête ALPHA-013 complète et ses références ↗</a></p>
<div class="j-actions"><button type="button" id="jAnswerMarkdown">↓ Rapport Markdown</button><button type="button" id="jAnswerJSON">↓ Preuves JSON</button></div>
`;
const result=document.getElementById("jResult");
if(result){result.append(root);}
else{base.append(root);}
const btn=document.createElement("button");
btn.type="button";btn.id="jAnswerGo";btn.className="j-go";btn.textContent="⟶ ALLER JUSQU'À LA RÉPONSE";
const actions=base.querySelector(".j-actions");
if(actions)actions.append(btn);
let latest=null;
function outputFile(content,name,mimetype){
 const blob=new Blob([content],{type:mimetype}),u=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=u;a.download=name;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),3000);
}
function render(x){
 latest=x;
 const s=root.querySelector("#jAnswerSummary");
 const stats=[
 [x.focus.letters,"Lettres du mot-clé"],
 [x.focus.isopsephy,"Valeur isopséphique"],
 [x.focus.parts.length+"/12","Parties touchées"],
 [x.focus.completedPairs.length+"/12","Paires complètes"]
 ];
 const columns=stats.map(([n,l])=>'<div class="jA-num"><strong>'+esc(n)+'</strong><small>'+esc(l)+'</small></div>').join("");
 const tests=x.tests.map(t=>'<div class="jA-proof"><b>'+(t.result?"TEST SATISFAIT":"RÉSULTAT NÉGATIF")+'</b><span>'+esc(t.check)+'</span><span class="jA-muted">'+esc(t.meaning)+'</span></div>').join("");
 const conclusions=x.conclusions.map(t=>'<div class="jA-proof"><b>'+esc(t.level)+'</b><span>'+esc(t.statement)+'</span></div>').join("");
 const control=x.controls.map(t=>'<li>'+esc(t.word)+" : "+t.letters+" lettres, "+t.anatomicalParts+" parties correspondantes, valeur "+t.number+"</li>").join("");
 const src=x.sources.map(item=>'<div class="jA-source"><a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">'+esc(item.title)+' ↗</a><p>'+esc(item.scope)+'</p><p class="jA-muted">Réserve : '+esc(item.limitation)+'</p></div>').join("");
 s.innerHTML='<div class="jA-grid">'+columns+'</div>'+
 '<h4>01 · Le résultat calculé</h4><p>Mot : <strong>'+esc(x.focus.normalized)+'</strong>. Rangs additionnés : '+x.focus.ranksTotal+'. Lettre par lettre : '+esc(x.focus.decomposition.map(l=>l.letter+"("+l.value+")").join(" + "))+'.</p>'+
 '<h4>02 · Ce que les documents attestent</h4>'+conclusions+
 '<h4>03 · Le contre-interrogatoire</h4>'+tests+
 '<details><summary>Afficher les mots témoins qui produisent aussi des résultats numériques</summary><p>Des mots grecs ordinaires produisent des nombres et mobilisent des parties du corps sans qu’il s’agisse d’un code théologique établi.</p><ul>'+control+'</ul></details>'+
 '<h4>04 · Réponse de l’enquête</h4><div class="jA-answer">'+esc(x.answer)+'</div>'+
 '<h4>Ce qu’il faudrait encore trouver</h4><ul>'+x.missing.map(m=>'<li>'+esc(m)+'</li>').join("")+'</ul>'+
 '<h4>Références et vérification</h4><div class="jA-sources">'+src+'</div>'+
 '<p class="jA-muted">'+esc(x.limitation)+'</p>';
}
function go(scroll){
 const value=base.querySelector("#jQuote")?.value.trim()||"";
 if(/[\u0370-\u03ff\u1f00-\u1fff]/u.test(value)){
  latest=null;
  root.querySelector("#jAnswerSummary").textContent="Le texte grec saisi n'a pas été identifié comme un extrait des Évangiles. Ses lettres peuvent être analysées, mais une conclusion historique exige une référence vérifiée.";
  if(scroll)root.scrollIntoView({behavior:"smooth",block:"start"});
  return;
 }
 let id=base.querySelector("#jVerse")?.value;
 if(value){
  const lookup=P.lookupFrench(value);
  if(!lookup.length){
   latest=null;
   root.querySelector("#jAnswerSummary").textContent="Parole non reconnue dans les extraits référencés. Aucune conclusion attribuée à Jésus n'est fabriquée : sélectionne un verset connu.";
   if(scroll)root.scrollIntoView({behavior:"smooth",block:"start"});
   return;
  }
  id=lookup[0].id;
 }
 try{render(V.answerFor(id));}
 catch(err){latest=null;root.querySelector("#jAnswerSummary").textContent="Analyse indisponible : "+err.message}
 if(scroll)root.scrollIntoView({behavior:"smooth",block:"start"});
}
btn.addEventListener("click",()=>go(true));
for(const id of ["jGo","jReset","jVerse"]){
 const control=base.querySelector("#"+id);
 if(control)control.addEventListener(id==="jVerse"?"change":"click",()=>go(false));
}
root.querySelector("#jAnswerMarkdown").addEventListener("click",()=>{
 if(!latest)return;
 outputFile(V.markdown(latest),"ALPHA-"+latest.id+"-reponse.md","text/markdown;charset=utf-8");
});
root.querySelector("#jAnswerJSON").addEventListener("click",()=>{
 if(!latest)return;
 outputFile(JSON.stringify(latest,null,2),"ALPHA-"+latest.id+"-preuves.json","application/json;charset=utf-8");
});
go(false);
})();
