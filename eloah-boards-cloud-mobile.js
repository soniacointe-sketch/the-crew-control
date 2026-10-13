/* ELOAH Boards — accès mobile aux cartes du compte connecté. */
(()=>{
'use strict';
const css=document.createElement('style');css.textContent=[
'@media(max-width:767px){',
'#eloahMobile .em-cloud-access{margin:12px 15px 18px;padding:16px;border:1px solid #d5dff0;background:#fff;border-radius:18px;box-shadow:0 5px 20px #142d5912}',
'#eloahMobile .em-cloud-access strong{display:block;font-size:19px;font-weight:700;color:#1e3045}',
'#eloahMobile .em-cloud-access p{font-size:14px;color:#4c5b69;margin:7px 0 12px;line-height:1.45}',
'#eloahMobile .em-cloud-access button{min-height:44px!important;border-radius:12px!important;background:#108bf4!important;color:#fff!important;font-weight:650!important;padding:11px 15px!important;width:100%;text-align:center}',
'#eloahMobile .em-cloud-count{font-size:14px;font-weight:650;color:#31557a;margin:8px 0}',
'}'].join('\n');document.head.appendChild(css);
const byId=id=>document.getElementById(id);
const total=()=>{try{return data.boards.reduce((n,b)=>n+(Array.isArray(b.cards)?b.cards.length:0),0)}catch(e){return 0}};
let scheduled=false;
function ensure(){
 if(!window.matchMedia('(max-width:767px)').matches)return;
 const root=byId('eloahMobile');if(!root)return;
 const count=byId('cloudCounts')?.textContent?.trim()||total()+' cartes sur cet appareil';
 const connected=byId('cloudLogin')?.hidden===true;
 const missing=connected&&count.includes('aucune sauvegarde');
 const workspace=byId('emWorkspaceList');
 if(workspace){
   const scroll=workspace.closest('.em-scroll');
   if(!scroll)return;
   let box=byId('emCloudAccess');
   if(!box){box=document.createElement('section');box.id='emCloudAccess';box.className='em-cloud-access';
     const heading=document.createElement('strong');heading.textContent='Mes cartes enregistrées';
     const note=document.createElement('p');note.className='em-cloud-count';
     const btn=document.createElement('button');btn.type='button';
     btn.addEventListener('click',()=>{
       if(!byId('cloudLogin')?.hidden){root.querySelector('.em-dock .em-tab:last-child')?.click();return;}
       if((byId('cloudCounts')?.textContent||'').includes('aucune sauvegarde')){root.querySelector('.em-dock .em-tab:last-child')?.click();return;}
       byId('cloudDownload')?.click();
     });
     box.append(heading,note,btn);scroll.insertBefore(box,scroll.firstChild);
   }
   const note=box.querySelector('.em-cloud-count');if(note&&note.textContent!==count)note.textContent=count;
   const button=box.querySelector('button');
   const label=!connected?'Me connecter pour retrouver mes cartes':missing?'Vérifier le compte connecté':'Afficher les cartes sauvegardées';
   if(button&&button.textContent!==label)button.textContent=label;
 }
 const sections=[...root.querySelectorAll('.em-section-card')];
 const account=sections.find(x=>x.querySelector('h2')?.textContent==='Mon espace ELOAH');
 if(account){
   let label=account.querySelector('.em-cloud-count');
   if(!label){label=document.createElement('p');label.className='em-cloud-count';account.insertBefore(label,account.children[1]||null)}
   if(label.textContent!==count)label.textContent=count;
 }
}
function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;ensure()})}
const observer=new MutationObserver(queue);
observer.observe(document.body,{childList:true,subtree:true});
window.addEventListener('eloah:boards-updated',queue);
window.addEventListener('eloah:cloud-status',queue);
window.addEventListener('pageshow',queue);
queue();
})();