(()=>{
'use strict';
const get=id=>document.getElementById(id),key='eloah-crew-article-studio-v1';
let ideas=[],selected=null,page=0;
const facts=document.createElement('section');facts.className='panel';facts.innerHTML='<h2>Informations confirmées pour cet article</h2><p>Ajoute ici les dates, horaires, tarifs, liens et détails que tu as vérifiés. Ces informations entrent dans le brief.</p><label for="crew-facts">Mes informations à utiliser</label><textarea id="crew-facts" placeholder="Informations vérifiées pour ce sujet…"></textarea><label for="crew-pack">SEO et textes de partage</label><textarea id="crew-pack" placeholder="Colle ici la méta-description, le slug et les textes Facebook, Instagram et story."></textarea><div class="actions"><button type="button" id="crew-export">Exporter le dossier JSON</button><label class="action secondary" for="crew-import">Importer un dossier JSON</label><input type="file" id="crew-import" accept=".json,application/json"></div>';
document.querySelector('.layout').before(facts);
const briefBox=document.createElement('section');briefBox.className='panel';briefBox.innerHTML='<h2>Brief complet pour ChatGPT</h2><label for="crew-brief">Texte à copier</label><textarea id="crew-brief" rows="10" readonly></textarea><p>Les 1 300 idées sont des pistes de création, pas des activités annoncées.</p>';
get('pg-ideas').after(briefBox);
const controls=document.createElement('div');controls.className='actions';controls.innerHTML='<button type="button" id="crew-prev">← Précédent</button><span id="crew-page" role="status"></span><button type="button" id="crew-next">Suivant →</button>';get('pg-idea-list').after(controls);
function makeBrief(){
return [
'THE CREW ORCHIES — DOSSIER ÉDITORIAL COMPLET',
'Thème : '+get('universe').value,
'Sujet : '+get('prompt').value,
'Angle : '+(selected?.angle||'Guide concret et accessible'),
'Développement : '+(selected?.instruction||'Expliquer le sujet à partir de situations concrètes et proposer une action réalisable.'),
'CONTEXTE : Association de danse à Orchies, danse moderne et pompons, enfants, ados et adultes. Ton chaleureux, convivial, accessible, naturel, comme Sonia qui parle au groupe. Pas de slogans empilés ni de discours commercial artificiel. Noir #111111 et or #c9a86a. Ne pas désigner les cours comme de la Zumba.',
'INFORMATIONS CONFIRMÉES PAR SONIA POUR CE SUJET :\n'+(get('crew-facts').value||'Aucune information pratique récente fournie. Ne pas inventer de date, tarif, effectif, lieu précis, places restantes, témoignage ou événement réalisé.'),
'RIGUEUR : distinguer les propositions, exemples fictifs et faits vérifiés. Ne pas attribuer un témoignage ou une expérience réelle sans source. Vérifier les affirmations historiques ou techniques avec des sources identifiables quand la recherche est disponible. Pas de promesse de santé. Pour les photos de personnes, vérifier les autorisations, notamment pour les mineurs. Ne jamais inventer de citation attribuée.',
'LIVRABLE 1 : article original complet de 1 000 à 1 500 mots, titre précis, chapô, 5 à 7 sections, exemples, encadré pratique et conclusion conviviale. Adapter la longueur si le sujet exige un format plus court. Si le sujet évoque un atelier, le présenter comme proposition tant qu’il n’est pas confirmé.',
'LIVRABLE 2 : remplir séparément TITRE, INTRODUCTION, CORPS (intertitres ## sur une ligne séparée avec une ligne vide avant et après), PHRASE À RETENIR facultative, PHOTO (URL seulement si réellement connue et autorisée), TEXTE ALTERNATIF.',
'LIVRABLE 3 : titre SEO, slug proposé, méta-description, extrait, catégorie, mots-clés et liens internes seulement si leur URL est connue. Site de destination : https://thecreworchies.blog .',
'LIVRABLE 4 : texte Facebook naturel, légende Instagram, 5 écrans story et message WhatsApp court, avec [LIEN APRÈS PUBLICATION] si nécessaire. Pas de faux compte à rebours.',
'LIVRABLE 5 : brief photo de couverture 16:9, déclinaisons 4:5 et 9:16, texte superposé lisible. Privilégier les vraies photos du Crew avec les accords nécessaires. À défaut proposer une illustration clairement identifiée, jamais un faux reportage du Crew.',
'LIVRABLE 6 : blocs Gutenberg sans script, tableau des informations restant à confirmer et checklist avant publication. Ne pas publier ni envoyer de message. Livrer le contenu complet, pas une simple méthode.'
].join('\n\n');
}
function refresh(){get('crew-brief').value=makeBrief();}
async function copy(text,status){try{await navigator.clipboard.writeText(text);get('state').textContent=status;}catch{get('crew-brief').value=text;get('crew-brief').focus();get('crew-brief').select();get('state').textContent='Texte sélectionné : copie-le avec Ctrl+C ou le menu Copier.';}}
get('copy-prompt').onclick=()=>{refresh();copy(get('crew-brief').value,'Brief complet copié. Colle-le dans ChatGPT.');};
['prompt','universe','crew-facts'].forEach(id=>get(id).addEventListener('input',()=>{if(id==='prompt')selected=null;refresh();}));
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function render(){
const term=get('pg-idea-search').value.toLocaleLowerCase('fr'),category=get('pg-idea-filter').value;
const filtered=ideas.filter(i=>(category==='all'||category===i.universe)&&(i.title+' '+i.universe).toLocaleLowerCase('fr').includes(term));
const pages=Math.max(1,Math.ceil(filtered.length/30));page=Math.min(page,pages-1);
get('pg-idea-count').textContent=filtered.length+' idées sur '+ideas.length;
get('pg-idea-list').replaceChildren();
filtered.slice(page*30,page*30+30).forEach(i=>{const b=document.createElement('button');b.type='button';b.className='idea-item';b.textContent=i.universe+' · '+i.title;b.setAttribute('aria-pressed',String(selected?.title===i.title));b.onclick=()=>{selected=i;get('universe').value=i.universe;get('prompt').value=i.title;get('universe').dispatchEvent(new Event('change'));refresh();render();get('pg-idea-feedback').textContent='Idée sélectionnée. Le brief complet est prêt à copier ci-dessous.';};get('pg-idea-list').append(b);});
if(!filtered.length)get('pg-idea-list').textContent='Aucune idée pour cette recherche.';
get('crew-page').textContent='Page '+(page+1)+' / '+pages;get('crew-prev').disabled=page===0;get('crew-next').disabled=page===pages-1;
}
get('crew-prev').onclick=()=>{page--;render();};get('crew-next').onclick=()=>{page++;render();};
get('pg-idea-filter').onchange=get('pg-idea-search').oninput=()=>{page=0;render();};
get('pg-export-ideas').onclick=()=>download('the-crew-1300-idees.json',JSON.stringify(ideas,null,2),'application/json');
const fields=['universe','prompt','title','intro','body','quote','cover','alt','crew-facts','crew-pack'];
function dossier(){return Object.fromEntries(fields.map(id=>[id,get(id).value]));}
function restore(d){if(!d||typeof d!=='object'||Array.isArray(d))throw Error('Format de dossier invalide');for(const id of fields){if(typeof d[id]==='string'){if(id!=='universe'||[...get(id).options].some(o=>o.value===d[id]))get(id).value=d[id];}}selected=null;get('body').dispatchEvent(new Event('input'));refresh();}
get('save-local').onclick=()=>{try{localStorage.setItem(key,JSON.stringify(dossier()));get('state').textContent='Dossier conservé sur cet appareil, dans ce navigateur.';}catch{get('state').textContent='Sauvegarde indisponible. Exporte le dossier JSON.';}};
get('crew-export').onclick=()=>download('the-crew-dossier-article.json',JSON.stringify(dossier(),null,2),'application/json');
get('crew-import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>5000000)throw Error('Fichier trop volumineux');restore(JSON.parse(await f.text()));get('state').textContent='Dossier importé. Clique sur Conserver localement pour le sauvegarder.';}catch(err){get('state').textContent='Import impossible : '+err.message;}e.target.value='';};
try{restore(JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
get('copy-blocks').onclick=async()=>{document.getElementById('body').dispatchEvent(new Event('input'));if(!get('title').value.trim()||!get('body').value.trim()){get('state').textContent='Renseigne un titre et le texte de ton article avant de copier.';return;}copy(blocks,'Blocs Gutenberg copiés.');};
const visual=document.createElement('section');visual.id='crew-visuals';visual.className='ideas-panel';
visual.innerHTML='<h2>10 prompts images · The Crew Orchies</h2><p>Ces prompts servent à préparer des illustrations. Pour raconter un vrai cours ou événement, utilise une photo réelle et autorisée du Crew.</p><div id="crew-visual-list" class="idea-list"></div><label for="crew-visual-prompt">Prompt visuel sélectionné</label><textarea id="crew-visual-prompt" rows="6" readonly></textarea><div class="actions"><button type="button" id="crew-copy-visual">Copier le prompt image</button><a class="action secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Ouvrir ChatGPT ↗</a></div><p id="crew-visual-status" role="status"></p>';
document.querySelector('main').append(visual);
const scenes=['Pompons or sur fond noir, nature morte','Chaussures de danse et sac, préparation d’un cours','Salle de danse vide, lumière douce','Mains adultes disposant des pompons','Silhouettes graphiques en mouvement, sans visage identifiable','Carnet de chorégraphie et crayon','Ambiance latino abstraite, rythme et couleurs chaudes','Ambiance années 80 graphique, accents or','Composition de scène et faisceau doré','Table de préparation associative, matériel et feuilles sans données personnelles'];
scenes.forEach((scene,i)=>{const b=document.createElement('button');b.type='button';b.className='idea-item';b.textContent=(i+1)+' · '+scene;b.onclick=()=>{get('crew-visual-prompt').value='Créer une illustration éditoriale pour The Crew Orchies. Sujet : '+(get('prompt').value||'la danse et la vie associative')+'. Scène : '+scene+'. Identité noir #111111 et or #c9a86a, convivialité, énergie accessible, lumière naturelle, matières crédibles, composition aérée. Format 16:9, sujet central adaptable en 4:5 et 9:16. Aucun texte ni faux logo, aucune personne présentée comme membre réel du Crew, aucun faux événement. Ne pas imiter un portrait de Sonia. Préserver un espace pour un titre ajouté ensuite.';get('crew-visual-status').textContent='Prompt prêt à copier. Aucune image générée automatiquement.';};get('crew-visual-list').append(b);});
get('crew-copy-visual').onclick=async()=>{const t=get('crew-visual-prompt').value;if(!t){get('crew-visual-status').textContent='Choisis un prompt image.';return;}try{await navigator.clipboard.writeText(t);get('crew-visual-status').textContent='Prompt image copié.';}catch{get('crew-visual-prompt').select();get('crew-visual-status').textContent='Texte sélectionné, copie-le manuellement.';}};
fetch('crew-article-ideas.json').then(r=>{if(!r.ok)throw Error('Chargement indisponible');return r.json();}).then(data=>{ideas=data;render();}).catch(()=>{get('pg-idea-feedback').textContent='La banque d’idées n’a pas pu être chargée. Recharge la page. Tu peux déjà saisir ton propre sujet.';});
refresh();
})();
