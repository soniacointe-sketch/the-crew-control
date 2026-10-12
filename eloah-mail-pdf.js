(()=>{
"use strict";
const B=()=>window.EloahMailBridge,$=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let mode="actions",includeNotes=false,includeSources=true;
const isReviewed=x=>x.status!=="À trier"&&x.source_kind!=="gmail_header";
const done=x=>x.status==="Terminé"||x.status==="Ignoré";
const day=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const fr=v=>{const x=String(v||"").slice(0,10).split("-");return x.length===3&&x[0].length===4?x[2]+"/"+x[1]+"/"+x[0]:"Non renseignée"};
const rating=x=>x.priority==="P1"?0:x.priority==="P2"?1:2;
const sort=(a,b)=>rating(a)-rating(b)||String(a.deadline||"9999").localeCompare(String(b.deadline||"9999"))||String(b.date||"").localeCompare(String(a.date||""));
function choose(all){
 let x=mode==="all"?all.slice():all.filter(isReviewed);
 if(mode==="school")x=x.filter(a=>a.domain==="École");
 if(mode==="urgent")x=x.filter(a=>!done(a)&&(a.priority==="P1"||a.deadline));
 if(mode==="done")x=x.filter(a=>a.status==="Terminé");
 return x.sort(sort);
}
function counts(all){
 const n=v=>all.filter(x=>x.status===v).length;
 return {total:all.length,reviewed:all.filter(isReviewed).length,todo:n("À faire"),done:n("Terminé"),check:n("À vérifier"),wait:n("En attente"),unread:n("À trier"),dates:all.filter(x=>x.deadline&&!done(x)).length};
}
function render(){
 const all=B()?.getItems()||[],sel=choose(all),n=counts(all);
 $("content").innerHTML='<div class="freshness"><strong>Création locale de PDF.</strong> Le rapport est construit dans ton navigateur à partir des dossiers ELOAH déjà chargés. Aucune donnée personnelle n’est publiée sur GitHub. Le PDF téléchargé n’est pas chiffré : conserve-le dans un emplacement privé.</div>'+
 '<section class="panel"><div class="eyebrow">CENTRE DE RAPPORTS</div><h3>Rapport PDF : fait, pas fait, à faire, dates et méthodes</h3>'+
 '<p class="small">Chaque fiche comprend son état, sa priorité, une date limite quand elle est renseignée, ce qui reste à faire, les étapes connues et une référence de source. Les messages seulement indexés restent clairement signalés.</p>'+
 '<div class="pdf-stats">'+[["Indexés",n.total],["Analysés",n.reviewed],["À faire",n.todo],["Terminés",n.done],["À vérifier",n.check],["En attente",n.wait]].map(x=>'<div><strong>'+x[1]+'</strong><small>'+x[0]+'</small></div>').join("")+'</div>'+
 '<div class="pdf-config"><label>Périmètre du rapport<select class="field" id="pdfMode"><option value="actions">Toutes les actions qualifiées</option><option value="urgent">Urgences et dates</option><option value="school">École et enfants</option><option value="done">Dossiers terminés</option><option value="all">Tous les messages, même non analysés</option></select></label>'+
 '<label class="pdf-check"><input type="checkbox" id="pdfNotes"> Inclure mes notes privées</label>'+
 '<label class="pdf-check"><input type="checkbox" id="pdfSources" checked> Ajouter les références et justifications des dates</label></div>'+
 '<div class="actions"><button class="primary" id="pdfDownload" '+(!sel.length?'disabled':'')+'>Télécharger le PDF ↓</button><button id="pdfReload">Actualiser les chiffres</button><button id="pdfTable">Voir le tableur</button></div>'+
 '<p class="small" id="pdfFeedback">'+sel.length+' fiches prévues dans ce rapport. Les chiffres globaux reflètent les dossiers déjà chargés, et non une nouvelle lecture Gmail.</p></section>'+
 '<section class="panel"><h3>Aperçu du document</h3>'+preview(sel)+'</section>';
 $("pdfMode").value=mode;$("pdfNotes").checked=includeNotes;$("pdfSources").checked=includeSources;
 $("pdfMode").onchange=x=>{mode=x.target.value;render()};
 $("pdfNotes").onchange=x=>{includeNotes=x.target.checked;render()};
 $("pdfSources").onchange=x=>{includeSources=x.target.checked;render()};
 $("pdfDownload").onclick=generate;$("pdfReload").onclick=render;$("pdfTable").onclick=()=>B()?.setView("spreadsheet");
}
function preview(rows){
 if(!rows.length)return '<p class="small">Aucun dossier pour ce filtre. Charge d’abord ton coffre privé.</p>';
 return '<p class="small">'+rows.length+' fiches dans le rapport sélectionné.</p>'+
 rows.slice(0,5).map(x=>'<article class="pdf-example"><div class="mini"><span class="pill">'+esc(x.priority||"P3")+'</span><span class="pill">'+esc(x.status||"À trier")+'</span><span class="pill">'+esc(x.domain||"Autre")+'</span></div><strong>'+esc(x.subject||"Sans objet")+'</strong><p><b>Quand :</b> '+esc(x.deadline?fr(x.deadline):"Pas de date limite connue")+'</p><p><b>À faire :</b> '+esc(x.action||"Lire et qualifier ce courriel")+'</p></article>').join("")+
 (rows.length>5?'<p class="small">Aperçu limité à cinq fiches, mais le PDF contient tout le périmètre choisi.</p>':"");
}
const symbols={"€":128,"’":146,"‘":145,"“":147,"”":148,"–":150,"—":151,"œ":156,"Œ":140,"…":133,"•":149," ":32," ":32};
function latin(s){
 let o="";
 for(const c of String(s??"").replace(/[\r\n\t]+/g," ")){
  const n=c.codePointAt(0),v=Object.prototype.hasOwnProperty.call(symbols,c)?symbols[c]:n;
  o+=String.fromCharCode(v>=32&&v<=255?v:63);
 }
 return o;
}
function pdfLit(x){return "("+latin(x).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")+")"}
function wrap(txt,max=93){
 const output=[];
 for(const paragraph of String(txt||"").split(/\n/)){
  let line="";
  for(let word of paragraph.split(/\s+/).filter(Boolean)){
   while(word.length>max){if(line){output.push(line);line=""}output.push(word.slice(0,max));word=word.slice(max)}
   if((line+" "+word).trim().length>max){if(line)output.push(line);line=word}
   else line=line?line+" "+word:word;
  }
  if(line)output.push(line);
 }
 return output.length?output:[""];
}
class DocumentPDF{
 constructor(){this.pages=[];this.addPage()}
 addPage(){
  const p={text:[],links:[]};this.pages.push(p);this.page=p;this.y=772;
  this.rect(39,795,518,33,"0.95 0.93 0.88");
  this.put("ELOAH  /  AGENT COURRIER",49,806,12,true);
  this.put("SUIVI PRIVÉ",485,807,8,true);
  this.rule(39,791,556,791);
 }
 rect(x,y,w,h,color){this.page.text.push(color+" rg "+x+" "+y+" "+w+" "+h+" re f\n")}
 rule(x1,y1,x2,y2){this.page.text.push("0.75 0.67 0.54 RG 0.55 w "+x1+" "+y1+" m "+x2+" "+y2+" l S\n")}
 put(s,x,y,size=9,bold=false){this.page.text.push("BT 0.18 0.18 0.18 rg /"+(bold?"F2":"F1")+" "+size+" Tf 1 0 0 1 "+x+" "+y+" Tm "+pdfLit(s)+" Tj ET\n")}
 need(h){if(this.y-h<55)this.addPage()}
 p(text,size=9,bold=false,indent=0){
  const lines=wrap(text,Math.max(40,Math.floor((500-indent)/(size*.54))));
  for(const line of lines){this.need(size+5);this.put(line,48+indent,this.y,size,bold);this.y-=size+4}
 }
 gap(g=8){this.need(g);this.y-=g}
 heading(title,num){
  this.need(45);this.gap(8);
  this.rect(41,this.y-14,515,25,"0.95 0.91 0.84");
  this.put(title.toUpperCase()+"  ·  "+num+" dossier(s)",49,this.y-6,10,true);
  this.y-=37;
 }
 add(entry){
  this.need(95);
  this.p((entry.priority||"P3")+"  |  "+(entry.domain||"Autre").toUpperCase()+"  |  "+String(entry.status||"À trier").toUpperCase(),8,true);
  this.p(entry.subject||"Sans objet",11,true);
  this.p("DATE LIMITE : "+(entry.deadline?fr(entry.deadline):"non renseignée")+"  |  Message du "+fr(entry.date),8);
  this.p("À FAIRE : "+(entry.status==="À trier"?"Lire le message avant d’en déduire une action.":entry.action||"Préciser la prochaine action."),9);
  if(entry.status!=="À trier"){
   const steps=Array.isArray(entry.steps)?entry.steps:[];
   if(steps.length)for(const step of steps.slice(0,6))this.p("COMMENT : "+step,8.5,false,11);
   else if(entry.status!=="Terminé")this.p("COMMENT : vérifier le message source, rassembler les pièces nécessaires, puis noter la réponse ou la décision.",8.5);
  }
  if(includeNotes&&entry.note)this.p("NOTE : "+entry.note,8);
  if(includeSources){
   if(entry.due_source)this.p("SOURCE DE LA DATE : "+entry.due_source,8);
   this.p("PREUVE : "+(isReviewed(entry)?"message analysé":"en-tête seulement")+" | Référence : "+entry.id,7.5);
   const uri=String(entry.link||"");
   if(/^https:\/\/mail\.google\.com\//.test(uri)){
    this.need(18);this.put("Consulter le message source dans Gmail",50,this.y,8);
    this.page.links.push({rect:[49,this.y-2,285,this.y+11],url:uri});this.y-=14;
   }
  }
  this.gap(7);this.rule(45,this.y,550,this.y);this.y-=13;
 }
 make(all,rows){
  const n=counts(all);
  this.p("RAPPORT DE SUIVI DES COURRIERS",18,true);this.gap(4);
  this.p("Émis le "+new Date().toLocaleString("fr-FR",{timeZone:"Europe/Paris"}),9);
  this.gap(8);
  this.p("BILAN : "+n.total+" indexés, "+n.reviewed+" analysés, "+n.unread+" à trier.",9,true);
  this.p("FAIT : "+n.done+" | PAS FAIT : "+(n.todo+n.check+n.wait)+" | À FAIRE : "+n.todo,9);
  this.p("À VÉRIFIER : "+n.check+" | EN ATTENTE : "+n.wait+" | PAS ENCORE ANALYSÉ : "+n.unread,9);
  this.p("ÉCHÉANCES RENSEIGNÉES OUVERTES : "+n.dates+" | FICHES DANS CE RAPPORT : "+rows.length,9);
  this.gap(5);
  this.p("Attention : un mail indexé n’est pas nécessairement lu. Une date absente n’est jamais inventée. Les statuts reflètent les suivis ELOAH à la date du rapport.",8);
  this.gap(12);
  for(const status of ["À faire","À vérifier","En attente","Terminé","À trier","Ignoré"]){
   const subset=rows.filter(x=>x.status===status);
   if(!subset.length)continue;this.heading(status,subset.length);
   for(const x of subset)this.add(x);
  }
  this.gap(12);this.p("Fin du rapport. Document confidentiel, personnel et non chiffré. Aucun email n’a été envoyé par cet export.",8);
  return this.build();
 }
 build(){
  const o=[null,"","",
   "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
   "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"];
  const append=x=>{o.push(x);return o.length-1};
  const pages=[];
  for(let i=0;i<this.pages.length;i++){
   const page=this.pages[i];
   page.text.push("BT /F1 7 Tf 1 0 0 1 48 28 Tm "+pdfLit("ELOAH - Rapport privé · usage personnel")+" Tj ET\n");
   page.text.push("BT /F1 7 Tf 1 0 0 1 510 28 Tm "+pdfLit((i+1)+"/"+this.pages.length)+" Tj ET\n");
   const stream=page.text.join("");
   const cid=append("<< /Length "+stream.length+" >>\nstream\n"+stream+"endstream");
   const annotations=page.links.map(l=>append("<< /Type /Annot /Subtype /Link /Rect ["+l.rect.join(" ")+"] /Border [0 0 0] /A << /S /URI /URI "+pdfLit(l.url)+" >> >>"));
   const pid=append("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents "+cid+" 0 R "+(annotations.length?"/Annots ["+annotations.map(n=>n+" 0 R").join(" ")+"] ":"")+">>");
   pages.push(pid+" 0 R");
  }
  o[1]="<< /Type /Catalog /Pages 2 0 R >>";
  o[2]="<< /Type /Pages /Count "+pages.length+" /Kids ["+pages.join(" ")+"] >>";
  let pdf="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";const offsets=[0];
  for(let i=1;i<o.length;i++){offsets[i]=pdf.length;pdf+=i+" 0 obj\n"+o[i]+"\nendobj\n"}
  const start=pdf.length;
  pdf+="xref\n0 "+o.length+"\n0000000000 65535 f \n";
  for(let i=1;i<o.length;i++)pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  pdf+="trailer\n<< /Size "+o.length+" /Root 1 0 R >>\nstartxref\n"+start+"\n%%EOF\n";
  const bytes=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;
  return new Blob([bytes],{type:"application/pdf"});
 }
}
function generate(){
 const all=B()?.getItems()||[],rows=choose(all);
 if(!rows.length)return alert("Charge tes dossiers privés dans ELOAH avant de créer le PDF.");
 if(mode==="all"&&rows.length>500&&!confirm("Exporter "+rows.length+" messages peut produire un PDF volumineux. Continuer ?"))return;
 const btn=$("pdfDownload"),message=$("pdfFeedback");btn.disabled=true;btn.textContent="Génération en cours…";
 setTimeout(()=>{
  try{
   const file=new DocumentPDF(),blob=file.make(all,rows),url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download="ELOAH-Courrier-"+mode+"-"+day()+".pdf";a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
   message.textContent="PDF créé sur cet appareil : "+rows.length+" dossiers, "+file.pages.length+" pages, "+Math.ceil(blob.size/1024)+" Ko.";
  }catch(err){message.textContent="Erreur PDF : "+err.message}
  finally{btn.disabled=false;btn.textContent="Télécharger le PDF ↓"}
 },30);
}
window.EloahMailPDF={render,createReport:(items,scope="actions")=>{const previous=mode;mode=scope;try{const pdf=new DocumentPDF();const blob=pdf.make(items,choose(items));return {blob,pages:pdf.pages.length}}finally{mode=previous}}};
})();