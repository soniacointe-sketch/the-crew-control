/* ALPHA-C8 : registre en session uniquement ; aucun accès aux comptes ELOAH. */
(function(){
"use strict";
const A=window.PARISIS_ALPHA_C8;
if(!A)return;
const lab=location.pathname.includes("parisis-alpha-laboratoire");
const mount=lab?document.querySelector("main.wrap"):document.getElementById("parisisAlphaHeading")?.closest("section");
if(!mount)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");css.textContent=`
#alpha-c8{background:linear-gradient(135deg,#29252e,#222329);color:#faf0e4;border:1px solid #92764b;border-top:4px solid #e8c27e;padding:clamp(16px,3vw,28px);margin:28px 0;font:14px/1.6 system-ui}
#alpha-c8 h2,#alpha-c8 h3{font:normal 31px Georgia,serif;color:#fff2df;margin:10px 0}#alpha-c8 h3{font-size:23px}
#alpha-c8 p,#alpha-c8 small{color:#d9cbb9}#alpha-c8 p{font-size:13px}
#alpha-c8 .c8-cols{display:grid;grid-template-columns:1.1fr 1fr;gap:16px}
#alpha-c8 .c8-panel{border:1px solid #62564c;background:#302e37;padding:17px;min-width:0}
#alpha-c8 label{display:block;color:#ead4ae;font-size:12px;margin-top:10px}
#alpha-c8 input,#alpha-c8 textarea,#alpha-c8 select{display:block;width:100%;padding:10px 11px;margin:4px 0;color:#231e21;background:#fffaf2;border:0;border-radius:2px;font:14px system-ui}
#alpha-c8 textarea{min-height:105px;resize:vertical}
#alpha-c8 button{cursor:pointer;background:#4b3446;color:#f4deb4;border:1px solid #c2a06b;padding:9px 12px;font:600 12px system-ui}
#alpha-c8 button:hover{background:#604759}#alpha-c8 button:disabled{opacity:.5}
#alpha-c8 button.c8-main{background:#e8c27e;color:#201b1d}
#alpha-c8 .c8-row{display:flex;gap:9px;flex-wrap:wrap;margin:11px 0}
#alpha-c8 .c8-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#alpha-c8 .c8-status{border-left:3px solid #e8c27e;padding:10px;background:#42363f;color:#f8e4c4;font-size:12px;margin:11px 0}
#alpha-c8 .c8-item{padding:12px;border:1px solid #716052;margin:9px 0;background:#282830}
#alpha-c8 .c8-item strong{display:block;color:#fff0d8}
#alpha-c8 .c8-item a{color:#f1d194;word-break:break-all}
#alpha-c8 .c8-item small{display:block;font-size:11px}
#alpha-c8 .c8-summary{border-bottom:1px solid #716052;padding:8px 0;font-size:12px}
#alpha-c8 .c8-summary b{color:#f1d08e}
#alpha-c8 a{color:#f1d194}#alpha-c8 [hidden]{display:none!important}
@media(max-width:900px){#alpha-c8 .c8-cols{grid-template-columns:1fr}}@media(max-width:550px){#alpha-c8 .c8-grid{grid-template-columns:1fr}}
`;document.head.appendChild(css);
const section=document.createElement("section");section.id="alpha-c8";section.innerHTML=`
<div style="font:800 11px system-ui;letter-spacing:.14em;color:#e8c27e">HUMANITIES LAB · INGESTION DOCUMENTAIRE · ALPHA-C8</div>
<h2>Le moteur cherche. Le registre conserve.</h2>
<p>Recherche bibliographique Crossref, import de source et audit automatique des sept méthodes. Un rapprochement n'est jamais une preuve de transmission.</p>
<div class="c8-row"><button id="c8Export">Exporter les sources JSON</button><button id="c8ImportButton">Importer JSON</button><input hidden type="file" accept=".json,application/json" id="c8File"><button id="c8ReportExport">Exporter le rapport</button></div>
<div id="c8Status" class="c8-status" role="status">Registre temporaire : cet onglet uniquement. Les dossiers et données privées d'ELOAH restent inchangés.</div>
<div class="c8-cols">
 <div class="c8-panel">
  <h3>01 · Découvrir et ajouter</h3>
  <label>Rechercher des publications scientifiques<input id="c8SearchTerms" type="search" placeholder="Irenaeus Marcus seven vowels" maxlength="200"></label>
  <div class="c8-row"><button id="c8Search" class="c8-main">Rechercher via Crossref</button></div>
  <div id="c8Results"></div>
  <h3>Une source ancienne à examiner ?</h3>
  <form id="c8Form">
   <label>Titre *<input name="title" required maxlength="240"></label>
   <div class="c8-grid"><label>Auteur / institution<input name="author" maxlength="200"></label><label>Nature<select name="kind"><option>source primaire</option><option>objet matériel</option><option>étude moderne</option><option>notice bibliographique</option><option>autre</option></select></label></div>
   <label>Référence URL<input name="url" type="url" maxlength="2000" placeholder="https://..."></label>
   <div class="c8-grid"><label>Composition au plus tôt (année)<input name="compositionMin" type="number" min="-5000" max="2100"></label><label>Composition au plus tard (année)<input name="compositionMax" type="number" min="-5000" max="2100"></label></div>
   <label>Extrait documentaire à contrôler<textarea name="excerpt" maxlength="12000" placeholder="Courte transcription avec référence explicite ; aucun contenu confidentiel."></textarea></label>
   <label>Objection / contexte<textarea name="note" maxlength="1600"></textarea></label>
   <button type="submit" class="c8-main">Analyser et intégrer automatiquement</button>
  </form>
 </div>
 <div class="c8-panel"><h3>02 · Registre : <span id="c8Count">0</span></h3>
 <p>Les résultats des sept méthodes et les convergences sont ajoutés avec la référence. Tout reste « à vérifier ».</p>
 <div id="c8Saved"></div><h3>03 · Rapport des méthodes</h3><div id="c8Audit">Ajoute une source pour lancer les sept contrôles.</div></div>
</div><p><small>Sauvegarde uniquement dans la session de cet onglet. Export/import JSON pour conserver durablement tes recherches. Les extraits fournis ne sont pas envoyés à Crossref.</small></p>
`;
if(lab)mount.insertBefore(section,mount.firstChild);else mount.insertAdjacentElement("afterend",section);
const $=id=>section.querySelector("#"+id);
const notify=s=>{$("c8Status").textContent=s};
function saveFile(obj,name){
 const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function report(s){
 const x=A.inspect(s,A.read().sources);
 $("c8Audit").innerHTML='<strong>'+esc(s.title)+'</strong>'+x.evidence.map(e=>'<div class="c8-summary"><b>'+esc(e.method)+'</b> · '+esc(e.status)+' : '+esc(e.detail)+'</div>').join("")+
 '<p>Rapprochements documentaires : '+x.links.length+'</p>'+
 x.links.map(l=>'<div class="c8-summary">'+esc(l.title)+' — '+esc(l.distinctive.join(", "))+' · '+esc(l.chronology)+' · emprunt non démontré</div>').join("")+
 '<p>À vérifier :</p>'+x.candidates.map(v=>'<div class="c8-summary">'+esc(v)+'</div>').join("");
}
function render(){
 const list=A.read().sources;
 $("c8Count").textContent=list.length;
 $("c8Saved").innerHTML=list.length?list.map(s=>
  '<article class="c8-item"><strong>'+esc(s.title)+'</strong><small>'+esc(s.kind)+' · '+esc(s.stage)+' · '+esc(s.motifs.join(", ")||"aucun motif confirmé")+'</small>'+
  (s.url?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">Consulter la référence ↗</a>':'')+
  '<div class="c8-row"><button data-detail="'+esc(s.id)+'">Lire l’audit</button><button data-remove="'+esc(s.id)+'">Retirer</button></div></article>').join(""):'<p>Aucune nouvelle référence enregistrée.</p>';
}
function add(obj){const s=A.validSource(obj);A.add(s);render();report(s);notify("Source analysée et intégrée dans le registre ALPHA temporaire. Vérification humaine nécessaire.");}
$("c8Form").addEventListener("submit",e=>{
 e.preventDefault();try{add(Object.fromEntries(new FormData(e.currentTarget).entries()));e.currentTarget.reset()}catch(err){notify(err.message)}
});
$("c8Saved").addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 const doc=A.read(),s=doc.sources.find(x=>x.id===(b.dataset.detail||b.dataset.remove));if(!s)return;
 if(b.dataset.detail){report(s);return}
 if(b.dataset.remove&&confirm("Retirer cette source du registre temporaire ?")){A.remove(s.id);render();notify("Source retirée ; aucune archive existante n'a été modifiée.")}
});
let found=[];
$("c8Search").addEventListener("click",async()=>{
 const b=$("c8Search"),q=$("c8SearchTerms").value.trim();b.disabled=true;notify("Recherche Crossref : "+q);
 try{
  found=await A.searchCrossref(q);
  $("c8Results").innerHTML=found.length?found.map((s,i)=>
   '<div class="c8-item"><strong>'+esc(s.title)+'</strong><small>'+esc(s.author)+' · '+esc(s.publicationYear||"année non fournie")+' · DOI '+esc(s.doi)+'</small><button data-crossref="'+i+'">Importer et analyser</button></div>').join(""):'<p>Aucune notice disponible.</p>';
  notify(found.length+" notices bibliographiques récupérées. Leur contenu historique n'est pas automatiquement vérifié.");
 }catch(err){notify("Recherche indisponible : "+err.message+". Utilise la saisie manuelle.");}
 finally{b.disabled=false}
});
$("c8Results").addEventListener("click",e=>{
 const btn=e.target.closest("[data-crossref]");if(!btn)return;
 try{add(found[Number(btn.dataset.crossref)])}catch(err){notify(err.message)}
});
$("c8Export").addEventListener("click",()=>saveFile(A.read(),"PARISIS-ALPHA-C8-sources.json"));
$("c8ReportExport").addEventListener("click",()=>{
 const d=A.read();saveFile({format:"parisis-alpha-c8-rapport",version:A.version,exportedAt:new Date().toISOString(),sources:d.sources.map(s=>A.inspect(s,d.sources))},"PARISIS-ALPHA-C8-rapport.json");
});
$("c8ImportButton").addEventListener("click",()=>$("c8File").click());
$("c8File").addEventListener("change",async e=>{
 const f=e.target.files?.[0];if(!f)return;
 try{if(f.size>1048576)throw Error("Taille maximale : 1 Mo.");const r=A.importJSON(await f.text());render();notify(r.added+" sources importées ; "+r.skipped+" doublons ignorés.");}
 catch(err){notify("Import refusé : "+err.message)}
 e.target.value="";
});
render();window.addEventListener("parisis-alpha-c8-updated",render);
})();
