(()=>{'use strict';
const detail=document.getElementById('mailing-list-detail'),title=document.getElementById('mailing-detail-title');
if(!detail||!title)return;
const endpoint='https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-mailing-resend';
const key='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
let busy=false,last=null,loaded=false;
const host=()=>document.getElementById('mailing-contacts-content');
function message(value){const node=host();if(!node)return;node.replaceChildren();const p=document.createElement('p');p.textContent=value;node.append(p)}
function render(data){const node=host();if(!node)return;node.replaceChildren();
const note=document.createElement('p');note.textContent=data.length+' contacts de la liste The Crew Orchies · source sécurisée Resend';node.append(note);
const header=document.createElement('div');header.className='mail-contact-head';const blank=document.createElement('span');header.append(blank,document.createTextNode('Email'),document.createTextNode('Statut'));node.append(header);
for(const person of data){const row=document.createElement('div');row.className='mail-contact-row';const cb=document.createElement('input');cb.type='checkbox';cb.disabled=true;const em=document.createElement('span');em.textContent=person.email;const status=document.createElement('span');status.textContent=person.status==='enabled'?'Activé':'Désabonné';row.append(cb,em,status);node.append(row)}
const counter=document.getElementById('mail-contacts-title');if(counter)counter.textContent='Contacts ('+data.length+')';
const page=document.getElementById('mail-page');if(page)page.textContent='1 / 1';
const count=document.getElementById('mail-page-count');if(count)count.textContent=data.length+' contacts';
for(const id of ['mail-next','mail-prev','mail-select-all']){const el=document.getElementById(id);if(el)el.disabled=true;}
const msg=document.createElement('p');msg.textContent='Les statuts de cette liste se modifient dans Resend. Les données ne sont pas publiées sur GitHub.';node.append(msg);
}
async function load(){if(busy)return;busy=true;message('Chargement des contacts sécurisés Resend…');
try{if(!window.supabase?.createClient)throw Error('Connexion Supabase indisponible');
const client=window.supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co',key,{auth:{persistSession:true,autoRefreshToken:true}});
const session=await client.auth.getSession();const token=session.data?.session?.access_token;
if(!token)throw Error('Connecte-toi à ton compte ELOAH pour afficher les adresses privées.');
const res=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,apikey:key,'Content-Type':'application/json'},body:JSON.stringify({action:'contacts'})});
const data=await res.json();if(!res.ok)throw Error(data.error||'Lecture impossible');
last=Array.isArray(data.contacts)?data.contacts:[];loaded=true;render(last);
}catch(e){message(String(e.message||e)+' Les 39 contacts restent conservés dans Resend.')}finally{busy=false;}}
function check(){if(detail.hidden||title.textContent.trim()!=='The Crew Orchies')return;loaded=false;load()}
new MutationObserver(check).observe(detail,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(check).observe(title,{childList:true,subtree:true});
const back=document.getElementById('mailing-detail-back');
back?.addEventListener('click',()=>{loaded=false;last=null});
})();