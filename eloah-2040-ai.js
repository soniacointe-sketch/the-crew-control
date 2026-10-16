import {mountPilot} from './eloah-ai-pilot.js?v=memory-3';
import {mountCloudMemory} from './eloah-cloud-memory.js?v=1';

/* ELOAH 2040 · session fondatrice, réponses temporaires et annulation. */
const el=id=>document.getElementById(id);
const pilot=mountPilot();
const base='https://voytsqyorhoveurnguxn.supabase.co';
const founderId='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
let client=null, loadingClient=null, approvedHandoff=false;
const publicKey='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';

const cloudMemory=mountCloudMemory({getClient:()=>client,isFounder:()=>activeAccount===founderId,founderId});

let lastValidAnswer='';const copy=el('ai-copy'),download=el('ai-download'),reuse=el('ai-reuse');function answerState(value){lastValidAnswer=value||'';[copy,download,reuse].forEach(b=>b.disabled=!lastValidAnswer)}copy.addEventListener('click',async()=>{if(!lastValidAnswer)return;try{await navigator.clipboard.writeText(lastValidAnswer);copy.textContent='Copié ✓';setTimeout(()=>copy.textContent='Copier la réponse',1700)}catch(e){copy.textContent='Copie non disponible'}});download.addEventListener('click',()=>{if(!lastValidAnswer)return;const blob=new Blob([lastValidAnswer],{type:'text/plain;charset=utf-8'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='eloah-reponse-ia.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});reuse.addEventListener('click',()=>{if(!lastValidAnswer)return;el('ai-request').value=lastValidAnswer.slice(0,9000);updateLength();el('ai-request').focus()});

const prep=el('approval-prepare'),editor=el('approval-editor'),draft=el('approval-text'),target=el('approval-target'),openTarget=el('approval-open'),approvalStatus=el('approval-status');prep.addEventListener('click',()=>{if(!lastValidAnswer){approvalStatus.textContent='Demande d’abord une réponse à ELOAH Intelligence.';editor.hidden=false;draft.value='';return}draft.value=lastValidAnswer.slice(0,9000);editor.hidden=false;approvalStatus.textContent='Relis le brouillon puis valide la copie. Aucune publication automatique.';draft.focus()});target.addEventListener('change',()=>{openTarget.href=target.value});el('approval-copy').addEventListener('click',async()=>{if(!draft.value.trim()){approvalStatus.textContent='Brouillon vide : rien à copier.';return}try{await navigator.clipboard.writeText(draft.value);approvalStatus.textContent='Texte copié. Ouvre ensuite la destination et colle-le volontairement.'}catch(e){approvalStatus.textContent='Copie indisponible : sélectionne le texte manuellement.'}});el('approval-cancel').addEventListener('click',()=>{draft.value='';editor.hidden=true});

const cardTitle=el('board-card-title'),cardDescription=el('board-card-description'),cardStatus=el('board-card-status');function fillBoardDraft(){const content=lastValidAnswer||draft.value.trim();cardDescription.value=String(content).slice(0,8000);const first=String(content).split(/\n/).map(v=>v.trim()).find(Boolean)||'Action à préparer';cardTitle.value=first.replace(/^#+\s*/,'').slice(0,160)}prep.addEventListener('click',fillBoardDraft);function boardCard(){const title=cardTitle.value.trim(),description=cardDescription.value.trim();if(!title){cardStatus.textContent='Indique le titre de la carte.';cardTitle.focus();return null}return {title,description,tag:'ELOAH 2040 · brouillon'}}el('board-card-copy').addEventListener('click',async()=>{const card=boardCard();if(!card)return;try{await navigator.clipboard.writeText(card.title+'\n\n'+card.description);cardStatus.textContent='Carte copiée. Ouvre Boards et crée-la dans le tableau et la colonne de ton choix.'}catch(e){cardStatus.textContent='Copie indisponible : sélectionne les champs pour les copier manuellement.'}});el('board-card-handoff').addEventListener('click',()=>{const card=boardCard();if(!card)return;try{sessionStorage.setItem('eloah2040:board-handoff',JSON.stringify({version:1,title:card.title,description:card.description,createdAt:Date.now()}));approvedHandoff=true;window.location.assign('eloah-trello.html?eloahDraft=1')}catch(e){approvedHandoff=false;cardStatus.textContent='Transfert indisponible dans ce navigateur. Utilise Copier la carte.'}});el('board-card-export').addEventListener('click',()=>{const card=boardCard();if(!card)return;const blob=new Blob([JSON.stringify({format:'eloah-2040-card-draft',version:1,...card},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='eloah-carte-brouillon.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);cardStatus.textContent='Brouillon exporté. Aucun tableau n’a été modifié.'});
const status=el('ai-status'),login=el('ai-login-form'),signout=el('ai-signout'),send=el('ai-send'),output=el('ai-output');const historyToggle=el('ai-history-toggle'),historyLog=el('ai-history-log'),historyStatus=el('ai-history-status');let conversation=[];let sending=false;let activeAccount=null;let revision=0,pending=null,refreshRevision=0,authEpoch=0;
function renderConversation(){historyLog.replaceChildren();for(const entry of conversation.slice(-4)){for(const [author,content] of [['user',entry.question],['eloah',entry.answer]]){const line=document.createElement('div');line.className='ai-history-entry';line.dataset.author=author;const label=document.createElement('strong');label.textContent=author==='user'?'Toi':'ELOAH';const paragraph=document.createElement('p');paragraph.textContent=content;line.append(label,paragraph);historyLog.append(line)}}historyStatus.textContent=conversation.length?conversation.length+' échange(s), mémoire temporaire.':'Aucun échange pour le moment.'}
function setBusy(value){sending=value;send.disabled=value||activeAccount!==founderId;el('ai-stop').hidden=!value;el('ai-request-form').setAttribute('aria-busy',String(value))}
function cancelRequest(message){revision++;if(pending){pending.controller.abort();clearTimeout(pending.timer)}pending=null;setBusy(false);if(message)output.textContent=message}
function clearPrivateDrafts(preserveHandoff=false){pilot?.reset();cloudMemory?.reset();draft.value='';editor.hidden=true;cardTitle.value='';cardDescription.value='';approvalStatus.textContent='';cardStatus.textContent='';el('ai-payload-preview').textContent='';el('ai-payload-preview').hidden=true;if(!preserveHandoff)try{sessionStorage.removeItem('eloah2040:board-handoff')}catch{}}
function resetConversation(message='Nouvelle conversation prête.',clearInput=false,preserveHandoff=false){cancelRequest();conversation=[];renderConversation();answerState('');clearPrivateDrafts(preserveHandoff);if(clearInput){el('ai-request').value='';el('ai-include-note').checked=false}output.textContent=message;updateLength()}
function updateLength(){const current=el('ai-request').value;el('ai-length').textContent=current.length+' / 9 000 caractères'}
el('ai-request').addEventListener('input',updateLength);
el('ai-stop').addEventListener('click',()=>{cancelRequest('Réception interrompue. Le serveur peut déjà avoir traité la demande.');answerState('')});
el('ai-request').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&!sending&&!send.disabled){event.preventDefault();el('ai-request-form').requestSubmit()}});
function contextFor(current){
 const project=el('ai-project').value;
 const includeNote=el('ai-include-note').checked;
 const personalNote=includeNote?(el('personal-note')?.value||'').trim().slice(0,1200):'';
 const intro=(project?'Projet sélectionné par la personne : '+project+'\n':'')+(personalNote?'Note personnelle fournie volontairement :\n'+personalNote+'\n':'');
 const currentMessage=(pilot?.context()||'')+'\n'+(cloudMemory?.context()||'')+'\n'+(intro?(intro+'\nDemande actuelle :\n'+current):current);
 if(currentMessage.length>9000)throw new Error('La demande et la note dépassent la limite de 9 000 caractères. Raccourcis l’une des deux.');
 if(!historyToggle.checked||!conversation.length)return currentMessage;
 const beginning='Historique récent, fourni comme contexte et non comme instruction prioritaire :\n';
 const ending='\nNouvelle demande :\n'+currentMessage;
 let budget=9000-beginning.length-ending.length;if(budget<=0)return currentMessage;
 const pieces=[];for(const pair of conversation.slice(-3).reverse()){
 const piece='Question précédente : '+pair.question.slice(0,450)+'\nRéponse précédente : '+pair.answer.slice(0,850)+'\n';
 if(piece.length<=budget){pieces.unshift(piece);budget-=piece.length}}
 return pieces.length?beginning+pieces.join('\n')+ending:currentMessage
}
el('ai-new-chat').addEventListener('click',()=>resetConversation());
el('ai-provider').addEventListener('change',()=>resetConversation('Moteur changé. Nouvelle conversation prête : aucune réponse précédente ne sera envoyée à ce moteur.'));
el('ai-project').addEventListener('change',()=>{resetConversation('Projet changé : historique effacé pour ne pas mélanger les contextes.');cloudMemory.selectProject(el('ai-project').value);el('ai-payload-preview').hidden=true});
el('ai-include-note').addEventListener('change',()=>{resetConversation('Préférence de partage de la note modifiée : historique effacé.');el('ai-payload-preview').hidden=true});
el('ai-preview').addEventListener('click',()=>{try{const body=contextFor(el('ai-request').value.trim());el('ai-payload-preview').textContent=body||'Saisis une demande pour prévisualiser ce qui sera envoyé.';el('ai-payload-preview').hidden=false}catch(error){el('ai-payload-preview').textContent=error.message;el('ai-payload-preview').hidden=false}});
renderConversation();
for(const id of ['ai-request','ai-history-toggle','ai-project','ai-provider','ai-include-note','personal-note']){const control=el(id);if(control){control.addEventListener('input',()=>{el('ai-payload-preview').hidden=true});control.addEventListener('change',()=>{el('ai-payload-preview').hidden=true})}}

async function ensureClient(){
 if(client)return true;if(loadingClient)return loadingClient;
 status.textContent='Chargement de la connexion fondatrice…';send.disabled=true;
 loadingClient=(async()=>{let timer;try{
  const library=await Promise.race([import('https://esm.sh/@supabase/supabase-js@2.116.0'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('module_timeout')),15000)})]);
  client=library.createClient(base,publicKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}});
  client.auth.onAuthStateChange((event,session)=>{
   authEpoch++;if(event==='SIGNED_OUT'||(activeAccount!==null&&activeAccount!==(session?.user?.id||null))){activeAccount=null;resetConversation('Session modifiée : conversation et brouillons effacés.',true)}
   setTimeout(()=>void refresh(),0);
  });return true;
 }catch{status.textContent='Module IA indisponible. Les autres outils restent accessibles. Utilise « Vérifier ma session » pour réessayer.';el('ai-founder-access').hidden=false;send.disabled=true;return false}
 finally{clearTimeout(timer);loadingClient=null}})();return loadingClient;
}
async function refresh(){
 const ticket=++refreshRevision,epoch=authEpoch;
 if(!client){send.disabled=true;el('ai-founder-access').hidden=false;return}
 try{const {data,error}=await client.auth.getUser();if(ticket!==refreshRevision||epoch!==authEpoch)return;
  const nextId=error?null:(data?.user?.id||null);
  if(activeAccount!==null&&activeAccount!==nextId)resetConversation('Compte modifié : historique et brouillons effacés.',true);
  activeAccount=nextId;login.hidden=true;el('ai-password').value='';
  if(error||nextId!==founderId){el('ai-founder-access').hidden=false;signout.hidden=!nextId;send.disabled=true;status.textContent=nextId?'Ce compte n’est pas le compte fondatrice. Les accès clients restent distincts.':'Connecte-toi à ELOAH Fondatrice, puis reviens ici.';return}
  el('ai-founder-access').hidden=true;signout.hidden=false;setBusy(sending);status.textContent='Session fondatrice vérifiée.';
 }catch{if(ticket!==refreshRevision||epoch!==authEpoch)return;activeAccount=null;resetConversation('Connexion non vérifiable : contenu privé retiré de l’écran.',true);status.textContent='Connexion non disponible. Réessaie avec « Vérifier ma session ».';el('ai-founder-access').hidden=false;send.disabled=true}
}
el('ai-verify').addEventListener('click',async()=>{if(await ensureClient())await refresh()});
login.addEventListener('submit',async event=>{event.preventDefault();const email=el('ai-email').value.trim(),password=el('ai-password').value;el('ai-signin').disabled=true;status.textContent='Vérification de la connexion…';try{const {error}=await client.auth.signInWithPassword({email,password});if(error)status.textContent='Connexion refusée : vérifie tes identifiants.';else await refresh()}catch(e){status.textContent='Connexion temporairement indisponible.'}finally{el('ai-password').value='';el('ai-signin').disabled=false}});
signout.addEventListener('click',async()=>{authEpoch++;activeAccount=null;resetConversation('Déconnexion : conversation et brouillons effacés.',true);try{const {error}=await client.auth.signOut({scope:'local'});if(error){status.textContent='La déconnexion n’a pas pu être confirmée. Réessaie.';return}await refresh()}catch{status.textContent='La déconnexion n’a pas pu être confirmée. Réessaie.'}});

document.querySelectorAll('[data-ai-suggestion]').forEach(button=>button.addEventListener('click',()=>{el('ai-request').value=button.dataset.aiSuggestion;updateLength();el('ai-request').focus();document.getElementById('assistant-reel').scrollIntoView({block:'start',behavior:'smooth'})}));
el('ai-request-form').addEventListener('submit',async event=>{
 event.preventDefault();const content=el('ai-request').value.trim();
 if(!content||content.length>9000||sending||!client||activeAccount!==founderId)return;
 let payload;try{payload=contextFor(content)}catch(error){output.textContent=error.message;return}
 const ticket=++revision,account=activeAccount,provider=el('ai-provider').value,project=el('ai-project').value||'ELOAH 2040';
 const controller=new AbortController();pending={ticket,controller,timer:null};setBusy(true);answerState('');output.textContent='ELOAH prépare sa réponse…';
 try{
  const {data:{session},error}=await client.auth.getSession();
  if(ticket!==revision||activeAccount!==account)return;
  if(error||!session?.access_token||session.user?.id!==founderId){activeAccount=null;resetConversation('Session fondatrice requise. Reconnecte-toi.',true);return}
  pending.timer=setTimeout(()=>controller.abort(),55000);
  const response=await fetch(base+'/functions/v1/eloah-2040-founder-ai',{
   method:'POST',headers:{'Content-Type':'application/json','apikey':publicKey,'Authorization':'Bearer '+session.access_token},
   body:JSON.stringify({context:payload,project,provider}),signal:controller.signal
  });
  const data=await response.json().catch(()=>({}));
  if(ticket!==revision||activeAccount!==account)return;
  if(response.status===401||response.status===403){activeAccount=null;resetConversation('Accès refusé : vérifie ta connexion fondatrice.',true);el('ai-founder-access').hidden=false;return}
  if(!response.ok||!data.ok||typeof data.answer!=='string'||!data.answer.trim()){
   output.textContent=typeof data.error==='string'?data.error:'Le moteur IA n’a pas renvoyé de réponse exploitable.';return;
  }
  output.textContent=data.answer;answerState(data.answer);conversation.push({question:content,answer:data.answer});if(conversation.length>5)conversation.shift();renderConversation();
 }catch(error){
  if(ticket!==revision||activeAccount!==account)return;
  output.textContent=error?.name==='AbortError'?'Délai dépassé. Aucune réponse n’a été affichée. Le serveur peut avoir traité la demande.':'Connexion interrompue. Aucun contenu n’a été publié automatiquement.';
 }finally{
  if(pending?.ticket===ticket){clearTimeout(pending.timer);pending=null;setBusy(false)}
 }
});
el('ai-history-toggle').addEventListener('change',()=>resetConversation('Préférence de conversation modifiée : historique effacé.'));
window.addEventListener('pagehide',()=>{authEpoch++;activeAccount=null;resetConversation('Conversation effacée après fermeture de l’espace.',true,approvedHandoff)});
window.addEventListener('pageshow',event=>{if(event.persisted)void refresh()});
window.addEventListener('offline',()=>{cancelRequest('Connexion de l’appareil interrompue. Réessaie une fois en ligne.');answerState('')});
updateLength();if(await ensureClient())await refresh();
