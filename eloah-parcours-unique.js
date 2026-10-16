/* ELOAH · Parcours unique : préparer, sources, produire, relire, conserver. */
(()=>{
'use strict';
function init(){
 const ai=document.getElementById('eloah-home-ai');
 const studio=document.getElementById('eloah-factory');
 const form=document.getElementById('home-ai-form');
 const sources=document.getElementById('eloah-creation-sources');
 const local=document.getElementById('eloah-creation-library');
 const cloud=document.getElementById('eloah-cloud-creations');
 const log=document.getElementById('home-ai-log');
 if(!ai||!studio||!form||!log||document.getElementById('eloah-workflow'))return;
 const steps=document.createElement('nav');steps.id='eloah-workflow';steps.setAttribute('aria-label','Étapes de ma création');
 const links=[['1 · Mon idée','#eloah-factory'],['2 · Mes références','#eloah-creation-sources'],['3 · Lancer l’IA','#home-ai-form'],['4 · Mon résultat','#home-ai-log'],['5 · Conserver','#eloah-creation-library']];
 links.forEach(([label,href])=>{
  const a=document.createElement('a');a.href=href;a.textContent=label;
  a.addEventListener('click',()=>{
   const dest=document.querySelector(href);
   if(dest){const details=dest.closest('details');if(details)details.open=true}
  });
  steps.append(a);
 });
 studio.before(steps);
 if(sources){
  const d=sources.querySelector('details');if(d)d.open=false;
 }
 const output=document.createElement('section');output.id='eloah-result-guide';
 output.innerHTML='<h3>Mon résultat</h3><p id="eloah-result-state" role="status">Aucune création générée dans cette session. Prépare ta demande puis utilise « Envoyer à ELOAH ».</p><div class="eloah-result-buttons"><button type="button" id="eloah-result-save-local">Conserver sur cet appareil</button><button type="button" id="eloah-result-save-cloud">Conserver dans mon cloud</button></div><small>Ces boutons utilisent les fonctions de sauvegarde existantes. La création et la publication ne sont jamais automatiques.</small>';
 log.after(output);
 const state=document.getElementById('eloah-result-state');
 function lastAnswer(){return [...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||''}
 function refresh(){
  const answer=lastAnswer();
  state.textContent=answer?'Une réponse est disponible. Relis-la puis choisis où la conserver.':'Aucune réponse IA à enregistrer. Lance d’abord une création.';
  document.getElementById('eloah-result-save-local').disabled=!answer;
  document.getElementById('eloah-result-save-cloud').disabled=!answer;
 }
 document.getElementById('eloah-result-save-local').addEventListener('click',()=>document.getElementById('ecl-save')?.click());
 document.getElementById('eloah-result-save-cloud').addEventListener('click',()=>document.getElementById('ecc-save')?.click());
 const observer=new MutationObserver(refresh);observer.observe(log,{childList:true,subtree:true});
 refresh();
 const css=document.createElement('style');css.textContent=
 '#eloah-workflow{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}#eloah-workflow a{display:flex;align-items:center;min-height:44px;padding:10px 12px;background:#f4eee7;border:1px solid #dacdc2;border-radius:8px;color:#3a2733;text-decoration:none;font:600 12px system-ui}'+
 '#eloah-result-guide{margin:18px 0;padding:18px;border:1px solid #866477;border-radius:12px;background:#29172a;color:#f9e9e8}#eloah-result-guide h3{color:#f7ddb9;font:400 23px Georgia,serif;margin:0 0 10px}#eloah-result-guide p,#eloah-result-guide small{color:#ead4e1}#eloah-result-guide .eloah-result-buttons{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#eloah-result-guide button{min-height:44px;background:#f7eee5;color:#342137;border:1px solid #cab0bd;border-radius:8px;padding:10px 14px;cursor:pointer}#eloah-result-guide button:disabled{opacity:.55;cursor:not-allowed}'+
 '#eloah-factory{margin:20px 0;padding:18px;background:#fbf5ef;border:1px solid #ded2c8;border-radius:14px;color:#392c36}#eloah-factory h3{margin:0 0 8px;font:400 24px Georgia,serif}#eloah-factory label{display:block;margin-top:14px;font-weight:600}#eloah-factory :is(select,textarea){display:block;width:100%;box-sizing:border-box;padding:12px;margin:7px 0;border:1px solid #bcaab3;border-radius:9px;background:#fff;color:#241926;font:16px system-ui}#eloah-factory button{min-height:46px;margin-top:12px;padding:11px 18px;border:0;border-radius:8px;background:#302133;color:white;cursor:pointer}#eloah-factory p{color:#5c4c58}'+
 '#eloah-creation-sources{margin:12px 0;color:#f5e8ee}#eloah-creation-sources summary{cursor:pointer;min-height:44px}#eloah-creation-sources .ecs-search{display:flex;flex-wrap:wrap;gap:8px}#eloah-creation-sources input[type=search]{min-height:44px;flex:1;min-width:170px;padding:10px}#eloah-creation-sources button{min-height:44px}#eloah-creation-sources .ecs-row{display:flex;align-items:center;gap:10px;min-height:44px}';
 document.head.append(css);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();