/* ELOAH 2040 · Mission Desk: validated internal planning, no external actions. */
export function mountMissionDesk({getClient,isFounder,founderId}){
 const host=document.getElementById('assistant-reel');
 if(!host)return {reset:()=>{}};
 const panel=document.createElement('section');
 panel.id='eloah-mission-desk';panel.className='approval-box';
 panel.innerHTML='<div class="emd-heading"><div><p class="emd-eyebrow">SONIA OS · CADRE A0 → A3</p><h3>Centre de missions</h3><p>Préparer, contrôler et documenter une mission. Seuls les livrables internes A0/A1 peuvent être finalisés ici : aucun mail, paiement, publication ou action externe.</p></div><button id="emd-reload" type="button">Actualiser mes missions</button></div>'
 +'<div class="emd-columns"><section class="emd-create"><h4>Nouvelle mission</h4><form id="emd-create-form">'
 +'<label for="emd-universe">Univers</label><select id="emd-universe" required><option>ELOAH</option><option>SONIA OS</option><option>Power &amp; Glam</option><option>The Crew Orchies</option><option>PARISIS ENGINE</option><option>Sonia Velka</option><option>Le Lion Blanc</option><option>Foi &amp; spiritualité</option></select>'
 +'<label for="emd-title">Titre</label><input id="emd-title" type="text" maxlength="180" required placeholder="Ex. Préparer une campagne The Crew">'
 +'<label for="emd-objective">Objectif</label><textarea id="emd-objective" maxlength="2000" rows="3" required placeholder="Que doit produire cette mission ?"></textarea>'
 +'<label for="emd-level">Niveau de risque</label><select id="emd-level"><option value="0">A0 · Analyse interne</option><option value="1" selected>A1 · Préparation de contenu</option><option value="2">A2 · Action externe à autoriser séparément</option><option value="3">A3 · Action sensible, exécution interdite ici</option></select>'
 +'<button type="submit" id="emd-create-btn">Créer le dossier de mission</button></form></section>'
 +'<section class="emd-list-panel"><div class="emd-list-heading"><h4>Mes missions enregistrées</h4><small id="emd-total">—</small></div><div class="emd-list" id="emd-list"><p>Aucune lecture avant connexion.</p></div></section></div>'
 +'<section id="emd-detail" class="emd-detail" hidden><div class="emd-detail-head"><div><span id="emd-stage" class="emd-pill"></span><h4 id="emd-selected-title"></h4><p id="emd-selected-info"></p></div><button type="button" id="emd-close">Fermer le dossier</button></div>'
 +'<p id="emd-selected-objective" class="emd-goal"></p><label for="emd-plan">Plan / livrable de travail</label><textarea id="emd-plan" maxlength="9000" rows="8" placeholder="Rédige un plan ou reprends une réponse IA, puis sauvegarde-le."></textarea>'
 +'<div class="emd-actions"><button type="button" id="emd-prepare">Faire préparer par ELOAH IA</button><button type="button" id="emd-copyanswer">Reprendre la dernière réponse IA</button><button type="button" id="emd-saveplan">Sauvegarder ce plan</button><button type="button" id="emd-submit">Soumettre à validation</button></div>'
 +'<div class="emd-approval" id="emd-approval" hidden><p>Relis le plan intégralement. Cette confirmation valide seulement le plan documentaire, pas l’autorisation d’intervenir dans une application externe.</p><label><input type="checkbox" id="emd-confirm"> Je valide ce plan</label></div>'
 +'<div class="emd-actions"><button type="button" id="emd-approve">Valider le plan</button><button type="button" id="emd-reject">Refuser / révoquer</button><button type="button" id="emd-finalize">Enregistrer le livrable interne</button><button type="button" id="emd-archive">Archiver</button></div>'
 +'<details id="emd-audit"><summary>Historique de cette mission</summary><button id="emd-events" type="button">Lire le journal</button><div id="emd-event-list"></div></details>'
 +'</section><p id="emd-status" role="status" aria-live="polite">Connexion fondatrice nécessaire pour créer ou retrouver des missions.</p>'
 +'<p class="emd-note">Chaque changement est journalisé sur le serveur, avec version et détection des conflits entre appareils. Une mission approuvée A2/A3 ne déclenche aucune exécution. Les dossiers existants SONIA OS restent inchangés.</p>';
 const prev=document.getElementById('eloah-agent-network');
 if(prev)prev.after(panel);else host.append(panel);
 if(location.hash==='#eloah-mission-desk')requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}));
 if(!document.getElementById('emd-style')){
  const style=document.createElement('style');style.id='emd-style';
  style.textContent='#eloah-mission-desk{margin:18px 0}#eloah-mission-desk .emd-eyebrow{font-size:11px;letter-spacing:.14em;opacity:.75}#eloah-mission-desk .emd-heading,#eloah-mission-desk .emd-detail-head,#eloah-mission-desk .emd-list-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}#eloah-mission-desk .emd-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:14px;margin:16px 0}#eloah-mission-desk .emd-create,#eloah-mission-desk .emd-list-panel,#eloah-mission-desk .emd-detail{border:1px solid var(--line);padding:16px;border-radius:12px;min-width:0}#eloah-mission-desk h4{font-size:17px;margin:0 0 12px}#eloah-mission-desk label:not(.emd-approval label){display:block;font-weight:650;font-size:13px;margin:12px 0 7px}#eloah-mission-desk input[type=text],#eloah-mission-desk textarea,#eloah-mission-desk select{display:block;width:100%;max-width:100%;min-width:0;box-sizing:border-box;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:9px;padding:10px;font:inherit;font-size:16px}#eloah-mission-desk .emd-list{display:grid;gap:9px;max-height:390px;overflow:auto}#eloah-mission-desk .emd-item{display:block;width:100%;text-align:left;border:1px solid var(--line);padding:12px;border-radius:9px;background:transparent;color:inherit;cursor:pointer}#eloah-mission-desk .emd-item[aria-current=true]{outline:2px solid var(--gold);outline-offset:1px}#eloah-mission-desk .emd-item strong,#eloah-mission-desk .emd-item small{display:block;overflow-wrap:anywhere}#eloah-mission-desk .emd-item small,#eloah-mission-desk .emd-note,#eloah-mission-desk .emd-goal{font-size:12px;opacity:.82;line-height:1.6}#eloah-mission-desk .emd-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}#eloah-mission-desk .emd-actions button,#eloah-mission-desk .emd-heading button{min-height:44px;white-space:normal}#eloah-mission-desk .emd-detail{margin:14px 0}#eloah-mission-desk .emd-pill{display:inline-block;font-size:12px;padding:5px 10px;border-radius:30px;border:1px solid var(--line)}#eloah-mission-desk .emd-approval{padding:12px;border:1px solid var(--line);border-radius:10px;margin:12px 0}#eloah-mission-desk .emd-approval label{font-weight:650}#eloah-mission-desk .emd-approval input{margin-right:6px}#eloah-mission-desk details{padding:12px 0}#eloah-mission-desk summary{cursor:pointer}#eloah-mission-desk .emd-event-row{margin:8px 0;padding:9px;border-bottom:1px solid var(--line);font-size:12px}#eloah-mission-desk #emd-status{font-size:13px;line-height:1.6}@media(max-width:700px){#eloah-mission-desk .emd-columns{grid-template-columns:1fr}#eloah-mission-desk .emd-create,#eloah-mission-desk .emd-list-panel,#eloah-mission-desk .emd-detail{padding:12px}#eloah-mission-desk .emd-actions{display:grid;grid-template-columns:1fr}#eloah-mission-desk .emd-actions button,#eloah-mission-desk .emd-heading button{width:100%}}';
  document.head.append(style);
 }
 const $=id=>document.getElementById(id);
 let missions=[],selected=null,epoch=0,busy=false;
 const stateLabels={draft:'Brouillon',ready_for_review:'À valider',approved:'Plan validé',completed:'Livrable enregistré',rejected:'Refusé',archived:'Archivé'};
 const announce=message=>{$('emd-status').textContent=message};
 const lock=(on)=>{
  busy=on;for(const id of ['emd-reload','emd-create-btn','emd-prepare','emd-copyanswer','emd-saveplan','emd-submit','emd-approve','emd-reject','emd-finalize','emd-archive','emd-events'])$(id).disabled=on;
 };
 function reset(){
  epoch++;missions=[];selected=null;$('emd-detail').hidden=true;$('emd-list').replaceChildren();
  $('emd-list').textContent='Clique sur « Actualiser mes missions » pour consulter ton espace.';
  $('emd-total').textContent='—';$('emd-create-form').reset();$('emd-plan').value='';
  $('emd-event-list').replaceChildren();$('emd-confirm').checked=false;announce('Aucune mission chargée dans cet écran.');
 }
 async function session(){
  if(!isFounder())throw Error('Ouvre la session ELOAH Fondatrice avant de poursuivre.');
  const client=getClient();if(!client)throw Error('Connexion au cloud indisponible.');
  const {data:verified,error}=await client.auth.getUser();
  if(error||verified?.user?.id!==founderId)throw Error('Identité fondatrice non vérifiée.');
  return client;
 }
 async function rpc(action,record={},values={}){
  const client=await session();
  const request_key=crypto.randomUUID();
  const {data,error}=await client.rpc('eloah_mission_ui_action',{
   p_owner:founderId,p_action:action,p_request_key:request_key,
   p_mission_id:record?.id||null,p_expected_version:record?.version||null,p_values:values
  });
  if(error)throw Error(/Version conflict/i.test(error.message)?'Mission modifiée ailleurs : actualise puis relis.':'Opération refusée par le serveur : '+(error.code==='42501'?'accès non autorisé':error.message));
  if(!data?.ok||!data.mission)throw Error('Aucune sauvegarde confirmée.');
  return data.mission;
 }
 async function read(){
  const client=await session();
  const {data,error}=await client.from('eloah_mission_desk')
   .select('id,universe,title,objective,autonomy_level,state,plan,result_text,version,created_at,updated_at')
   .eq('owner_id',founderId).order('updated_at',{ascending:false}).limit(40);
  if(error)throw Error('Lecture des missions refusée.');
  return data||[];
 }
 function renderList(){
  const list=$('emd-list');list.replaceChildren();$('emd-total').textContent=missions.length+' affichée(s)';
  if(!missions.length){list.textContent='Aucune mission enregistrée pour ce compte.';return}
  for(const m of missions){
   const b=document.createElement('button');b.type='button';b.className='emd-item';
   b.setAttribute('aria-current',String(selected?.id===m.id));
   const strong=document.createElement('strong');strong.textContent=m.title;
   const small=document.createElement('small');small.textContent=m.universe+' · A'+m.autonomy_level+' · '+(stateLabels[m.state]||m.state);
   b.append(strong,small);b.onclick=()=>pick(m.id);list.append(b);
  }
 }
 function buttons(){
  if(!selected)return;
  const s=selected.state,planSaved=selected.plan&&selected.plan===$('emd-plan').value.trim();
  const editable=['draft','rejected'].includes(s);
  $('emd-plan').readOnly=!editable;
  $('emd-saveplan').hidden=!editable;
  $('emd-copyanswer').hidden=!editable;
  $('emd-prepare').hidden=['completed','archived'].includes(s);
  $('emd-submit').hidden=s!=='draft';
  $('emd-submit').disabled=busy||!planSaved;
  $('emd-approval').hidden=s!=='ready_for_review';
  $('emd-approve').hidden=s!=='ready_for_review';
  $('emd-approve').disabled=busy||!$('emd-confirm').checked;
  $('emd-reject').hidden=!['ready_for_review','approved'].includes(s);
  $('emd-finalize').hidden=s!=='approved'||selected.autonomy_level>1;
  $('emd-archive').hidden=!['draft','rejected','completed'].includes(s);
  $('emd-stage').textContent='A'+selected.autonomy_level+' · '+(stateLabels[s]||s);
 }
 function pick(id){
  selected=missions.find(m=>m.id===id)||null;
  const d=$('emd-detail');d.hidden=!selected;
  $('emd-event-list').replaceChildren();$('emd-audit').open=false;$('emd-confirm').checked=false;
  if(!selected){renderList();return}
  $('emd-selected-title').textContent=selected.title;
  $('emd-selected-objective').textContent=selected.objective;
  $('emd-selected-info').textContent=selected.universe+' · Version '+selected.version+' · Mise à jour : '+new Date(selected.updated_at).toLocaleString('fr-FR');
  $('emd-plan').value=selected.plan||'';
  buttons();renderList();
 }
 async function refresh(selectId){
  if(busy)return;
  const token=++epoch;lock(true);announce('Lecture des missions autorisées…');
  try{
   const rows=await read();
   if(token!==epoch||!isFounder())return;
   missions=rows;
   const found=rows.find(m=>m.id===(selectId||selected?.id));
   selected=null;renderList();if(found)pick(found.id);
   announce(rows.length+' dossier(s) chargé(s). Aucun agent exécuté.');
  }catch(e){if(token===epoch){reset();announce(e.message)}}
  finally{lock(false);buttons()}
 }
 async function mutate(action,values={}){
  if(!selected||busy)return;
  const old=selected,token=++epoch;lock(true);announce('Vérification et écriture du journal…');
  try{
   const updated=await rpc(action,old,values);
   if(token!==epoch||!isFounder())return;
   missions=[updated,...missions.filter(m=>m.id!==updated.id)].sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
   pick(updated.id);
   announce(action==='finalize'?'Livrable documentaire interne enregistré. Aucune action externe effectuée.':'Mission actualisée et changement journalisé.');
  }catch(e){if(token===epoch)announce(e.message)}
  finally{lock(false);buttons()}
 }
 $('emd-reload').onclick=()=>refresh();
 $('emd-create-form').onsubmit=async e=>{
  e.preventDefault();if(busy||!e.currentTarget.reportValidity())return;
  const values={title:$('emd-title').value.trim(),objective:$('emd-objective').value.trim(),universe:$('emd-universe').value,autonomy_level:Number($('emd-level').value)};
  const token=++epoch;lock(true);announce('Création sécurisée du dossier…');
  try{
   const result=await rpc('create',null,values);
   if(token!==epoch||!isFounder())return;
   missions=[result,...missions];$('emd-create-form').reset();pick(result.id);
   announce('Mission créée et inscrite au journal. Aucun agent déclenché.');
  }catch(e){if(token===epoch)announce(e.message)}
  finally{lock(false);buttons()}
 };
 $('emd-plan').oninput=buttons;
 $('emd-saveplan').onclick=()=>mutate('save_plan',{plan:$('emd-plan').value.trim()});
 $('emd-submit').onclick=()=>mutate('submit');
 $('emd-confirm').onchange=buttons;
 $('emd-approve').onclick=()=>{
  if(!$('emd-confirm').checked)return announce('Relis puis coche « Je valide ce plan ».');
  mutate('approve',{confirmation:'Je valide ce plan'});
 };
 $('emd-reject').onclick=()=>mutate('reject');
 $('emd-finalize').onclick=()=>{
  if(selected?.autonomy_level>1)return announce('Actions A2 et A3 interdites dans ce centre.');
  mutate('finalize');
 };
 $('emd-archive').onclick=()=>mutate('archive');
 $('emd-close').onclick=()=>pick(null);
 $('emd-prepare').onclick=()=>{
  if(!selected)return;
  const input=$('ai-request');if(!input)return announce('Module IA non disponible.');
  input.value='Prépare un livrable documentaire pour cette mission ELOAH. Ne réalise aucune action externe et ne prétends pas avoir accédé à des comptes ou dossiers privés. Distingue faits vérifiés, hypothèses et étapes à confirmer.\nUnivers : '+selected.universe+'\nNiveau : A'+selected.autonomy_level+'\nMission : '+selected.title+'\nObjectif : '+selected.objective+'\nRends un plan utilisable à relire, avec étapes, risques et critères de réussite.';
  input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();input.scrollIntoView({block:'center',behavior:'smooth'});
  announce('Demande préparée dans ELOAH Intelligence. Clique sur « Envoyer » dans l’assistant pour obtenir une réponse.');
 };
 $('emd-copyanswer').onclick=()=>{
  if(!selected||!['draft','rejected'].includes(selected.state))return;
  const src=$('ai-output');if(!src||$('ai-copy')?.disabled)return announce('Aucune réponse IA disponible à reprendre.');
  const value=src.textContent.trim();if(!value)return announce('Aucune réponse exploitable.');
  $('emd-plan').value=value.slice(0,9000);buttons();
  announce('Réponse reprise dans un brouillon non enregistré. Relis et sauvegarde le plan.');
 };
 $('emd-events').onclick=async()=>{
  if(!selected||busy)return;const token=++epoch,missionId=selected.id;
  lock(true);const area=$('emd-event-list');area.replaceChildren();
  try{
   const client=await session();
   const {data,error}=await client.from('eloah_mission_desk_events')
    .select('event_type,before_state,after_state,created_at')
    .eq('owner_id',founderId).eq('mission_id',missionId).order('created_at',{ascending:false}).limit(30);
   if(error)throw Error('Journal indisponible.');
   if(token!==epoch||selected?.id!==missionId||!isFounder())return;
   if(!data?.length)area.textContent='Aucun événement.';
   for(const item of data||[]){
    const div=document.createElement('div');div.className='emd-event-row';
    div.textContent=new Date(item.created_at).toLocaleString('fr-FR')+' · '+item.event_type+' · '+(item.before_state||'création')+' → '+(item.after_state||'—');
    area.append(div);
   }
  }catch(e){if(token===epoch)announce(e.message)}
  finally{lock(false);buttons()}
 };
 return {reset};
}
