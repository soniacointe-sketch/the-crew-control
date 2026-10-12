(()=>{'use strict';
const root=document.getElementById('eloah-daily');if(!root)return;
const KEY='eloah-action-tasks-v1';let calendar=[];let view='today';
const $=id=>document.getElementById(id);
function localDay(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function getTasks(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(t=>t&&typeof t.title==='string'&&!t.done).map(t=>({id:t.id,title:t.title,date:t.date||'',priority:t.priority||'normale',source:'Tâche · '+t.project})):[]}catch{return []}}
function collect(){return [...getTasks(),...calendar.map(e=>({id:e.id,title:e.title,date:e.date,priority:'normale',source:'Google Agenda',url:e.url}))]}
function render(){
 const today=localDay(new Date()),until=new Date();until.setDate(until.getDate()+7);const week=localDay(until);
 const items=collect().filter(t=>view==='today'?t.date===today:view==='week'?t.date>=today&&t.date<week:(t.date&&t.date<today)||t.priority==='haute').sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||Number(b.priority==='haute')-Number(a.priority==='haute')).slice(0,60);
 $('eloah-daily-count').textContent=items.length+' élément(s)';const target=$('eloah-daily-items');target.replaceChildren();
 for(const t of items){const row=document.createElement('article');row.className='daily-item';const detail=document.createElement('div');const strong=document.createElement('strong');strong.textContent=t.title;const small=document.createElement('small');small.textContent=[t.date||'Sans échéance',t.source,t.priority==='haute'?'Priorité haute':''].filter(Boolean).join(' · ');detail.append(strong,small);row.append(detail);if(t.url&&t.url.startsWith('https://')){const a=document.createElement('a');a.href=t.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ouvrir ↗';row.append(a)}target.append(row)}
 if(!items.length){const p=document.createElement('p');p.textContent='Rien à afficher dans cette vue.';target.append(p)}
}
root.querySelectorAll('[data-daily]').forEach(btn=>btn.onclick=()=>{view=btn.dataset.daily;root.querySelectorAll('[data-daily]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));render()});
window.addEventListener('eloah-google-calendar-loaded',e=>{calendar=Array.isArray(e.detail)?e.detail.filter(x=>x&&typeof x.title==='string'&&typeof x.date==='string'):[];render()});
window.addEventListener('storage',e=>{if(e.key===KEY)render()});
window.addEventListener('eloah-task-changed',render);
render();
})();