/* Power & Glam · photothèque V1 : navigateur local, sélection explicite, aucun envoi externe. */
(function(){
'use strict';
const photos=[
{id:'pg-vie-jungle',name:'Aventure tropicale vers la cascade',material:'VIE',universe:'Vie',also:['Amour'],position:'0% 0%',light:'Soleil filtré dans une canopée humide',frame:'Plan large, silhouette en marche, végétation au premier plan',feeling:'Élan, liberté et renaissance',alt:'Une femme traverse une jungle tropicale luxuriante en direction d’une cascade baignée de lumière dorée.',idea:'Traverser les changements sans perdre sa direction',note:'La femme ne pose pas ; le paysage domine.',colors:'#789477'},
{id:'pg-eau-lagon',name:'Lagon turquoise face aux montagnes',material:'EAU',universe:'Amour',also:['Vie','Désir'],position:'100% 100%',light:'Lumière claire sur l’eau transparente',frame:'Plan d’ensemble, horizon montagneux, mouvement dans le lagon',feeling:'Apaisement, respiration et fluidité',alt:'Une femme avance dans un lagon turquoise transparent face aux montagnes et à la végétation tropicale.',idea:'Faire de la place à ce que l’on ressent',note:'Transparence, profondeur et présence naturelle.',colors:'#A63D57'},
{id:'pg-terre-basalte',name:'Rivage volcanique sous lumière dorée',material:'TERRE',universe:'Argent',also:['Vie','Désir'],position:'0% 100%',light:'Soleil bas doré, relief humide et ombres profondes',frame:'Minéral au premier plan, mer et falaises en profondeur',feeling:'Ancrage, solidité et indépendance',alt:'Rivage volcanique aux roches de basalte noir, éclairées par un soleil bas au-dessus de l’océan.',idea:'Construire sa marge de manœuvre',note:'Texture réelle de la pierre et échelle monumentale.',colors:'#28705A'},
{id:'pg-feu-hibiscus',name:'Hibiscus rouge au coucher du soleil',material:'FEU',universe:'Désir',also:['Beauté','Amour'],position:'100% 0%',light:'Contre-jour chaud du coucher du soleil',frame:'Gros plan sur une fleur unique, arrière-plan côtier doux',feeling:'Choix, audace et vitalité',alt:'Un hibiscus rouge intense est éclairé par la lumière dorée du coucher du soleil, devant une côte tropicale.',idea:'Oser une décision qui donne envie',note:'L’hibiscus est un accent rare, pas un motif systématique.',colors:'#D7654F'}
];
const universes=['Amour','Beauté','Argent','Vie','Désir'];
const byId=id=>photos.find(p=>p.id===id);
function safeGet(key){try{return localStorage.getItem(key)}catch(e){return null}}
function safeSet(key,val){try{localStorage.setItem(key,val);return true}catch(e){return false}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function tagSelect(list,attr,selected){return list.map(v=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(v)+'</option>').join('')}
function matchPhoto(p,u){return u==='Tous'||p.universe===u||p.also.includes(u)}
function studioLink(p,u){return 'eloah-power-glam-article-studio.html?pg_photo='+encodeURIComponent(p.id)+'&pg_univers='+encodeURIComponent(u)}
function buildBrief(p,u){return 'Direction photographique Power & Glam — univers '+u+'.\nImage de référence : '+p.name+'.\nDescription : '+p.alt+'\nÉmotion : '+p.feeling+'.\nLumière : '+p.light+'.\nCadrage : '+p.frame+'.\nPiste éditoriale possible : '+p.idea+'.\nRègles : photographie crédible, mouvement naturel, pas de rendu plastique, pas de filtre artificiel, pas de symboles ajoutés systématiquement.\nLe visuel est une référence intégrée à la photothèque, pas encore une URL publique de couverture WordPress.'}
function initAtlas(){
const original=document.getElementById('galerie-images');if(!original||document.getElementById('pg-photo-engine'))return;
const host=document.createElement('section');host.id='pg-photo-engine';host.setAttribute('aria-label','Photothèque interactive Power & Glam');
original.parentNode.insertBefore(host,original);original.hidden=true;
const favKey='pg-photo-favoris-v1',selectionKey='pg-photo-selection-v1';
let favorites=[];try{favorites=JSON.parse(safeGet(favKey)||'[]');if(!Array.isArray(favorites))favorites=[]}catch(e){favorites=[]}
let current='pg-vie-jungle',chosenUniverse='Vie';
try{const s=JSON.parse(safeGet(selectionKey)||'null');if(s&&byId(s.photo)){current=s.photo;if(universes.includes(s.universe))chosenUniverse=s.universe;else chosenUniverse=byId(current).universe}}catch(e){}
host.innerHTML='<span id="phototheque" style="display:block;scroll-margin-top:22px"></span><div class="pg-pe-head"><div><span class="eyebrow">POWER & GLAM · CREATION ENGINE</span><h2>Ma photothèque vivante</h2><p class="pg-pe-muted">Choisis une photographie, explore sa fiche et ouvre le Studio Articles avec sa direction artistique. Aperçus de référence, non fichiers HD hébergés.</p></div><a class="cta" href="eloah-power-glam-article-studio.html">Studio Articles ↗</a></div>'+
'<div class="pg-pe-controls"><label>Rechercher une image<input type="search" id="pg-pe-search" placeholder="Lagon, basalte, hibiscus…"></label><label>Filtrer par matière<select id="pg-pe-matiere">'+tagSelect(['Toutes','EAU','VIE','TERRE','PEAU','FEU'],'', 'Toutes')+'</select></label><label>Filtrer par univers<select id="pg-pe-filter-univers">'+tagSelect(['Tous'].concat(universes),'','Tous')+'</select></label></div><p class="pg-pe-muted" id="pg-pe-count" role="status"></p><div class="pg-pe-grid" id="pg-pe-grid"></div><div class="pg-pe-detail" id="pg-pe-detail" aria-live="polite"></div>';
const grid=host.querySelector('#pg-pe-grid'),detail=host.querySelector('#pg-pe-detail'),count=host.querySelector('#pg-pe-count');
function visible(){const term=host.querySelector('#pg-pe-search').value.toLocaleLowerCase('fr').trim(),mat=host.querySelector('#pg-pe-matiere').value,univ=host.querySelector('#pg-pe-filter-univers').value;return photos.filter(p=>(mat==='Toutes'||p.material===mat)&&matchPhoto(p,univ)&&(p.name+' '+p.alt+' '+p.feeling+' '+p.material+' '+p.idea).toLocaleLowerCase('fr').includes(term))}
function render(){
const v=visible();count.textContent=v.length+' photographie(s) sur '+photos.length+' · '+favorites.length+' favori(s)';
grid.innerHTML=v.map(p=>'<article class="pg-pe-card" aria-selected="'+String(p.id===current)+'"><button type="button" class="pg-pe-preview pg-photo-preview" data-pick="'+p.id+'" style="background-position:'+p.position+'" aria-label="Sélectionner '+esc(p.name)+'"></button><div class="pg-pe-card-body"><small>'+esc(p.material)+' · '+esc(p.feeling)+'</small><h3>'+esc(p.name)+'</h3><div class="pg-pe-actions"><button type="button" data-pick="'+p.id+'">Voir la fiche</button><button type="button" data-fav="'+p.id+'" aria-pressed="'+String(favorites.includes(p.id))+'">'+(favorites.includes(p.id)?'♥ Favori':'♡ Favori')+'</button></div></div></article>').join('')||'<p class="pg-pe-empty">Aucune image ne correspond à ces filtres. Essaie une autre sélection.</p>';
const p=byId(current);if(!p||!v.some(x=>x.id===current)){detail.innerHTML='<p>Sélectionne une photographie pour afficher sa fiche.</p>';return}
detail.innerHTML='<span class="eyebrow">FICHE PHOTOGRAPHIQUE · '+esc(p.material)+'</span><h3>'+esc(p.name)+'</h3><p><b>Émotion :</b> '+esc(p.feeling)+'</p><p><b>Lumière :</b> '+esc(p.light)+'</p><p><b>Cadrage :</b> '+esc(p.frame)+'</p><p><b>Direction :</b> '+esc(p.note)+'</p><p><b>Texte alternatif :</b> '+esc(p.alt)+'</p><p class="pg-pe-note">Image générée de référence. L’aperçu de la page ne constitue pas une image HD publiée ni une couverture WordPress.</p><label for="pg-pe-universe" style="display:block;margin-top:13px">Univers de destination<select id="pg-pe-universe">'+tagSelect(universes,'',chosenUniverse)+'</select></label><div class="pg-pe-actions"><a class="pg-pe-action pg-pe-main" id="pg-pe-create" href="'+studioLink(p,chosenUniverse)+'">Créer avec cette image →</a><button type="button" id="pg-pe-copy">Copier la direction photo</button></div><p class="pg-pe-note" id="pg-pe-feedback" role="status"></p>';
detail.querySelector('#pg-pe-universe').onchange=e=>{chosenUniverse=e.target.value;detail.querySelector('#pg-pe-create').href=studioLink(p,chosenUniverse)};
detail.querySelector('#pg-pe-create').addEventListener('click',()=>{safeSet(selectionKey,JSON.stringify({photo:p.id,universe:chosenUniverse,at:new Date().toISOString()}))});
detail.querySelector('#pg-pe-copy').onclick=async()=>{try{await navigator.clipboard.writeText(buildBrief(p,chosenUniverse));detail.querySelector('#pg-pe-feedback').textContent='Direction artistique copiée.'}catch(e){detail.querySelector('#pg-pe-feedback').textContent='Copie impossible dans ce navigateur.'}};
}
grid.addEventListener('click',e=>{const pick=e.target.closest('[data-pick]'),fav=e.target.closest('[data-fav]');if(pick){current=pick.dataset.pick;chosenUniverse=byId(current).universe;safeSet(selectionKey,JSON.stringify({photo:current,universe:chosenUniverse}));render();detail.scrollIntoView({behavior:'smooth',block:'nearest'})}else if(fav){const id=fav.dataset.fav;favorites=favorites.includes(id)?favorites.filter(x=>x!==id):favorites.concat(id);safeSet(favKey,JSON.stringify(favorites));render()}});
['#pg-pe-search','#pg-pe-matiere','#pg-pe-filter-univers'].forEach(q=>host.querySelector(q).addEventListener('input',()=>{const visibleIds=visible().map(p=>p.id);if(visibleIds.length&&!visibleIds.includes(current)){current=visibleIds[0];chosenUniverse=byId(current).universe}render()}));
render();
}
function initStudio(){
const layout=document.querySelector('main .layout');if(!layout||document.getElementById('pg-photo-incoming'))return;
const q=new URLSearchParams(location.search);
let saved=null;try{saved=JSON.parse(safeGet('pg-photo-linked-article-v1')||'null')}catch(e){}
const requested=byId(q.get('pg_photo'));
const linked=!requested&&saved&&byId(saved.photo)?byId(saved.photo):null;
const photo=requested||linked;
const panel=document.createElement('section');panel.id='pg-photo-incoming';layout.parentNode.insertBefore(panel,layout);
if(!photo){panel.innerHTML='<strong>Photothèque Power & Glam</strong><p>Associe une photographie de référence et sa direction artistique à ton prochain article.</p><a href="power-glam-photographie.html#phototheque">Choisir une image dans la photothèque →</a>';return}
const universe=requested?(universes.includes(q.get('pg_univers'))?q.get('pg_univers'):photo.universe):(universes.includes(saved.universe)?saved.universe:photo.universe);
panel.innerHTML='<div class="pg-si-flex"><div class="pg-studio-photo-preview" role="img" aria-label="'+esc(photo.alt)+'" style="background-position:'+photo.position+'"></div><div class="pg-si-description"><span class="eyebrow">PHOTO LIÉE · '+esc(photo.material)+'</span><h2>'+esc(photo.name)+'</h2><p>'+esc(photo.feeling)+' · '+esc(photo.light)+'</p><p>Univers : <b>'+esc(universe)+'</b>. Cette photo est une <b>référence visuelle</b> : elle ne dispose pas encore d’une URL HD de couverture WordPress.</p><button id="pg-si-use" type="button" class="pg-pe-main">Utiliser dans mon brief</button><button id="pg-si-copy" type="button">Copier la fiche photo</button><a href="power-glam-photographie.html#phototheque">Changer d’image ↗</a><button id="pg-si-unlink" type="button">Dissocier l’image</button><p id="pg-si-status" role="status" aria-live="polite"></p></div></div>';
const status=panel.querySelector('#pg-si-status'),prompt=document.getElementById('prompt'),universeField=document.getElementById('universe'),alt=document.getElementById('alt');
const marker='[PHOTO P&G : '+photo.id+']';
function apply(ask){
if(prompt.value.includes(marker)){status.textContent='Cette direction photo figure déjà dans ton brief.';return}
if(ask&&prompt.value.trim()&&!window.confirm('Ton brouillon contient déjà un brief. Ajouter la référence photographique à sa suite, sans effacer ton texte ?'))return;
universeField.value=universe;
const brief=marker+'\n'+buildBrief(photo,universe);
prompt.value=prompt.value.trim()?prompt.value.trim()+'\n\n'+brief:'Sujet proposé : '+photo.idea+'.\n\n'+brief;
if(!alt.value.trim())alt.value=photo.alt;
prompt.dispatchEvent(new Event('input',{bubbles:true}));
universeField.dispatchEvent(new Event('change',{bubbles:true}));
status.textContent='Direction photo ajoutée au brief sans écraser le texte existant. Enregistre ton brouillon pour la conserver.';
}
panel.querySelector('#pg-si-use').onclick=()=>apply(true);
panel.querySelector('#pg-si-copy').onclick=async()=>{try{await navigator.clipboard.writeText(buildBrief(photo,universe));status.textContent='Fiche photographique copiée.'}catch(e){status.textContent='Copie non disponible dans ce navigateur.'}};
panel.querySelector('#pg-si-unlink').onclick=()=>{
if(!window.confirm('Dissocier cette photographie du brouillon ? Le texte de ton article ne sera pas supprimé.'))return;
try{localStorage.removeItem('pg-photo-linked-article-v1');localStorage.removeItem('pg-photo-selection-v1')}catch(e){}
const u=new URL(location.href);u.searchParams.delete('pg_photo');u.searchParams.delete('pg_univers');history.replaceState(null,'',u.pathname+u.search+u.hash);
panel.innerHTML='<strong>Photographie dissociée</strong><p>Le texte de ton brouillon est conservé. Tu peux sélectionner une autre image.</p><a href="power-glam-photographie.html#phototheque">Ouvrir la photothèque →</a>';
};
if(!prompt.value.trim()){apply(false)}else{status.textContent=prompt.value.includes(marker)?'Cette image fait déjà partie du brief enregistré.':'Brouillon existant conservé. Clique sur « Utiliser dans mon brief » pour y ajouter la photographie.'}
const save=document.getElementById('save-local');if(save)save.addEventListener('click',()=>{
const payload={photo:photo.id,universe,updated:new Date().toISOString()};
if(!safeSet('pg-photo-linked-article-v1',JSON.stringify(payload))){status.textContent='Impossible de mémoriser le lien photo sur cet appareil : exporte ton brouillon.'}
});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{initAtlas();initStudio()});else{initAtlas();initStudio()}
})();
