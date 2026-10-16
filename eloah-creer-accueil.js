/* ELOAH — accueil orienté création. Reutilise l'assistant existant, sans simuler d'IA. */
(() => {
  'use strict';
  function init(){
    const assistant=document.getElementById('eloah-home-ai');
    const hero=document.getElementById('eloah-home-v2');
    if(!assistant||!hero||document.getElementById('eloah-create-choices'))return;
    hero.insertAdjacentElement('afterend',assistant);
    const title=document.getElementById('home-ai-title');
    if(title)title.textContent='Qu’est-ce qu’on crée aujourd’hui ?';
    const intro=assistant.querySelector('.hai-intro');
    if(intro)intro.textContent='Choisis ton univers, décris ce que tu veux et lance une vraie demande à ELOAH. Tu peux récupérer la réponse en texte.';
    const opts=[
      ['Power & Glam','Rédige un contenu éditorial Power & Glam, adulte et élégant, fidèle à ses cinq univers. Sujet : '],
      ['The Crew','Prépare un contenu utile pour The Crew Orchies, convivial, clair et sans inventer d’horaires ni de tarifs. Sujet : '],
      ['PARISIS ENGINE','Mène une enquête PARISIS ENGINE rigoureuse, avec sources et incertitudes clairement distinguées. Question : '],
      ['Sonia Velka','Écris avec ma voix Sonia Velka, franche, drôle et libre. Sujet : '],
      ['SONIA OS','Aide-moi à rendre une mission SONIA OS concrète et opérationnelle : '],
      ['ELOAH','Aide-moi à créer et terminer cet élément de mon espace ELOAH : ']
    ];
    const div=document.createElement('div');
    div.id='eloah-create-choices';
    div.setAttribute('role','group');
    div.setAttribute('aria-label','Choisir un univers de création');
    const prompt=document.getElementById('home-ai-prompt');
    const project=document.getElementById('home-ai-project');
    const status=document.getElementById('home-ai-status');
    opts.forEach(([name,starter])=>{
      const btn=document.createElement('button');
      btn.type='button';btn.textContent=name;
      btn.addEventListener('click',()=>{
        div.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));
        if(project){if(![...project.options].some(o=>o.value===name)){const option=document.createElement('option');option.value=name;option.textContent=name;project.append(option)}project.value=name;}
        if(prompt){
          const current=prompt.value.trim();
          if(!current || opts.some(([,p])=>current.startsWith(p)))prompt.value=starter;
          else prompt.value=starter+current;
          prompt.dispatchEvent(new Event('input',{bubbles:true}));
          prompt.focus();
          prompt.setSelectionRange(prompt.value.length,prompt.value.length);
        }
        if(status)status.textContent='Univers choisi : '+name+'. Complète ta demande, puis clique sur Envoyer à ELOAH.';
      });
      btn.setAttribute('aria-pressed','false');div.append(btn);
    });
    const form=document.getElementById('home-ai-form');
    form?.before(div);
    const reassurance=document.createElement('p');
    reassurance.className='eloah-create-truth';
    reassurance.textContent='La création IA nécessite une connexion fondatrice et un moteur disponible. Les fichiers de tes univers ne sont pas chargés automatiquement, et aucune publication n’est faite sans ton action.';
    assistant.append(reassurance);
    const oldActions=hero.querySelector('.hero-actions');
    if(oldActions){
      const a=document.createElement('a');a.href='#eloah-home-ai';a.className='primary eloah-create-first';a.textContent='✦ Créer avec ELOAH';
      oldActions.prepend(a);
    }
    const headline=hero.querySelector('h1');
    if(headline)headline.textContent='Tes idées prennent forme ici.';
    const tagline=hero.querySelector('.intro');
    if(tagline)tagline.textContent='Un univers, une demande, une création. Ton organisation et tes outils restent accessibles plus bas.';
    if(location.hash==='#creer')assistant.scrollIntoView({block:'start'});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();