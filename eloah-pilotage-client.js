/* Customer-facing presentation only. Existing project and planning data are not rewritten. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const projectURL = id => 'eloah-projet.html?projet=' + encodeURIComponent(id);
  const text = (node, value) => { if (node && node.textContent !== value) node.textContent = value; };
  let refreshing = false;

  function localProjects() {
    try {
      return (window.ELOAHWorkspace?.projects?.() || [])
        .filter(p => typeof p.id === 'string' && !p.state?.settings?.archived)
        .sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr'));
    } catch { return []; }
  }
  function planningProjects() {
    try {
      const actions = JSON.parse(localStorage.getItem('eloah-planning-v1') || '[]');
      return Array.isArray(actions) ? actions.filter(a => a && !a.archived && typeof a.project === 'string').map(a => a.project) : [];
    } catch { return []; }
  }
  function projectNames() {
    return [...new Set([...localProjects().map(p => p.id), ...planningProjects(), new URLSearchParams(location.search).get('projet')].filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'));
  }
  function fillProjectSelect(select, all = false) {
    if (!select) return;
    const current = select.value;
    const names = projectNames();
    if (!names.length && !all) names.push('ELOAH');
    const wanted = JSON.stringify([all, names, current]);
    if (select.dataset.clientOptions === wanted) return;
    select.replaceChildren();
    if (all) select.add(new Option('Tous mes projets', ''));
    for (const name of names) select.add(new Option(name, name));
    if ([...select.options].some(o => o.value === current)) select.value = current;
    select.dataset.clientOptions = JSON.stringify([all, names, select.value]);
  }
  function labelBefore(select, value) {
    const node = select?.parentElement?.firstChild;
    if (node?.nodeType === Node.TEXT_NODE && node.nodeValue !== value + ' ') node.nodeValue = value + ' ';
  }
  function decorateCalendar() {
    const root = $('ops-calendar');
    if (!root) return;
    text(root.querySelector('.ops-head h2'), 'Mon planning');
    text(root.querySelector('.ops-muted'), 'Retrouve les actions et les dates de tes projets. Les dates ajoutées ici ne déclenchent pas de rappel automatique.');
    text($('ops-add-task'), '+ Ajouter une action');
    labelBefore($('ops-project-filter'), 'Projet');
    labelBefore($('ops-view'), 'Affichage');
    fillProjectSelect($('ops-project-filter'), true);
    text($('ops-csv'), 'Télécharger la liste');
    text($('ops-ics'), 'Ajouter à mon agenda');
    if ($('ops-csv')) $('ops-csv').title = 'Télécharger un fichier CSV';
    if ($('ops-ics')) $('ops-ics').title = 'Télécharger un fichier .ics à importer dans ton agenda';
    text($('ops-archives'), 'Mes archives');
    root.querySelectorAll('th').forEach(th => {
      if (th.textContent === 'Univers') text(th, 'Projet');
      if (th.textContent === 'Suite') text(th, 'Actions');
    });
    const empty = root.querySelector('.ops-empty');
    if (empty) text(empty, 'Aucune action pour le moment dans cette sélection. Commence avec « Ajouter une action ».');
    const bar = root.querySelector('.ops-actions');
    if (bar && !$('planning-more')) {
      const details = document.createElement('details');
      details.id = 'planning-more'; details.className = 'planning-more';
      const summary = document.createElement('summary'); summary.textContent = 'Exporter ou retrouver une action';
      const contents = document.createElement('div'); contents.className = 'ops-actions';
      for (const id of ['ops-csv', 'ops-ics', 'ops-archives']) if ($(id)) contents.append($(id));
      details.append(summary, contents); bar.append(details);
    }
  }
  function renderProjects() {
    const host = $('client-project-list');
    const projects = localProjects();
    const signature = JSON.stringify(projects.map(p => [p.id, p.name]));
    if (host.dataset.projects === signature) return;
    host.dataset.projects = signature; host.replaceChildren();
    $('client-project-empty').hidden = projects.length > 0;
    $('client-project-count').textContent = projects.length ? projects.length + (projects.length > 1 ? ' projets sur cet appareil' : ' projet sur cet appareil') : '';
    projects.forEach(p => {
      const link = document.createElement('a'); link.className = 'project-tile'; link.href = projectURL(p.id);
      const title = document.createElement('strong'); title.textContent = p.name || p.id;
      const next = document.createElement('span'); next.textContent = 'Reprendre mon projet →';
      link.append(title, next); host.append(link);
    });
  }
  function decorateEditor() {
    const select = document.querySelector('#ops-task select[name="project"]');
    if (select) { labelBefore(select, 'Projet'); fillProjectSelect(select); }
    const note = document.querySelector('#ops-task textarea[name="note"]')?.parentElement?.firstChild;
    if (note?.nodeType === Node.TEXT_NODE && note.nodeValue === 'Prochaine étape / brief') note.nodeValue = 'Ce que je souhaite faire';
  }
  function refresh() {
    if (refreshing) return;
    refreshing = true;
    try { decorateCalendar(); renderProjects(); decorateEditor(); }
    finally { refreshing = false; }
  }
  const observer = new MutationObserver(refresh);
  observer.observe($('ops-calendar'), { childList: true, subtree: true });
  const dialogObserver = new MutationObserver(() => {
    const dialog = $('ops-dialog');
    if (dialog && dialog.dataset.clientObserved !== '1') {
      dialog.dataset.clientObserved = '1';
      new MutationObserver(decorateEditor).observe(dialog, { childList: true, subtree: true });
      decorateEditor();
    }
  });
  dialogObserver.observe(document.body, { childList: true });

  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    for (let p = target; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) revealHash();
  });
  document.querySelectorAll('[data-new-project]').forEach(button => button.addEventListener('click', () => {
    $('client-new-project').showModal(); $('client-project-name').focus();
  }));
  $('client-project-close').addEventListener('click', () => $('client-new-project').close());
  $('client-project-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('client-project-name'), name = input.value.trim();
    if (!name) { input.setCustomValidity('Donne un nom à ton projet.'); input.reportValidity(); return; }
    const existing = localProjects().find(p => p.id.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'));
    location.href = projectURL(existing?.id || name);
  });
  $('client-project-name').addEventListener('input', e => e.target.setCustomValidity(''));
  window.addEventListener('storage', e => {
    if (!e.key || e.key.startsWith('eloah-project-v1:') || e.key === 'eloah-planning-v1') {
      window.ELOAHWorkspace?.renderCalendar?.(); refresh();
    }
  });
  window.addEventListener('focus', refresh);
  // Retain the common menu and its destinations; remove the personal name on this page only.
  text(document.querySelector('.eloah-global-nav .eloah-wordmark'), 'ELOAH · MON ESPACE');
  refresh();
  if (location.hash) revealHash();
})();
