/* ELOAH customer-only modules. Never load into personal cockpit pages. */
(()=>{
'use strict';
const BUCKET='eloah-customer-documents';
const MAX_BYTES=20*1024*1024;
const MIME={
 pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 txt:'text/plain',csv:'text/csv',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'
};
const $=id=>document.getElementById(id);
const state={client:null,userId:null,month:new Date(new Date().getFullYear(),new Date().getMonth(),1),day:null,entries:[],workspaceNames:new Map(),calSeq:0,docSeq:0,bound:false};
const node=(tag,txt,cls)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(txt!==undefined)n.textContent=String(txt);
 return n;
};
const pad=n=>String(n).padStart(2,'0');
const key=(y,m,d)=>String(y)+'-'+pad(m+1)+'-'+pad(d);
const today=()=>{const n=new Date();return key(n.getFullYear(),n.getMonth(),n.getDate())};
const readable=s=>{const parts=String(s).split('-').map(Number);if(parts.length!==3||!parts.every(Number.isFinite))return s;return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(parts[0],parts[1]-1,parts[2]))};
const write=(id,text)=>{const el=$(id);if(el)el.textContent=text};
const active=(id)=>!!state.client&&!!state.userId&&(!id||state.userId===id);
const originalName=name=>String(name||'Document').replace(/^[0-9a-f-]{36}--/i,'');
const store=()=>state.client.storage.from(BUCKET);
function reset(){
 state.calSeq++;state.docSeq++;state.client=null;state.userId=null;state.entries=[];state.day=null;state.workspaceNames=new Map();
 ['eloah-calendar-grid','eloah-day-actions','eloah-upcoming-list','eloah-documents-list'].forEach(id=>{if($(id))$(id).replaceChildren()});
 write('eloah-due-count','—');write('eloah-calendar-status','');write('eloah-documents-status','');
}
function setWorkspaces(rows){
 state.workspaceNames=new Map((Array.isArray(rows)?rows:[]).map(w=>[w.id,w.title]));
}
function openWorkspace(id){
 const buttons=Array.from(document.querySelectorAll('#workspace-list button.workspace'));
 const target=buttons.find(b=>b.dataset.id===id);
 if(!target){write('eloah-calendar-status','Ce projet n’est pas affiché dans la liste actuelle.');return}
 target.click();
 $('client-actions')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function taskCard(task){
 const card=node('article',undefined,'eloah-due-card');
 const copy=node('div');
 copy.append(node('strong',task.title));
 const project=state.workspaceNames.get(task.workspace_id)||'Mon projet';
 copy.append(node('small',project+' · '+readable(task.due_date)+' · '+(task.status==='termine'?'Terminée':task.status==='en_cours'?'En cours':'À faire')));
 card.append(copy);
 const button=node('button','Voir','light');button.type='button';button.addEventListener('click',()=>openWorkspace(task.workspace_id));
 card.append(button);
 return card;
}
function showDay(day){
 state.day=day;
 write('eloah-selected-day','Échéances du '+readable(day));
 const entries=state.entries.filter(x=>x.due_date===day);
 const list=$('eloah-day-actions');list.replaceChildren();
 if(!entries.length){list.append(node('p','Aucune échéance prévue pour ce jour.','eloah-module-empty'));return}
 entries.forEach(x=>list.append(taskCard(x)));
 document.querySelectorAll('#eloah-calendar-grid button[data-day]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.day===day)));
}
function drawCalendar(){
 const year=state.month.getFullYear(),month=state.month.getMonth();
 write('eloah-calendar-month',new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(state.month));
 const grid=$('eloah-calendar-grid');grid.replaceChildren();
 ['L','M','M','J','V','S','D'].forEach(x=>grid.append(node('span',x,'eloah-weekday')));
 const offset=(new Date(year,month,1).getDay()+6)%7;
 for(let i=0;i<offset;i++)grid.append(node('span','','eloah-calendar-blank'));
 const days=new Date(year,month+1,0).getDate();
 const counts=new Map();
 for(const task of state.entries)counts.set(task.due_date,(counts.get(task.due_date)||0)+1);
 const current=today();
 for(let d=1;d<=days;d++){
  const day=key(year,month,d),count=counts.get(day)||0;
  const button=node('button',String(d),'eloah-calendar-day'+(day===current?' is-today':'')+(count?' has-tasks':''));
  button.type='button';button.dataset.day=day;button.setAttribute('aria-label',readable(day)+(count?' · '+count+' échéance(s)':''));
  button.setAttribute('aria-pressed',String(state.day===day));
  if(count)button.append(node('small',String(count),'eloah-day-count'));
  button.addEventListener('click',()=>showDay(day));grid.append(button);
 }
 const defaultDay=state.day&&state.day.startsWith(key(year,month,1).slice(0,7))?state.day:(current.startsWith(key(year,month,1).slice(0,7))?current:key(year,month,1));
 showDay(defaultDay);
}
async function loadCalendar(){
 if(!active())return;
 const id=state.userId,seq=++state.calSeq;
 const year=state.month.getFullYear(),month=state.month.getMonth();
 const from=key(year,month,1),to=key(year,month,new Date(year,month+1,0).getDate());
 write('eloah-calendar-status','Chargement des échéances…');
 const {data,error}=await state.client.from('eloah_customer_workspace_items')
 .select('id,title,status,due_date,workspace_id').eq('owner_id',id)
 .gte('due_date',from).lte('due_date',to).order('due_date',{ascending:true}).limit(500);
 if(!active(id)||seq!==state.calSeq)return;
 if(error){write('eloah-calendar-status','Impossible de charger le planning : '+error.message);return}
 state.entries=data||[];
 drawCalendar();
 write('eloah-calendar-status',state.entries.length===500?'500 actions affichées au maximum pour ce mois.':'Planning à jour.');
}
async function loadUpcoming(){
 if(!active())return;
 const id=state.userId,seq=state.calSeq;
 const {data,error}=await state.client.from('eloah_customer_workspace_items')
 .select('id,title,status,due_date,workspace_id').eq('owner_id',id).gte('due_date',today())
 .neq('status','termine').order('due_date',{ascending:true}).limit(6);
 if(!active(id)||seq!==state.calSeq)return;
 const list=$('eloah-upcoming-list');list.replaceChildren();
 if(error){list.append(node('p','Échéances momentanément indisponibles.','eloah-module-empty'));return}
 write('eloah-due-count',String((data||[]).length)+(data?.length===6?'+':''));
 if(!data?.length){list.append(node('p','Aucune action à venir pour le moment.','eloah-module-empty'));return}
 data.forEach(x=>list.append(taskCard(x)));
}
async function refreshPlanning(){
 if(!active())return;
 await Promise.allSettled([loadCalendar(),loadUpcoming()]);
}
function fileSize(bytes){
 const n=Number(bytes)||0;
 return n>=1048576?(n/1048576).toFixed(1)+' Mo':Math.max(1,Math.ceil(n/1024))+' Ko';
}
async function refreshDocuments(){
 if(!active())return;
 const id=state.userId,seq=++state.docSeq;
 write('eloah-documents-status','Chargement de vos documents…');
 const {data,error}=await store().list(id,{limit:100,sortBy:{column:'created_at',order:'desc'}});
 if(!active(id)||seq!==state.docSeq)return;
 const list=$('eloah-documents-list');list.replaceChildren();
 if(error){write('eloah-documents-status','Impossible de lire vos documents : '+error.message);return}
 const docs=(data||[]).filter(f=>f.name&&f.id);
 if(!docs.length){list.append(node('p','Votre espace documents est vide. Ajoutez votre premier fichier.','eloah-module-empty'))}
 docs.forEach(file=>{
  const path=id+'/'+file.name,name=originalName(file.name);
  const row=node('div',undefined,'eloah-document-row'),copy=node('div');
  copy.append(node('strong',name));
  const date=file.created_at?new Date(file.created_at).toLocaleDateString('fr-FR'):'';
  copy.append(node('small',fileSize(file.metadata?.size)+(date?' · '+date:'')));
  row.append(copy);
  const actions=node('div',undefined,'eloah-document-actions');
  const download=node('button','Télécharger','light');download.type='button';
  download.addEventListener('click',async()=>{
   if(!active(id))return;
   download.disabled=true;write('eloah-documents-status','Préparation du téléchargement…');
   try{
    const result=await store().download(path);
    if(result.error)throw result.error;
    if(!active(id))return;
    const objectUrl=URL.createObjectURL(result.data);
    const link=node('a');link.href=objectUrl;link.download=name;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),15000);
    write('eloah-documents-status','Téléchargement demandé.');
   }catch(e){write('eloah-documents-status','Téléchargement impossible : '+(e?.message||'Erreur de lecture'))}
   finally{download.disabled=false}
  });
  const remove=node('button','Supprimer','light');remove.type='button';
  remove.addEventListener('click',async()=>{
   if(!active(id)||!confirm('Supprimer définitivement « '+name+' » ?'))return;
   remove.disabled=true;
   const result=await store().remove([path]);
   if(result.error){write('eloah-documents-status','Suppression impossible : '+result.error.message);remove.disabled=false;return}
   await refreshDocuments();write('eloah-documents-status','Document supprimé.');
  });
  actions.append(download,remove);row.append(actions);list.append(row);
 });
 write('eloah-documents-status',docs.length+(docs.length===100?' premiers':'')+' document(s). Vos fichiers ne sont pas publics.');
}
async function uploadDocument(event){
 event.preventDefault();
 if(!active())return;
 const input=$('eloah-document-file'),button=$('eloah-document-submit'),file=input.files?.[0];
 if(!file){write('eloah-documents-status','Choisissez un fichier à ajouter.');return}
 const extension=(file.name.split('.').pop()||'').toLowerCase(),type=MIME[extension];
 if(!type){write('eloah-documents-status','Format non pris en charge. Formats : PDF, Office, texte et images.');return}
 if(file.size<1||file.size>MAX_BYTES){write('eloah-documents-status','Le fichier doit peser entre 1 octet et 20 Mo.');return}
 const id=state.userId;
 const original=file.name.substring(0,file.name.length-extension.length-1);
 const normalized=original.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,75)||'Document';
 const path=id+'/'+crypto.randomUUID()+'--'+normalized+'.'+extension;
 button.disabled=true;write('eloah-documents-status','Envoi du fichier privé…');
 try{
  const {error}=await store().upload(path,file,{contentType:type,upsert:false,cacheControl:'0'});
  if(error)throw error;
  if(!active(id))return;
  $('eloah-documents-form').reset();
  await refreshDocuments();write('eloah-documents-status','Document ajouté à votre espace privé.');
 }catch(e){write('eloah-documents-status','Envoi impossible : '+(e?.message||'Erreur de transfert'))}
 finally{button.disabled=false}
}
function bindOnce(){
 if(state.bound)return;state.bound=true;
 $('eloah-calendar-prev').addEventListener('click',()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()-1,1);state.day=null;loadCalendar()});
 $('eloah-calendar-next').addEventListener('click',()=>{state.month=new Date(state.month.getFullYear(),state.month.getMonth()+1,1);state.day=null;loadCalendar()});
 $('eloah-calendar-today').addEventListener('click',()=>{const n=new Date();state.month=new Date(n.getFullYear(),n.getMonth(),1);state.day=today();loadCalendar()});
 $('eloah-documents-form').addEventListener('submit',uploadDocument);
 $('eloah-documents-refresh').addEventListener('click',refreshDocuments);
}
async function init(client,userId){
 if(!client||!userId)return;
 if(state.userId!==userId){
  state.month=new Date(new Date().getFullYear(),new Date().getMonth(),1);state.day=today();
 }
 state.client=client;state.userId=userId;bindOnce();
 await Promise.allSettled([refreshPlanning(),refreshDocuments()]);
}
window.EloahClientModules={init,reset,setWorkspaces,refreshPlanning,refreshDocuments};
})();
