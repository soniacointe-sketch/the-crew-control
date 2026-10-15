/* ELOAH Monitor · vérification publique de GitHub Actions et liste manuelle Supabase.
 * Ne lit que des métadonnées de CI publiques. Aucune connexion Supabase depuis ce module.
 */
(()=>{'use strict';
const app=document.getElementById('app'),refreshBtn=document.getElementById('monitor-audit-refresh');
if(!app||!refreshBtn)return;
const names={monitor:'eloah-monitor-security.yml',pages:'pages.yml'};
const github='https://api.github.com/repos/soniacointe-sketch/the-crew-control/actions/workflows/';
const $=id=>document.getElementById(id);
let busy=false,ran=false,sequence=0;
function render(key,label,kind,note='',url=''){
 const badge=$('audit-'+key+'-state'),detail=$('audit-'+key+'-meta');
 if(!badge||!detail)return;
 badge.textContent=label;
 badge.dataset.kind=kind;
 detail.textContent=note;
 const link=$('audit-'+key+'-details');
 if(link){
   // Existing static href is the fallback. Only allow trusted GitHub workflow run URLs.
   const valid=typeof url==='string'&&/^https:\/\/github\.com\/soniacointe-sketch\/the-crew-control\/actions\/runs\/[0-9]+$/.test(url);
   if(valid)link.href=url;
 }
}
function statusFrom(run){
 if(!run)return['Pas de résultat','unknown'];
 if(run.status!=='completed'){
   if(run.status==='in_progress')return['En cours','pending'];
   return['En attente','pending'];
 }
 if(run.conclusion==='success')return['Tests réussis','good'];
 if(run.conclusion==='failure'||run.conclusion==='timed_out'||run.conclusion==='action_required')return['Échec à examiner','fail'];
 if(run.conclusion==='cancelled')return['Exécution annulée','pending'];
 return['À examiner','pending'];
}
async function get(key,workflow,signal){
 const url=github+encodeURIComponent(workflow)+'/runs?per_page=3';
 const response=await fetch(url,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',headers:{Accept:'application/vnd.github+json'},signal});
 if(!response.ok)throw Error('HTTP '+response.status);
 const data=await response.json();
 const run=Array.isArray(data.workflow_runs)?data.workflow_runs[0]:null;
 const [label,kind]=statusFrom(run);
 let date='';
 if(run?.updated_at && Number.isFinite(Date.parse(run.updated_at))){
  date='Dernière actualisation GitHub : '+new Date(run.updated_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'});
 }
 return {key,label,kind,note:date||'Aucune exécution retournée par GitHub.',url:run?.html_url||''};
}
async function load(){
 if(app.hidden||busy)return;
 busy=true;ran=true;const ticket=++sequence;
 refreshBtn.disabled=true;refreshBtn.textContent='Contrôle GitHub en cours…';
 render('monitor','Vérification…','pending','Consultation des résultats publics.');
 render('pages','Vérification…','pending','Consultation des résultats publics.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
 const results=await Promise.allSettled(Object.entries(names).map(([key,workflow])=>get(key,workflow,controller.signal)));
 clearTimeout(timeout);
 if(ticket!==sequence||app.hidden){busy=false;refreshBtn.disabled=false;refreshBtn.textContent='↻ Rafraîchir les contrôles';return;}
 results.forEach((r,index)=>{
  const key=Object.keys(names)[index];
  if(r.status==='fulfilled'){const x=r.value;render(x.key,x.label,x.kind,x.note,x.url);}
  else render(key,'Non vérifiable','pending','Impossible de consulter GitHub maintenant. Ouvrir l’historique pour vérifier.');
 });
 $('audit-last-check').textContent='Consultation effectuée le '+new Date().toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})+' · GitHub Actions (public).';
 busy=false;refreshBtn.disabled=false;refreshBtn.textContent='↻ Rafraîchir les contrôles';
}
const watcher=new MutationObserver(()=>{
 if(app.hidden){
  sequence++;ran=false;
  render('monitor','Session requise','unknown','Les contrôles s’affichent une fois la session fondatrice reconnue.');
  render('pages','Session requise','unknown','Les contrôles s’affichent une fois la session fondatrice reconnue.');
  $('audit-last-check').textContent='Session fondatrice non vérifiée.';
 }else if(!ran)load();
});
watcher.observe(app,{attributes:true,attributeFilter:['hidden']});
refreshBtn.addEventListener('click',load);
if(!app.hidden)load();
})();