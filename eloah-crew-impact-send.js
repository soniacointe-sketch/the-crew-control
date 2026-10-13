/* ELOAH · Envoi contrôlé des campagnes Impact The Crew via Resend. */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('rubrique')!=='Mailing')return;
const studio=document.getElementById('eloah-resend-campaign-control');
const entries=Array.isArray(window.ELOAH_CREW_IMPACT)?window.ELOAH_CREW_IMPACT:[];
if(!studio||!entries.length)return;
const fields=['subject','title','preheader','eyebrow','body','details','hero','button','link','sign','portrait','layout','instagram','facebook','youtube'];
const q=(selector)=>studio.querySelector(selector);
const actions=q('.erc-actions'),originalDraft=q('[data-act="draft"]');
if(!actions)return;
const sendBtn=document.createElement('button');sendBtn.type='button';sendBtn.dataset.act='send-impact';sendBtn.textContent='Envoyer aux abonnés';sendBtn.className='erc-primary erc-send-impact';sendBtn.hidden=true;sendBtn.disabled=true;
actions.append(sendBtn);
const restoreBtn=document.createElement('button');restoreBtn.type='button';restoreBtn.textContent='Restaurer la version prête';restoreBtn.hidden=true;restoreBtn.className='erc-restore-impact';
actions.append(restoreBtn);
const badge=document.createElement('p');badge.className='erc-impact-status';badge.setAttribute('role','status');badge.setAttribute('aria-live','polite');
actions.after(badge);
const link=document.createElement('a');link.className='erc-campaign-provider';link.target='_blank';link.rel='noopener noreferrer';link.hidden=true;link.textContent='Ouvrir ce brouillon dans Resend ↗';
badge.after(link);
const style=document.createElement('style');style.textContent='.erc-send-impact{background:#b00c17!important;border-color:#b00c17!important;color:#fff!important;min-width:200px}.erc-impact-status{font:600 12px/1.55 Arial,sans-serif!important;margin:10px 0!important;color:#6c553c!important}.erc-campaign-provider{display:inline-block;color:#795e3c;font:600 12px/1.4 Arial,sans-serif;margin:2px 0 12px}.erc-campaign-provider[hidden],.erc-send-impact[hidden],.erc-restore-impact[hidden]{display:none!important}.erc-impact-dialog{border:1px solid #d6c8b4;border-radius:16px;max-width:460px;width:calc(100% - 26px);background:#fffdf9;color:#2c2422;padding:24px;box-shadow:0 25px 75px #2016144d}.erc-impact-dialog::backdrop{background:#19191bcc}.erc-impact-dialog h2{font:26px Georgia,serif;color:#2c2422;margin:0 0 13px}.erc-impact-dialog p{font:14px/1.65 Arial,sans-serif;color:#514640}.erc-impact-dialog label{display:block;font:600 13px/1.6 Arial,sans-serif;margin-top:18px}.erc-impact-dialog input{display:block;margin-top:7px;padding:10px 12px;width:100%;border:1px solid #c8bcae;border-radius:6px;font:14px Arial,sans-serif}.erc-impact-dialog .buttons{display:flex;gap:8px;margin-top:19px;flex-wrap:wrap}.erc-impact-dialog button{font:700 13px Arial,sans-serif;padding:12px 15px;border-radius:7px;border:1px solid #b6a89c;background:#fff;color:#352a29;cursor:pointer}.erc-impact-dialog button.primary{background:#a70813;color:#fff;border-color:#a70813}.erc-impact-dialog button:disabled{opacity:.4;cursor:not-allowed}';document.head.append(style);
const dialog=document.createElement('dialog');dialog.className='erc-impact-dialog';
dialog.innerHTML='<h2>Envoyer aux abonnés ?</h2><p class="erc-confirm-summary"></p><p><strong>Liste :</strong> The Crew Orchies. L’envoi est lancé à tous les abonnés actifs au moment de la diffusion ; Resend gère les désabonnements.</p><p>Cette action est une diffusion réelle. Tu dois avoir vérifié le texte, le bouton et les images.</p><label>Écris ENVOYER pour confirmer<input type="text" class="erc-confirm-typing" autocomplete="off" placeholder="ENVOYER"></label><div class="buttons"><button type="button" class="erc-cancel">Annuler</button><button type="button" class="erc-confirm-final primary" disabled>Confirmer et envoyer</button></div>';
studio.append(dialog);
const confirmText=dialog.querySelector('.erc-confirm-typing'),finalButton=dialog.querySelector('.erc-confirm-final');
dialog.querySelector('.erc-cancel').onclick=()=>{if(!busy)dialog.close()};
confirmText.addEventListener('input',()=>{finalButton.disabled=confirmText.value.trim()!=='ENVOYER'||busy});
let authClient=null,busy=false,loading=false,loaded=false,serverCampaigns=new Map(),lastFailure=null,statusError='';
const ENDPOINT='https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-mailing-resend';
const PUB='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const allowedKeys=new Set(fields);
function activeTemplate(){
 const id=new URLSearchParams(location.search).get('campagne');
 return q('[data-n="brand"]')?.value==='The Crew Orchies'?entries.find(t=>t.id===id)||null:null;
}
function snapshot(){
 return Object.fromEntries(fields.map(k=>[k,String(q('[data-n="'+k+'"]')?.value??'')]));
}
function sameAsPrepared(model,data){
 return fields.every(k=>String(model[k]??'')===String(data[k]??''));
}
function currentRow(){const model=activeTemplate();return model?serverCampaigns.get(model.id):null;}
function setState(message){badge.textContent=message}
function update(){
 const model=activeTemplate(),row=currentRow();
 sendBtn.hidden=!model;restoreBtn.hidden=true;link.hidden=true;
 if(originalDraft)originalDraft.hidden=Boolean(model);
 if(!model){badge.textContent='';return}
 const changed=!sameAsPrepared(model,snapshot());
 if(changed)restoreBtn.hidden=false;
 if(row?.broadcastId&&/^[a-f0-9-]{36}$/.test(row.broadcastId)){
   link.href='https://resend.com/broadcasts/'+row.broadcastId;
   link.hidden=false;
 }
 let message='';
 if(changed)message='Modifications non synchronisées : le bouton est bloqué pour éviter d’envoyer une ancienne version. Restaure la version prête ou prépare un nouveau brouillon.';
 else if(loading)message='Vérification du brouillon dans Resend…';
 else if(!loaded)message=statusError||'Statut non vérifié. Connecte-toi à ELOAH pour autoriser l’envoi.';
 else if(!row)message='Cette newsletter ne possède pas encore de brouillon Resend autorisé.';
 else if(lastFailure?.id===model.id&&row.status==='draft')message='Dernier essai refusé : '+lastFailure.message+' · Aucun envoi confirmé.';
 else if(row.status==='draft')message='Brouillon prêt dans Resend. Clique pour envoyer cette version à la liste The Crew Orchies.';
 else if(row.status==='queued')message='Envoi déjà lancé. Le statut de livraison final est consultable dans Resend ; ne renvoie pas cette campagne.';
 else if(row.status==='submitting')message='Envoi en cours : ne clique pas une deuxième fois.';
 else message='Statut à vérifier dans Resend avant toute nouvelle tentative.';
 sendBtn.disabled=busy||loading||!loaded||changed||row?.status!=='draft'||lastFailure?.id===model.id;
 setState(message);
}
async function getSession(){
 if(!window.supabase?.createClient)throw Error('Connexion ELOAH indisponible.');
 if(!authClient)authClient=window.supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co',PUB,{auth:{persistSession:true,autoRefreshToken:true}});
 const {data,error}=await authClient.auth.getSession();
 if(error||!data?.session?.access_token)throw Error('Connecte-toi à ton compte ELOAH pour envoyer cette newsletter.');
 return data.session.access_token;
}
async function api(action,payload={}){
 const token=await getSession();
 const resp=await fetch(ENDPOINT,{method:'POST',headers:{Authorization:'Bearer '+token,apikey:PUB,'Content-Type':'application/json'},body:JSON.stringify({action,...payload})});
 let data={};try{data=await resp.json()}catch{}
 if(!resp.ok){const error=new Error(data.error||'La passerelle Resend n’a pas confirmé la demande.');error.status=resp.status;throw error}
 return data;
}
async function refresh(){
 if(busy||loading)return;
 loading=true;update();
 try{
   const data=await api('crew-impact-status');
   if(!Array.isArray(data.items))throw Error('Statuts absents de la réponse ELOAH.');
   serverCampaigns=new Map(data.items.map(x=>[x.templateId,x]));
   loaded=true;statusError='';
 }catch(e){loaded=false;serverCampaigns.clear();statusError=e?.message||'Statuts indisponibles.';if(activeTemplate())setState(statusError);}
 finally{loading=false;update()}
}
function openDialog(){
 const model=activeTemplate(),row=currentRow();
 if(busy||!loaded||!model||row?.status!=='draft'||!sameAsPrepared(model,snapshot())){update();return}
 dialog.querySelector('.erc-confirm-summary').textContent='Newsletter : « '+model.subject+' ». Envoi immédiat à la liste Resend The Crew Orchies, et non seulement à une adresse de test.';
 confirmText.value='';finalButton.disabled=true;dialog.showModal();confirmText.focus();
}
sendBtn.onclick=openDialog;
finalButton.onclick=async()=>{
 if(busy||confirmText.value.trim()!=='ENVOYER')return;
 const model=activeTemplate(),row=currentRow();
 if(!model||row?.status!=='draft'||!sameAsPrepared(model,snapshot())){dialog.close();update();return}
 const chosen=model.id,content=snapshot();
 busy=true;finalButton.disabled=true;sendBtn.disabled=true;dialog.close();
 setState('Demande d’envoi transmise à Resend. Ne rafraîchis pas et ne reclique pas.');
 try{
   const result=await api('crew-impact-send',{brand:'The Crew Orchies',templateId:chosen,snapshot:content,confirmation:'ENVOYER THE CREW AUX ABONNÉS'});
   serverCampaigns.set(chosen,{...row,status:'queued',broadcastId:result.broadcastId||row.broadcastId});
   loaded=true;lastFailure=null;
   setState('Resend a accepté la diffusion et l’a placée en file d’envoi. La livraison individuelle reste à vérifier.');
 }catch(e){
   lastFailure={id:chosen,message:e?.message||'Envoi non confirmé.'};
   setState(lastFailure.message+' Ouvre Resend pour vérifier avant de réessayer.');
   loaded=false;
 }finally{
   busy=false;
   update();
   if(!loaded)await refresh();
 }
};
restoreBtn.onclick=()=>{
 const t=activeTemplate();if(!t)return;
 if(!window.confirm('Restaurer la version The Crew préparée dans Resend ? Tes modifications locales de ce brouillon seront perdues.'))return;
 try{localStorage.removeItem('eloah-rich-impact-'+t.id)}catch{}
 document.dispatchEvent(new CustomEvent('eloah:crew-impact-open',{detail:{id:t.id}}));
 Promise.resolve().then(update);
};
studio.addEventListener('input',update);
studio.addEventListener('change',update);
document.addEventListener('eloah:crew-impact-open',()=>Promise.resolve().then(update));
document.getElementById('crew-impact-cards')?.addEventListener('click',()=>Promise.resolve().then(update));
document.getElementById('campaign-list')?.addEventListener('click',()=>Promise.resolve().then(update));
window.addEventListener('popstate',update);
const reloadBtn=document.createElement('button');reloadBtn.type='button';reloadBtn.textContent='Actualiser les statuts Resend';reloadBtn.className='erc-reload-impact';
reloadBtn.onclick=()=>{lastFailure=null;refresh()};actions.append(reloadBtn);
update();refresh();
})();