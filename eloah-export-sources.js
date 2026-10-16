(()=>{
function init(){
 const box=document.getElementById('eloah-result-guide'),log=document.getElementById('home-ai-log');
 if(!box||!log||document.getElementById('eloah-package'))return;
 const btn=document.createElement('button');btn.type='button';btn.id='eloah-package';btn.textContent='Exporter le dossier et ses sources';
 box.querySelector('.eloah-result-buttons')?.append(btn);
 const result=()=>[...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent||'';
 function refresh(){btn.disabled=!result()}new MutationObserver(refresh).observe(log,{childList:true,subtree:true});refresh();
 btn.addEventListener('click',()=>{
  const content=result();if(!content)return;
  const file={
   version:1,created_at:new Date().toISOString(),
   universe:document.getElementById('home-ai-project')?.value||'ELOAH',
   subject:document.getElementById('ef-subject')?.value||'',
   deliverable:{type:'text',content},
   references:window.EloahEvidence?.sources?.()||window.EloahAutoSources?.sources?.()||[],
   citation_review:window.EloahEvidence?.audit?.(content)||null,
   visual_assets:[],
   status:{text_generated:true,images_generated:false,files_published:false},
   note:'Texte à relire. Les sources sont des extraits internes, pas des preuves indépendamment vérifiées. Les références citées et les affirmations restent à contrôler. Aucun visuel généré ni publication réalisée.'
  };
  const url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='eloah-dossier-et-sources.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();