/* ELOAH Boards: présentation cliente, sans migration destructrice. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!$('lanes') || !$('boardSelect') || !$('editor') || !document.querySelector('main')) return;
  const main = document.querySelector('main');
  document.body.classList.add('eloah-boards-client');
  document.title = 'Mes tableaux · ELOAH';
  const make = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const intro = make('section', 'client-hero');
  const eyebrow = main.querySelector(':scope > .eyebrow'), h1 = main.querySelector(':scope > h1'), description = main.querySelector(':scope > p');
  if (eyebrow) { eyebrow.textContent = 'ELOAH · MON ORGANISATION'; intro.append(eyebrow); }
  if (h1) { h1.textContent = 'Mes tableaux'; intro.append(h1); }
  if (description) {
    description.textContent = 'Un tableau pour ton projet, une carte pour chaque chose à faire. Avance à ton rythme, une étape après l’autre.';
    intro.append(description);
  }
  const starter = make('p', 'client-get-started', 'Pour commencer : choisis ton tableau, ajoute une carte puis change son étape à mesure que tu avances.');
  intro.append(starter);
  main.prepend(intro);

  const siteHeader = document.querySelector('body > header');
  if (siteHeader) {
    siteHeader.classList.add('client-site-header');
    const subtitle = siteHeader.querySelector('small');
    if (subtitle) subtitle.textContent = 'Organiser mes projets';
    const right = siteHeader.querySelector('.right');
    if (right) {
      const home = right.querySelector('a[href="mes-univers.html"]');
      if (home) home.textContent = '← Mon accueil';
      const details = make('details', 'client-global-options');
      details.id = 'client-global-options';
      details.append(make('summary', '', 'Options et imports'));
      const actions = make('div', 'client-global-links');
      for (const element of [...right.children]) {
        if (element === home) continue;
        if (element.id === 'export') element.textContent = 'Télécharger une copie (JSON)';
        if (element.id === 'importBtn') element.textContent = 'Importer une copie (JSON)';
        actions.append(element);
      }
      const help = make('p', 'client-help', 'Les imports de tableaux peuvent remplacer ta version locale : conserve une copie avant de les lancer.');
      actions.append(help);
      details.append(actions);
      right.append(details);
    }
  }

  const originalToolbar = main.querySelector('.toolbar');
  if (originalToolbar) {
    const essentials = make('section', 'client-essential-tools');
    essentials.setAttribute('aria-label','Actions de mon tableau');
    const selectLabel = make('label', 'client-board-select', 'Mon tableau');
    selectLabel.append($('boardSelect'));
    essentials.append(selectLabel);
    $('newBoard').textContent = '+ Nouveau tableau';
    essentials.append($('newBoard'));
    $('newCard').textContent = '+ Ajouter une carte';
    essentials.append($('newCard'));
    const searchLabel = make('label', 'client-search', 'Retrouver une carte');
    $('search').placeholder = 'Un titre, un détail…';
    searchLabel.append($('search'));
    essentials.append(searchLabel);

    const shortcuts = make('nav', 'client-shortcuts');
    shortcuts.setAttribute('aria-label','Accès rapides aux cartes');
    const allCards = originalToolbar.querySelector('a[href="eloah-trello-toutes-cartes.html"]');
    const deadlines = originalToolbar.querySelector('a[href="eloah-trello-echeances.html"]');
    if (allCards) {
      allCards.textContent = 'Toutes mes cartes →';
      shortcuts.append(allCards);
    }
    if (deadlines) {
      deadlines.textContent = 'Mes échéances →';
      shortcuts.append(deadlines);
    }
    $('calendarBtn').textContent = 'Vue calendrier';
    shortcuts.append($('calendarBtn'));

    const filters = make('details', 'client-options');
    filters.id = 'client-options';
    filters.append(make('summary', '', 'Filtrer, trier ou personnaliser mon tableau'));
    const filterContent = make('div', 'client-filters');
    const tagLabel = make('label', '', 'Afficher');
    tagLabel.append($('filterTag'));
    const orderLabel = make('label', '', 'Trier les cartes');
    orderLabel.append($('sortCards'));
    filterContent.append(tagLabel,orderLabel);
    $('renameBoard').textContent = 'Renommer ce tableau';
    $('archiveView').textContent = 'Voir les archives';
    $('themesBtn').textContent = 'Changer le fond';
    filterContent.append($('archiveView'),$('renameBoard'),$('themesBtn'));
    filters.append(filterContent);
    const themePicker = $('themePicker');
    if(themePicker) filters.append(themePicker);

    originalToolbar.replaceWith(essentials,shortcuts,filters);
  }

  const boardInfo = make('div', 'client-board-info');
  boardInfo.innerHTML = '<strong>Mon tableau en un coup d’œil</strong>';
  const helper = make('p', 'client-help'); helper.id = 'client-board-help';
  boardInfo.append(helper);
  const lanes = $('lanes');
  lanes.before(boardInfo);

  const mobile = make('div','client-lane-nav');
  mobile.id = 'client-lane-nav';
  const previous = make('button','', '←'); previous.id='client-lane-prev'; previous.type='button';
  previous.setAttribute('aria-label','Afficher la liste précédente');
  const position = make('span',''); position.id='client-lane-position'; position.setAttribute('aria-live','polite');
  const next = make('button','', '→'); next.id='client-lane-next'; next.type='button';
  next.setAttribute('aria-label','Afficher la liste suivante');
  mobile.append(previous,position,next);
  lanes.before(mobile);

  const calendar = $('calendar');
  const storageDetails = make('details','client-storage');
  storageDetails.id='client-storage';
  storageDetails.append(make('summary','','Mes données et ma sauvegarde'));
  const storageContent = make('div','client-storage-content');
  const explain = make('p','client-help','Sans connexion, les tableaux restent dans ce navigateur. Sur un appareil partagé, ils peuvent être visibles par les autres personnes qui l’utilisent : évite les informations confidentielles.');
  storageContent.append(explain);
  const cloudPanel=$('cloudPanel');
  if (cloudPanel) {
    const cloudTitle=cloudPanel.querySelector('strong');
    if(cloudTitle) cloudTitle.textContent='Retrouver mes tableaux sur un autre appareil';
    const cloudNote=cloudPanel.querySelector('small');
    if(cloudNote) cloudNote.textContent='Connecte-toi pour sauvegarder une copie sur ton compte. Une première sauvegarde demande ton accord ; ensuite, lorsque les versions sont synchronisées, les modifications peuvent être enregistrées automatiquement. Les conflits demandent une décision.';
    $('cloudLogin').textContent='Recevoir un lien de connexion';
    $('cloudUpload').textContent='Sauvegarder en ligne';
    $('cloudDownload').textContent='Récupérer mes tableaux';
    $('cloudLogout').textContent='Me déconnecter';
    $('cloudEmail').setAttribute('aria-label','Adresse e-mail de mon compte ELOAH');
    storageContent.append(cloudPanel);
  }
  storageDetails.append(storageContent);
  if (calendar) calendar.after(storageDetails); else lanes.after(storageDetails);

  const editor = $('editor'), form = $('editForm');
  const editorHelp = make('p','client-editor-help','Une carte peut être une tâche, une idée ou un objectif. L’enregistrer ne publie rien et n’envoie aucun message.');
  form.insertBefore(editorHelp,form.querySelector('label'));
  const labels = [
    ['title','Ce que je veux faire'],
    ['description','Détails (facultatif)'],
    ['laneChoice','Étape de la carte'],
    ['tag','Étiquette (facultatif)'],
    ['due','Date prévue (facultatif)'],
    ['cover','Image de couverture (lien HTTPS)'],
    ['links','Liens utiles (une adresse par ligne)'],
    ['comments','Ma note personnelle'],
  ];
  for (const [id,label] of labels) {
    const input=$(id),parent=input?.closest('label');
    const textNode=[...parent?.childNodes||[]].find(n=>n.nodeType===3);
    if(textNode)textNode.nodeValue=label;
    else if(parent)parent.prepend(document.createTextNode(label));
  }
  $('postComment').textContent='Ajouter au journal';
  $('addCheck').textContent='+ Ajouter une étape';
  $('deleteCard').textContent='Supprimer la carte';
  const headingFeed=$('commentFeed')?.previousElementSibling;
  if(headingFeed?.tagName==='LABEL') headingFeed.textContent='Historique de la carte (dans ce navigateur)';
  const headingChecks=$('checks')?.previousElementSibling;
  if(headingChecks?.tagName==='LABEL')headingChecks.textContent='Mes étapes à cocher';
  // The original modal still owns saving, duplicating, archiving and removing.
  let editingChanged=false;
  new MutationObserver(()=>{if(editor.open)editingChanged=false}).observe(editor,{attributes:true,attributeFilter:['open']});
  form.addEventListener('input',()=>{editingChanged=true});
  form.addEventListener('change',()=>{editingChanged=true});
  $('cancel').addEventListener('click', e=>{
    if(editingChanged&&!confirm('Quitter sans enregistrer les modifications de cette carte ?')){
      e.preventDefault(); e.stopImmediatePropagation();
    }
  },true);
  editor.addEventListener('cancel',e=>{
    if(editingChanged&&!confirm('Quitter sans enregistrer les modifications de cette carte ?'))e.preventDefault();
  });
  // An explicit "Ajouter au journal" saves its entry to the card.
  $('postComment').title='Conserver la note dans l’historique de cette carte, pas l’envoyer à une autre personne';

  function activeBoard(){
    try{
      const currentData=typeof data!=='undefined' ? data : JSON.parse(localStorage.getItem('eloah-boards-v1')||'null');
      return currentData?.boards?.find(b=>b.id===currentData.active)||currentData?.boards?.[0]||null;
    }catch{return null;}
  }
  function updateHelp(){
    const current=activeBoard();
    if(!current)return;
    const activeCards=(current.cards||[]).filter(c=>!c.archived);
    helper.textContent=activeCards.length?
      activeCards.length+(activeCards.length===1?' carte active.':' cartes actives.')+' Pour avancer, choisis une nouvelle étape sous une carte ou ouvre-la pour la compléter.':
      'Ton tableau est prêt. Commence avec « Ajouter une carte » : par exemple une tâche, un événement ou une idée à préparer.';
  }
  const laneElements=()=>[...lanes.querySelectorAll(':scope > .lane')];
  function laneIndex(){
    const cards=laneElements();
    if(!cards.length)return 0;
    const first=cards[0].offsetLeft;
    const current=lanes.scrollLeft;
    let best=0,distance=Infinity;
    cards.forEach((lane,i)=>{
      const delta=Math.abs(lane.offsetLeft-first-current);
      if(delta<distance){best=i;distance=delta}
    });
    return best;
  }
  function syncLaneNav(){
    const list=laneElements(),idx=laneIndex();
    mobile.hidden=Boolean(calendar&&!calendar.hidden);
    if(!list.length)return;
    const heading=list[idx].querySelector('h2');
    // The heading contains a numerical count; show only the first text node.
    const laneName=[...heading?.childNodes||[]].find(n=>n.nodeType===3)?.nodeValue?.trim()||'Étape';
    position.textContent=(idx+1)+' / '+list.length+' · '+laneName;
    previous.disabled=idx===0;
    next.disabled=idx===list.length-1;
  }
  function moveLane(direction){
    const list=laneElements();
    if(!list.length)return;
    const idx=Math.max(0,Math.min(list.length-1,laneIndex()+direction));
    const offset=list[idx].offsetLeft-list[0].offsetLeft;
    lanes.scrollTo({left:offset,behavior:'smooth'});
    syncLaneNav();
  }
  previous.addEventListener('click',()=>moveLane(-1));
  next.addEventListener('click',()=>moveLane(1));
  lanes.addEventListener('scroll',()=>requestAnimationFrame(syncLaneNav),{passive:true});
  let queue=false;
  new MutationObserver(()=>{
    if(queue)return;
    queue=true;requestAnimationFrame(()=>{queue=false;updateHelp();syncLaneNav()});
  }).observe(lanes,{childList:true});
  const calendarWatch=new MutationObserver(syncLaneNav);
  if(calendar)calendarWatch.observe(calendar,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('resize',syncLaneNav);
  updateHelp();syncLaneNav();

  // Query parameters used by other ELOAH modules keep working.
})();