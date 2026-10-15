/* ELOAH Pilotage · cockpit local non intrusif.
   Lit uniquement les mêmes clés locales que les fonctions de pilotage existantes.
   Ne publie, ne modifie et ne synchronise aucune donnée. */
(()=>{
 'use strict';
 const projectPrefix='eloah-project-v1:';
 const taskKey='eloah-planning-v1';
 const ids={projects:'pilotage-count-projects',open:'pilotage-count-open',soon:'pilotage-count-soon',late:'pilotage-count-late'};
 const elements=Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,document.getElementById(id)]));
 const message=document.getElementById('pilotage-count-status');
 if(!message||Object.values(elements).some(v=>!v))return;
 let scheduled=false;
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00Z'));
 const isOpen=item=>item && typeof item==='object' && !item.archived && item.status!=='Terminé';
 const number=v=>new Intl.NumberFormat('fr-FR').format(v);
 function clear(text){
   for(const e of Object.values(elements))e.textContent='—';
   message.textContent=text;
 }
 function render(){
  try{
   let projects=0;
   const storage=window.localStorage;
   for(let i=0;i<storage.length;i++){
    const key=storage.key(i);
    if(!key?.startsWith(projectPrefix))continue;
    let parsed;
    try{parsed=JSON.parse(storage.getItem(key)||'null')}catch{continue}
    if(parsed && Array.isArray(parsed.threads) && !parsed.settings?.archived)projects++;
   }
   const parsed=JSON.parse(storage.getItem(taskKey)||'[]');
   if(!Array.isArray(parsed))throw Error('invalid_planning');
   const current=today();
   const end=new Date(current+'T12:00:00Z').getTime()+7*86400000;
   let open=0,soon=0,late=0;
   for(const item of parsed){
    if(!isOpen(item))continue;
    open++;
    if(!validDate(item.date))continue;
    if(item.date<current){late++;continue;}
    const when=Date.parse(item.date+'T12:00:00Z');
    if(when<=end)soon++;
   }
   elements.projects.textContent=number(projects);
   elements.open.textContent=number(open);
   elements.soon.textContent=number(soon);
   elements.late.textContent=number(late);
   message.textContent='Relevé local · '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' · Aucun envoi externe';
  }catch{
   clear('Stockage local indisponible ou planning invalide. Les données existantes restent intactes.');
  }
 }
 function queueRender(){
   if(scheduled)return;
   scheduled=true;
   queueMicrotask(()=>{scheduled=false;render()});
 }
 for(const id of ['ops-calendar','client-project-list','client-next']){
  const element=document.getElementById(id);
  if(element)new MutationObserver(queueRender).observe(element,{childList:true,subtree:false});
 }
 document.addEventListener('submit',e=>{
   if(e.target.closest('#ops-calendar,#client-new-project'))setTimeout(queueRender,120);
 });
 document.addEventListener('click',e=>{
   if(e.target.closest('#ops-calendar,#client-new-project,[data-new-project],#client-quick-add'))setTimeout(queueRender,130);
 });
 window.addEventListener('storage',e=>{
   if(e.key===null||e.key===taskKey||e.key?.startsWith(projectPrefix))queueRender();
 });
 window.addEventListener('pageshow',queueRender);
 render();
})();