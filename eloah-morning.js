(()=>{'use strict';
const target=document.getElementById('eloah-morning');if(!target)return;
const KEY='eloah-action-tasks-v1';let google=[];const el=id=>document.getElementById(id);
const day=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const today=()=>day(new Date());
function tasks(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(t=>t&&!t.done&&typeof t.title==='string'):[]}catch{return []}}
function render(){
 const now=today(),all=tasks(),events=google.filter(e=>e.date===now),upcoming=all.filter(t=>t.date&&t.date>=now).sort((a,b)=>a.date.localeCompare(b.date)),important=all.filter(t=>t.priority==='haute'||(t.date&&t.date<=now)).sort((a,b)=>Number(b.priority==='haute')-Number(a.priority==='haute')||(a.date||'9999').localeCompare(b.date||'9999')).slice(0,3);
 el('eloah-morning-date').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
 const areas=[['eloah-morning-events',events.map(e=>({label:e.title,meta:'Google Agenda',url:e.url})),'Aucun rendez-vous Google chargé aujourd’hui.'],['eloah-morning-tasks',important.map(t=>({label:t.title,meta:(t.project||'ELOAH')+(t.date?' · '+t.date:'')})),'Aucune tâche prioritaire pour le moment.'],['eloah-morning-next',upcoming.slice(0,3).map(t=>({label:t.title,meta:t.date+' · '+(t.project||'ELOAH')})),'Aucune échéance à venir enregistrée.']];
 for(const [id,items,empty] of areas){const box=el(id);box.replaceChildren();if(!items.length){const p=document.createElement('p');p.textContent=empty;box.append(p)}for(const entry of items){const row=document.createElement('div');row.className='morning-entry';const b=document.createElement('strong');b.textContent=entry.label;const sm=document.createElement('small');sm.textContent=entry.meta;row.append(b,sm);if(entry.url&&entry.url.startsWith('https://')){const a=document.createElement('a');a.href=entry.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ouvrir ↗';row.append(a)}box.append(row)}}
}
window.addEventListener('eloah-google-calendar-loaded',e=>{google=Array.isArray(e.detail)?e.detail.filter(x=>x&&typeof x.date==='string'):[];render()});
window.addEventListener('eloah-task-changed',render);window.addEventListener('storage',e=>{if(e.key===KEY)render()});render();
})();