/* Parcours cliente ELOAH : actions utiles, aucun faux rendez-vous ou suivi. */
(() => {
  'use strict';
  if (!document.body.classList.contains('entretiens-premium')) return;
  const $ = id => document.getElementById(id);
  const intro = $('premium-prep-start');
  const goToTab = (tab) => {
    const button = [...document.querySelectorAll('#tabs [data-tab]')].find(n => n.dataset.tab === tab);
    if (!button) return;
    button.click(); // le contrôleur existant conserve les protections des bilans non enregistrés
    const target = $(tab);
    if (target && !target.classList.contains('hidden')) {
      target.scrollIntoView({behavior:'smooth',block:'start'});
      const heading = target.querySelector('h2');
      if (heading) {
        heading.setAttribute('tabindex','-1');
        heading.focus({preventScroll:true});
      }
    }
  };
  if (intro) intro.addEventListener('click', () => goToTab('prep'));

  const copies = $('copies');
  document.querySelectorAll('a[href="#copies"]').forEach(link=>link.addEventListener('click', e=>{
    if(!copies)return;
    e.preventDefault();
    copies.open = true;
    copies.scrollIntoView({behavior:'smooth',block:'start'});
    const summary = copies.querySelector(':scope > summary');
    summary?.focus({preventScroll:true});
  }));

  const makeButton = (name, fn) => {
    const button = document.createElement('button');
    button.type='button';
    button.className='premium-empty-button';
    button.textContent=name;
    button.addEventListener('click',fn);
    return button;
  };
  function decorateEmpty(id){
    const root=$(id);
    if(!root)return;
    // Les vrais éléments sont gérés par le contrôleur existant.
    if(root.querySelector('.item'))return;
    if(root.querySelector('.premium-empty-button'))return;
    const search=$('search');
    const hasFilter=!!search?.value.trim() || ($('filter')?.value && $('filter')?.value !== 'Tous');
    const button = id==='request-list' && hasFilter
      ? makeButton('Effacer ma recherche',()=>{
          if(search)search.value='';
          if($('filter'))$('filter').value='Tous';
          search?.dispatchEvent(new Event('input',{bubbles:true}));
          $('filter')?.dispatchEvent(new Event('change',{bubbles:true}));
          search?.focus();
        })
      : makeButton(id==='followup-list'?'Noter un rendez-vous pour préparer mon bilan':'+ Noter mon rendez-vous',()=> $('add')?.click());
    root.append(button);
  }
  for(const id of ['request-list','followup-list']){
    const root=$(id);
    if(!root)continue;
    let scheduled=false;
    new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      queueMicrotask(()=>{
        scheduled=false;
        decorateEmpty(id);
      });
    }).observe(root,{childList:true});
    decorateEmpty(id);
  }
  // L’espace commercial et la réservation restent distincts de ce carnet.
})();