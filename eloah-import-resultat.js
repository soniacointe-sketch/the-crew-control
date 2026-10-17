/* ELOAH · Réutilisation volontaire d'un texte terminé dans le parcours d'export.
   Fonctionne sans connexion IA. Aucun envoi automatique et aucune sauvegarde implicite. */
(()=>{
'use strict';
const MAX_LENGTH=100000;
function init(){
 const guide=document.getElementById('eloah-result-guide');
 const log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('eloah-import-resultat'))return;
 const panel=document.createElement('details');
 panel.id='eloah-import-resultat';
 panel.innerHTML=
  '<summary>J’ai déjà un contenu terminé · le reprendre ici</summary>'+
  '<div class="eir-body">'+
  '<p>Colle un texte préparé dans ChatGPT, dans tes notes ou ailleurs. ELOAH pourra le mettre en page et l’exporter <strong>sans prétendre l’avoir généré</strong>.</p>'+
  '<label for="eir-text">Mon contenu à reprendre</label>'+
  '<textarea id="eir-text" rows="8" maxlength="'+MAX_LENGTH+'" placeholder="Colle ici ton article, ton dossier ou les 10 textes du carrousel…"></textarea>'+
  '<p class="eir-hint">Aucune génération IA, aucune transmission et aucun enregistrement déclenchés par cette action. Tu choisis ensuite ta sauvegarde.</p>'+
  '<button type="button" id="eir-use">Utiliser ce texte pour mes exports</button>'+
  '<p id="eir-status" role="status" aria-live="polite"></p>'+
  '</div>';
 const state=document.getElementById('eloah-result-state');
 if(state)state.after(panel);else guide.prepend(panel);
 const textarea=panel.querySelector('#eir-text');
 const status=panel.querySelector('#eir-status');
 const use=panel.querySelector('#eir-use');
 use.addEventListener('click',()=>{
  const value=textarea.value.trim();
  if(value.length<10){status.textContent='Colle un contenu d’au moins 10 caractères.';textarea.focus();return}
  if(value.length>MAX_LENGTH){status.textContent='Texte trop long pour cette importation.';return}
  if(document.getElementById('home-ai-form')?.getAttribute('aria-busy')==='true'){
   status.textContent='Une réponse IA est en cours : termine ou arrête cette génération avant d’importer un autre résultat.';return;
  }
  // Les précédentes importations sont remplacées ; les réponses IA ne sont jamais effacées ici.
  log.querySelectorAll('.hai-message[data-eloah-import="true"]').forEach(node=>node.remove());
  // Un contenu collé ne peut hériter des prétendues preuves d'une génération antérieure.
  try{window.EloahEvidence?.clear?.()}catch{}
  const article=document.createElement('article');
  article.className='hai-message';
  article.dataset.author='eloah'; // Compatibilité avec les fonctions d'export existantes.
  article.dataset.eloahImport='true';
  const title=document.createElement('strong');
  title.textContent='Texte importé manuellement · non généré par ELOAH';
  const body=document.createElement('p');
  body.textContent=value; // Pas d'injection HTML, le contenu importé reste du texte.
  article.append(title,body);
  log.append(article);
  status.textContent='Texte chargé pour les exports. Relis-le, puis utilise les boutons de sauvegarde ou de téléchargement ci-dessous.';
  const announcement=document.getElementById('eloah-import-indicator')||document.createElement('p');
  announcement.id='eloah-import-indicator';
  announcement.setAttribute('role','status');
  announcement.textContent='Contenu actif : texte importé manuellement. Sources non vérifiées. Aucun envoi ni publication.';
  guide.insertBefore(announcement,guide.querySelector('.eloah-result-buttons'));
  panel.open=false;
  guide.scrollIntoView({block:'start',behavior:'smooth'});
 });
 const style=document.createElement('style');
 style.textContent=
  '#eloah-import-resultat{margin:14px 0;border:1px solid #d6cabe;border-radius:10px;background:#fffcf7;color:#292828}'+
  '#eloah-import-resultat summary{cursor:pointer;padding:14px;font:600 14px/1.5 system-ui;color:#293d38;min-height:46px;box-sizing:border-box}'+
  '#eloah-import-resultat .eir-body{padding:2px 14px 16px}'+
  '#eloah-import-resultat p{font:13px/1.6 system-ui!important;color:#4d4d49!important;margin:5px 0 12px}'+
  '#eloah-import-resultat label{display:block;font:600 13px system-ui;margin-bottom:8px;color:#293d38}'+
  '#eloah-import-resultat textarea{box-sizing:border-box;display:block;width:100%;min-height:165px;padding:12px;border:1px solid #a8a39a;border-radius:8px;font:16px/1.5 system-ui;color:#222;background:#fff;resize:vertical}'+
  '#eloah-import-resultat button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border:0;border-radius:8px;background:#293d38;color:#fff;font:600 14px system-ui;padding:10px 16px;cursor:pointer}'+
  '#eloah-import-resultat button:focus-visible,#eloah-import-resultat textarea:focus-visible,#eloah-import-resultat summary:focus-visible{outline:3px solid #c69270;outline-offset:3px}'+
  '#eloah-result-guide #eloah-import-indicator{padding:10px 12px;border-left:3px solid #789477;background:#f0f4eb;color:#2d4537!important;font:13px/1.5 system-ui!important}';
 document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
