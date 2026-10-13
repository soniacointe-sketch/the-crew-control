(()=>{
const main=document.querySelector('main'),legacy=document.getElementById('eloah-legacy-cockpit');
if(!main||!legacy)return;
const section=document.createElement('section');section.id='eloah-reference-cockpit';section.setAttribute('aria-label','Tableau de bord ELOAH');
for(const child of [...legacy.children])if(child.tagName!=='SUMMARY')section.append(child);
legacy.remove();main.prepend(section);
const home=document.getElementById('eloah-home-v2');
if(home){const extra=document.createElement('details');extra.id='eloah-reference-search';const summary=document.createElement('summary');summary.textContent='Recherche, raccourcis et accès à tous mes univers';extra.append(summary,home);section.after(extra)}
const paths={sites:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18 M3 12h18 M12 3c-4 5-4 13 0 18 M12 3c4 5 4 13 0 18',vault:'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4',program:'M5 20l3-7 9-9a3 3 0 0 1 4 4l-9 9z M8 13l4 4',default:'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'};
section.querySelectorAll('.cockpit-card').forEach(card=>{if(card.querySelector('.reference-icon'))return;const icon=document.createElement('span');icon.className='reference-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 24 24"><path d="'+(paths[card.dataset.cockpit]||paths.default)+'"/></svg>';card.prepend(icon)});
const greeting=document.getElementById('cockpit-greeting');
function styleGreeting(){if(!greeting)return;const text=greeting.textContent;const match=text.match(/^(.*?)(Sonia\.?$)/);if(match&&!greeting.querySelector('em')){greeting.replaceChildren(document.createTextNode(match[1]));const name=document.createElement('em');name.textContent=match[2];greeting.append(name)}}
styleGreeting();if(greeting)new MutationObserver(styleGreeting).observe(greeting,{childList:true});
})();