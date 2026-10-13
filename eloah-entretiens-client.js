/* ELOAH Mes entretiens — existing storage contracts; customer interface. */
(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],key='eloah-entretiens-crm-local-v1';let records=[],current=null,month=new Date(),cloud=null,cloudUser=null,cloudMode=false;const cloudStatus=$('#cloud-status');let localBackup=[],localRaw=null,localReadable=true;try{localRaw=localStorage.getItem(key);records=JSON.parse(localRaw||'[]');if(!Array.isArray(records)||records.some(r=>!r||typeof r.id!=='string'||typeof r.name!=='string'))throw Error()}catch{localReadable=false;records=[];document.body.dataset.entretienStorage='unreadable'}localBackup=records.slice();function persist(){if(cloudMode)return;if(!localReadable)throw Error('Les données de cet appareil sont illisibles. Elles n’ont pas été remplacées.');if(localStorage.getItem(key)!==localRaw)throw Error('Les fiches ont changé dans un autre onglet. Copie ta saisie, puis recharge cette page.');const encoded=JSON.stringify(records);localStorage.setItem(key,encoded);localRaw=encoded;localBackup=records.slice()}function node(tag,text){const n=document.createElement(tag);n.textContent=text;return n}async function cloudLoad(){if(!cloudUser||!cloud)return;const {data,error}=await cloud.from('eloah_appointments').select('id,name,universe,date,state,contact,followup,notes').order('created_at',{ascending:false});if(error){cloudStatus.textContent='Lecture des fiches en ligne impossible : '+error.message;return}records=(data||[]).map(r=>({...r,date:r.date?r.date.slice(0,16):''}));cloudMode=true;cloudStatus.textContent='Compte connecté · '+records.length+' fiches retrouvées en ligne. Les fiches locales ne sont pas transférées automatiquement.';$('#local-import-cloud').classList.toggle('hidden',!localBackup.length);draw()}
async function cloudInit(){if(!window.supabase){cloudStatus.textContent='La connexion au compte est indisponible. Tes fiches restent sur cet appareil.';return}try{cloud=window.supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co',"sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy",{auth:{persistSession:true,autoRefreshToken:true}});const {data,error}=await cloud.auth.getUser();if(error||!data?.user){cloudStatus.textContent='Tes fiches restent dans ce navigateur. Aucun compte connecté n’a été retrouvé pour les rendez-vous.';return}cloudUser=data.user;await cloudLoad()}catch(e){cloudStatus.textContent='Connexion indisponible : '+e.message}}
$('#cloud-sync').onclick=async()=>{if(!cloudUser)await cloudInit();else await cloudLoad()};
$('#local-import-cloud').onclick=async()=>{if(!cloudUser||!cloudMode||!localBackup.length)return;if(!confirm('Importer '+localBackup.length+' rendez-vous locaux dans ton espace privé Supabase ? Les doublons éventuels ne seront pas supprimés automatiquement.'))return;const payload=localBackup.map(r=>({owner_id:cloudUser.id,name:String(r.name||'Sans nom').slice(0,120),universe:r.universe||'Personnel',date:r.date?new Date(r.date).toISOString():null,state:r.state||'À confirmer',contact:r.contact||'',followup:r.followup||null,notes:r.notes||''}));const {error}=await cloud.from('eloah_appointments').insert(payload);if(error){cloudStatus.textContent='Import refusé : '+error.message;return}localBackup=[];$('#local-import-cloud').classList.add('hidden');await cloudLoad()};
function openForm(r){current=r||null;$('#form').reset();$('#edit-title').textContent=r?'Mon rendez-vous':'Noter un rendez-vous';$('#delete').classList.toggle('hidden',!r);if(r){for(const name of ['name','date','state','contact','notes','followup','universe'])if($('#form').elements[name])$('#form').elements[name].value=r[name]||''}$('#edit-dialog').showModal()}function openChat(r){window.dispatchEvent(new CustomEvent('eloah:entretien-aide',{detail:{mode:'preparation'}}))}function ical(r){if(!r.date)return alert('Renseigne une date et une heure');const d=new Date(r.date),end=new Date(d.getTime()+3600000),stamp=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const clean=s=>String(s||'').replace(/[\\,;]/g,' ').replace(/\n/g,' ');const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ELOAH//Entretiens//FR','BEGIN:VEVENT','UID:'+r.id+'@eloah','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(d),'DTEND:'+stamp(end),'SUMMARY:'+clean('Entretien '+r.name),'DESCRIPTION:'+clean(r.notes),'END:VEVENT','END:VCALENDAR'].join('\r\n');download(new Blob([body],{type:'text/calendar'}),'eloah-rendez-vous.ics')}function download(blob,name){const u=URL.createObjectURL(blob),a=node('a','');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}function item(r,short=false){const div=node('div','');div.className='item';const info=node('div','');info.append(node('strong',r.name||'Sans nom'),node('small',[r.universe||'Personnel',r.date?new Date(r.date).toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'}):'Date à fixer',r.state||'À confirmer'].join(' · ')));const actions=node('div','');actions.className='actions';const edit=node('button','Ouvrir ma fiche');edit.onclick=()=>openForm(r);const prep=node('button','Aide pour préparer' );prep.onclick=()=>openChat(r);actions.append(edit,prep);if(r.date){const cal=node('button','Exporter vers mon agenda');cal.onclick=()=>ical(r);actions.append(cal)}div.append(info,actions);return div}function fill(id,rows){const host=$('#'+id);host.replaceChildren();if(!rows.length)host.append(node('p','Aucune fiche dans cette sélection. Note un rendez-vous pour commencer.'));rows.forEach(r=>host.append(item(r)))}function draw(){for(const [id,status] of [['s-pending','À confirmer'],['s-confirmed','Confirmé'],['s-done','Terminé']])$('#'+id).textContent=records.filter(r=>r.state===status).length;$('#s-followup').textContent=records.filter(r=>r.followup&&r.state!=='Terminé'&&r.state!=='Annulé'&&r.followup<=new Date().toISOString().slice(0,10)).length;const fold=v=>String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const q=fold($('#search').value),f=$('#filter').value;fill('request-list',records.filter(r=>(f==='Tous'||r.state===f)&&fold(JSON.stringify(r)).includes(q)));fill('prep-list',records.filter(r=>!['Terminé','Annulé','Refusé'].includes(r.state)));fill('followup-list',records.filter(r=>!['Annulé','Refusé'].includes(r.state)));document.querySelectorAll('#followup-list .item').forEach((row,i)=>{const data=records.filter(r=>!['Annulé','Refusé'].includes(r.state))[i];const b=node('button','Ouvrir mon bilan');b.onclick=()=>openReport(data);row.querySelector('.actions').prepend(b)});renderRelations();drawCalendar()}function renderRelations(){
  const host=$('#relations-list'), input=$('#relation-search');
  if(!host||!input)return;
  const fold=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
  const q=fold(input.value.trim());
  host.replaceChildren();
  const groups=new Map();
  for(const record of records){
    if(!record||typeof record.name!=='string')continue;
    const title=record.name.trim()||'Sans titre', key=fold(title);
    if(!groups.has(key))groups.set(key,{title,items:[]});
    groups.get(key).items.push(record);
  }
  const results=[...groups.values()].filter(g=>!q||fold(g.title).includes(q)||g.items.some(r=>fold([r.universe,r.notes,r.state,r.contact].join(' ')).includes(q))).sort((a,b)=>a.title.localeCompare(b.title,'fr',{sensitivity:'base'}));
  const matches=results.reduce((total,g)=>total+g.items.length,0);
  $('#relations-count').textContent=results.length?(results.length===1?'1 nom ou titre':' '+results.length+' noms ou titres')+' · '+matches+(matches===1?' fiche':' fiches'):q?'Aucun résultat':records.length?'Aucune fiche à afficher':'Aucune fiche enregistrée dans cette vue';
  const scope=$('#relations-scope');
  if(scope)scope.textContent=cloudMode?'Fiches du compte ELOAH connecté. Les fiches conservées seulement sur cet appareil ne figurent pas dans cette liste.':'Fiches enregistrées dans ce navigateur. Si tu as utilisé un autre appareil, ses fiches ne sont pas récupérées automatiquement.';
  function goCopies(){
    const d=$('#copies');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});d.querySelector('summary')?.focus({preventScroll:true})}
  }
  if(!results.length){
    const empty=node('div','');empty.className='relation-empty';
    empty.append(node('strong',q?'Aucun nom ne correspond à ta recherche.':'Aucun rendez-vous à retrouver pour le moment.'));
    empty.append(node('p',q?'Essaie un autre prénom, titre ou mot-clé.':'Ajoute un rendez-vous, même sans date : sa fiche apparaîtra ensuite ici.'));
    const actions=node('div','');actions.className='actions';
    if(q){const clear=node('button','Effacer la recherche');clear.type='button';clear.onclick=()=>{input.value='';renderRelations();input.focus()};actions.append(clear)}
    else{const add=node('button','+ Noter mon premier rendez-vous');add.type='button';add.className='primary';add.onclick=()=>openForm();actions.append(add)}
    if(cloudMode&&localBackup.length){
      const msg=node('p',localBackup.length+' fiche(s) sont aussi conservées sur cet appareil. Elles ne sont pas automatiquement transférées vers le compte connecté.');
      const copy=node('button','Voir mes copies et ma connexion');copy.type='button';copy.onclick=goCopies;
      empty.append(msg);actions.append(copy);
    }
    empty.append(actions);host.append(empty);return;
  }
  for(const group of results){
    const details=node('details','');details.className='relation-group';
    if(results.length===1)details.open=true;
    const summary=node('summary','');const title=node('strong',group.title);
    const count=node('span',group.items.length+(group.items.length===1?' fiche':' fiches'));
    summary.append(title,count);details.append(summary);
    const body=node('div','');body.className='relation-entries';
    const appointments=group.items.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    for(const record of appointments){
      const row=node('div','');row.className='relation-entry';
      const content=node('div','');content.className='relation-entry-info';
      let dateLabel='Date à fixer';
      if(record.date){const parsed=new Date(record.date);dateLabel=Number.isFinite(parsed.getTime())?parsed.toLocaleString('fr-FR',{dateStyle:'medium',timeStyle:'short'}):'Date à vérifier'}
      const subtitle=node('span',[dateLabel,record.state||'À confirmer',record.universe||'Personnel'].join(' · '));
      content.append(subtitle);
      const edit=node('button','Ouvrir ma fiche');edit.type='button';
      edit.setAttribute('aria-label','Ouvrir la fiche '+group.title+' du '+dateLabel);
      edit.onclick=()=>openForm(record);
      row.append(content,edit);body.append(row);
    }
    details.append(body);host.append(details);
  }
}
function drawCalendar(){const grid=$('#calendar-grid');grid.replaceChildren();$('#month').textContent=month.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});['L','M','M','J','V','S','D'].forEach(d=>grid.append(node('strong',d)));const first=new Date(month.getFullYear(),month.getMonth(),1),offset=(first.getDay()+6)%7,last=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();for(let i=0;i<offset;i++)grid.append(node('span',''));for(let day=1;day<=last;day++){const box=node('div',String(day));box.className='day';const iso=[month.getFullYear(),String(month.getMonth()+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');if(iso===new Date().toISOString().slice(0,10))box.classList.add('today');records.filter(r=>r.date?.slice(0,10)===iso).forEach(r=>{const line=node('small',r.name);line.title=r.notes||'';box.append(line)});grid.append(box)}}let reportItem=null;
const weekTemplate='';
const reportFields=()=>({summary:$('#report-summary').value,goal:$('#report-goal').value,plan:$('#report-plan').value,closing:$('#report-end').value});
async function openReport(r){reportItem=r;$('#report-editor').classList.remove('hidden');let data={};if(cloudMode){const res=await cloud.from('eloah_appointment_reports').select('summary,goal,plan,closing').eq('appointment_id',r.id).maybeSingle();if(res.error){$('#report-status').textContent='Lecture impossible : '+res.error.message;return}data=res.data||{}}else{try{data=JSON.parse(localStorage.getItem('eloah-report-'+r.id)||'{}')}catch{}}$('#report-summary').value=data.summary||'';$('#report-goal').value=data.goal||'';$('#report-plan').value=data.plan||weekTemplate;$('#report-end').value=data.closing||'';$('#report-status').textContent='Ce bilan est rédigé par toi. Il ne constitue pas un compte rendu envoyé par ta coach.';$('#report-editor').scrollIntoView({block:'start',behavior:'smooth'})}
$('#report-save').onclick=async()=>{if(!reportItem)return;const data=reportFields();if(cloudMode){const result=await cloud.from('eloah_appointment_reports').upsert({...data,appointment_id:reportItem.id,owner_id:cloudUser.id},{onConflict:'appointment_id'});$('#report-status').textContent=result.error?'Erreur : '+result.error.message:'Bilan enregistré sur le compte connecté.'}else{try{localStorage.setItem('eloah-report-'+reportItem.id,JSON.stringify(data));$('#report-status').textContent='Bilan enregistré dans ce navigateur.'}catch{$('#report-status').textContent='Impossible d’enregistrer le compte rendu.'}}};
$('#report-chat').onclick=()=>{if(reportItem)window.dispatchEvent(new CustomEvent('eloah:entretien-aide',{detail:{mode:'bilan'}}))};
$('#report-pdf').onclick=()=>{if(!reportItem)return;const Engine=window.jspdf?.jsPDF;if(!Engine){$('#report-status').textContent='Bibliothèque PDF indisponible.';return}const doc=new Engine();let y=22;doc.setFontSize(20);doc.text('ELOAH',18,y);y+=12;doc.setFontSize(14);doc.text('Mon bilan personnel',18,y);y+=14;const sections=[['Synthese', $('#report-summary').value],['Objectif', $('#report-goal').value],['Mes prochaines etapes', $('#report-plan').value],['Conclusion', $('#report-end').value]];for(const pair of sections){if(y>265){doc.addPage();y=22}doc.setFontSize(13);doc.text(pair[0],18,y);y+=9;doc.setFontSize(10);const lines=doc.splitTextToSize(pair[1]||'A completer',170);for(const line of lines){if(y>280){doc.addPage();y=22}doc.text(line,18,y);y+=6}y+=9}doc.save('eloah-mon-bilan-personnel.pdf');$('#report-status').textContent='PDF préparé. Vérifie tes téléchargements et enregistre aussi les modifications de ton bilan.'};
$('#add').onclick=()=>openForm();$('#prep-new').onclick=()=>{openForm();$('#form').elements['notes'].placeholder='Mon objectif, mes questions et ce que je souhaite préparer. Sans informations intimes ou confidentielles.';};$('#cancel').onclick=()=>$('#edit-dialog').close();$('#form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());if(cloudMode){const payload={name:data.name,universe:data.universe,state:data.state,date:data.date?new Date(data.date).toISOString():null,followup:data.followup||null,contact:data.contact||'',notes:data.notes||''};const result=current?await cloud.from('eloah_appointments').update(payload).eq('id',current.id):await cloud.from('eloah_appointments').insert({...payload,owner_id:cloudUser.id});if(result.error){cloudStatus.textContent='Enregistrement refusé : '+result.error.message;return}$('#edit-dialog').close();await cloudLoad();return}const before=records;records=current?records.map(r=>r===current?{...r,...data}:r):[{id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),...data},...records];try{persist()}catch(err){records=before;throw err}$('#edit-dialog').close();draw()};$('#delete').onclick=async()=>{if(!current||!confirm('Supprimer ce rendez-vous ?'))return;if(cloudMode){const {error}=await cloud.from('eloah_appointments').delete().eq('id',current.id);if(error){cloudStatus.textContent='Suppression refusée : '+error.message;return}$('#edit-dialog').close();await cloudLoad();return}const before=records;records=records.filter(r=>r!==current);try{persist()}catch(err){records=before;throw err}$('#edit-dialog').close();draw()};$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));['requests','calendar','relations','prep','followup'].forEach(id=>$('#'+id).classList.toggle('hidden',id!==b.dataset.tab))});$('#search').oninput=draw;$('#filter').onchange=draw;$('#relation-search').oninput=renderRelations;$('#relations-new').onclick=()=>openForm();$('#prev').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);drawCalendar()};$('#next').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);drawCalendar()};$('#export').onclick=()=>download(new Blob([JSON.stringify({source:'ELOAH local',records},null,2)],{type:'application/json'}),'eloah-entretiens.json');$('#import').onclick=()=>$('#import-file').click();$('#import-file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const obj=JSON.parse(await f.text()),arr=Array.isArray(obj)?obj:obj.records;if(!Array.isArray(arr)||arr.length>5000)throw Error();if(!confirm('Importer '+arr.length+' rendez-vous en remplaçant les données locales actuelles ?'))return;if(cloudMode){alert('L’import JSON vers le cloud utilise le bouton dédié aux données locales. Déconnecte-toi pour restaurer une sauvegarde locale.');return}records=arr.filter(r=>r&&typeof r.name==='string'&&typeof r.id==='string');persist();draw()}catch{alert('Sauvegarde non valide')}e.target.value=''};draw();cloudInit()})();

/* Client presentation for the existing appointment module. No new server writes. */
(() => {
  'use strict';
  if (!document.body.classList.contains('entretiens-client')) return;
  const $ = id => document.getElementById(id);
  const form = $('form'), editor = $('edit-dialog'), leave = $('leave-dialog');
  let dirty = false, busy = false, opener = null;
  const report = $('report-editor'); let reportDirty = false;
  function formError(text = '') { $('form-error').textContent = text; }
  function closeEditor() {
    if (busy) return;
    if (!dirty) { editor.close(); return; }
    if (!leave.open) leave.showModal();
    $('keep-writing').focus();
  }
  $('cancel').onclick = closeEditor; $('edit-close').onclick = closeEditor;
  editor.addEventListener('cancel', e => { e.preventDefault(); closeEditor(); });
  $('keep-writing').onclick = () => { leave.close(); form.elements.name.focus(); };
  $('leave-confirm').onclick = () => { dirty = false; leave.close(); editor.close(); };
  leave.addEventListener('cancel', e => { e.preventDefault(); leave.close(); form.elements.name.focus(); });
  form.addEventListener('input', () => { dirty = true; formError(); });
  form.addEventListener('change', () => { dirty = true; });
  document.addEventListener('click', e => { if (!editor.open && !leave.open) opener = e.target.closest('button,a') || opener; }, true);
  new MutationObserver(() => {
    if (editor.open) {
      dirty = false; formError();
      const extra = form.elements;
      $('form-extra').open = extra.universe.value !== 'Personnel' || extra.state.value !== 'À confirmer' || !!extra.contact.value || !!extra.followup.value;
      extra.name.focus();
    }
  }).observe(editor, {attributes:true, attributeFilter:['open']});
  editor.addEventListener('close', () => { dirty = false; (opener?.isConnected ? opener : $('add')).focus(); });
  // Let the original handlers retain storage and account behavior. Only gate/describe the user's actions.
  const originalSubmit = form.onsubmit;
  form.noValidate = true;
  form.onsubmit = async e => {
    e.preventDefault(); if (busy) return;
    formError();
    const fields = form.elements;
    fields.name.value = fields.name.value.trim();
    if (!fields.name.value) { formError('Donne un nom à ton rendez-vous pour retrouver sa fiche.'); fields.name.focus(); return; }
    if (!form.checkValidity()) { formError('Vérifie les champs de ta fiche, notamment la date et l’heure.'); form.reportValidity(); return; }
    busy = true; const controls = [...form.querySelectorAll('button')]; controls.forEach(b => b.disabled = true);
    try {
      await originalSubmit.call(form, e);
      if (editor.open) formError('La fiche n’a pas été enregistrée. ' + $('cloud-status').textContent);
    } catch (error) { formError('La fiche n’a pas pu être enregistrée. Ta saisie reste ouverte. ' + (error.message || 'Copie-la avant de réessayer.')); }
    finally { busy = false; controls.forEach(b => b.disabled = false); }
  };
  const originalDelete = $('delete').onclick;
  $('delete').onclick = async e => { try { await originalDelete.call($('delete'), e); } catch { formError('La suppression n’a pas pu être enregistrée. Ta fiche reste disponible.'); } };
  // Accurate navigation state without depending on translated button labels.
  document.querySelectorAll('[data-tab]').forEach(button => {
    const handler = button.onclick;
    button.onclick = e => {
      if (reportDirty && !confirm('Ton bilan contient des modifications non enregistrées. Changer de vue sans les enregistrer ?')) return;
      handler.call(button, e);
      document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      reportDirty = false;
    };
  });
  const requestEmpty = () => {
    const copy = {'request-list':'Aucun rendez-vous dans cette sélection. Clique sur « Noter un rendez-vous » pour créer ta première fiche.', 'prep-list':'Aucun entretien à préparer pour le moment. Tu peux commencer une fiche même sans date.', 'followup-list':'Aucun bilan à ouvrir pour le moment. Note d’abord un rendez-vous pour y rattacher ton bilan.'};
    for (const [id, message] of Object.entries(copy)) {
      const host = $(id), p = host.querySelector(':scope > p');
      if (!host.querySelector('.item') && p && p.textContent !== message) p.textContent = message;
    }
    // Warn before loading a different report so unrecorded work is not silently discarded.
    document.querySelectorAll('#followup-list .item').forEach(item => {
      const button = item.querySelector('.actions button');
      if (!button || button.dataset.clientHandled) return;
      button.dataset.clientHandled = '1'; const action = button.onclick;
      button.onclick = async e => {
        if (reportDirty && !confirm('Changer de bilan sans enregistrer tes dernières modifications ?')) return;
        reportDirty = false;
        await action.call(button,e);
        $('report-title').textContent = 'Mon bilan · ' + (item.querySelector('strong')?.textContent || 'entretien');
      };
    });
  };
  for (const id of ['request-list','prep-list','followup-list']) new MutationObserver(requestEmpty).observe($(id), {childList:true});
  report.querySelectorAll('textarea').forEach(t => t.addEventListener('input', () => {reportDirty = true;}));
  const saveReport = $('report-save').onclick;
  $('report-save').onclick = async e => {
    await saveReport.call($('report-save'),e);
    if (/^(Bilan enregistré|Compte rendu enregistré)/.test($('report-status').textContent)) reportDirty = false;
  };
  window.addEventListener('beforeunload', e => { if (dirty || reportDirty) { e.preventDefault(); e.returnValue=''; } });
  // An optional, reviewed prompt. Do not copy appointment names, contacts, notes or reports automatically.
  const prompt = $('prompt-dialog');
  window.addEventListener('eloah:entretien-aide', e => {
    $('prompt-text').value = e.detail?.mode === 'bilan'
      ? 'Aide-moi à choisir une prochaine étape après un entretien. Pose-moi trois questions simples pour préciser mon objectif, mes ressources et une petite action réaliste. N’invente pas le contenu de mon entretien et ne donne pas de diagnostic.'
      : 'Je souhaite préparer un entretien en tant que cliente. Aide-moi à formuler mon sujet, ce que j’aimerais clarifier et trois questions utiles à poser. Ne présume pas de ma situation et ne me demande pas de détails intimes.';
    $('prompt-status').textContent = 'Relis la demande. Copie-la puis colle-la dans ChatGPT. Rien n’est envoyé automatiquement.';
    if (!prompt.open) prompt.showModal(); $('prompt-text').focus();
  });
  $('prompt-close').onclick = () => prompt.close();
  $('prompt-copy').onclick = async () => {
    try { await navigator.clipboard.writeText($('prompt-text').value); $('prompt-status').textContent = 'Demande copiée. Ouvre ChatGPT puis colle-la dans ta conversation.'; }
    catch { $('prompt-text').select(); $('prompt-status').textContent = 'Sélectionne et copie le texte affiché, puis colle-le dans ta conversation.'; }
  };
  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    for (let parent=target;parent;parent=parent.parentElement) if(parent.tagName==='DETAILS') parent.open=true;
    if (target.classList.contains('hidden')) document.querySelector('[data-tab="'+target.id+'"]')?.click();
    target.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange', revealHash);
  document.querySelector('[href="#comment-ca-marche"]').addEventListener('click', () => {$('comment-ca-marche').open=true;});
  // Reuse the outer navigation when embedded. Do not inject a second sidebar into the iframe.
  let hostFrame = null;
  try {
    if (window.parent !== window && window.parent.location.origin === location.origin && new URLSearchParams(window.parent.location.search).get('rubrique') === 'Entretiens') {
      document.body.classList.add('embedded');
      hostFrame = window.frameElement;
      const parentDoc = window.parent.document;
      if (hostFrame?.id === 'eloah-entretiens-frame') {
        const style = parentDoc.createElement('style');
        style.textContent='body.eloah-entretiens-client-host .layout>main>:not(#eloah-entretiens-integrated){display:none!important}body.eloah-entretiens-client-host #eloah-entretiens-integrated{margin:0!important;padding:0!important;border:0!important;background:transparent!important}body.eloah-entretiens-client-host #eloah-entretiens-integrated>p{display:none!important}body.eloah-entretiens-client-host .layout>main{max-width:1180px;margin:auto;padding:20px clamp(12px,3vw,35px)!important}body.eloah-entretiens-client-host #eloah-entretiens-frame{border:0!important;border-radius:0!important;background:#f6f5f0!important}';
        parentDoc.head.append(style); parentDoc.body.classList.add('eloah-entretiens-client-host');
        hostFrame.title='Mes entretiens · ELOAH'; parentDoc.title='Mes entretiens · ELOAH';
        const brand=parentDoc.querySelector('.eloah-wordmark');if(brand)brand.textContent='ELOAH · MON ESPACE';
        let queued=false;
        const resize=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const h=Math.ceil(document.querySelector('main').getBoundingClientRect().height)+4;if(hostFrame.style.height!==h+'px')hostFrame.style.height=h+'px';});};
        new ResizeObserver(resize).observe(document.querySelector('main')); resize();
        document.querySelectorAll('dialog').forEach(d=>new MutationObserver(()=>{if(d.open){hostFrame.scrollIntoView({block:'start'});d.style.top='0';d.style.margin='18px auto 0';d.style.maxHeight=Math.max(240,window.parent.innerHeight-90)+'px';}}).observe(d,{attributes:true,attributeFilter:['open']}));
      }
    }
  } catch { /* Same-origin enhancement only; the module remains usable standalone. */ }
  if (!hostFrame && window.top === window) {
    const nav=document.createElement('script');nav.src='eloah-navigation.js?v=20261014-favoris';nav.defer=true;
    nav.onload=()=>{const mark=document.querySelector('.eloah-wordmark');if(mark)mark.textContent='ELOAH · MON ESPACE';};
    document.head.append(nav);
  }
  if(document.body.dataset.entretienStorage==='unreadable'){const notice=document.createElement('p');notice.className='note';notice.setAttribute('role','alert');notice.textContent='Les fiches de cet appareil ne peuvent pas être lues. Elles n’ont pas été remplacées. Évite de créer une nouvelle fiche locale avant d’avoir récupéré tes données.';document.querySelector('.hero').after(notice);}
  requestEmpty(); if(location.hash)revealHash();
})();
