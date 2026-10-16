/* ELOAH: simple project navigation; preserves every existing module and record. */
(()=>{'use strict';
const nav=document.getElementById('tabs'),main=document.querySelector('main'),head=document.querySelector('.project-head');
if(!nav||!main||!head||typeof showTab!=='function')return;
const labels=[['💬 Conversations','Chat Projet'],['📂 Fichiers','Fichiers'],['📝 Mes notes','Meta Projets Memory'],['✅ Mes actions','__actions'],['🧠 Assistante IA','__assistant'],['⚙️ Gérer le projet','Paramètres']];
const area=document.createElement('nav');area.id='eloah-simple-nav';area.setAttribute('aria-label','Mes outils essentiels');
const explain=document.createElement('p');explain.id='eloah-simple-help';explain.textContent='Un projet, un seul endroit pour tes conversations, fichiers, notes et actions. Les données restent dans ton navigateur sauf sauvegarde explicite.';
const advanced=document.createElement('details');advanced.id='eloah-advanced-tools';
advanced.innerHTML='<summary>Outils avancés (facultatifs)</summary><div class="eloah-advanced-links"></div>';
const custom=document.createElement('div');custom.id='eloah-simple-message';custom.setAttribute('role','status');
function go(name){
 if(name==='__actions'){showTab('Planning');update(name);return;}
 if(name==='__assistant'){
  showTab('Chat Projet');
  const field=document.getElementById('message-input');
  if(field){field.focus();custom.textContent='Écris ta demande ci-dessous. Une nouvelle fenêtre ChatGPT s’ouvrira lors de l’envoi : les réponses ne reviennent pas automatiquement ici.'}
  return;
 }
 custom.textContent='';
 showTab(name);
 update(name);
}
function button(label,name,container){const el=document.createElement('button');el.type='button';el.dataset.simpleTarget=name;el.textContent=label;el.addEventListener('click',()=>go(name));container.append(el)}
labels.forEach(([label,target])=>button(label,target,area));
const links=advanced.querySelector('.eloah-advanced-links');
[['📚 Bases d’expertise','Bases d’Expertise'],['👥 Équipe','Équipe'],['💳 Facturation','Facturation'],['📊 Statistiques','Analytics']].forEach(([label,target])=>button(label,target,links));
function update(name){document.querySelectorAll('[data-simple-target]').forEach(b=>b.classList.toggle('selected',b.dataset.simpleTarget===name))}
const original=showTab;
showTab=function(name){original(name);update(name);};
nav.before(explain,area,advanced,custom);
nav.setAttribute('aria-label','Navigation technique masquée');
nav.hidden=true;
const style=document.createElement('style');style.textContent=`
#tabs{display:none!important}
#eloah-simple-help{margin:0;padding:12px 24px 5px;color:var(--muted);font-size:12px}
#eloah-simple-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:14px 24px}
#eloah-simple-nav button{background:var(--panel);padding:14px 9px;text-align:left;white-space:normal;min-height:48px;border-radius:11px;font-weight:650}
#eloah-simple-nav button.selected,.eloah-advanced-links button.selected{background:var(--tint);border-color:var(--purple);color:var(--purple)}
#eloah-advanced-tools{margin:0 24px 9px;border:1px solid var(--line);border-radius:10px;padding:8px 12px}
#eloah-advanced-tools summary{cursor:pointer;color:var(--muted)}
.eloah-advanced-links{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 3px}
.eloah-advanced-links button{font-size:12px}
#eloah-simple-message{margin:0 24px;color:var(--muted);font-size:12px}
#eloah-simple-message:empty{display:none}
#eloah-check-button{display:none!important}
@media(max-width:700px){#eloah-simple-nav{grid-template-columns:repeat(2,minmax(0,1fr));padding:12px;gap:7px}#eloah-simple-nav button{padding:12px 8px;font-size:12px}#eloah-advanced-tools{margin:0 12px 8px}#eloah-simple-help{padding:12px 12px 0}}
`;document.head.append(style);
update('Chat Projet');
})();