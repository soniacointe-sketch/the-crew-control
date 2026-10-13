/* ELOAH · parcours client : synthèse de ses actions et liens vers son projet. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  if (!$('client-next') || !$('client-tool-project') || !$('ops-calendar')) return;
  let selectedProject = '';
  const listProjects = () => {
    const projects = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('eloah-project-v1:')) continue;
        const obj = JSON.parse(localStorage.getItem(k) || 'null');
        if (!obj || !Array.isArray(obj.threads) || obj.settings?.archived) continue;
        const id = k.slice('eloah-project-v1:'.length);
        if (id) projects.push({id, name:typeof obj.settings?.name==='string' ? obj.settings.name : id});
      }
    } catch { return []; }
    return projects.sort((a,b)=>a.name.localeCompare(b.name,'fr'));
  };
  function syncProjectLinks() {
    const select = $('client-tool-project'), hint = $('client-tool-hint');
    const projects = listProjects();
    const signature = JSON.stringify(projects);
    if (select.dataset.optionsSignature !== signature) {
      select.replaceChildren();
      if (!projects.length) select.add(new Option('Aucun projet pour le moment', ''));
      for (const project of projects) select.add(new Option(project.name, project.id));
      if (!projects.some(p => p.id === selectedProject)) selectedProject = projects[0]?.id || '';
      select.value = selectedProject;
      select.disabled = !projects.length;
      select.dataset.optionsSignature = signature;
    }
    hint.textContent = selectedProject
      ? 'Les outils de projet s’ouvriront dans « '+(projects.find(p=>p.id===selectedProject)?.name||selectedProject)+' ».'
      : 'Commence par créer un projet pour accéder à ses conversations, ses notes et ses finances.';
    for (const link of document.querySelectorAll('a[data-project-link]')) {
      const tab = link.dataset.projectLink;
      link.href = selectedProject
        ? 'eloah-projet.html?projet=' + encodeURIComponent(selectedProject) + (tab === 'chat' ? '' : '&onglet='+encodeURIComponent(tab))
        : '#mes-projets';
      if (selectedProject) delete link.dataset.unavailable; else link.dataset.unavailable = '1';
      link.title = selectedProject ? 'Ouvrir le projet choisi' : 'Crée d’abord ton projet';
    }
  }
  $('client-tool-project').addEventListener('change',event=>{
    selectedProject = event.target.value; syncProjectLinks();
  });
  function openTaskEditor() {
    const button = $('ops-add-task');
    if (button) button.click();
    else if ($('ops-status')) $('ops-status').textContent = 'Le planning est indisponible. Actualise la page pour réessayer.';
  }
  $('client-quick-add')?.addEventListener('click',openTaskEditor);

  const create = (tag, cls, value) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (value !== undefined) e.textContent = value;
    return e;
  };
  function dateLabel(task) {
    const raw = String(task.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'Sans date choisie';
    const d = new Date(raw+'T12:00:00');
    if (Number.isNaN(d.getTime())) return 'Date à vérifier';
    const today = new Date();today.setHours(0,0,0,0);
    const label = d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
    return d < today ? 'Date dépassée · '+label : 'Prévu le '+label;
  }
  function showTask(task) {
    const filter = $('ops-project-filter'), view = $('ops-view');
    if (filter && filter.value !== '') {
      filter.value = '';
      filter.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if (view && view.value !== 'Liste') {
      view.value = 'Liste';
      view.dispatchEvent(new Event('change',{bubbles:true}));
    }
    const link=[...document.querySelectorAll('#ops-calendar [data-task-edit]')].find(b=>b.dataset.taskEdit===task.id);
    if (link) {
      $('mon-organisation').scrollIntoView({block:'start'});
      link.click();
    } else if ($('ops-status')) $('ops-status').textContent = 'Cette action n’est pas disponible dans le planning de cet appareil.';
  }
  function renderNext() {
    const host=$('client-next');
    let entries;
    try {
      entries=JSON.parse(localStorage.getItem('eloah-planning-v1')||'[]');
      if(!Array.isArray(entries))throw Error('Format incorrect');
    }catch{
      host.replaceChildren(create('p','','Le planning de ce navigateur ne peut pas être lu. Aucune donnée n’a été remplacée.'));
      return;
    }
    const active=entries.filter(t=>t&&typeof t.id==='string'&&typeof t.title==='string'&&!t.archived&&t.status!=='Terminé');
    const done=entries.filter(t=>t&&typeof t.title==='string'&&!t.archived&&t.status==='Terminé').length;
    active.sort((a,b)=>{
      const first=/^\d{4}-\d{2}-\d{2}$/.test(a.date||'')?a.date:'9999-99-99';
      const second=/^\d{4}-\d{2}-\d{2}$/.test(b.date||'')?b.date:'9999-99-99';
      return first.localeCompare(second)||a.title.localeCompare(b.title,'fr');
    });
    const signature=JSON.stringify({count:active.length,done,items:active.slice(0,3).map(t=>[t.id,t.title,t.date,t.project,t.status])});
    if(host.dataset.signature===signature)return;
    host.dataset.signature=signature;host.replaceChildren();
    host.append(create('h3','client-next-heading','Mes prochaines actions'));
    if(!active.length) {
      const empty=create('div','client-next-empty');
      empty.append(create('strong','',done?'Tes actions actives sont terminées.':'Pas encore d’action dans ce planning.'));
      empty.append(create('p','',done?'Tu peux ajouter une nouvelle étape ou retrouver les actions terminées plus bas.':'Note une tâche, un appel à prévoir ou une première petite étape pour commencer.'));
      const b=create('button','primary','+ Noter une action');b.type='button';b.onclick=openTaskEditor;empty.append(b);host.append(empty);
      return;
    }
    const note=create('p','client-next-description',active.length+' action'+(active.length>1?'s':'')+' à suivre'+(done?' · '+done+' terminée'+(done>1?'s':''):'')+'.');
    host.append(note);
    for(const t of active.slice(0,3)){
      const card=create('article','client-next-card');
      card.append(create('strong','',t.title),create('small','',(t.project||'Personnel')+' · '+dateLabel(t)));
      const b=create('button','','Reprendre cette action →');b.type='button';b.onclick=()=>showTask(t);
      card.append(b);host.append(card);
    }
  }
  const update=()=>{syncProjectLinks();renderNext()};
  const calendar=$('ops-calendar');
  new MutationObserver(update).observe(calendar,{childList:true});
  window.addEventListener('focus',update);
  window.addEventListener('storage',event=>{
    if (!event.key || event.key === 'eloah-planning-v1' || event.key.startsWith('eloah-project-v1:')) update();
  });
  update();
})();