/* ELOAH Workspace · real in-place assistant, founder only. */
(()=>{'use strict';
const form=document.getElementById('compose'),textarea=document.getElementById('message-input'),messages=document.getElementById('messages');if(!form||!textarea||!messages)return;
const base='https://voytsqyorhoveurnguxn.supabase.co',apiKey='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy',founder='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
const project=new URLSearchParams(location.search).get('projet')||'ELOAH';
const bar=document.createElement('div');bar.className='eloah-route-bar';
bar.innerHTML='<label>Modèle <select id="ew-model"><option value="auto">Auto · ELOAH</option><option value="claude" selected>Claude Haiku 4.5</option><option value="openai">OpenAI</option></select></label><label>Outil <select id="ew-tool"><option value="analyse">Analyser</option><option value="resume">Résumé</option><option value="priorites">5 priorités</option><option value="redaction">Rédaction</option></select></label><label class="ew-check"><input id="ew-memory" type="checkbox"> Mémoire autorisée</label><span id="ew-status" role="status">IA intégrée · aucune action externe</span>';
form.before(bar);
const style=document.createElement('style');style.textContent='.eloah-route-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0;padding:10px;background:var(--panel);border:1px solid var(--line);border-radius:10px}.eloah-route-bar label{font-size:12px;display:flex;align-items:center;gap:6px}.eloah-route-bar select{max-width:180px;padding:7px}.eloah-route-bar input{width:auto}.eloah-route-bar #ew-status{font-size:11px;color:var(--muted)}.eloah-route-message{max-width:90%;padding:14px;margin:12px 0;border:1px solid var(--line);background:var(--panel);border-radius:11px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6}.eloah-route-message.user{margin-left:auto;background:var(--tint)}.eloah-route-message button{margin-top:10px}@media(max-width:740px){.eloah-route-bar{gap:7px}.eloah-route-bar select{max-width:140px}}';document.head.append(style);
const btn=form.querySelector('button[type="submit"]');if(btn)btn.textContent='Envoyer à ELOAH';
let busy=false;
function show(label,value,cls){const d=document.createElement('article');d.className='eloah-route-message '+cls;const b=document.createElement('strong');b.textContent=label;d.append(b,document.createElement('hr'),document.createTextNode(value));messages.append(d);d.scrollIntoView({block:'nearest'});return d}
form.addEventListener('submit',async e=>{
 e.preventDefault();e.stopImmediatePropagation();if(busy)return;const question=textarea.value.trim();if(!question)return;
 busy=true;if(btn)btn.disabled=true;document.getElementById('ew-status').textContent='Connexion et analyse en cours…';
 let client;try{
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.116.0');
 client=createClient(base,apiKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}});
 const {data,error}=await client.auth.getUser();if(error||data?.user?.id!==founder)throw Error('Connexion fondatrice ELOAH nécessaire. Connecte-toi depuis ELOAH 2040.');
 const session=(await client.auth.getSession()).data.session;if(!session?.access_token)throw Error('Session expirée.');
 const action=document.getElementById('ew-tool').value;
 const instr={analyse:'Analyse cette demande et distingue faits, risques et actions.',resume:'Fais une synthèse fidèle et indique les informations manquantes.',priorites:'Propose exactement 5 prochaines étapes classées par priorité, chacune avec résultat attendu et première action.',redaction:'Prépare un brouillon directement utilisable sans le publier.'}[action];
 const local=JSON.parse(localStorage.getItem('eloah-project-v1:'+project)||'null');
 const scope=local?.settings?JSON.stringify({name:local.settings.name,objective:local.settings.objective,deadline:local.settings.deadline}).slice(0,700):'Aucun contexte local transmis';
 const finalQuestion=instr+'\nProjet : '+project+'\nContexte volontairement transmis : '+scope+'\nDemande : '+question;
 show('Toi · '+project,question,'user');const pending=show('ELOAH · Claude','Analyse en cours…','ai');
 const res=await fetch(base+'/functions/v1/eloah-model-router',{method:'POST',headers:{'Content-Type':'application/json','apikey':apiKey,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({question:finalQuestion,project,model:document.getElementById('ew-model').value,use_memory:document.getElementById('ew-memory').checked})});
 const out=await res.json().catch(()=>({}));if(!res.ok||!out.ok)throw Error(out.error||'Le moteur IA n’a pas répondu.');
 pending.textContent=(out.route||'ELOAH Route')+'\n\n'+out.answer;
 const cp=document.createElement('button');cp.type='button';cp.textContent='Copier la réponse';cp.onclick=()=>navigator.clipboard.writeText(out.answer);pending.append(cp);
 textarea.value='';document.getElementById('ew-status').textContent='Réponse obtenue · non enregistrée dans les conversations du projet.';
 }catch(err){document.getElementById('ew-status').textContent=String(err.message||'Connexion indisponible');}
 finally{busy=false;if(btn)btn.disabled=false}
},true);
})();
