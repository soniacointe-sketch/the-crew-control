/* ELOAH Mailing — un test privé pour tous les univers, tous les brouillons et tous les éditeurs. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('rubrique')!=='Mailing')return;
const root=document.getElementById('mailing-dashboard');
if(!root)return;
const form=document.getElementById('campaign-form');
const studio=document.getElementById('eloah-resend-campaign-control');
const impactTemplates=Array.isArray(window.ELOAH_CREW_IMPACT)?window.ELOAH_CREW_IMPACT:[];
const to='soniacointe@icloud.com';
const endpoint='https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-mailing-resend';
const pub='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const visualFields=['subject','title','preheader','eyebrow','body','details','hero','button','link','sign','portrait','layout','instagram','facebook','youtube'];
let client=null,busy=false;
function byId(id){return document.getElementById(id)}
const style=document.createElement('style');
style.textContent='.eloah-test-global{display:inline-flex!important;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:11px 15px!important;border-radius:8px!important;border:1px solid #97774b!important;background:#fff8e7!important;color:#513e24!important;font:700 13px/1.25 Arial,sans-serif!important;cursor:pointer}.eloah-test-global:hover,.eloah-test-global:focus-visible{background:#f5ead3!important;outline:2px solid #b99e69;outline-offset:1px}.eloah-test-global[hidden]{display:none!important}.eloah-test-global:disabled{opacity:.52;cursor:wait}.eloah-test-feedback{font:600 12px/1.55 Arial,sans-serif!important;color:#28705a!important;margin:8px 0!important}.eloah-test-feedback[data-error="true"]{color:#ab2530!important}.eloah-test-target{font:12px/1.5 Arial,sans-serif!important;color:#75644f!important;margin:7px 0!important}#campaign-form .campaign-test-send{display:none!important}.eloah-test-card{width:calc(100% - 26px);margin:0 13px 12px;min-height:38px;font:600 12px/1.4 Arial,sans-serif;border:1px solid #bd9b68;color:#6b4a25;background:#fffaed;border-radius:8px;cursor:pointer}.eloah-test-card:hover,.eloah-test-card:focus-visible{outline:2px solid #b99e69;outline-offset:1px}.eloah-test-card:disabled{opacity:.5;cursor:wait}.eloah-test-card-progress{display:block;margin:1px 12px 12px;color:#28705a;font:600 12px/1.5 Arial,sans-serif;overflow-wrap:anywhere}.eloah-test-card-progress[data-error="true"]{color:#b02b38}#crew-impact-cards .eloah-test-card{margin:0;width:100%;background:#fff6df;color:#452c10;border-color:#c1a16d}#crew-impact-cards .eloah-test-card-progress{margin:0 0 5px;color:#f4e7c5}#crew-impact-cards .eloah-test-card-progress[data-error="true"]{color:#f8a6a6}@media(max-width:560px){.eloah-test-card{font-size:11px;padding:8px}.eloah-test-global{font-size:12px!important}}';
document.head.append(style);
function control(textValue){const b=document.createElement('button');b.type='button';b.className='eloah-test-global';b.textContent=textValue;return b}
function feedback(){const p=document.createElement('p');p.className='eloah-test-feedback';p.setAttribute('role','status');p.setAttribute('aria-live','polite');return p}
function normBrand(b){if(b==='crew-test'||b==='La Voix d’Orchies — Asso'||b==="La Voix d'Orchies — Asso")return 'The Crew Orchies';if(b==='La Voix d’Orchies'||b==="La Voix d'Orchies")return 'Le Lion Blanc';return b}
function getClassic(){
 if(!form||form.hidden)throw Error('Ouvre une newsletter dans l’éditeur pour la tester.');
 const brand=normBrand(byId('campaign-target')?.value||'');
 if(!['The Crew Orchies','Power & Glam','Le Lion Blanc'].includes(brand))throw Error('Sélectionne une liste destinataire avant le test.');
 return {brand,format:'markdown',subject:byId('campaign-subject')?.value?.trim()||'',body:byId('campaign-body')?.value?.trim()||''};
}
function getVisual(){
 if(!studio)throw Error('Studio visuel indisponible.');
 const brand=studio.querySelector('[data-n="brand"]')?.value||'';
 if(!['The Crew Orchies','Power & Glam','Le Lion Blanc'].includes(brand))throw Error('Univers non reconnu.');
 const snapshot=Object.fromEntries(visualFields.map(k=>[k,String(studio.querySelector('[data-n="'+k+'"]')?.value??'')]));
 return {brand,format:'visual',subject:snapshot.subject.trim(),body:snapshot.body.trim(),snapshot};
}
async function token(){
 if(!window.supabase?.createClient)throw Error('Connexion ELOAH indisponible sur cet appareil.');
 if(!client)client=window.supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co',pub,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data,error}=await client.auth.getSession();
 if(error||!data?.session?.access_token)throw Error('Connecte-toi à ELOAH pour utiliser le bouton d’essai.');
 return data.session.access_token;
}
async function run(payload,nodes=[]){
 if(busy)return;
 const targets=nodes.filter(Boolean);let status='Envoi du test vers '+to+'…';
 const show=(msg,error=false)=>{targets.forEach(n=>{n.textContent=msg;if(error)n.dataset.error='true';else n.removeAttribute('data-error')})};
 try{
   if(payload.subject.length<3||payload.body.length<20)throw Error('Ajoute un objet et un texte complet avant l’essai.');
   busy=true;
   document.querySelectorAll('.eloah-test-global,.eloah-test-card').forEach(b=>b.disabled=true);
   show(status);
   const auth=await token();
   const res=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+auth,apikey:pub,'Content-Type':'application/json'},body:JSON.stringify({action:'mailing-test',...payload})});
   const result=await res.json().catch(()=>({}));
   if(!res.ok)throw Error(result.error||'Test refusé. Aucun abonné contacté.');
   status=(result.message||'Test accepté par Resend. Vérifie ta boîte iCloud.')+(result.emailId?' Référence : '+result.emailId+'.':'');
   show(status);
 }catch(e){
   show((e?.message||'Le test n’a pas pu être confirmé.')+' Aucun envoi collectif.',true);
   if(/connecte-toi|connexion ELOAH|session/i.test(String(e?.message||''))&&byId('campaign-login-panel')&&!form.hidden)byId('campaign-login-panel').hidden=false;
 }finally{
   busy=false;
   document.querySelectorAll('.eloah-test-global,.eloah-test-card').forEach(b=>b.disabled=false);
 }
}
const classicActions=form?.querySelector('.campaign-compose-actions');
let classicBtn,classicResult;
if(classicActions){
 classicBtn=control('✉ M’envoyer un test');
 classicResult=feedback();
 classicActions.insertBefore(classicBtn,byId('campaign-preview'));
 const note=document.createElement('p');note.className='eloah-test-target';note.textContent='Essai privé vers '+to+' · aucun abonné contacté · expéditeur de test vérifié The Crew.';
 classicActions.after(note,classicResult);
 classicBtn.onclick=()=>{try{run(getClassic(),[classicResult])}catch(e){classicResult.dataset.error='true';classicResult.textContent=e.message}};
}
const visualActions=studio?.querySelector('.erc-actions');
let visualBtn,visualResult;
if(visualActions){
 visualBtn=control('✉ M’envoyer un test');
 visualResult=feedback();
 visualActions.insertBefore(visualBtn,visualActions.firstChild);
 const note=document.createElement('p');note.className='eloah-test-target';note.textContent='Test privé vers '+to+' · adapté à chaque univers · sans diffusion collective.';
 visualActions.after(note,visualResult);
 visualBtn.onclick=()=>{try{run(getVisual(),[visualResult])}catch(e){visualResult.dataset.error='true';visualResult.textContent=e.message}};
 studio.addEventListener('input',e=>{if(e.target?.matches?.('[data-n]')){visualResult.textContent='';visualResult.removeAttribute('data-error')}});
 studio.addEventListener('change',e=>{if(e.target?.matches?.('[data-n]')){visualResult.textContent='';visualResult.removeAttribute('data-error')}});
 function isPreparedCrew(){
  const id=new URLSearchParams(location.search).get('campagne');
  return studio.querySelector('[data-n="brand"]')?.value==='The Crew Orchies'&&impactTemplates.some(t=>t.id===id);
 }
 function syncVisualButtons(){
  if(visualBtn)visualBtn.hidden=isPreparedCrew()&&!!studio.querySelector('[data-act="test-impact"]');
 }
 studio.addEventListener('change',syncVisualButtons);
 document.addEventListener('eloah:crew-impact-open',()=>Promise.resolve().then(syncVisualButtons));
 window.addEventListener('popstate',syncVisualButtons);
 const prior=studio.querySelector('[data-act="test-impact"]');
 if(prior)new MutationObserver(syncVisualButtons).observe(prior,{attributes:true,attributeFilter:['hidden']});
 syncVisualButtons();
}
function testCard(makeOpen,preferred,display){
 try{
   makeOpen();
   Promise.resolve().then(()=>{
     try{
       if(preferred==='visual'||(form?.hidden&&studio))run(getVisual(),[display,visualResult]);
       else run(getClassic(),[display,classicResult]);
     }catch(e){display.dataset.error='true';display.textContent=e.message}
   });
 }catch(e){display.dataset.error='true';display.textContent=e.message}
}
function addCardButtons(){
 const list=byId('campaign-list');if(!list)return;
 list.querySelectorAll('.campaign-library-card').forEach(card=>{
   if(card.querySelector('.eloah-test-card'))return;
   const op=card.querySelector('.campaign-library-open');if(!op)return;
   const btn=document.createElement('button');btn.type='button';btn.className='eloah-test-card';btn.textContent='✉ M’envoyer un test';
   const msg=document.createElement('span');msg.className='eloah-test-card-progress';msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');
   card.append(btn,msg);
   btn.onclick=()=>testCard(()=>op.click(),'auto',msg);
 });
}
const list=byId('campaign-list');if(list){new MutationObserver(addCardButtons).observe(list,{childList:true});addCardButtons()}
function addImpactGalleryButtons(){
 const cards=byId('crew-impact-cards');if(!cards)return;
 Array.from(cards.querySelectorAll('.crew-impact-card')).forEach((card,index)=>{
   if(card.querySelector('.eloah-test-card'))return;
   const op=card.querySelector('.crew-impact-card-body > button');if(!op)return;
   const btn=document.createElement('button');btn.type='button';btn.className='eloah-test-card';btn.textContent='✉ M’envoyer un test';
   const msg=document.createElement('span');msg.className='eloah-test-card-progress';msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');
   op.after(btn,msg);
   btn.onclick=()=>testCard(()=>op.click(),'visual',msg);
 });
}
const grid=byId('crew-impact-cards');
if(grid){new MutationObserver(addImpactGalleryButtons).observe(grid,{childList:true});addImpactGalleryButtons()}
})();