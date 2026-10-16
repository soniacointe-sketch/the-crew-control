/* ELOAH : exporter le dernier résultat comme document HTML lisible et texte Markdown. */
(()=>{
'use strict';
function init(){
 const guide=document.getElementById('eloah-result-guide'),log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('eloah-export-document'))return;
 const button=document.createElement('button');button.id='eloah-export-document';button.type='button';button.textContent='Télécharger mon dossier (HTML)';
 guide.querySelector('.eloah-result-buttons')?.append(button);
 function output(){return [...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||''}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function update(){button.disabled=!output()}
 button.addEventListener('click',()=>{
  const answer=output();if(!answer)return;
  const project=document.getElementById('home-ai-project')?.value||'ELOAH';
  const date=new Date().toLocaleDateString('fr-FR');
  const content='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dossier ELOAH</title><style>body{font:16px/1.8 Georgia,serif;color:#272127;background:#f8f3eb;margin:0}.page{max-width:760px;margin:0 auto;padding:64px 30px}header{border-bottom:2px solid #9d7e76;margin-bottom:30px;padding-bottom:20px}h1{font-size:38px;font-weight:normal}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}small{color:#6a5b60}@media print{body{background:white}.page{padding:20px}}</style></head><body><article class="page"><header><small>ELOAH · '+escape(project)+' · '+escape(date)+'</small><h1>Mon dossier de création</h1></header><pre>'+escape(answer)+'</pre><footer><small>Document à relire avant diffusion. Visuels et publication non inclus.</small></footer></article></body></html>';
  const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='eloah-dossier-'+new Date().toISOString().slice(0,10)+'.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 });
 new MutationObserver(update).observe(log,{childList:true,subtree:true});update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();