/* ELOAH — Assistant de projet V2. Les données restent locales, aucun envoi sans clic explicite. */
(()=>{
'use strict';
if(!window.eloahBuildContext)return;
const $id=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stamp=()=>new Date().toISOString();
const ensure=()=>{if(!state.pilot)state.pilot={objective:'',period:'',nextAction:'',facts:[],outputs:{}};return state.pilot};
function newDialog(id){let d=$id(id);if(!d){d=document.createElement('dialog');d.id=id;document.body.appendChild(d)}return d}
function savePilot(){save();drawStatus()}
function button(label,id){const b=document.createElement('button');b.type='button';b.id=id;b.className='accent';b.textContent=label;return b}
const style=document.createElement('style');
style.textContent='#eloah-pilot,#eloah-review-v2,#eloah-outputs{width:min(820px,95vw);max-height:93dvh;overflow:auto;border:1px solid var(--line);border-radius:17px;background:var(--panel);color:var(--ink);padding:24px}#eloah-pilot::backdrop,#eloah-review-v2::backdrop,#eloah-outputs::backdrop{background:#23252ba9}.eloah-v2-row{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:12px 0}.eloah-v2-row>*{min-width:0}.eloah-v2-field{display:block;margin:12px 0;font-size:13px}.eloah-v2-field input,.eloah-v2-field textarea,.eloah-v2-field select{width:100%;margin-top:5px}.eloah-v2-field textarea{min-height:75px}.eloah-v2-info{padding:12px;background:var(--tint);border-radius:10px;font-size:12px;line-height:1.65}.eloah-v2-list{display:grid;gap:8px;margin:14px 0}.eloah-v2-item{border:1px solid var(--line);border-radius:10px;padding:12px;overflow-wrap:anywhere}.eloah-v2-item small{color:var(--muted);display:block;margin:5px 0}.eloah-v2-close{float:right}#eloah-v2-status{font-size:12px;color:var(--muted);padding:8px 18px;border-bottom:1px solid var(--line)}#eloah-preview{min-height:230px;width:100%;font:12px/1.5 ui-monospace,monospace;white-space:pre-wrap}#eloah-v2-progress{font-size:12px;color:var(--purple)}.eloah-v2-check{display:flex;gap:9px;align-items:start;padding:7px 0;font-size:12px}.eloah-v2-check input{margin-top:3px}.eloah-v2-actions{display:flex;gap:8px;flex-wrap:wrap;padding:14px 0}.eloah-v2-actions button{font-size:12px}.eloah-v2-muted{color:var(--muted);font-size:12px}@media(max-width:650px){#eloah-pilot,#eloah-review-v2,#eloah-outputs{padding:16px}}';
document.head.appendChild(style);
function drawStatus(){
 const p=ensure(),n=p.facts.length,output=Object.keys(p.outputs).length;
 let el=$id('eloah-v2-status');if(!el){el=document.createElement('div');el.id='eloah-v2-status';$id('conversation-memory-status')?.after(el)}
 if(el)el.textContent='Pilotage ELOAH · '+n+' repère'+(n!==1?'s':'')+' documenté'+(n!==1?'s':'')+' · '+output+' livrable'+(output!==1?'s':'')+' suivi'+(output!==1?'s':'')+' · données locales · IA intégrée conditionnelle · sources locales';
}
function renderPilot(){
 const p=ensure(),d=newDialog('eloah-pilot');
 d.innerHTML='<button class="eloah-v2-close" id="ep-close">Fermer ×</button><h2>Pilotage du projet</h2><p class="eloah-v2-info">Tu définis ce qui est confirmé, proposé ou à vérifier. Seules les informations réellement saisies ici sont mémorisées. Aucune publication ni synchronisation automatique.</p>'
 +'<label class="eloah-v2-field">Objectif en cours<input id="ep-goal" maxlength="350" value="'+safe(p.objective)+'"></label>'
 +'<label class="eloah-v2-field">Période concernée<input id="ep-period" maxlength="160" value="'+safe(p.period)+'"></label>'
 +'<label class="eloah-v2-field">Prochaine étape décidée<input id="ep-next" maxlength="350" value="'+safe(p.nextAction)+'"></label>'
 +'<div class="eloah-v2-row"><button id="ep-save" class="primary">Enregistrer le pilotage</button></div>'
 +'<h3>Registre des informations</h3><div class="eloah-v2-list">'+(p.facts.map((f,i)=>'<div class="eloah-v2-item"><strong>'+safe(f.status)+'</strong> — '+safe(f.text)+'<small>Source : '+safe(f.source||'non renseignée')+' · ajout '+safe(new Date(f.at).toLocaleDateString('fr-FR'))+'</small><button data-fact-remove="'+i+'">Supprimer</button></div>').join('')||'<p class="eloah-v2-muted">Aucun repère renseigné.</p>')+'</div>'
 +'<label class="eloah-v2-field">Information à conserver<textarea id="ep-fact" maxlength="1500" placeholder="Une décision, une information vérifiée ou une question ouverte…"></textarea></label>'
 +'<label class="eloah-v2-field">Statut<select id="ep-state"><option>À vérifier</option><option>Confirmé par Sonia</option><option>Proposition</option></select></label>'
 +'<label class="eloah-v2-field">Provenance (obligatoire pour une confirmation)<input id="ep-source" maxlength="300" placeholder="Ex. décision de Sonia, document joint, URL vérifiée…"></label>'
 +'<button id="ep-add" class="primary">Ajouter au registre</button>';
 $id('ep-close').onclick=()=>d.close();
 $id('ep-save').onclick=()=>{p.objective=$id('ep-goal').value.trim();p.period=$id('ep-period').value.trim();p.nextAction=$id('ep-next').value.trim();savePilot();notify('Pilotage enregistré pour ce projet.')};
 $id('ep-add').onclick=()=>{const text=$id('ep-fact').value.trim(),status=$id('ep-state').value,source=$id('ep-source').value.trim();if(!text)return;if(status==='Confirmé par Sonia'&&!source){notify('Indique la provenance avant de marquer cette information comme confirmée.');return}p.facts.push({text,status,source,at:stamp()});savePilot();renderPilot()};
 d.querySelectorAll('[data-fact-remove]').forEach(b=>b.onclick=()=>{p.facts.splice(Number(b.dataset.factRemove),1);savePilot();renderPilot()});
 if(!d.open)d.showModal();
}
function pilotContext(){
 const p=ensure(),parts=['PILOTAGE ELOAH — INFORMATIONS SAISIES PAR SONIA (ne pas transformer les propositions en faits)'];
 if(p.objective)parts.push('Objectif : '+p.objective);
 if(p.period)parts.push('Période : '+p.period);
 if(p.nextAction)parts.push('Prochaine étape retenue : '+p.nextAction);
 if(p.facts.length)parts.push('Registre :\n'+p.facts.slice(-20).map(f=>'- ['+f.status+'] '+f.text+' ; provenance : '+(f.source||'non renseignée')).join('\n'));
 const outputEntries=Object.entries(p.outputs).filter(([k,v])=>v&&v.status);
 if(outputEntries.length)parts.push('Livrables enregistrés :\n'+outputEntries.slice(-12).map(([k,v])=>'- '+v.title+' : '+v.status+' ; enregistré le '+(v.at||'date inconnue')).join('\n'));
 return parts.length>1?parts.join('\n'):'Aucun pilotage structuré saisi dans ELOAH.';
}
function recognized(f){return /^text\//.test(f.blob?.type||'')||/\.(txt|md|csv|json|html|xml|yaml|yml)$/i.test(f.name)}
function otherProjects(){const prefix='eloah-project-v1:';const names=new Set((window.ELOAHUniverseRegistry||[]).filter(n=>n!==project));try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(prefix)&&k!==key)names.add(k.slice(prefix.length))}}catch{}return [...names].sort((a,b)=>a.localeCompare(b,'fr'))}
function otherContext(names){
 const sections=[];for(const name of names){try{const s=JSON.parse(localStorage.getItem('eloah-project-v1:'+name));if(!s){const scope=typeof eloahUniverseProfiles==='object'?eloahUniverseProfiles[name]?.scope:'';sections.push('UNIVERS : '+name+'\\nEspace référencé'+(scope?' ('+scope+')':'')+' ; aucune information locale consultable. Ne présume aucune activité, donnée ni connexion.');continue}const p=s.pilot||{};const lines=['UNIVERS : '+name];if(p.objective)lines.push('Objectif : '+p.objective);if(p.period)lines.push('Période : '+p.period);if(p.nextAction)lines.push('Prochaine étape : '+p.nextAction);for(const f of (p.facts||[]).slice(-5))lines.push('['+f.status+'] '+f.text+' (source : '+(f.source||'non précisée')+')');const last=(s.threads||[]).filter(t=>!t.excluded).slice(-2).flatMap(t=>t.messages||[]).slice(-3);for(const m of last)lines.push((m.role==='response'?'Réponse conservée':'Sonia')+' : '+m.text.slice(0,600));sections.push(lines.join('\n').slice(0,2500))}catch{}}
 return sections.length?'\n\nAUTRES UNIVERS — INCLUS EXPLICITEMENT PAR SONIA\n'+sections.join('\n\n'):'';
}
async function fileContext(ids){
 if(!ids.length)return '';
 let total=0;const parts=[];
 for(const id of ids.slice(0,5)){const f=files.find(x=>x.id===id);if(!f)continue;
  if(!recognized(f)){parts.push('[Fichier '+f.name+' : non lu, format non pris en charge pour extraction textuelle dans ELOAH. Joindre séparément dans ChatGPT.]');continue}
  try{const text=await f.blob.slice(0,18000).text();const fragment=text.slice(0,Math.max(0,10000-total));total+=fragment.length;parts.push('FICHIER LOCAL SÉLECTIONNÉ : '+f.name+'\nStatut : contenu réellement extrait du fichier présent sur cet appareil'+(fragment.length<text.length||f.blob.size>18000?' (extrait partiel)':'')+'\n---\n'+fragment+'\n---');if(total>=10000)break}catch{parts.push('Fichier '+f.name+' : lecture impossible, non consulté.')}
 }
 return parts.length?'\n\nSOURCES LOCALES — INCLUSES APRÈS SÉLECTION EXPLICITE\n'+parts.join('\n\n'):'';
}
let questionToOpen='';
function renderReview(question){
 questionToOpen=question;
 const d=newDialog('eloah-review-v2'),other=otherProjects();
 d.innerHTML='<button class="eloah-v2-close" id="er-close">Fermer ×</button><h2>Mission — '+safe(project)+'</h2>'
 +'<p class="eloah-v2-info">ELOAH prépare le dossier et sa mémoire ; ChatGPT exécute la demande avec les outils disponibles dans sa session. Aucun fichier local n’est envoyé automatiquement. Les informations confirmées et les propositions restent distinguées. Relis le texte avant tout transfert.</p>'
 +'<h3>Sources locales à transmettre</h3>'
 +'<div id="er-files">'+(files.length?files.map(f=>'<label class="eloah-v2-check"><input type="checkbox" data-file="'+safe(f.id)+'"> <span>'+safe(f.name)+' <small class="eloah-v2-muted">· '+(recognized(f)?'texte extractible':'nom seulement — joindre ce fichier dans ChatGPT')+'</small></span></label>').join(''):'<p class="eloah-v2-muted">Aucun fichier importé dans cet espace.</p>')+'</div>'
 +(other.length?'<details><summary>Inclure explicitement d’autres projets (travail transversal)</summary>'+other.map(n=>'<label class="eloah-v2-check"><input type="checkbox" data-universe="'+safe(n)+'"> '+safe(n)+(localStorage.getItem('eloah-project-v1:'+n)?'':' <small class="eloah-v2-muted"> · aucune mémoire locale</small>')+'</label>').join('')+'</details>':'')
 +'<label class="eloah-v2-field">Contexte transmis à ChatGPT<textarea id="eloah-preview" spellcheck="false"></textarea></label>'
 +'<p id="eloah-v2-progress" role="status"></p>'
 +'<div class="eloah-v2-actions"><button class="primary" id="er-direct">Répondre dans ELOAH (IA)</button><button id="er-open">Ouvrir dans ChatGPT</button><button id="er-copy">Copier le contexte</button><button id="er-refresh">Actualiser les sources</button></div>'
 +'<p class="eloah-v2-muted">Les documents PDF, DOCX, images et vidéos ne sont pas lus automatiquement ici. Pour les utiliser, joins-les dans ChatGPT. Les demandes longues peuvent nécessiter un collage manuel.</p>';
 $id('er-close').onclick=()=>d.close();
 const preview=$id('eloah-preview'),progress=$id('eloah-v2-progress');
 async function refresh(){
  progress.textContent='Préparation des sources choisies…';
  const selected=[...d.querySelectorAll('[data-file]:checked')].map(el=>el.dataset.file);
  const universes=[...d.querySelectorAll('[data-universe]:checked')].map(el=>el.dataset.universe);
  const docs=await fileContext(selected);
  preview.value=window.eloahBuildContext(question)+'\n\n'+pilotContext()+otherContext(universes)+docs+'\n\nÉTAT DES PIÈCES : '+files.length+' fichier(s) inventorié(s) dans ELOAH, '+selected.length+' explicitement sélectionné(s). Les fichiers non sélectionnés et leurs contenus ne sont pas transmis. Aucun accès aux sites, brouillons distants ou connecteurs n’est établi par ce contexte.';
  progress.textContent='Dossier préparé : '+selected.length+' fichier(s) sélectionné(s), '+universes.length+' autre(s) univers. Vérifie et ajuste avant l’ouverture.';
 }
 $id('er-refresh').onclick=refresh;
 d.querySelectorAll('[data-file],[data-universe]').forEach(b=>b.onchange=refresh);
 $id('er-copy').onclick=async()=>{try{await navigator.clipboard.writeText(preview.value);progress.textContent='Contexte copié.'}catch{preview.select();progress.textContent='Copie manuellement le texte sélectionné.'}};
 $id('er-direct').onclick=async()=>{
  const prepared=preview.value.trim();if(!prepared){progress.textContent='Prépare le contexte avant de continuer.';return}
  if(prepared.length>24000){progress.textContent='Le contexte dépasse 24 000 caractères. Réduis-le dans la zone de texte ou ouvre ChatGPT.';return}
  if(!window.supabase){progress.textContent='Connexion Supabase indisponible. Utilise ChatGPT.';return}
  if(!window.confirm('Lancer une réponse IA dans ELOAH ? Cette action transmet le texte affiché au service IA et peut consommer des crédits API. Aucun fichier non sélectionné ni action de publication ne sera envoyé.'))return;
  const btn=$id('er-direct');btn.disabled=true;progress.textContent='Connexion au compte ELOAH…';
  try{
    const endpoint='https://voytsqyorhoveurnguxn.supabase.co',publishable='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
    const client=window.supabase.createClient(endpoint,publishable,{auth:{storageKey:'eloah-cloud-auth-v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data,error}=await client.auth.getSession();
    if(error||!data?.session?.access_token)throw Error('Connecte-toi dans « Compte & sauvegardes » pour utiliser l’IA intégrée.');
    progress.textContent='Rédaction de la réponse dans ELOAH…';
    const res=await fetch(endpoint+'/functions/v1/eloah-assistant',{method:'POST',headers:{authorization:'Bearer '+data.session.access_token,apikey:publishable,'content-type':'application/json'},body:JSON.stringify({project,context:prepared})});
    const payload=await res.json().catch(()=>({}));
    if(!res.ok||!payload.ok||!payload.answer)throw Error(payload.error||'Le service n’a pas renvoyé de réponse vérifiable.');
    addMessage('user',question);
    addMessage('response',String(payload.answer));
    const t=current(),p=ensure(),id=t.id+':'+(t.messages.length-1);
    p.outputs[id]={title:t.title,status:'Brouillon',at:stamp()};
    savePilot();
    $id('message-input').value='';d.close();renderChat();
    notify('Réponse IA ajoutée au projet comme brouillon, sans publication.');
  }catch(err){progress.textContent=err?.message||'Erreur de connexion. Tu peux ouvrir ChatGPT.'}
  finally{btn.disabled=false}
 };
 $id('er-open').onclick=async()=>{const prepared=preview.value.trim();if(!prepared)return;let ok=false;
  if(encodeURIComponent(prepared).length>15000){try{await navigator.clipboard.writeText(prepared);progress.textContent='Contexte copié. Colle-le dans la nouvelle conversation ChatGPT.';ok=true}catch{preview.select();progress.textContent='Contexte trop long : copie le texte sélectionné puis réessaie après l’avoir copié.';return}}
  const u=ok||encodeURIComponent(prepared).length>15000?'https://chatgpt.com/':'https://chatgpt.com/?q='+encodeURIComponent(prepared);
  const w=window.open(u,'_blank','noopener,noreferrer');
  // Avec noopener, certains navigateurs renvoient null malgré une ouverture réussie.
  addMessage('user',question);$id('message-input').value='';d.close();
  notify('Demande conservée dans ELOAH. ChatGPT s’ouvre séparément ; colle la réponse dans ELOAH pour l’archiver.');
 };
 d.showModal();refresh();
}
function downloadBlob(data,name,mime){const blob=data instanceof Blob?data:new Blob([data],{type:mime||'text/plain;charset=utf-8'});download(blob,name)}
function filename(s){return String(s||'livrable').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'livrable'}
function wordXml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
async function docxExport(text,title){
 if(!window.JSZip)throw Error('La bibliothèque de création DOCX ne s’est pas chargée. Réessaie ou exporte en Markdown.');
 const zip=new window.JSZip();const paras=[title,'',...text.split(/\r?\n/)].slice(0,4000).map(line=>'<w:p><w:r><w:t xml:space="preserve">'+wordXml(line)+'</w:t></w:r></w:p>').join('');
 const ct='<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
 const rel='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
 const document='<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+paras+'<w:sectPr/></w:body></w:document>';
 zip.file('[Content_Types].xml',ct);zip.folder('_rels').file('.rels',rel);zip.folder('word').file('document.xml',document);
 return await zip.generateAsync({type:'blob',compression:'DEFLATE'});
}
function renderOutputs(){
 const d=newDialog('eloah-outputs'),p=ensure(),items=[];
 for(const t of state.threads)for(let i=0;i<(t.messages||[]).length;i++){const m=t.messages[i];if(m.role==='response')items.push({id:t.id+':'+i,text:m.text,title:t.title,date:m.date})}
 items.reverse();
 d.innerHTML='<button class="eloah-v2-close" id="eo-close">Fermer ×</button><h2>Livrables du projet</h2><p class="eloah-v2-info">Un livrable apparaît ici lorsqu’une vraie réponse a été conservée dans ELOAH via « Coller une réponse ». Son statut n’est jamais deviné. Export DOCX et Markdown depuis son contenu réel ; aucune publication automatique.</p>'
 +'<div class="eloah-v2-list">'+(items.length?items.map(x=>{const v=p.outputs[x.id]||{};return '<article class="eloah-v2-item"><strong>'+safe(x.title)+'</strong><small>Réponse conservée le '+safe(new Date(x.date).toLocaleString('fr-FR'))+' · '+x.text.length+' caractères</small><p>'+safe(x.text.slice(0,250))+(x.text.length>250?'…':'')+'</p><label class="eloah-v2-field">Statut<select data-output-state="'+safe(x.id)+'">'+['Brouillon','À valider','Validé par Sonia','Publié (confirmé manuellement)'].map(y=>'<option '+((v.status||'Brouillon')===y?'selected':'')+'>'+y+'</option>').join('')+'</select></label><div class="eloah-v2-actions"><button data-md="'+safe(x.id)+'">Télécharger .md</button><button data-docx="'+safe(x.id)+'">Télécharger .docx</button></div></article>'}).join(''):'<p class="eloah-v2-muted">Aucune réponse conservée. Utilise « Coller une réponse » après avoir travaillé dans ChatGPT.</p>')+'</div><p id="eo-status" role="status"></p>';
 $id('eo-close').onclick=()=>d.close();
 function item(id){return items.find(x=>x.id===id)}
 d.querySelectorAll('[data-output-state]').forEach(el=>el.onchange=()=>{const x=item(el.dataset.outputState);if(!x)return;p.outputs[x.id]={title:x.title,status:el.value,at:stamp()};savePilot();$id('eo-status').textContent='Statut enregistré. Il ne constitue pas une preuve de publication externe.'});
 d.querySelectorAll('[data-md]').forEach(el=>el.onclick=()=>{const x=item(el.dataset.md);if(x)downloadBlob('# '+x.title+'\n\n'+x.text,filename(project+'-'+x.title)+'.md','text/markdown;charset=utf-8')});
 d.querySelectorAll('[data-docx]').forEach(el=>el.onclick=async()=>{const x=item(el.dataset.docx);if(!x)return;el.disabled=true;$id('eo-status').textContent='Création du document…';try{const doc=await docxExport(x.text,x.title);downloadBlob(doc,filename(project+'-'+x.title)+'.docx');$id('eo-status').textContent='Document DOCX créé à partir de la réponse conservée.'}catch(e){$id('eo-status').textContent=e.message}finally{el.disabled=false}});
 if(!d.open)d.showModal();
}
const bar=document.querySelector('.composer .tools');if(bar){const b1=button('Pilotage & sources','eloah-pilot-button'),b2=button('Livrables','eloah-output-button');bar.prepend(b2);bar.prepend(b1);b1.onclick=renderPilot;b2.onclick=renderOutputs}
const composer=$id('compose');
composer.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const question=$id('message-input').value.trim();if(question)renderReview(question)},true);
drawStatus();
})();