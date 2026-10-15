/* ELOAH / PARISIS · Interface ALPHA de concordance.
   Toutes les opérations sont locales : ni compte client, ni réseau, ni stockage. */
(function(){
"use strict";
const A=window.PARISIS_ALPHA_COMPARATOR;
if(!A)return;
const $=id=>document.getElementById(id);
const wrap=$("alphaComparePanel");if(!wrap)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const status=x=>{$("alphaCompareStatus").textContent=x};
let result=null;
const exampleA="Ἐν ἀρχῇ ἦν ὁ λόγος. Ἰησοῦς ἡ ἀλήθεια. Α Ω.";
const exampleB="Ἀλήθεια καὶ λόγος · Ἰησοῦς · Ω Α. Ἐν ἀρχῇ.";
function save(data,name,mime){
 const blob=new Blob([data],{type:mime||"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function show(data){
 const host=$("alphaCompareResults");
 const common=data.shared.slice(0,40).map(x=>
  '<tr><td>'+esc(x.word)+'</td><td>'+x.countA+'</td><td>'+x.countB+'</td><td>'+esc(x.value)+'</td></tr>'
 ).join("");
 const pairs=data.pairs.map(p=>
  '<tr><td>'+esc(p.body)+'</td><td>'+esc(p.first+' — '+p.last)+'</td><td>'+p.sourceA+'</td><td>'+p.sourceB+'</td></tr>'
 ).join("");
 host.innerHTML=
 '<div class="alpha-compare-kpis"><div><strong>'+data.sourceA.distinct+'</strong><small>Formes distinctes A</small></div>'+
 '<div><strong>'+data.sourceB.distinct+'</strong><small>Formes distinctes B</small></div>'+
 '<div><strong>'+data.shared.length+'</strong><small>Formes communes</small></div>'+
 '<div><strong>'+data.overlapPct+' %</strong><small>Recouvrement lexical</small></div></div>'+
 '<div class="scroll"><h3>Mots présents dans les deux textes</h3>'+
 '<table class="table"><thead><tr><th>Forme normalisée</th><th>A</th><th>B</th><th>Isopséphie</th></tr></thead><tbody>'+
 (common||'<tr><td colspan="4">Aucune forme commune.</td></tr>')+'</tbody></table></div>'+
 '<div class="scroll"><h3>Douze correspondances corporelles</h3><table class="table">'+
 '<thead><tr><th>Partie</th><th>Paire</th><th>Texte A</th><th>Texte B</th></tr></thead><tbody>'+pairs+'</tbody></table></div>'+
 '<p class="sub">Propres à A : '+data.onlyA.length+' forme(s). Propres à B : '+data.onlyB.length+' forme(s). '+
 'Ces nombres décrivent les lettres, pas le sens des textes ni leur filiation.</p>';
}
function run(){
 try{
  result=A.compare($("alphaCompareA").value,$("alphaCompareB").value,{mode:"greek"});
  show(result);
  status('Deux textes analysés. '+result.shared.length+' forme(s) normalisée(s) commune(s) : aucun emprunt historique déduit.');
 }catch(e){status("Analyse impossible : "+e.message)}
}
function search(){
 const target=$("alphaCompareQuery").value.trim();
 const output=$("alphaConcordanceResults");
 if(!target){output.textContent="Saisis le mot grec à rechercher.";return}
 try{
  const a=A.concordance($("alphaCompareA").value,target);
  const b=A.concordance($("alphaCompareB").value,target);
  const render=(r,title)=>'<div><h3>'+title+' · '+r.total+' occurrence(s)</h3>'+
   (r.hits.length?'<ol>'+r.hits.slice(0,60).map(h=>
    '<li>Mot n° '+h.wordIndex+' · '+esc(h.before)+' <strong style="color:#ffdea6">'+esc(h.word)+'</strong> '+esc(h.after)+'</li>'
   ).join("")+'</ol>':'<p class="sub">Aucune occurrence sous cette forme exacte.</p>')+'</div>';
  output.innerHTML=render(a,"Texte A")+render(b,"Texte B")+
   '<p class="sub">La recherche supprime les accents pour comparer les formes, mais ne regroupe pas automatiquement les flexions grecques.</p>';
  status("Concordance "+esc(target)+" : "+a.total+" occurrence(s) dans A et "+b.total+" dans B.");
 }catch(e){status("Recherche impossible : "+e.message)}
}
async function handleFile(input,target){
 const f=input.files?.[0];if(!f)return;
 try{
  if(f.size>240000)throw Error("Taille maximale 240 Ko.");
  if(!/\.(txt|md|csv)$/i.test(f.name))throw Error("Format TXT, MD ou CSV uniquement.");
  const s=await f.text();
  if(s.length>120000)throw Error("120 000 caractères maximum.");
  $(target).value=s;
  status("Fichier « "+f.name+" » chargé localement. Lance la comparaison pour actualiser le rapport.");
 }catch(e){status("Lecture refusée : "+e.message)}
 input.value="";
}
$("alphaCompareRun").addEventListener("click",run);
$("alphaCompareSearch").addEventListener("click",search);
$("alphaCompareSample").addEventListener("click",()=>{
 $("alphaCompareA").value=exampleA;$("alphaCompareB").value=exampleB;
 $("alphaCompareQuery").value="ἀλήθεια";run();search();
});
$("alphaCompareCurrent").addEventListener("click",()=>{
 $("alphaCompareA").value=$("alphaInput")?.value||"";
 status("Le passage du lecteur principal est copié dans le texte A. Aucun enregistrement effectué.");
});
$("alphaCompareFileA").addEventListener("change",e=>handleFile(e.target,"alphaCompareA"));
$("alphaCompareFileB").addEventListener("change",e=>handleFile(e.target,"alphaCompareB"));
$("alphaCompareJson").addEventListener("click",()=>{
 if(!result){status("Exécute une comparaison avant d'exporter.");return}
 save(JSON.stringify({date:new Date().toISOString(),analysis:result},null,2),"ALPHA-comparaison.json");
});
$("alphaCompareCsv").addEventListener("click",()=>{
 if(!result){status("Exécute une comparaison avant d'exporter.");return}
 save(A.csv(result),"ALPHA-comparaison.csv","text/csv;charset=utf-8");
});
$("alphaCompareQuery").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();search()}});
})();
