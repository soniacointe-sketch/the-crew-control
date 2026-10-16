/* Fiches de travail locales : aucun envoi, lecture de fichier ou publication automatique. */
(()=>{
'use strict';
const W=window.ELOAHWorkspace;if(!W)return;
const KEY='eloah-planning-v1';
let dialog=null,opener=null,currentId=null;
const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function read(){const a=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(a))throw Error('Planning illisible.');return a}
function get(id){return read().find(t=>t.id===id&&!t.archived)}
function update(id,fn){const list=read(),task=list.find(t=>t.id===id&&!t.archived);if(!task)throw Error('Cette action n’est plus disponible.');fn(task);task.updated=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(list));W.renderCalendar?.()}
function recipe(t){
const n=norm(t.title);
if(n.includes('siren')||n.includes('siret'))return ['Rassembler les justificatifs disponibles','Vérifier les identifiants SIREN, SIRET et le code APE','Noter les informations manquantes et la démarche suivante'];
if(n.includes('latino'))return ['Ouvrir la gestion de l’événement','Vérifier les inscriptions et les paiements dans leurs sources','Préparer la liste des participants et les informations pratiques'];
if(n.includes('flashback'))return ['Vérifier les inscriptions et la communication','Préparer musique et matériel','Confirmer les informations pratiques'];
if(n.includes('thriller'))return ['Vérifier les horaires et le rendez-vous auprès de l’organisateur','Préparer transport, tenue et matériel','Noter les informations à transmettre aux participants'];
if(n.includes('apocryph')||n.includes('manuscrit'))return ['Ouvrir le catalogue et choisir une fiche','Compléter les références et les sources','Distinguer faits vérifiés, hypothèses et points à reprendre'];
if(n.includes('.pdf')||n.includes('courrier'))return ['Relier le document concerné','Lire le document et vérifier une éventuelle date limite','Noter les pièces ou la réponse à préparer'];
return ['Préciser le résultat attendu','Rassembler les ressources nécessaires','Réaliser et vérifier le travail'];
}
function link(label,url){const a=el('a',label);a.href=url;return a}
function safe(url){try{const u=new URL(url,location.href);return ['http:','https:'].includes(u.protocol)?u.href:null}catch{return null}}
function status(text){dialog.querySelector('[role=status]').textContent=text}
function render(id){
const task=get(id);if(!task)throw Error('Action introuvable sur cet appareil.');
dialog.replaceChildren();
const head=el('header'),title=el('h2',task.title),close=el('button','×');title.id='action-sheet-title';close.type='button';close.setAttribute('aria-label','Fermer la fiche');close.onclick=()=>dialog.close();head.append(title,close);
const meta=el('p',[task.project||'Personnel',task.status||'À faire'].join(' · '));
let date='Sans date';if(/^\d{4}-\d{2}-\d{2}$/.test(task.date||''))date=new Date(task.date+'T12:00:00').toLocaleDateString('fr-FR');
const dateInfo=el('p',(task.dateType==='Date limite confirmée'?'Date limite confirmée : ':'Date de travail prévue : ')+date);
const help=el('p','Les anciennes dates sont traitées comme des dates de travail, sauf confirmation explicite d’une date limite.');
help.className='as-help';
const briefTitle=el('h3','Consignes'),brief=el('p',task.note||'Aucune consigne enregistrée. Utilise « Modifier l’action » pour préciser ce que tu souhaites faire.');brief.style.whiteSpace='pre-wrap';
const resources=el('section');resources.append(el('h3','Documents et outils'));
const url=task.resourceUrl&&safe(task.resourceUrl);
if(url)resources.append(link('Ouvrir la ressource liée ↗',url));
else resources.append(el('p','Aucun document ou outil n’est relié à cette action. Ajoute son lien dans « Modifier l’action ».'));
if(norm(task.title).includes('.pdf'))resources.append(el('p','Le nom du PDF dans le titre ne permet pas d’ouvrir le fichier : il faut lui associer un accès réel.'));
if(norm(task.project).includes('crew'))resources.append(link('Ouvrir la gestion The Crew →','index.html'));
if(/apocryph|manuscrit/.test(norm(task.title)))resources.append(link('Explorer le catalogue des apocryphes →','eloah-apocryphes-atlas.html'));
resources.append(link('Ouvrir l’espace du projet →','eloah-projet.html?projet='+encodeURIComponent(task.project||'Personnel')));
const checklist=el('section');checklist.append(el('h3','Étapes de travail'),el('p','Suggestions à adapter. Les cases cochées sont conservées sur cet appareil.'));
const saved=Array.isArray(task.workChecklist)?task.workChecklist:null;
for(const [index,item] of (saved||recipe(task).map(text=>({text,done:false}))).entries()){
const label=el('label'),input=el('input');input.type='checkbox';input.checked=!!item.done;label.append(input,el('span',String(item.text)));checklist.append(label);
input.onchange=()=>{try{update(id,t=>{const items=Array.isArray(t.workChecklist)?t.workChecklist:recipe(t).map(text=>({text,done:false}));if(items[index])items[index].done=input.checked;t.workChecklist=items});status('Étape enregistrée sur cet appareil.')}catch(e){input.checked=!input.checked;status(e.message)}};
}
const notesLabel=el('label','Notes de travail'),notes=el('textarea');notes.rows=4;notes.maxLength=12000;notes.value=task.workNotes||'';notesLabel.append(notes);
const save=el('button','Enregistrer mes notes');save.type='button';save.onclick=()=>{try{update(id,t=>{t.workNotes=notes.value});status('Notes enregistrées sur cet appareil.')}catch(e){status(e.message)}};
const footer=el('footer'),edit=el('button','Modifier l’action'),done=el('button',task.status==='Terminé'?'Rouvrir l’action':'Marquer comme terminé');
edit.type=done.type='button';
edit.onclick=()=>{dialog.close();W.editAction(id)};
done.onclick=()=>{if(notes.value!==(get(id)?.workNotes||'')){status('Enregistre tes notes avant de changer le statut.');return}try{update(id,t=>{t.status=t.status==='Terminé'?'À faire':'Terminé'});render(id);status('Statut enregistré dans le planning.')}catch(e){status(e.message)}};
footer.append(edit,done);
const state=el('p');state.setAttribute('role','status');state.setAttribute('aria-live','polite');
dialog.append(head,meta,dateInfo,help,briefTitle,brief,resources,checklist,notesLabel,save,footer,state);
}
W.openAction=id=>{
try{
if(!dialog){dialog=el('dialog');dialog.id='eloah-action-sheet';dialog.setAttribute('aria-labelledby','action-sheet-title');document.body.append(dialog);dialog.addEventListener('close',()=>opener?.focus());}
opener=document.activeElement;currentId=id;render(id);if(!dialog.open)dialog.showModal();
}catch(e){const state=document.getElementById('ops-status');if(state)state.textContent=e.message}
};
window.addEventListener('storage',e=>{if((e.key===KEY||e.key===null)&&dialog?.open){status('Le planning a changé dans une autre fenêtre. Ferme puis rouvre la fiche avant de poursuivre.')}});
const style=el('style');style.textContent=`
#eloah-action-sheet{box-sizing:border-box;width:min(720px,calc(100% - 24px));max-height:88dvh;overflow:auto;padding:24px;background:#fffcf7;color:#242723;border:1px solid #c9c1b0;border-radius:8px;font:15px/1.6 system-ui}
#eloah-action-sheet::backdrop{background:#24272399}
#eloah-action-sheet header{display:flex;gap:18px;align-items:start;justify-content:space-between}
#eloah-action-sheet h2{font:400 29px/1.2 Georgia,serif;margin:0;overflow-wrap:anywhere}
#eloah-action-sheet h3{font:400 23px/1.3 Georgia,serif;margin:20px 0 9px}
#eloah-action-sheet .as-help{font-size:12px;color:#64675f}
#eloah-action-sheet a{display:block;color:#293d38;margin:10px 0;text-underline-offset:3px;min-height:30px}
#eloah-action-sheet label{display:flex;align-items:start;gap:10px;margin:12px 0}
#eloah-action-sheet input[type=checkbox]{width:20px;height:20px;margin-top:3px;accent-color:#293d38;flex:none}
#eloah-action-sheet label:has(textarea){display:block}
#eloah-action-sheet textarea{display:block;box-sizing:border-box;width:100%;margin-top:8px;padding:12px;font:16px/1.6 system-ui;border:1px solid #aaa18d;background:#fffaf5;color:#242723}
#eloah-action-sheet button{min-height:44px;padding:10px 14px;background:#ece8de;color:#293d38;border:1px solid #bcb5a7;border-radius:4px;cursor:pointer;font:inherit}
#eloah-action-sheet footer{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}
#eloah-action-sheet :is(a,button,input,textarea):focus-visible{outline:3px solid #927847;outline-offset:3px}
@media(max-width:650px){#eloah-action-sheet{padding:18px}#eloah-action-sheet h2{font-size:24px}}
`;document.head.append(style);
})();