/* ELOAH 2040 · Lecture seule du réseau SONIA OS existant. */
export function mountAgentNetwork({getClient,isFounder,founderId}) {
 const host=document.getElementById('assistant-reel');
 if(!host)return {reset:()=>{}};
 const box=document.createElement('section');
 box.id='eloah-agent-network';box.className='approval-box';
 box.innerHTML='<h3>Mon réseau d’agents · SONIA OS</h3><p>Un aperçu des enregistrements réels de SONIA OS, sans déclencher d’agent ni exécuter de mission.</p>'
  +'<div class="ean-actions"><button id="ean-refresh" type="button">Consulter mon réseau</button> <a href="sonia-os.html">Ouvrir SONIA OS ↗</a> <a href="eloah-monitor.html">Supervision ↗</a></div>'
  +'<div id="ean-kpis" class="ean-grid" hidden></div><div id="ean-missions" class="ean-list"></div>'
  +'<p id="ean-status" role="status">Connecte-toi au compte fondatrice, puis choisis « Consulter mon réseau ».</p>'
  +'<p class="ean-small">Un agent enregistré n’est pas forcément en cours d’exécution. Les connexions, les publications et les automatisations ne sont pas lancées par cette page.</p>';
 const prior=document.getElementById('eloah-cloud-memory');
 if(prior)prior.after(box);else host.append(box);
 if(!document.getElementById('ean-style')){
  const style=document.createElement('style');style.id='ean-style';
  style.textContent='#eloah-agent-network{margin-top:18px}#eloah-agent-network .ean-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:12px 0}#eloah-agent-network .ean-actions>a{font-size:13px}#eloah-agent-network .ean-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}#eloah-agent-network .ean-kpi{border:1px solid var(--line);border-radius:10px;padding:14px;min-width:0}#eloah-agent-network .ean-kpi strong{display:block;font-size:25px;margin-top:8px}#eloah-agent-network .ean-kpi small{display:block;font-size:12px}#eloah-agent-network .ean-list{display:grid;gap:9px;margin-top:14px}#eloah-agent-network .ean-item{border:1px solid var(--line);border-radius:9px;padding:12px}#eloah-agent-network .ean-item strong,#eloah-agent-network .ean-item small{display:block;overflow-wrap:anywhere}#eloah-agent-network .ean-item small,#eloah-agent-network .ean-small{font-size:12px;opacity:.8;line-height:1.6}@media(max-width:650px){#eloah-agent-network .ean-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}';
  document.head.append(style);
 }
 const $=id=>document.getElementById(id);
 let generation=0;
 function reset(){generation++;$('ean-kpis').replaceChildren();$('ean-kpis').hidden=true;$('ean-missions').replaceChildren();$('ean-status').textContent='Aucune donnée privée affichée. Consulter mon réseau après connexion.';}
 function card(label,value){
  const item=document.createElement('div');item.className='ean-kpi';
  const caption=document.createElement('small');caption.textContent=label;
  const strong=document.createElement('strong');strong.textContent=String(value);
  item.append(caption,strong);$('ean-kpis').append(item);
 }
 $('ean-refresh').addEventListener('click',async()=>{
  const token=++generation;reset(); // effacer toute session précédente avant lecture
  const thisRun=++generation,button=$('ean-refresh');button.disabled=true;
  $('ean-status').textContent='Lecture des informations autorisées…';
  try{
   if(!isFounder())throw Error('Connexion fondatrice requise.');
   const client=getClient();if(!client)throw Error('Connexion Supabase indisponible.');
   const {data:identity,error:identityError}=await client.auth.getUser();
   if(identityError||identity?.user?.id!==founderId||!isFounder())throw Error('Session fondatrice non vérifiée.');
   const own=table=>client.from(table);
   const [agents,missions,tasks,automations]=await Promise.all([
    own('sonia_os_agents').select('id,name,status',{count:'exact'}).eq('owner_id',founderId).order('name').limit(100),
    own('sonia_os_missions').select('id,title,status,human_approval_required',{count:'exact'}).eq('owner_id',founderId).order('created_at',{ascending:false}).limit(8),
    own('sonia_os_tasks').select('id,status,approval_status',{count:'exact',head:true}).eq('owner_id',founderId),
    own('sonia_os_automations').select('id,name,status',{count:'exact'}).eq('owner_id',founderId).limit(30)
   ]);
   if(thisRun!==generation||!isFounder())return;
   if([agents,missions,tasks,automations].some(x=>x.error))throw Error('Lecture de certaines tables SONIA OS refusée. Les chiffres ne seront pas présentés comme complets.');
   const kpis=$('ean-kpis');kpis.replaceChildren();
   card('Agents référencés',agents.count??'—');
   card('Missions enregistrées',missions.count??'—');
   card('Tâches enregistrées',tasks.count??'—');
   card('Automatisations définies',automations.count??'—');
   kpis.hidden=false;
   const list=$('ean-missions');list.replaceChildren();
   const title=document.createElement('strong');title.textContent='Dernières missions enregistrées';list.append(title);
   for(const item of missions.data||[]){
    const row=document.createElement('div');row.className='ean-item';
    const name=document.createElement('strong');name.textContent=item.title||'Mission sans titre';
    const info=document.createElement('small');info.textContent='Statut : '+(item.status||'non renseigné')+(item.human_approval_required?' · Validation humaine prévue':'');
    row.append(name,info);list.append(row);
   }
   if(!missions.data?.length){const p=document.createElement('p');p.textContent='Aucune mission visible.';list.append(p)}
   $('ean-status').textContent='Données lues avec ton compte fondatrice. Affichage en lecture seule, sans action exécutée.';
  }catch(e){if(thisRun===generation){$('ean-kpis').replaceChildren();$('ean-kpis').hidden=true;$('ean-missions').replaceChildren();$('ean-status').textContent=e.message}}
  finally{button.disabled=false}
 });
 return {reset};
}
