/* Coffre-fort: customer-facing references, not an encrypted vault.
   Scoped to this route; uses the existing records, with no automatic writes. */
(() => {
  'use strict';
  if (!location.pathname.endsWith('/eloah-partenaire.html') || new URLSearchParams(location.search).get('rubrique') !== 'Coffre-fort') return;
  function start() {
    if (document.getElementById('coffre-client-root')) return;
    const main = document.querySelector('.layout > main') || document.querySelector('main');
    if (!main) return;
    const KEY = 'sonia-universe-v1-itriia', MODULE = 'Coffre-fort';
    const STATES = ['À faire', 'En cours', 'À vérifier', 'Terminé'];
    const normal = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr');
    const own = row => row && typeof row === 'object' && row.module === MODULE && typeof row.id === 'string' && typeof row.title === 'string';
    function read() {
      let value;
      try { value = JSON.parse(localStorage.getItem(KEY) || '[]'); }
      catch { throw Error('Tes repères ne peuvent pas être lus dans ce navigateur. Aucune donnée n’a été remplacée.'); }
      if (!Array.isArray(value)) throw Error('Le fichier de travail de ce navigateur est illisible. Aucune donnée n’a été remplacée.');
      return value;
    }
    function write(value) {
      try { localStorage.setItem(KEY, JSON.stringify(value)); }
      catch { throw Error('Enregistrement impossible : le stockage est plein ou indisponible. Garde le formulaire ouvert pour copier ton texte.'); }
      // Refresh the hidden legacy model as well, without triggering any other view.
      try { if (typeof rows !== 'undefined' && Array.isArray(rows)) rows = value; } catch {}
    }
    function safeURL(value) {
      if (!value) return '';
      try { const url = new URL(value); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : ''; }
      catch { return ''; }
    }
    function validDate(value) {
      if (!value) return true;
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const d = new Date(value + 'T12:00:00Z');
      return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
    }
    const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
    const button = (label, fn, cls = '') => { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', fn); return b; };
    const root = el('section'); root.id = 'coffre-client-root';
    root.innerHTML = `
      <header class="cr-hero">
        <div class="cr-top"><span class="cr-eyebrow">ELOAH · COFFRE-FORT</span><a href="mes-univers.html">← Mon accueil</a></div>
        <h1>Mes repères</h1>
        <p class="cr-intro">Garde les liens et les notes utiles à tes projets. Retrouve l’essentiel sans avoir à chercher partout.</p>
        <div class="cr-actions"><button type="button" class="cr-primary" id="cr-add">+ Ajouter un lien ou une note</button><a class="cr-btn" href="eloah-bibliotheque.html?type=fichiers">Ouvrir mes documents</a></div>
      </header>
      <div class="cr-security" id="cr-security"><strong>Des repères, pas des secrets.</strong><p>Cet espace n’est ni chiffré ni verrouillé. Ajoute uniquement des liens publics et des notes non confidentielles : aucun mot de passe, code d’accès ou document sensible.</p></div>
      <p id="cr-error" class="cr-error" role="alert" hidden></p>
      <section class="cr-collection" aria-labelledby="cr-list-title">
        <div class="cr-section-head"><h2 id="cr-list-title">Mes liens et notes</h2><div class="cr-switch" aria-label="Choisir les repères affichés"><button type="button" id="cr-active" aria-pressed="true">Mes repères</button><button type="button" id="cr-archived" aria-pressed="false">Mes archives</button></div></div>
        <div class="cr-filters"><label for="cr-search">Rechercher<input id="cr-search" type="search" placeholder="Un titre, un lien, un mot dans une note…" autocomplete="off" maxlength="200"></label><label for="cr-kind">Afficher<select id="cr-kind"><option value="all">Tous les repères</option><option value="links">Avec un lien</option><option value="notes">Notes sans lien</option></select></label><button type="button" id="cr-clear" hidden>Effacer les filtres</button></div>
        <p id="cr-count" class="cr-help" role="status" aria-live="polite"></p><div id="cr-list" class="cr-grid"></div>
        <p id="cr-status" class="cr-status" role="status" aria-live="polite"></p>
      </section>
      <details class="cr-details" id="cr-backup"><summary>Conserver ou récupérer mes repères</summary><div><p>Télécharge une copie de cette rubrique, archives comprises. L’import ajoute seulement les fiches absentes et laisse les fiches déjà présentes inchangées.</p><div class="cr-actions"><button type="button" id="cr-export">Télécharger mes repères</button><button type="button" id="cr-import">Importer une copie</button><input type="file" id="cr-file" accept=".json,application/json" hidden></div><p class="cr-help">Cette copie n’est pas chiffrée et ne contient pas les autres rubriques. Conserve le fichier dans un endroit sûr.</p></div></details>
      <details class="cr-details" id="cr-help"><summary>Ce que je peux garder ici</summary><div class="cr-help-grid"><div><h3>Des ressources utiles</h3><p>Le site public d’un outil, une page à relire, une référence ou des instructions non confidentielles.</p></div><div><h3>Ce qui reste ailleurs</h3><p>Les mots de passe et codes d’accès restent dans un gestionnaire de mots de passe. Les documents confidentiels n’ont pas leur place ici.</p></div><div><h3>Sur cet appareil</h3><p>Les fiches restent dans ce navigateur et ne sont pas séparées par compte. Changer de compte ne les efface pas. Aucune synchronisation automatique n’est activée par cette rubrique.</p></div></div></details>
      <p class="cr-footer">Tes repères sont enregistrés dans ce navigateur. Pense à conserver une copie avant de changer d’appareil.</p>`;
    main.append(root);
    const $ = id => document.getElementById(id);
    const editor = el('dialog', 'cr-dialog'); editor.id = 'cr-editor'; editor.setAttribute('aria-labelledby', 'cr-editor-title'); editor.setAttribute('aria-describedby', 'cr-editor-help');
    editor.innerHTML = `<div class="cr-section-head"><h2 id="cr-editor-title">Ajouter un repère</h2><button type="button" id="cr-close" aria-label="Fermer le formulaire">×</button></div><p class="cr-help" id="cr-editor-help">Un lien public ou une note non confidentielle. Aucun mot de passe ni code d’accès.</p><form id="cr-form"><label for="cr-title">Nom du repère<input id="cr-title" name="title" required maxlength="180" autocomplete="off" placeholder="Ex. Ressources pour mon prochain atelier"></label><label for="cr-url">Lien public <small>(facultatif)</small><input id="cr-url" name="url" type="url" maxlength="2048" placeholder="https://" autocomplete="off" aria-describedby="cr-url-help"></label><p class="cr-help" id="cr-url-help">Une adresse publique, sans identifiant ni code d’accès dans le lien.</p><label for="cr-note">Ma note <small>(facultative)</small><textarea id="cr-note" name="note" maxlength="12000" rows="6" placeholder="Ce que je souhaite retrouver ou retenir…"></textarea></label><details class="cr-details" id="cr-followup"><summary>Ajouter un suivi <small>(facultatif)</small></summary><div class="cr-form-grid"><label for="cr-state">Avancement<select id="cr-state" name="state"></select></label><label for="cr-date">Date à prévoir<input id="cr-date" name="date" type="date"></label></div><p class="cr-help">Cette date ne déclenche pas de rappel.</p></details><p id="cr-form-error" class="cr-error" role="alert" hidden></p><div class="cr-actions"><button type="submit" class="cr-primary" id="cr-save">Enregistrer mon repère</button><button type="button" id="cr-cancel">Annuler</button></div></form>`;
    const preview = el('dialog', 'cr-dialog'); preview.id = 'cr-preview'; preview.setAttribute('aria-labelledby', 'cr-preview-title');
    preview.innerHTML = `<h2 id="cr-preview-title">Récupérer mes repères</h2><p id="cr-preview-summary"></p><p class="cr-help">Seule la rubrique Coffre-fort est importée. Les fiches existantes et les autres rubriques ne sont pas remplacées.</p><p id="cr-preview-error" class="cr-error" role="alert" hidden></p><div class="cr-actions"><button type="button" class="cr-primary" id="cr-apply">Ajouter les repères manquants</button><button type="button" id="cr-import-cancel">Annuler</button></div>`;
    document.body.append(editor, preview);
    for (const s of STATES) $('cr-state').add(new Option(s, s));
    let archive = false, editing = null, baseline = null, dirty = false, pending = null, opener = null;
    function error(message) { $('cr-error').hidden = !message; $('cr-error').textContent = message || ''; }
    function status(message) { $('cr-status').textContent = message; }
    function setFormError(message) { $('cr-form-error').hidden = !message; $('cr-form-error').textContent = message || ''; }
    function render() {
      let all;
      try { all = read(); error(''); $('cr-add').disabled = false; $('cr-export').disabled = false; }
      catch (e) { error(e.message); $('cr-add').disabled = true; $('cr-export').disabled = true; $('cr-list').replaceChildren(); $('cr-count').textContent = 'Lecture indisponible. Tes données n’ont pas été modifiées.'; return; }
      const q = normal($('cr-search').value.trim()), kind = $('cr-kind').value;
      const selected = all.filter(own).filter(r => !!r.archived === archive);
      const filtered = selected.filter(r => (!q || normal([r.title, r.note, r.url].join(' ')).includes(q)) && (kind === 'all' || (kind === 'links' ? !!r.url : !r.url))).sort((a, b) => a.title.localeCompare(b.title, 'fr', {numeric: true}));
      $('cr-count').textContent = filtered.length + (filtered.length === 1 ? ' repère' : ' repères') + (archive ? ' dans les archives' : '') + (q || kind !== 'all' ? ' pour cette recherche' : '');
      $('cr-list-title').textContent = archive ? 'Mes archives' : 'Mes liens et notes';
      $('cr-active').setAttribute('aria-pressed', String(!archive)); $('cr-archived').setAttribute('aria-pressed', String(archive)); $('cr-clear').hidden = !q && kind === 'all';
      const host = $('cr-list'); host.replaceChildren();
      if (!filtered.length) {
        const box = el('div', 'cr-empty');
        box.append(el('h3', '', q || kind !== 'all' ? 'Aucun repère trouvé.' : archive ? 'Tes archives sont vides.' : 'Tes liens utiles commencent ici.'), el('p', '', q || kind !== 'all' ? 'Essaie un autre mot ou efface les filtres.' : archive ? 'Les fiches que tu archives restent disponibles ici.' : 'Un site à retrouver, une page à relire, quelques instructions : ajoute ton premier lien ou ta première note.'));
        box.append(button(q || kind !== 'all' ? 'Effacer les filtres' : archive ? 'Retrouver mes repères' : '+ Ajouter mon premier repère', () => { if (q || kind !== 'all') clear(); else if (archive) { archive = false; render(); } else edit(); })); host.append(box); return;
      }
      for (const r of filtered) {
        const card = el('article', 'cr-card'), url = safeURL(r.url), title = el('h3', '', r.title);
        card.append(el('span', 'cr-tag', r.url ? (r.note ? 'LIEN ET NOTE' : 'LIEN') : 'NOTE'), title);
        if (r.note) { const detail = el('details', 'cr-note-details'); detail.append(el('summary', '', 'Lire ma note'), el('p', 'cr-full-note', String(r.note))); card.append(detail); }
        if (url) { const a = el('a', 'cr-resource', new URL(url).hostname + ' ↗'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', 'Ouvrir le lien : ' + r.title + ' (nouvel onglet)'); card.append(a); }
        else if (r.url) card.append(el('p', 'cr-help', 'Ce lien doit être corrigé avant de pouvoir être ouvert.'));
        if (r.date && validDate(r.date)) card.append(el('p', 'cr-help', 'Date à prévoir : ' + new Date(r.date + 'T12:00:00').toLocaleDateString('fr-FR')));
        if (r.state && r.state !== 'À faire') card.append(el('p', 'cr-help', 'Avancement : ' + r.state));
        const actions = el('div', 'cr-actions');
        const editButton = button('Modifier', () => edit(r.id)); editButton.setAttribute('aria-label', 'Modifier : ' + r.title);
        const archiveButton = button(archive ? 'Restaurer' : 'Archiver', () => changeArchive(r.id, !archive)); archiveButton.setAttribute('aria-label', (archive ? 'Restaurer : ' : 'Archiver : ') + r.title);
        actions.append(editButton, archiveButton); card.append(actions); host.append(card);
      }
    }
    function clear() { $('cr-search').value = ''; $('cr-kind').value = 'all'; render(); $('cr-search').focus(); }
    function uniqueRecord(all, id) { const matches = all.filter(r => r && r.id === id); if (matches.length !== 1 || !own(matches[0])) throw Error('Cette fiche ne peut pas être modifiée sans risque. Conserve une copie avant de poursuivre.'); return matches[0]; }
    function changeArchive(id, next) {
      try { const all = read(); const record = uniqueRecord(all, id); write(all.map(r => r === record ? {...r, archived: next, updated: new Date().toISOString()} : r)); render(); status(next ? 'Repère archivé. Tu peux le retrouver dans « Mes archives ».' : 'Repère restauré dans « Mes repères ».'); (archive ? $('cr-archived') : $('cr-active')).focus(); }
      catch (e) { error(e.message); }
    }
    function edit(id = null) {
      try {
        const all = read(), record = id ? uniqueRecord(all, id) : null;
        editing = id; baseline = record ? JSON.stringify(record) : null; dirty = false; opener = document.activeElement;
        $('cr-form').reset(); setFormError(''); $('cr-title').setCustomValidity(''); $('cr-url').setCustomValidity('');
        $('cr-editor-title').textContent = record ? 'Modifier mon repère' : 'Ajouter un repère';
        for (const name of ['title', 'url', 'note', 'date', 'state']) $('cr-' + name).value = record?.[name] || (name === 'state' ? 'À faire' : '');
        $('cr-followup').open = !!record?.date || (!!record?.state && record.state !== 'À faire');
        editor.showModal(); $('cr-title').focus();
      } catch (e) { error(e.message); }
    }
    function closeEditor() { if (!dirty || confirm('Fermer sans enregistrer les modifications ?')) editor.close(); }
    editor.addEventListener('cancel', e => { if (dirty && !confirm('Fermer sans enregistrer les modifications ?')) e.preventDefault(); });
    editor.addEventListener('close', () => { dirty = false; (opener?.isConnected ? opener : $('cr-add')).focus(); });
    $('cr-form').addEventListener('input', e => { dirty = true; e.target.setCustomValidity?.(''); });
    $('cr-form').addEventListener('submit', e => {
      e.preventDefault(); setFormError('');
      const data = Object.fromEntries(new FormData(e.target)); data.title = data.title.trim(); data.url = data.url.trim();
      if (!data.title) { $('cr-title').setCustomValidity('Donne un nom à ton repère.'); $('cr-title').reportValidity(); return; }
      if (data.url && !safeURL(data.url)) { $('cr-url').setCustomValidity('Utilise une adresse http ou https, sans identifiant ni mot de passe dans le lien.'); $('cr-url').reportValidity(); return; }
      if (!validDate(data.date) || !STATES.includes(data.state)) { setFormError('Vérifie la date et l’avancement de cette fiche.'); return; }
      try {
        const all = read(), previous = editing ? uniqueRecord(all, editing) : null;
        if (previous && JSON.stringify(previous) !== baseline) throw Error('Cette fiche a changé dans un autre onglet. Copie tes modifications, puis ferme et rouvre la fiche avant de réessayer.');
        const record = {...previous, ...data, module: MODULE, id: editing || crypto.randomUUID(), updated: new Date().toISOString()};
        write(previous ? all.map(r => r === previous ? record : r) : [...all, record]);
        dirty = false; editor.close(); render(); status('Repère enregistré dans ce navigateur.'); $('cr-add').focus();
      } catch (e) { setFormError(e.message); }
    });
    $('cr-add').onclick = () => edit(); $('cr-close').onclick = closeEditor; $('cr-cancel').onclick = closeEditor;
    $('cr-active').onclick = () => { archive = false; render(); }; $('cr-archived').onclick = () => { archive = true; render(); };
    $('cr-search').oninput = render; $('cr-kind').onchange = render; $('cr-clear').onclick = clear;
    $('cr-export').onclick = () => {
      try {
        const records = read().filter(own), payload = {format: 'sonia-universe-v1', universe: 'itriia', scope: MODULE, exportedAt: new Date().toISOString(), records};
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
        const a = el('a'); a.href = url; a.download = 'eloah-mes-reperes-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        status('Copie préparée : ' + records.length + ' repère(s), archives comprises. Vérifie le fichier dans tes téléchargements.');
      } catch (e) { error(e.message); }
    };
    function importRecord(r) {
      if (!own(r) || !r.id || r.id.length > 200 || !r.title.trim() || r.title.length > 180 || !STATES.includes(r.state) || typeof (r.note || '') !== 'string' || (r.note || '').length > 12000 || typeof (r.url || '') !== 'string' || (r.url || '').length > 2048 || (r.url && !safeURL(r.url)) || !validDate(r.date || '')) throw Error('Une fiche à importer est invalide. Aucune donnée n’a été ajoutée.');
      return {id:r.id, title:r.title, module:MODULE, state:r.state, note:r.note || '', url:r.url || '', date:r.date || '', archived:!!r.archived};
    }
    $('cr-import').onclick = () => $('cr-file').click();
    $('cr-file').onchange = async e => {
      pending = null;
      try {
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 8 * 1024 * 1024) throw Error('Choisis une copie de moins de 8 Mo.');
        const payload = JSON.parse(await file.text());
        if (payload?.format !== 'sonia-universe-v1' || payload.universe !== 'itriia' || !Array.isArray(payload.records) || payload.records.length > 5000) throw Error('Ce fichier n’est pas une copie compatible avec tes repères ELOAH.');
        const candidates = payload.records.filter(r => r && r.module === MODULE).map(importRecord);
        const seen = new Set(read().filter(r => r && typeof r.id === 'string').map(r => r.id));
        pending = candidates.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
        $('cr-preview-summary').textContent = candidates.length + ' fiche(s) de cette rubrique trouvée(s). ' + pending.length + ' à ajouter ; ' + (candidates.length - pending.length) + ' déjà présentes ou répétées, conservées sans changement.';
        $('cr-preview-error').hidden = true; $('cr-apply').disabled = pending.length === 0; preview.showModal();
      } catch (err) { error(err instanceof SyntaxError ? 'Ce fichier ne peut pas être lu. Choisis une copie ELOAH au format JSON.' : err.message); }
      finally { e.target.value = ''; }
    };
    $('cr-apply').onclick = () => {
      if (!pending) return;
      try {
        const all = read(), ids = new Set(all.filter(r => r && typeof r.id === 'string').map(r => r.id)), added = pending.filter(r => !ids.has(r.id));
        if (added.length) write([...all, ...added]);
        preview.close(); pending = null; archive = false; render(); status(added.length + ' repère(s) récupéré(s). Les fiches déjà présentes sont conservées.');
      } catch (e) { $('cr-preview-error').textContent = e.message; $('cr-preview-error').hidden = false; }
    };
    $('cr-import-cancel').onclick = () => preview.close(); preview.addEventListener('close', () => { pending = null; $('cr-import').focus(); });
    window.addEventListener('storage', e => { if (!e.key || e.key === KEY) render(); });
    window.addEventListener('focus', render);
    // No account, password, network API, AI or encryption is introduced by this view.
    const css = el('style'); css.id = 'eloah-coffre-client-style'; css.textContent = `
    body.eloah-coffre-client .layout>main>:not(#coffre-client-root){display:none!important}
    body.eloah-coffre-client .layout>main{width:100%;max-width:1180px;margin:auto;padding:34px clamp(16px,3.2vw,40px) 55px!important}
    #coffre-client-root,.cr-dialog{--cr-ink:#303530;--cr-muted:#666c62;--cr-line:#dedfd7;--cr-paper:#fffefa;--cr-accent:#7762af;color:var(--cr-ink);font:15px/1.6 system-ui,sans-serif}
    #coffre-client-root *, .cr-dialog *{box-sizing:border-box}
    #coffre-client-root [hidden],.cr-dialog [hidden]{display:none!important}
    #coffre-client-root h1,#coffre-client-root h2,#coffre-client-root h3,.cr-dialog h2{font-family:Georgia,serif;font-weight:400;line-height:1.2;color:var(--cr-ink)!important}
    #coffre-client-root h1{font-size:clamp(36px,4.3vw,53px);margin:18px 0 13px}
    #coffre-client-root h2,.cr-dialog h2{font-size:28px;margin:0}
    #coffre-client-root h3{font-size:23px;margin:10px 0}
    #coffre-client-root p,.cr-dialog p{color:var(--cr-muted);margin:9px 0;line-height:1.65}
    #coffre-client-root header{display:block!important;margin:0 0 22px!important}
    #coffre-client-root .cr-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    #coffre-client-root .cr-top a{font-size:13px;color:var(--cr-muted)}
    #coffre-client-root .cr-eyebrow{font:650 11px/1.5 system-ui;letter-spacing:.15em;color:var(--cr-muted)}
    #coffre-client-root .cr-intro{font-size:17px;max-width:640px;margin:0 0 23px}
    #coffre-client-root a{color:inherit;text-underline-offset:3px}
    #coffre-client-root button,#coffre-client-root .cr-btn,.cr-dialog button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 15px;background:var(--cr-paper)!important;color:var(--cr-ink)!important;border:1px solid var(--cr-line)!important;border-radius:8px;font:inherit;cursor:pointer;text-decoration:none}
    #coffre-client-root .cr-primary,.cr-dialog .cr-primary{background:var(--cr-ink)!important;border-color:var(--cr-ink)!important;color:#fffefa!important}
    #coffre-client-root button:hover,#coffre-client-root .cr-btn:hover,.cr-dialog button:hover{box-shadow:0 0 0 1px #b9acd3}
    #coffre-client-root button:disabled,.cr-dialog button:disabled{opacity:.5;cursor:not-allowed}
    #coffre-client-root :is(button,a,input,select,summary):focus-visible,.cr-dialog :is(button,input,select,textarea,summary):focus-visible{outline:3px solid #7762af;outline-offset:3px}
    #coffre-client-root .cr-actions,.cr-dialog .cr-actions{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin:17px 0 0}
    #coffre-client-root .cr-security{border:1px solid #ddd5c5;border-left:3px solid #ac9470;border-radius:10px;background:#f5f1e8;padding:15px 18px;margin:24px 0 32px}
    #coffre-client-root .cr-security strong{font-size:14px;font-weight:650}
    #coffre-client-root .cr-security p{font-size:13px;margin:4px 0 0;max-width:890px;color:#675f52}
    #coffre-client-root .cr-section-head,.cr-dialog .cr-section-head{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:19px}
    #coffre-client-root .cr-switch{display:flex;gap:5px;flex-wrap:wrap}
    #coffre-client-root .cr-switch button{font-size:13px;padding:9px 12px}
    #coffre-client-root .cr-switch [aria-pressed=true]{background:#ece7f4!important;color:#5f4c87!important;border-color:#cec1e0!important}
    #coffre-client-root .cr-filters{display:flex;gap:13px;align-items:end;flex-wrap:wrap;padding:18px;background:var(--cr-paper);border:1px solid var(--cr-line);border-radius:12px}
    #coffre-client-root label,.cr-dialog label{display:block;font-size:13px;color:var(--cr-muted);margin:0}
    #coffre-client-root .cr-filters label:first-child{flex:1;min-width:160px}
    #coffre-client-root .cr-filters label:nth-child(2){width:210px}
    #coffre-client-root input,#coffre-client-root select,.cr-dialog input,.cr-dialog select,.cr-dialog textarea{display:block;box-sizing:border-box;width:100%;max-width:100%;min-height:45px;padding:10px 12px;margin:6px 0 0;border:1px solid #d6d9cf!important;background:#fff!important;color:var(--cr-ink)!important;border-radius:7px;font:15px/1.4 system-ui}
    #coffre-client-root .cr-help,.cr-dialog .cr-help{font-size:12px;line-height:1.6}
    #coffre-client-root #cr-count{margin:12px 0}
    #coffre-client-root .cr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
    #coffre-client-root .cr-card{padding:22px;background:var(--cr-paper);border:1px solid var(--cr-line);border-radius:12px;min-width:0;overflow-wrap:anywhere;display:flex;flex-direction:column;align-items:start}
    #coffre-client-root .cr-tag{font:650 10px/1.4 system-ui;letter-spacing:.13em;color:#827092}
    #coffre-client-root .cr-card .cr-actions{margin-top:auto;padding-top:18px}
    #coffre-client-root .cr-card .cr-actions button{font-size:13px;padding:8px 12px}
    #coffre-client-root .cr-resource{display:inline-block;color:#69538d;font-size:13px;margin:12px 0 4px;overflow-wrap:anywhere}
    #coffre-client-root .cr-note-details{width:100%;margin:8px 0;border:0;padding:0}
    #coffre-client-root .cr-note-details summary{cursor:pointer;min-height:40px;padding:8px 0;font-size:13px}
    #coffre-client-root .cr-full-note{white-space:pre-wrap;font-size:14px;overflow-wrap:anywhere}
    #coffre-client-root .cr-empty{grid-column:1/-1;text-align:center;border:1px dashed #d3d7cc;background:#f5f4ed;border-radius:12px;padding:32px 20px}
    #coffre-client-root .cr-empty p{max-width:510px;margin:10px auto 20px;font-size:14px}
    #coffre-client-root .cr-details,.cr-dialog .cr-details{margin:18px 0 0;padding:0;border:1px solid var(--cr-line);background:var(--cr-paper);border-radius:11px}
    #coffre-client-root .cr-details>summary,.cr-dialog .cr-details>summary{padding:15px 18px;cursor:pointer;min-height:52px;font-size:14px}
    #coffre-client-root .cr-details>div,.cr-dialog .cr-details>div{padding:0 18px 18px}
    #coffre-client-root .cr-details p,.cr-dialog .cr-details p{font-size:13px}
    #coffre-client-root .cr-help-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
    #coffre-client-root .cr-help-grid h3{font:600 14px system-ui}
    #coffre-client-root .cr-footer{font-size:12px;margin:24px 0 0;color:#73786e}
    #coffre-client-root .cr-status:empty{display:none}
    #coffre-client-root .cr-status{font-size:13px;background:#ece7f4;padding:12px 15px;border-radius:8px}
    #coffre-client-root .cr-error,.cr-dialog .cr-error{font-size:13px;background:#fceeed;color:#8d3442!important;border-left:3px solid #bd7e86;padding:12px 15px;border-radius:7px}
    .cr-dialog{width:min(680px,calc(100vw - 28px));max-width:calc(100vw - 28px);max-height:90dvh;padding:26px;background:#fffefa!important;border:1px solid #dedfd7!important;border-radius:16px;overflow:auto;box-sizing:border-box}
    .cr-dialog::backdrop{background:#20252b80}
    .cr-dialog form>label{margin-top:18px}
    .cr-dialog label small{font-weight:400}
    .cr-dialog textarea{resize:vertical;min-height:140px}
    .cr-dialog .cr-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .cr-dialog #cr-followup>p{margin:0;padding:0 18px 16px}
    .cr-dialog #cr-close{font-size:25px;width:44px;padding:0}
    @media(max-width:700px){#coffre-client-root .cr-grid{grid-template-columns:1fr}#coffre-client-root .cr-help-grid{grid-template-columns:1fr;gap:5px}#coffre-client-root .cr-intro{font-size:15px}#coffre-client-root .cr-filters{padding:14px}#coffre-client-root .cr-filters label:first-child,#coffre-client-root .cr-filters label:nth-child(2){width:100%;flex:auto}#coffre-client-root .cr-card{padding:19px}#coffre-client-root input,#coffre-client-root select,.cr-dialog input,.cr-dialog select,.cr-dialog textarea{font-size:16px}.cr-dialog{padding:20px}.cr-dialog .cr-form-grid{grid-template-columns:1fr}#coffre-client-root .cr-empty{padding:25px 16px}#coffre-client-root h2,.cr-dialog h2{font-size:25px}#coffre-client-root .cr-hero .cr-actions>*{width:100%}#coffre-client-root .cr-security{margin:22px 0 27px}}
    `;
    document.head.append(css); document.body.classList.add('eloah-coffre-client'); document.title = 'Mes repères · ELOAH';
    const wordmark = document.querySelector('.eloah-global-nav .eloah-wordmark'); if (wordmark) wordmark.textContent = 'ELOAH · MON ESPACE';
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
