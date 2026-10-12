/* Power & Glam — dix prompts images, ouverts dans ChatGPT après choix explicite. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const universes=['Amour','Beauté','Argent','Vie','Désir'];
const photos=[
{id:'pg-vie-jungle',title:'Aventure tropicale vers la cascade',material:'VIE · jungle et canopée',universe:'Vie',scene:'une jungle émeraude dense, des fougères et feuilles mouillées, un chemin naturel et une cascade dans une vallée profonde',lighting:'rayons dorés filtrant à travers la canopée, vapeur subtile, profondeur réelle',accent:'vert profond',human:'une femme adulte vue de dos qui avance sur un sentier humide, sans poser'},
{id:'pg-eau-lagon',title:'Lagon turquoise face aux montagnes',material:'EAU · lagon turquoise',universe:'Amour',scene:'un lagon turquoise translucide avec reflets solaires, montagnes tropicales et palmiers naturels',lighting:'soleil tropical doux, éclats à la surface de l’eau, horizon lumineux',accent:'turquoise clair et émeraude',human:'une femme adulte traversant naturellement l’eau peu profonde, vue de dos'},
{id:'pg-terre-basalte',title:'Rivage volcanique sous lumière dorée',material:'TERRE · basalte noir',universe:'Argent',scene:'des falaises et galets de basalte noir mouillé, l’océan et une lumière rasante',lighting:'fin de journée dorée, roche humide et contraste naturel, profondeur atmosphérique',accent:'charbon minéral et ambre',human:'une silhouette adulte très lointaine marchant le long du rivage'},
{id:'pg-feu-hibiscus',title:'Hibiscus rouge au coucher du soleil',material:'FEU · hibiscus rouge',universe:'Désir',scene:'un seul hibiscus rouge intense sur un feuillage tropical sombre, un bord de mer lointain',lighting:'soleil bas doré, pétales détaillés, profondeur de champ optique naturelle',accent:'rouge floral rare',human:'pas de personne, la fleur et la nature portent le récit'}
];
const variants=[
{title:'Image signature',note:'L’image fondatrice qui résume ton univers.',angle:'Composition signature de maison éditoriale. Raconter le paysage comme un territoire vivant et singulier ; répartition visuelle élégante, sujet principal lisible, respiration et atmosphère profonde.',lens:'optique naturelle 35 mm'},
{title:'Grand paysage cinématographique',note:'L’espace, l’horizon et la profondeur.',angle:'Photographier un plan très large du lieu, avec plusieurs plans de profondeur, relief, horizon, textures fines et ampleur spectaculaire mais plausible.',lens:'grand-angle réaliste 24 mm'},
{title:'Une femme qui traverse',note:'Une présence humaine en mouvement, jamais posée.',angle:'Une femme adulte traverse physiquement la scène, absorbée par son mouvement et son environnement. La photographier de trois-quarts dos ou de dos, à l’échelle humaine du paysage ; pas de regard caméra ni de posture publicitaire.',lens:'photo documentaire 50 mm',human:true},
{title:'Nature sans personne',note:'Laisser les matières raconter l’histoire.',angle:'Aucune figure humaine : faire du lieu, de l’eau, de la végétation et de la lumière les sujets de l’image. Authenticité naturelle, détails organiques et composition contemplative.',lens:'paysage naturel 35 mm',noHuman:true},
{title:'Matière en détail',note:'Gros plan sur texture et sensations.',angle:'Photographie rapprochée sur la matière la plus caractéristique de cette scène : gouttes, feuille, roche, pétale ou reflet. Montrer des microtextures crédibles et une faible profondeur de champ naturelle.',lens:'macro 85 mm',noHuman:true},
{title:'Lumière dorée',note:'Le soleil comme émotion, sans filtre artificiel.',angle:'Variante au lever ou au coucher du soleil, où un rayon réel souligne le relief du décor. Conserver la palette naturelle, sans teinte jaune générale ni soleil irréaliste.',lens:'contre-jour photographique 50 mm'},
{title:'Reflets et transparences',note:'Jeu d’eau, de lumière et de profondeur.',angle:'Explorer reflets, transparences et couches de lumière de la scène, de façon physiquement crédible : eau si le lieu le permet, verre naturel, surface humide ou ombres projetées. Aucune eau ajoutée si elle ne convient pas au sujet.',lens:'optique 50 mm'},
{title:'Contraste minéral & végétal',note:'Rencontre entre puissance et vivant.',angle:'Juxtaposer naturellement deux matières présentes ou plausibles du lieu : roche sombre et feuillage humide, eau et pierre, fleur et lumière. Composition sculpturale sans symbole plaqué.',lens:'photographie de matière 50 mm'},
{title:'Lifestyle éditorial naturel',note:'Un geste réel plutôt qu’une pose publicitaire.',angle:'Scène vécue et discrète : quelqu’un marche, touche une feuille, ouvre un carnet, longe l’eau ou s’arrête pour observer. Pas de publicité, de sourire forcé ou d’accessoires gratuits.',lens:'reportage sensible 35 mm'},
{title:'Couverture avec espace pour titre',note:'Un cadrage pensé pour l’article et ses déclinaisons.',angle:'Composition verticale ou horizontale avec une zone calme et volontairement libre pour ajouter un titre plus tard. La photographie générée elle-même ne doit contenir aucun texte. Sujet placé élégamment hors de cette zone.',lens:'cadrage éditorial 50 mm'}
];
const choices={'Article / WordPress':'couverture de blog, avec espace de composition','Instagram':'publication éditoriale Instagram premium','Story / Reel':'story verticale immersive sans texte intégré','Dossier / ebook':'couverture de dossier ou ebook haut de gamme','Collection visuelle':'image de collection cohérente'};
const formats=['4:5','1:1','9:16','16:9'];
const key='pg-image-prompts-v1';
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getStore(){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){return {}}}
function saveStore(x){try{localStorage.setItem(key,JSON.stringify(x));return true}catch(e){return false}}
function build(p,u,fmt,use,v){
let living=v.noHuman?'Aucune personne dans cette photographie.':v.human?'Présence humaine : une femme adulte, naturelle, qui traverse le lieu ; pas une personne réelle identifiée.':p.human;
return 'Génère maintenant UNE IMAGE originale. Ne réponds pas avec une explication, un prompt reformulé ou du code : réalise une image.\n'+
'POWER & GLAM · '+u.toUpperCase()+' · PROPOSITION '+String(variants.indexOf(v)+1).padStart(2,'0')+' SUR 10 — '+v.title+'.\n'+
'Image de référence décrite (aucun fichier image joint automatiquement) : '+p.title+'. Paysage de base : '+p.scene+'.\n'+
'Objectif : '+choices[use]+'. Format demandé : '+fmt+'.\n'+
'Direction photographique : '+v.angle+'\n'+
'Lumière : '+p.lighting+'. Dominante naturelle : '+p.accent+'. '+living+'\n'+
'Esthétique : photographie cinématographique premium hyperréaliste, textures organiques crédibles, dynamique de lumière naturelle, atmosphère adulte, regard éditorial de mode, '+v.lens+'.\n'+
'ADN Power & Glam : VIE/jungle, EAU/lagon, TERRE/basalte, PEAU/lumière ambre, FEU/hibiscus rouge, dosés au niveau de la collection et non imposés tous dans chaque photographie.\n'+
'Règles : pas de peau plastique, pas de flore irréaliste, pas de voile de couleur uniforme, pas de calice imposé, pas d’hibiscus ajouté systématiquement, pas de pose publicitaire, pas de collage d’éléments incohérents.\n'+
'Composition lisible avec une belle respiration. AUCUN texte écrit, aucun logo, aucune signature ni watermark dans l’image.\n'+
'Produis une seule image correspondant précisément à cette variation.';
}
function init(){
const layout=document.querySelector('main .layout'),base=$('universe'),brief=$('prompt');
if(!layout||!base||!brief||$('pg-image-prompts'))return;
const q=new URLSearchParams(location.search);
const selectedPhoto=photos.find(p=>p.id===q.get('pg_photo'));
const store=getStore();
const first=selectedPhoto||photos.find(p=>p.id===store.photo)||photos[0];
const chooseU=universes.includes(q.get('pg_univers'))?q.get('pg_univers'):selectedPhoto?first.universe:universes.includes(base.value)?base.value:first.universe;
let photo=first,universe=chooseU,fmt=formats.includes(store.format)?store.format:'4:5',use=Object.prototype.hasOwnProperty.call(choices,store.use)?store.use:'Article / WordPress',chosen=0,dirty=(store.edits&&typeof store.edits==='object'&&!Array.isArray(store.edits))?store.edits:{};
const host=document.createElement('section');host.id='pg-image-prompts';host.setAttribute('aria-label','Atelier de dix prompts images Power & Glam');
layout.parentNode.insertBefore(host,layout);
host.innerHTML='<div class="pgip-header"><div><span class="pgip-overline">POWER & GLAM · IMAGE LAB · 10 PROMPTS</span><h2>Dix images à imaginer, une à créer à la fois.</h2><p>Depuis une photographie de référence, prépare dix cadrages originaux. Ouvre celui de ton choix dans ChatGPT pour générer l’image ici, puis reviens à ton article.</p></div><span class="pgip-pill">10 propositions photographiques</span></div>'+
'<div class="pgip-options"><label>Photographie de référence<select id="pgip-photo">'+photos.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.title)+'</option>').join('')+'</select></label><label>Univers<select id="pgip-universe">'+universes.map(x=>'<option>'+x+'</option>').join('')+'</select></label><label>Destination et format<div style="display:flex;gap:7px"><select aria-label="Destination" id="pgip-use">'+Object.keys(choices).map(x=>'<option>'+x+'</option>').join('')+'</select><select aria-label="Format" id="pgip-format">'+formats.map(x=>'<option>'+x+'</option>').join('')+'</select></div></label></div>'+
'<p class="pgip-notice">La photographie sert de référence d’ambiance via sa description ; ses pixels ne sont pas envoyés automatiquement à ChatGPT. Les prompts sont modifiables avant création.</p>'+
'<div class="pgip-grid" id="pgip-grid"></div>'+
'<div class="pgip-editor"><span class="pgip-overline" id="pgip-current-label"></span><h3 id="pgip-current-title"></h3><label for="pgip-text">Prompt prêt à envoyer dans ChatGPT</label><textarea id="pgip-text" spellcheck="true"></textarea><div class="pgip-utilities"><button id="pgip-copy" type="button">Copier ce prompt</button><a id="pgip-open" class="pgip-link pgip-open" target="_blank" rel="noopener noreferrer" href="https://chatgpt.com/">Créer cette image dans ChatGPT ↗</a><button id="pgip-add" type="button">Ajouter au brief de l’article</button><button id="pgip-all" type="button">Copier les 10 prompts</button><button id="pgip-reset" type="button">Réinitialiser ce prompt</button></div><p class="pgip-notice">ChatGPT ouvre une nouvelle conversation avec la demande préremplie lorsque ce paramètre est pris en charge. Vérifie le texte et envoie-le. La génération n’est pas déclenchée par GitHub Pages ; si le préremplissage échoue, colle le prompt copié.</p><p class="pgip-status" id="pgip-status" role="status" aria-live="polite"></p></div>';
const el=id=>host.querySelector('#'+id);
el('pgip-photo').value=photo.id;el('pgip-universe').value=universe;el('pgip-use').value=use;el('pgip-format').value=fmt;
function configId(i){return [photo.id,universe,fmt,use,i].join('|')}
function promptAt(i){const id=configId(i);return Object.prototype.hasOwnProperty.call(dirty,id)?dirty[id]:build(photo,universe,fmt,use,variants[i])}
function configure(){
photo=photos.find(p=>p.id===el('pgip-photo').value)||photos[0];
universe=el('pgip-universe').value;fmt=el('pgip-format').value;use=el('pgip-use').value;
const saved=getStore();saved.photo=photo.id;saved.format=fmt;saved.use=use;saveStore(saved);redraw();
}
function setStatus(t){el('pgip-status').textContent=t}
function redraw(){
el('pgip-grid').innerHTML=variants.map((v,i)=>'<article class="pgip-card" aria-selected="'+(chosen===i?'true':'false')+'"><div class="pgip-topline"><span class="pgip-count">'+String(i+1).padStart(2,'0')+'/10</span><span class="pgip-use">'+esc(fmt)+' · '+esc(universe)+'</span></div><h3>'+esc(v.title)+'</h3><p>'+esc(v.note)+'</p><div class="pgip-actions"><button type="button" data-edit="'+i+'">Ouvrir le prompt</button><a class="pgip-link pgip-open" data-create="'+i+'" href="https://chatgpt.com/?q='+encodeURIComponent(promptAt(i))+'" target="_blank" rel="noopener noreferrer">Créer dans ChatGPT ↗</a></div></article>').join('');
el('pgip-current-label').textContent='PROPOSITION '+String(chosen+1).padStart(2,'0')+' SUR 10 · '+universe.toUpperCase();
el('pgip-current-title').textContent=variants[chosen].title;
el('pgip-text').value=promptAt(chosen);
el('pgip-open').href='https://chatgpt.com/?q='+encodeURIComponent(el('pgip-text').value);
setStatus('');
}
async function copy(x,label){try{await navigator.clipboard.writeText(x);setStatus(label+' copié.')}catch(e){el('pgip-text').focus();el('pgip-text').select();setStatus('Copie automatique indisponible. Le texte du prompt est sélectionné : utilise Ctrl+C.')}}
el('pgip-grid').addEventListener('click',e=>{const button=e.target.closest('[data-edit]');if(button){chosen=Number(button.dataset.edit);redraw();el('pgip-text').scrollIntoView({behavior:'smooth',block:'center'})}});
el('pgip-text').addEventListener('input',()=>{dirty[configId(chosen)]=el('pgip-text').value;const updated=getStore();updated.edits=dirty;saveStore(updated);el('pgip-open').href='https://chatgpt.com/?q='+encodeURIComponent(el('pgip-text').value);const link=el('pgip-grid').querySelector('[data-create="'+chosen+'"]');if(link)link.href=el('pgip-open').href});
['pgip-photo','pgip-universe','pgip-use','pgip-format'].forEach(id=>el(id).addEventListener('change',configure));
el('pgip-copy').onclick=()=>copy(el('pgip-text').value,'Prompt');
el('pgip-all').onclick=()=>copy(variants.map((v,i)=>'—— '+(i+1)+' / 10 · '+v.title+' ——\n'+promptAt(i)).join('\n\n'),'Les dix prompts');
el('pgip-reset').onclick=()=>{delete dirty[configId(chosen)];const updated=getStore();updated.edits=dirty;saveStore(updated);redraw();setStatus('Prompt restauré dans sa version originale.')};
el('pgip-add').onclick=()=>{
const marker='[PROMPT IMAGE POWER & GLAM '+photo.id+' / '+(chosen+1)+']';
if(brief.value.includes(marker)){setStatus('Ce prompt a déjà été ajouté au brief de l’article.');return}
if(brief.value.trim()&&!window.confirm('Ajouter ce prompt à la fin du brief existant, sans remplacer ton texte ?'))return;
brief.value+=(brief.value.trim()?'\n\n':'')+marker+'\n'+el('pgip-text').value;
brief.dispatchEvent(new Event('input',{bubbles:true}));
setStatus('Prompt ajouté au brief sans effacer ton article. Pense à cliquer sur « Conserver localement ».');
};
redraw();
if(location.hash==='#pg-image-prompts')window.setTimeout(()=>host.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
