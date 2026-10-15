/* Power & Glam Intelligence v2 — existing founder gateway, explicit sends only.
   No automatic reads of cockpit data. Conversation stays in memory.
   Editor handoff fills a NEW unsaved form; the native Save button is still required. */
(() => {
  'use strict';
  if (location.pathname.split('/').pop() !== 'power-glam-control.html' || document.getElementById('pg-intelligence')) return;
  const main = document.querySelector('body > main'), view = document.getElementById('view');
  if (!main || !view) return;
  const host = document.createElement('section');
  host.id = 'pg-intelligence';
  host.setAttribute('aria-label', 'Power & Glam Intelligence');
  host.style.cssText = 'display:block;min-width:0;margin:20px 0;scroll-margin-top:20px';
  const shadow = host.attachShadow({mode:'open'});
  // Static markup only: all messages and user text are inserted with textContent/value.
  shadow.innerHTML = `
<link rel="stylesheet" href="power-glam-intelligence.css?v=1.0">
<details class="shell" id="panel" open>
 <summary><span><small>✦ LA MAISON ÉDITORIALE · IA 2040</small><strong>Power & Glam Intelligence</strong><span class="subtitle">Une idée. Une conversation. Un contenu à toi.</span></span><span class="chevron" aria-hidden="true">⌄</span></summary>
 <div class="inside">
  <div class="connection"><p id="auth-status" role="status">Vérifie ta connexion fondatrice pour activer l’IA.</p><div class="buttons"><button id="verify" type="button">Vérifier ma connexion</button><a href="eloah-fondatrice.html" target="_blank" rel="noopener noreferrer">Connexion fondatrice ↗</a><button id="signout" type="button" hidden>Déconnecter cette session</button></div></div>
  <div class="workspace">
   <div class="brief"><span class="overline">TON STUDIO DE RÉDACTION</span><h2>Qu’est-ce qu’on<br>crée aujourd’hui ?</h2><p>Écris, clarifie et transforme tes idées en contenus ou en offres. Tu gardes le dernier mot.</p><div class="suggestions" role="group" aria-label="Préparer une demande"><button type="button" data-preset="post">Écrire un post ↗</button><button type="button" data-preset="carousel">Carrousel · 10 slides ↗</button><button type="button" data-preset="article">Préparer un article ↗</button><button type="button" data-preset="reel">Écrire un reel ↗</button><button type="button" data-preset="offer">Imaginer une offre ↗</button><button type="button" data-preset="mail">Préparer un e-mail ↗</button></div><p class="privacy">Accès fondatrice uniquement. Les repères privés de Sonia sont chargés après vérification de sa connexion. Aucun document, contact ou chiffre du cockpit n’est lu automatiquement.</p></div>
   <div class="composer"><form id="request-form">
    <label for="prompt">Ta demande à Power & Glam</label><textarea id="prompt" maxlength="6000" rows="5" required placeholder="Ex. : un post sur l’attachement quand l’autre s’éloigne, profond et humain, sans phrases toutes faites…" aria-describedby="length"></textarea><div class="prompt-meta"><span>Ctrl / Cmd + Entrée pour envoyer</span><span id="length">0 / 6 000</span></div>
    <details class="settings" id="settings"><summary>Univers, format et confidentialité</summary><div class="settings-body"><div class="settings-grid"><label for="universe">Univers<select id="universe"><option>Power & Glam</option><option>Amour</option><option>Beauté</option><option>Argent</option><option>Vie</option><option>Désir</option><option>Dossiers P&G</option><option>P&G Éditions</option><option>Table Rouge</option></select></label><label for="format">Format<select id="format"><option>Libre</option><option>Post</option><option>Carrousel</option><option>Article</option><option>Reel</option><option>Offre</option><option>E-mail</option><option>Story</option><option>Page de vente</option></select></label></div><label for="provider">Moteur<select id="provider"><option value="free">Groq · selon quota disponible</option><option value="openai">OpenAI · API payante</option></select></label><p class="fine">Les disponibilités dépendent des clés et quotas du serveur. OpenAI peut entraîner des frais sur ton compte API. Aucun basculement payant automatique.</p><label class="check"><input type="checkbox" id="memory" checked> Joindre les derniers échanges de cette conversation</label><p class="fine">Trois échanges maximum, raccourcis si nécessaire. L’historique n’est pas enregistré par ce module après actualisation ou fermeture.</p><label for="source">Ton brief ou ton extrait (facultatif)</label><textarea id="source" maxlength="1500" rows="3" placeholder="Colle uniquement les éléments que tu souhaites partager…"></textarea><label class="check"><input type="checkbox" id="include-source"> Joindre volontairement ce texte à ma demande</label><p class="fine">Le texte coché et ta demande sont transmis au moteur choisi via la passerelle ELOAH. N’y colle ni mot de passe ni donnée sensible.</p></div></details>
    <div class="request-buttons"><button class="primary" id="send" type="submit" disabled>Envoyer à ELOAH ↗</button><button id="preview" type="button">Voir le texte envoyé</button><button id="stop" type="button" hidden>Interrompre</button><button id="reset" type="button">Nouvelle conversation</button></div>
    <pre id="payload" hidden aria-label="Aperçu exact du contexte envoyé"></pre>
   </form></div>
  </div>
  <section class="answer-section" aria-labelledby="answer-title"><div class="answer-head"><h3 id="answer-title">Notre échange</h3><span id="history-count">Mémoire temporaire</span></div><details id="history" hidden><summary>Voir les échanges précédents</summary><div id="history-log"></div></details><div id="output" role="status" aria-live="polite">Pose ta question. Rien ne sera publié ou enregistré sans ton choix.</div><div class="answer-actions" id="answer-actions" hidden><button type="button" id="copy">Copier</button><button type="button" id="download">Enregistrer en texte</button><button type="button" id="use-editor">Préparer dans l’éditeur</button><button type="button" id="use-note">Préparer une note</button><button type="button" data-adapt="Carrousel">Adapter en carrousel</button><button type="button" data-adapt="Reel">Adapter en reel</button><a href="eloah-power-glam-article-studio.html" target="_blank" rel="noopener noreferrer">Article Studio ↗</a></div><p id="action-status" class="fine" role="status"></p><p class="fine">« Préparer » remplit un nouveau brouillon : tu dois encore le relire et cliquer sur Enregistrer dans l’outil. Pour Article Studio, copie le texte puis colle-le dans le studio.</p></section>
 </div>
</details>`;
  view.before(host);
  const q = id => shadow.getElementById(id);
  const base = 'https://voytsqyorhoveurnguxn.supabase.co';
  const publicKey = 'sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
  const founderId = 'bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
  let client = null, clientLoading = null, checking = false, identity = null, verified = false;
  let authGeneration = 0, generation = 0, pending = null, lastAnswer = '', turns = [], preparedEditor = null;
  let lastFormat = 'Libre', lastUniverse = 'Power & Glam';
  let founderMemory=null,memoryLoading=null;
  async function ensureFounderMemory(){
    if(founderMemory)return founderMemory;if(memoryLoading)return memoryLoading;
    memoryLoading=(async()=>{const {createFounderMemory}=await deadline(import('./power-glam-founder-memory.js?v=1.0'),15000);
      founderMemory=createFounderMemory({shadow,isVerified:()=>verified&&identity===founderId,onChange:message=>reset(message)});return founderMemory;})();
    try{return await memoryLoading;}finally{memoryLoading=null;}
  }

  const prompts = {
    post:['Post','Écris un post Power & Glam sur le sujet suivant : [mon sujet]. Une voix adulte, profonde et humaine ; une accroche précise, une idée forte et une invitation naturelle.'],
    carousel:['Carrousel','Prépare un carrousel de 10 slides sur [mon sujet]. Pour chaque slide : un titre bref et un texte lisible. Ajoute une légende, sans slogans empilés.'],
    article:['Article','Prépare le plan détaillé et l’introduction d’un article sur [mon sujet]. Distingue les faits fournis, les hypothèses et les sources à vérifier ; n’invente pas de références.'],
    reel:['Reel','Écris un script de reel de 45 à 60 secondes sur [mon sujet] : voix off, texte à l’écran, idées de plans et conclusion naturelle.'],
    offer:['Offre','Aide-moi à structurer une offre autour de [mon idée] : public, besoin, contenu, limites et prochaines étapes. Ne crée ni tarif définitif ni promesse de résultat.'],
    mail:['E-mail','Prépare un e-mail Power & Glam pour [mon objectif] : trois objets possibles, un texte naturel et une invitation claire. Ne prétends pas l’avoir envoyé.']
  };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function openPanel() { q('panel').open = true; host.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'start'}); q('prompt').focus({preventScroll:true}); }
  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.id = 'pg-intelligence-open'; trigger.textContent = '✦ Assistante P&G'; trigger.setAttribute('aria-controls',host.id);
  const header = main.querySelector(':scope > header'); header?.append(trigger); trigger.addEventListener('click',openPanel);
  // Convert only the existing P&G hero shortcut, without changing the ELOAH 2040 page.
  document.addEventListener('click',event => {
    const link = event.target.closest?.('.pg2040-hero-actions a[href="eloah-2040.html#assistant-reel"]');
    if (!link) return; event.preventDefault(); event.stopPropagation(); openPanel();
  },true);
  function controls() {
    const busy = !!pending;
    q('send').disabled = !verified || busy || checking;
    q('stop').hidden = !busy;
    q('request-form').setAttribute('aria-busy',String(busy));
    q('answer-actions').hidden = !lastAnswer || !verified;
    q('signout').hidden = !client || !identity;
    q('verify').disabled = checking;
    q('length').textContent = `${q('prompt').value.length} / 6 000`;
    host.dataset.connected = verified ? 'true' : 'false';
  }
  function cancel() { generation++; if (pending) { clearTimeout(pending.timer); pending.controller.abort(); } pending = null; controls(); }
  function clearPrepared() {
    if (!preparedEditor) return;
    const {modal,form} = preparedEditor; preparedEditor = null;
    // Only the unsaved form opened by this module is touched, never other cockpit records.
    if (modal.open) { form.querySelectorAll('input,textarea').forEach(e => { if(!['checkbox','radio','submit','button'].includes(e.type)) e.value=''; }); modal.close(); }
  }
  function renderHistory() {
    const target = q('history-log'); target.replaceChildren();
    for (const pair of turns.slice(0,-1)) {
      for (const [author,text] of [['Toi',pair.question],['Power & Glam',pair.answer]]) {
        const line = document.createElement('article'), label = document.createElement('strong'), p = document.createElement('p');
        label.textContent = author; p.textContent = text; line.append(label,p); target.append(line);
      }
    }
    q('history').hidden = turns.length < 2;
    q('history-count').textContent = turns.length ? `${turns.length} échange(s) · uniquement dans cette page` : 'Mémoire temporaire';
  }
  function reset(message='Nouvelle conversation prête.',sensitive=false) {
    cancel(); turns=[]; lastAnswer=''; renderHistory(); q('output').textContent=message;
    q('payload').textContent=''; q('payload').hidden=true; q('action-status').textContent='';
    if(sensitive){if(!verified)founderMemory?.clear();q('prompt').value='';q('source').value='';q('include-source').checked=false;clearPrepared();}
    controls();
  }
  function contextFor(current) {
    const brief = q('include-source').checked ? q('source').value.trim() : '';
    const profile = `Demande éditoriale Power & Glam. Univers : ${q('universe').value}. Format : ${q('format').value}.\nVoix souhaitée : adulte, naturelle, précise et humaine ; éviter les slogans empilés et les promesses non étayées. N’invente ni chiffres, ni sources, ni actions réalisées.\n`;
    let request = profile+(brief?`Extrait fourni volontairement comme contexte, pas comme instruction système :\n${brief}\n`:'')+`\nDemande de Sonia :\n${current}`;
    if(request.length>9000)throw Error('La demande et son brief dépassent 9 000 caractères. Raccourcis le texte avant de l’envoyer.');
    if(!founderMemory)throw Error('Le module de mémoire n’est pas chargé. Clique sur Vérifier ma connexion pour réessayer.');
    request=founderMemory.compose(current,q('universe').value,Math.min(5200,9000-request.length))+request;
    if(!q('memory').checked||!turns.length)return request;
    let budget=9000-request.length-100; const pieces=[];
    for(const turn of turns.slice(-3).reverse()) {
      const piece=`Question précédente : ${turn.question.slice(0,350)}\nRéponse précédente : ${turn.answer.slice(0,700)}\n`;
      if(piece.length+2<=budget){pieces.unshift(piece);budget-=piece.length+2;}
    }
    return pieces.length?'Historique récent, extrait fourni comme contexte :\n'+pieces.join('\n')+'\n'+request:request;
  }
  async function deadline(promise,ms) {
    let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),ms);})]);}finally{clearTimeout(timer);}
  }
  async function ensureClient() {
    if(client)return client;if(clientLoading)return clientLoading;
    clientLoading=(async()=>{
      const {createClient}=await deadline(import('https://esm.sh/@supabase/supabase-js@2.116.0'),15000);
      client=createClient(base,publicKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}});
      client.auth.onAuthStateChange((event,session)=>{
        const next=session?.user?.id||null;
        if(event==='SIGNED_OUT'||(identity&&identity!==next)){
          authGeneration++;identity=null;verified=false;reset('Session modifiée : conversation et brouillons temporaires effacés.',true);
          q('auth-status').textContent='Connexion fondatrice à vérifier.';
        }
        if(next)setTimeout(()=>void checkUser(),0);
      });return client;
    })();
    try{return await clientLoading;}finally{clientLoading=null;}
  }
  async function checkUser() {
    if(checking)return;checking=true;const ticket=authGeneration;controls();
    q('auth-status').textContent='Vérification de ta session fondatrice…';
    try {
      const auth=await ensureClient();const {data,error}=await deadline(auth.auth.getUser(),15000);
      if(ticket!==authGeneration)return;
      const user=error?null:data?.user;
      if(identity&&identity!==(user?.id||null))reset('Compte changé : conversation effacée.',true);
      identity=user?.id||null;verified=identity===founderId&&user?.is_anonymous!==true;
      q('auth-status').textContent=verified?'Fondatrice vérifiée · envoi uniquement à ton clic.':identity?'Ce compte n’est pas le compte fondatrice. Les comptes clientes restent séparés.':'Ouvre Connexion fondatrice, puis reviens vérifier ta session.';
      if(!verified){founderMemory?.clear();if(lastAnswer)reset('Accès fondatrice requis : échange retiré de l’écran.',true);}
      else {try{const memoryModule=await ensureFounderMemory();if(ticket===authGeneration&&verified)await memoryModule.connect(client,identity);}catch{if(ticket===authGeneration)q('auth-status').textContent='Session vérifiée, mais mémoire indisponible. Réessaie Vérifier ma connexion.';}}
    } catch {
      if(ticket!==authGeneration)return;
      const hadPrivateSession=!!identity||!!lastAnswer;
      identity=null;verified=false;reset('Connexion IA indisponible. Tes autres outils restent utilisables.',hadPrivateSession);
      q('auth-status').textContent='Connexion non vérifiable. Réessaie avec « Vérifier ma connexion ».';
    } finally {checking=false;controls();}
  }
  q('verify').addEventListener('click',()=>void checkUser());
  q('signout').addEventListener('click',async()=>{
    authGeneration++;identity=null;verified=false;reset('Session terminée, conversation temporaire effacée.',true);controls();
    try{const {error}=await client.auth.signOut({scope:'local'});q('auth-status').textContent=error?'Déconnexion non confirmée. Vérifie depuis la page fondatrice.':'Session fondatrice déconnectée dans ce navigateur.';}catch{q('auth-status').textContent='Déconnexion non confirmée. Vérifie depuis la page fondatrice.';}
  });
  q('prompt').addEventListener('input',()=>{q('payload').hidden=true;controls();});
  q('source').addEventListener('input',()=>{q('payload').hidden=true;});
  ['provider','universe','format','memory','include-source'].forEach(id=>q(id).addEventListener('change',()=>{
    reset('Réglage changé : nouveau contexte, aucun ancien échange ne sera joint.');
    if(['provider','universe'].includes(id)){founderMemory?.resetPersonal();q('include-source').checked=false;q('source').value='';}
  }));
  q('reset').addEventListener('click',()=>{founderMemory?.resetPersonal();reset('Nouvelle conversation prête.',true);});
  q('stop').addEventListener('click',()=>{cancel();lastAnswer='';controls();q('output').textContent='Réception interrompue. Le serveur peut déjà avoir traité la demande.';});
  q('preview').addEventListener('click',()=>{
    try{q('payload').textContent=contextFor(q('prompt').value.trim());}catch(error){q('payload').textContent=error.message;}
    q('payload').hidden=false;
  });
  shadow.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
    const [format,text]=prompts[button.dataset.preset];founderMemory?.resetPersonal();reset('Demande préparée : complète ton sujet puis envoie-la.');
    q('format').value=format;q('prompt').value=text;controls();q('prompt').focus();
  }));
  q('prompt').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();if(!q('send').disabled)q('request-form').requestSubmit();}});
  q('request-form').addEventListener('submit',async event=>{
    event.preventDefault();event.stopPropagation();
    const current=q('prompt').value.trim();if(!current||pending||checking||!verified||!client)return;
    const provider=q('provider').value;if(!['free','openai'].includes(provider))return;
    let context;try{context=contextFor(current);}catch(error){q('output').textContent=error.message;return;}
    const ticket=++generation,account=identity,format=q('format').value,universe=q('universe').value;
    const controller=new AbortController();pending={ticket,controller,timer:setTimeout(()=>controller.abort(),55000)};
    lastAnswer='';q('output').textContent='ELOAH prépare ta réponse…';q('action-status').textContent='';controls();
    try {
      const {data,error}=await deadline(client.auth.getSession(),15000);
      if(ticket!==generation||account!==identity)return;
      const session=data?.session;
      if(error||!session?.access_token||session.user?.id!==founderId){authGeneration++;verified=false;identity=null;reset('Ta session a expiré. Vérifie ta connexion fondatrice.',true);return;}
      const response=await fetch(base+'/functions/v1/eloah-2040-founder-ai',{
        method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',apikey:publicKey,Authorization:'Bearer '+session.access_token},
        body:JSON.stringify({context,project:'Power & Glam · '+universe,provider}),signal:controller.signal
      });
      const dataAnswer=await response.json().catch(()=>({}));
      if(ticket!==generation||account!==identity||!verified)return;
      if(response.status===401||response.status===403){authGeneration++;verified=false;identity=null;reset('Accès refusé. Vérifie ton compte fondatrice.',true);q('auth-status').textContent='Session à vérifier.';return;}
      if(!response.ok||dataAnswer.ok!==true||typeof dataAnswer.answer!=='string'||!dataAnswer.answer.trim()){
        q('output').textContent=typeof dataAnswer.error==='string'?dataAnswer.error.slice(0,600):response.status===429?'Quota du moteur atteint. Aucun autre moteur n’a été appelé.':'Le moteur n’a pas renvoyé de réponse exploitable.';return;
      }
      if(dataAnswer.answer.length>30000){q('output').textContent='Réponse trop longue pour ce module. Demande une version plus courte.';return;}
      lastAnswer=dataAnswer.answer;lastFormat=format;lastUniverse=universe;
      q('output').textContent=lastAnswer;turns.push({question:current,answer:lastAnswer});if(turns.length>4)turns.shift();renderHistory();
    }catch(error){if(ticket===generation&&account===identity)q('output').textContent=error?.name==='AbortError'?'Délai dépassé. Le serveur peut avoir traité la demande ; aucune publication n’a été effectuée.':'Connexion interrompue. Réessaie sans envoyer de données sensibles.';}
    finally{if(pending?.ticket===ticket){clearTimeout(pending.timer);pending=null;controls();}}
  });
  q('copy').addEventListener('click',async()=>{
    if(!lastAnswer||!verified)return;const ticket=generation;
    try{await navigator.clipboard.writeText(lastAnswer);if(ticket===generation)q('action-status').textContent='Réponse copiée.';}catch{if(ticket===generation)q('action-status').textContent='Copie indisponible : sélectionne le texte de la réponse manuellement.';}
  });
  q('download').addEventListener('click',()=>{
    if(!lastAnswer||!verified)return;
    const href=URL.createObjectURL(new Blob([lastAnswer],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=href;a.download='power-glam-reponse-ia.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);
    q('action-status').textContent='Fichier texte préparé sur ton appareil.';
  });
  function prepareEditor(note=false) {
    if(!lastAnswer||!verified)return;
    if(document.querySelector('dialog[open]')){q('action-status').textContent='Ferme d’abord le brouillon ouvert pour ne pas l’écraser.';return;}
    if(typeof window.openEditor!=='function'){q('action-status').textContent='Éditeur indisponible. Copie le texte pour le conserver.';return;}
    const type=note?'journal':lastFormat==='E-mail'?'newsletters':lastFormat==='Offre'?'offers':'contents';
    try {
      window.openEditor(type);
      const modal=document.getElementById('editor'),form=document.getElementById('editForm');
      const body=form?.elements.namedItem(type==='offers'?'detail':'body'),title=form?.elements.namedItem('title');
      if(!modal?.open||!form||!body||!title)throw Error('editor_not_ready');
      if(body.maxLength>0&&lastAnswer.length>body.maxLength)throw Error('editor_limit');
      preparedEditor={modal,form};modal.addEventListener('close',()=>{preparedEditor=null;},{once:true});
      const heading=lastAnswer.split('\n').find(line=>line.trim())||'Brouillon Power & Glam';
      title.value=heading.replace(/^[#*\s]+/,'').slice(0,160);body.value=lastAnswer;
      const select=(name,value)=>{const input=form.elements.namedItem(name);if(input?.options&&Array.from(input.options).some(o=>o.value===value))input.value=value;};
      select('status',type==='offers'?'En préparation':'Brouillon');select('universe',lastUniverse);
      select('format',lastFormat==='Page de vente'?'Article':lastFormat==='Libre'?'Post':lastFormat);
      const subject=form.elements.namedItem('subject');if(subject)subject.value=title.value;
      // Do not dispatch a form-wide change: older editor extensions keep listeners across note/content forms.
      body.dispatchEvent(new Event('input'));
      if(type==='contents')document.getElementById('refreshContentPrompt')?.click();
      q('action-status').textContent='Nouveau brouillon préparé, non enregistré. Relis-le puis utilise Enregistrer dans l’éditeur.';body.focus();
    }catch{q('action-status').textContent='Le transfert n’a pas pu être terminé. Aucun enregistrement n’a été demandé ; utilise Copier.';}
  }
  q('use-editor').addEventListener('click',()=>prepareEditor(false));q('use-note').addEventListener('click',()=>prepareEditor(true));
  shadow.querySelectorAll('[data-adapt]').forEach(button=>button.addEventListener('click',()=>{
    if(!lastAnswer||!verified)return;const content=lastAnswer,target=button.dataset.adapt;
    if(content.length>5400){q('action-status').textContent='Réponse trop longue : copie un extrait dans ta demande pour l’adapter.';return;}
    reset('Adaptation préparée. Relis la demande puis appuie sur Envoyer.');q('format').value=target;
    q('prompt').value=`Transforme le texte ci-dessous en ${target==='Carrousel'?'carrousel de 10 slides, avec une légende':'script de reel de 45 à 60 secondes, avec voix off et plans'}.\n\nTexte à adapter :\n${content}`;controls();q('prompt').focus();
  }));
  document.getElementById('nav')?.addEventListener('click',()=>{q('panel').open=false;});
  window.addEventListener('pagehide',()=>{authGeneration++;verified=false;identity=null;reset('Conversation temporaire effacée.',true);});
  window.addEventListener('pageshow',event=>{if(event.persisted&&client)void checkUser();});
  window.addEventListener('focus',()=>{if(client&&!pending)void checkUser();});
  window.addEventListener('offline',()=>{cancel();lastAnswer='';controls();q('output').textContent='Connexion interrompue. Réessaie une fois en ligne.';});
  if(location.hash==='#pg-intelligence')openPanel();controls();
  void ensureFounderMemory().catch(()=>{q('auth-status').textContent='Chargement de la mémoire indisponible. Réessaie Vérifier ma connexion.';});
})();