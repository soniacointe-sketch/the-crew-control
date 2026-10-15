/* ELOAH PARISIS · Mini-lexique de lecture : dictionnaire explicite, consultation consentie.
   Aucune saisie de l'utilisateur n'est envoyée à Logeion automatiquement. */
(function(){
"use strict";
const lex=window.PARISIS_ALPHA_LEXIQUE;
const reader=window.PARISIS_ALPHA_READER;
const details=document.getElementById("alphaWordDetails");
const input=document.getElementById("alphaInput");
const cloud=document.getElementById("alphaWords");
if(!lex||!reader||!details||!input||!cloud)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const style=document.createElement("style");
style.textContent=`
#alpha-lexicon{margin-top:23px;background:#25242d;border:1px solid #83677a;padding:17px;min-width:0}
#alpha-lexicon h3{font:normal 25px Georgia,serif;color:#fbead5;margin:0 0 7px}
#alpha-lexicon .al-small{font-size:12px;color:#d9c8bb}
#alpha-lexicon .al-tag{font-size:10px;color:#f4d3a3;font-weight:800;letter-spacing:.12em}
#alpha-lexicon .al-gloss{margin:14px 0;background:#342b37;border-left:3px solid #e9c582;padding:13px}
#alpha-lexicon .al-gloss strong{font:23px Georgia,serif;color:#fff1da}
#alpha-lexicon .al-gloss p{margin:7px 0;color:#f2e3cf;font-size:13px}
#alpha-lexicon .al-gloss small{font-size:11px;color:#d5beb8}
#alpha-lexicon a{color:#f1cfa1}
#alpha-lexicon .al-tokens{display:flex;flex-wrap:wrap;gap:6px;margin:11px 0;max-height:180px;overflow:auto}
#alpha-lexicon .al-tokens button{background:#3b3241;color:#f6e6d1;border:1px solid #786174;padding:7px 9px;font:12px system-ui;cursor:pointer}
#alpha-lexicon .al-tokens button:hover,#alpha-lexicon .al-tokens button[aria-pressed="true"]{background:#684a62;border-color:#e9c582}
#alpha-lexicon .al-muted{color:#bdaab0;font-size:11px}
`;
document.head.appendChild(style);
const section=document.createElement("section");
section.id="alpha-lexicon";
section.setAttribute("aria-label","Mini-lexique grec historique");
section.innerHTML='<div class="al-tag">LECTURE SÉMANTIQUE · DICTIONNAIRE DE TRAVAIL</div>'+
'<h3>Que signifie ce mot en grec ?</h3>'+
'<p class="al-small">Les valeurs numériques et les parties du corps ne sont pas des traductions. Ce lexique distingue les mots attestés, leur sens possible et les formes inconnues.</p>'+
'<div id="alSelection" role="status" aria-live="polite">Sélectionne un mot grec.</div>'+
'<div class="al-tag">FORMES RECONNUES DANS LE PASSAGE</div><div id="alTokens" class="al-tokens"></div>'+
'<p class="al-muted">Lexique limité : la flexion grecque complète, les ambiguïtés et la syntaxe ne sont pas automatiquement résolues. Consulter les dictionnaires de référence avant de conclure.</p>';
details.insertAdjacentElement("afterend",section);
const selected=document.getElementById("alSelection"),tokens=document.getElementById("alTokens");
let activeIndex=0;
function renderWord(word){
 const result=lex.lookup(word);
 if(!result.recognized){
  const greek=/[\u0370-\u03FF\u1F00-\u1FFF]/u.test(word);
  selected.innerHTML='<div class="al-gloss"><strong>'+esc(word||"Aucun mot")+'</strong><p>'+esc(greek?"Mot grec non reconnu dans le mini-lexique : aucune définition ne sera inventée.":"Mot non reconnu comme grec ; utilise le mode graphique expérimental uniquement pour la cartographie des lettres.")+'</p>'+
   (greek?'<a href="https://logeion.uchicago.edu/'+encodeURIComponent(word)+'" target="_blank" rel="noopener noreferrer">Chercher ce mot sur Logeion ↗</a>':'')+'</div>';
  return;
 }
 selected.innerHTML=result.matches.map(m=>
 '<div class="al-gloss"><strong>'+esc(word)+' → '+esc(m.lemma)+'</strong>'+
 '<p><b>'+esc(m.gloss)+'</b> · '+esc(m.category)+'</p>'+
 '<small>'+esc(m.note)+'</small>'+
 '<p><a href="'+esc(m.reference)+'" target="_blank" rel="noopener noreferrer">Vérifier le lemme dans Logeion ↗</a></p></div>').join("")+
 '<p class="al-muted">'+esc(result.status)+' · La définition doit être interprétée dans la phrase originale.</p>';
}
function render(){
 const words=reader.tokenise(input.value).slice(0,1800);
 if(activeIndex>=words.length)activeIndex=0;
 const occurrences=[];
 for(let i=0;i<words.length;i++){
  const result=lex.lookup(words[i]);
  if(result.recognized)occurrences.push({index:i,word:words[i]});
 }
 tokens.replaceChildren();
 for(const {index,word} of occurrences.slice(0,70)){
  const button=document.createElement("button");
  button.type="button";button.textContent=word;button.dataset.alIndex=String(index);
  button.setAttribute("aria-pressed",String(index===activeIndex));tokens.append(button);
 }
 const word=words[activeIndex]||"";
 renderWord(word);
}
cloud.addEventListener("click",event=>{
 const b=event.target.closest("button[data-index]");
 if(!b)return;
 activeIndex=Number(b.dataset.index);render();
});
tokens.addEventListener("click",event=>{
 const b=event.target.closest("button[data-al-index]");if(!b)return;
 activeIndex=Number(b.dataset.alIndex);
 const wordButton=cloud.querySelector('button[data-index="'+activeIndex+'"]');
 if(wordButton)wordButton.click();else render();
});
const observer=new MutationObserver(()=>{render()});
observer.observe(cloud,{childList:true});
render();
})();
