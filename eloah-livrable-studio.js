/* ELOAH : assistant de livrables, une demande vers le moteur IA existant. */
(() => {
'use strict';
const formats={
 post:{label:'Publication complète',instructions:'Fournis un post prêt à publier, une variante courte, un appel à action sobre et une checklist de vérification. Ne prétends pas avoir publié.'},
 dossier:{label:'Dossier éditorial',instructions:'Fournis un dossier long structuré avec titre, angle, introduction, sections rédigées, conclusion et points à vérifier. Ne fabrique aucune source.'},
 atelier:{label:'Kit d’atelier',instructions:'Fournis présentation de l’atelier, déroulé, liste de matériel, message aux participants et texte de communication. N’invente aucune inscription ni disponibilité.'},
 carrousel:{label:'Carrousel',instructions:'Fournis 10 slides numérotées avec texte de chaque slide, direction artistique, légende complète et appel à action. Décris les images à créer sans prétendre les avoir générées.'}
};
function init(){
 const ai=document.getElementById('eloah-home-ai');
 const prompt=document.getElementById('home-ai-prompt');
 const project=document.getElementById('home-ai-project');
 if(!ai||!prompt||!project||document.getElementById('eloah-factory'))return;
 const box=document.createElement('section');box.id='eloah-factory';
 box.innerHTML='<h3>Mon atelier de création</h3><p>Une demande → un livrable structuré → relecture → sauvegarde.</p><label for="ef-format">Je veux créer</label><select id="ef-format"></select><label for="ef-subject">Mon idée ou mon sujet</label><textarea id="ef-subject" rows="3" placeholder="Écris simplement ce que tu veux obtenir…"></textarea><button type="button" id="ef-prepare">Créer maintenant avec ELOAH</button><p id="ef-status" role="status"></p><p class="ef-disclaimer">Les informations proviennent de ta demande et des notes validées de l’univers choisi. Pas de recherche externe ni de génération d’image automatique dans ce parcours.</p>';
 const options=box.querySelector('#ef-format');Object.entries(formats).forEach(([value,item])=>{const o=document.createElement('option');o.value=value;o.textContent=item.label;options.append(o)});
 const choices=document.getElementById('eloah-create-choices');
 if(choices)choices.after(box);else ai.querySelector('#home-ai-form')?.before(box);
 const subject=box.querySelector('#ef-subject'),status=box.querySelector('#ef-status');
 box.querySelector('#ef-prepare').addEventListener('click',()=>{
  const input=subject.value.trim();
  if(!input){status.textContent='Écris ton idée ou ton sujet.';subject.focus();return}
  const format=formats[options.value];
  prompt.value='MISSION DE PRODUCTION — '+format.label+'\nUNIVERS : '+(project.value||'ELOAH')+'\nSUJET : '+input+'\n\nLIVRABLE ATTENDU : '+format.instructions+'\n\nCONSIGNES : Utilise les règles validées de cet univers si elles sont disponibles. Distingue données confirmées, propositions et éléments manquants. Écris directement le livrable sans longues explications. Ne prétends pas avoir créé des images, publié, consulté des sources, ni réalisé une action externe sans preuve. Termine par « À vérifier avant diffusion » seulement si nécessaire.';
  prompt.dispatchEvent(new Event('input',{bubbles:true}));
  const form=document.getElementById('home-ai-form');
  if(!form){status.textContent='Formulaire IA indisponible. La demande reste prête dans le champ.';return}
  if(!navigator.onLine){status.textContent='Tu es hors ligne. La demande est prête, mais ne peut pas être envoyée.';return}
  if(form.getAttribute('aria-busy')==='true'){status.textContent='Une création est déjà en cours.';return}
  status.textContent='Demande transmise au formulaire IA. La connexion fondatrice sera vérifiée avant tout envoi.';
  form.requestSubmit();
  document.getElementById('home-ai-status')?.scrollIntoView({block:'center'});
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();