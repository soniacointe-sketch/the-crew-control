/* Shared photographic identity for Foi. Documentary images inside source texts are left intact. */
(()=>{"use strict";
const photos={
 cloitre:{src:"assets/foi-matieres/cloitre.webp",width:1125,height:1500,alt:"Lumière naturelle dans les doubles arcades du cloître de l’abbaye de Fontenay",caption:"Abbaye de Fontenay, Côte-d’Or · cloître, 2016",author:"Tangopaso",license:"domaine public",source:"https://commons.wikimedia.org/wiki/File:Fontenay_Abbey_-_Cloister_with_double_arcades.jpg"},
 pierre:{src:"assets/foi-matieres/pierre.webp",width:1125,height:1500,alt:"Colonnes et chapiteaux de pierre du cloître de Fontenay",caption:"Fontenay · colonnes du cloître, 2016",author:"Tangopaso",license:"domaine public",source:"https://commons.wikimedia.org/wiki/File:Fontenay_Abbey_-_Multiple_columns_of_the_cloister.jpg"},
 livre:{src:"assets/foi-matieres/livre.webp",width:1500,height:1125,alt:"Le Codex Sinaiticus ouvert dans sa vitrine à la British Library",caption:"Codex Sinaiticus · British Library, Londres, 2026",author:"PotatoCow25",license:"CC0 1.0",source:"https://commons.wikimedia.org/wiki/File:Codex_Sinaiticus.jpg"},
 manuscrit:{src:"assets/foi-matieres/manuscrit.webp",width:842,height:1500,alt:"Texte grec du Notre Père dans le Codex Sinaiticus",caption:"Codex Sinaiticus · Notre Père en grec",author:"British Library / CSNTM",license:"CC BY-SA 4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",source:"https://commons.wikimedia.org/wiki/File:Codex_Sinaiticus,_GA_01.jpg"},
 aube:{src:"assets/foi-matieres/aube.webp",width:1500,height:1125,alt:"Lumière de l’aube sur les étendues salines de Bonneville en Utah",caption:"Bonneville Salt Flats, Utah · aube, 2021",author:"Mx. Granger",license:"CC0 1.0",source:"https://commons.wikimedia.org/wiki/File:Sunrise_at_the_Bonneville_Salt_Flats_3.jpg"}
};
const selector='.pub-cover img,.hero-image img,.collection-art img,.publication-cover img,.atlas-hero-visual img,.atlas-highlight img,.atlas-family img,.rev-model-cover img,.rev-article-visual img,.shelf-card img';
function selectPhoto(img){
 const context=(img.closest('.pub-card,.collection-card,.publication-card,.atlas-highlight,.atlas-family,.rev-model-hero,.shelf-card')?.textContent||img.alt||'').toLowerCase();
 if(/prière|priere|chemin|foi et|médit|journal|anges|apocalypse/.test(context))return 'aube';
 if(/pierre|architecture|symbol|temple/.test(context))return 'pierre';
 if(/lettre|alpha|aleph|manuscrit|qum|copte|texte|écritur/.test(context))return 'manuscrit';
 if(/marie|tradition|christ/.test(context))return 'cloitre';
 return 'livre';
}
function dress(img){
 if(img.dataset.foiPhoto)return;
 const key=img.closest('.hero-image,.atlas-hero-visual')?'livre':selectPhoto(img),m=photos[key];
 img.dataset.foiPhoto=key;img.src=m.src;img.alt=m.alt+' — photographie de contexte';img.width=m.width;img.height=m.height;img.decoding='async';img.removeAttribute('srcset');
 const figure=img.closest('figure'),card=img.closest('.pub-card,.collection-card,.publication-card,.atlas-highlight,.atlas-family,.shelf-card');
 const text=m.caption+' · '+m.author+' · '+m.license+' · Image de contexte';
 if(figure){let cap=figure.querySelector('figcaption');if(!cap){cap=document.createElement('figcaption');figure.append(cap)}cap.classList.add('foi-image-credit');cap.textContent=text;}
 else if(card&&!card.querySelector('.foi-image-credit')){const cap=document.createElement('span');cap.className='foi-image-credit';cap.textContent=text;const body=card.querySelector('.pub-info,.collection-body,.collection-info,.publication-info,.study-info,.atlas-family-body,.shelf-main')||card;body.append(cap);}
 else if(img.closest('.hero-image')){const cap=img.closest('.hero-image').querySelector('.hero-image-label');if(cap){cap.classList.add('foi-image-credit');cap.textContent=text;}}
}
function scan(node){if(node.nodeType!==1)return;if(node.matches(selector))dress(node);node.querySelectorAll(selector).forEach(dress);}
scan(document.body);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node)}).observe(document.body,{childList:true,subtree:true});
const main=document.querySelector('main');
if(main){
 const credits=document.createElement('details');credits.className='foi-universe-credits';credits.dataset.noaudio='1';
 const summary=document.createElement('summary');summary.textContent='Photographies · provenance & licences';credits.append(summary);
 const note=document.createElement('p');note.textContent='Les photographies de couverture évoquent les lieux, les matières et la lecture. Elles ne constituent pas une preuve documentaire du sujet traité. Les reproductions et leurs références dans les textes sont conservées.';credits.append(note);
 const list=document.createElement('ul');
 for(const m of Object.values(photos)){const li=document.createElement('li'),a=document.createElement('a');a.href=m.source;a.target='_blank';a.rel='noopener noreferrer';a.textContent=m.caption+' · '+m.author+' · '+m.license;li.append(a);if(m.licenseUrl){const l=document.createElement('a');l.href=m.licenseUrl;l.target='_blank';l.rel='noopener noreferrer';l.textContent=' · Licence';li.append(l)}list.append(li)}credits.append(list);
 const changes=document.createElement('p');changes.textContent='Photographies redimensionnées en WebP, cadrages adaptés et couleurs légèrement désaturées. Reproduction du Notre Père : British Library / CSNTM, CC BY-SA 4.0 ; adaptation sous la même licence.';credits.append(changes);main.append(credits);
}
if(/eloah-foi-(paraboles-lab|lecture|spiritualite)\.html$/.test(location.pathname)){
 const host=document.querySelector('main');if(host){const figure=document.createElement('figure');figure.className='foi-breathing-photo';figure.dataset.noaudio='1';const m=photos[location.pathname.includes('spiritualite')?'aube':'pierre'];const img=document.createElement('img');img.src=m.src;img.alt=m.alt;img.width=m.width;img.height=m.height;const cap=document.createElement('figcaption');cap.textContent=m.caption+' · '+m.author+' · '+m.license;figure.append(img,cap);const intro=host.querySelector('.intro');if(intro)intro.after(figure);else host.prepend(figure);}
}
})();
