/* ELOAH · Bibliothèque de créations explicitement enregistrées sur cet appareil.
   Aucun enregistrement automatique, aucune synchronisation cloud. */
(() => {
'use strict';
const KEY='eloah-creations-local-v1',MAX=30;
const $=id=>document.getElementById(id);
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v.filter(x=>x&&typeof x.text==='string').slice(0,MAX):[]}catch{return []}}
function write(items){localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX)))}
function init(){
 const ai=$('eloah-home-ai'),log=$('home-ai-log'),prompt=$('home-ai-prompt');
 if(!ai||!log||!prompt||$('eloah-creation-library'))return;
 const panel=document.createElement('section');panel.id='eloah-creation-library';
 panel.innerHTML='<div class="ecl-head"><div><h3>Mes créations enregistrées</h3><p>Garde une réponse, reprends ton travail et exporte-le.</p></div><button type="button" id="ecl-save">Enregistrer la dernière création</button></div><p class="ecl-note">Enregistrement volontaire sur cet appareil uniquement, sans compte ni synchronisation. Évite les informations confidentielles sur un appareil partagé. Exporte tes travaux pour les conserver ailleurs.</p><p id="ecl-status" role="status" aria-live="polite"></p><div id="ecl-items"></div><button type="button" id="ecl-export">Exporter toutes mes créations (.json)</button>';
 ai.append(panel);
 const status=$('ecl-status'),items=$('ecl-items');
 function say(t){status.textContent=t}
 function download(name,contents,type){
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),3000);
 }
 function render(){
  items.replaceChildren();
  const list=read();
  if(!list.length){const p=document.createElement('p');p.textContent='Aucune création sauvegardée sur cet appareil.';items.append(p);return}
  for(const x of list){
   const article=document.createElement('article');article.className='ecl-item';
   const heading=document.createElement('strong');heading.textContent=x.title;
   const date=document.createElement('small');date.textContent=new Date(x.time).toLocaleString('fr-FR');
   const excerpt=document.createElement('p');excerpt.textContent=x.text.slice(0,160)+(x.text.length>160?'…':'');
   const actions=document.createElement('div');actions.className='ecl-actions';
   function action(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);actions.append(b)}
   action('Reprendre',()=>{prompt.value='Reprends et améliore cette création précédente :\n\n'+x.text.slice(0,4200)+'\n\nMa nouvelle demande : ';prompt.dispatchEvent(new Event('input',{bubbles:true}));prompt.focus();prompt.scrollIntoView({block:'center'});say('Création chargée dans la demande. Clique sur Envoyer pour continuer.')});
   action('Télécharger',()=>download('eloah-creation-'+x.id+'.txt',x.text,'text/plain;charset=utf-8'));
   action('Supprimer',()=>{if(!confirm('Supprimer cette création enregistrée sur cet appareil ?'))return;try{write(read().filter(v=>v.id!==x.id));render();say('Création supprimée de cet appareil.')}catch{say('Suppression impossible : stockage indisponible.')}});
   article.append(heading,date,excerpt,actions);items.append(article);
  }
 }
 $('ecl-save').addEventListener('click',()=>{
  const messages=[...log.querySelectorAll('.hai-message')];
  const response=[...messages].reverse().find(m=>m.dataset.author==='eloah');
  const question=[...messages].reverse().find(m=>m.dataset.author==='user');
  const text=response?.querySelector('p')?.textContent?.trim();
  if(!text){say('Aucune réponse IA à sauvegarder pour le moment.');return}
  const defaultName=(question?.querySelector('p')?.textContent||'Création ELOAH').trim().slice(0,60);
  const proposed=window.prompt('Titre de cette création :',defaultName);
  if(proposed===null)return;
  const title=proposed.trim().slice(0,100);
  if(!title){say('Donne un titre pour enregistrer.');return}
  const item={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),title,text,time:new Date().toISOString()};
  try{write([item,...read()]);render();say('Création enregistrée sur cet appareil. Pense à l’exporter pour la conserver.') }
  catch{say('Enregistrement impossible : espace de stockage indisponible ou saturé. Utilise Télécharger la réponse.')}
 });
 $('ecl-export').addEventListener('click',()=>{const data=read();if(!data.length){say('Aucune création à exporter.');return}download('eloah-mes-creations.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),creations:data},null,2),'application/json;charset=utf-8');say('Export demandé. Conserve le fichier dans un endroit sûr.')});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();