/* ELOAH diagnostic: opt-in, no project data mutations. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
function runCheck(name,fn){try{return Promise.resolve(fn()).then(v=>({name,ok:!!v,detail:v?'OK':'Indisponible'}),e=>({name,ok:false,detail:e.message||String(e)}))}catch(e){return Promise.resolve({name,ok:false,detail:e.message||String(e)})}}
function probeStorage(){const k='eloah-test-'+crypto.randomUUID();try{localStorage.setItem(k,'test');return localStorage.getItem(k)==='test'}finally{localStorage.removeItem(k)}}
function probeFiles(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window)){resolve(false);return}const req=indexedDB.open('eloah-project-files',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files',{keyPath:'id'})};req.onerror=()=>reject(req.error||Error('IndexedDB indisponible'));req.onsuccess=()=>{const db=req.result;const ok=db.objectStoreNames.contains('files');db.close();resolve(ok)}})}
async function tests(){
 return Promise.all([
 runCheck('💬 Conversations',()=>typeof newThread==='function'&&typeof renderChat==='function'&&typeof addMessage==='function'&&!!$('new-thread')&&!!$('compose')&&!!$('paste-response')&&probeStorage()),
 runCheck('📂 Fichiers',async()=>typeof addFiles==='function'&&typeof renderFiles==='function'&&!!$('upload')&&!!$('file-list')&&await probeFiles()),
 runCheck('💳 Facturation',()=>typeof showTab==='function'&&!!window.ELOAHWorkspace&&probeStorage()),
 runCheck('📚 Bases d’expertise',()=>typeof expertiseHome==='function'&&typeof saveBases==='function'&&probeStorage()),
 runCheck('👥 Équipe',()=>typeof showTab==='function'&&!!window.ELOAHWorkspace&&probeStorage()),
 runCheck('🧠 Mémoire',()=>typeof renderMemoryControls==='function'&&typeof settingsSave==='function'&&probeStorage()),
 runCheck('📊 Analytics',()=>typeof stats==='function'&&!!$('thread-count')&&!!$('file-count')),
 runCheck('⚙️ Paramètres',()=>typeof renderSettings==='function'&&!!window.EloahProjectStore&&typeof window.EloahProjectStore.remove==='function'&&typeof JSZip!=='undefined'&&probeStorage())
 ]);
}
function show(){let modal=$('eloah-check-dialog');if(!modal){modal=document.createElement('dialog');modal.id='eloah-check-dialog';modal.innerHTML='<div class="eloah-check-head"><h2>Diagnostic de mon projet</h2><button type="button" id="eloah-check-close">Fermer</button></div><p>Test non destructif des modules et des stockages locaux. Il ne prouve ni les paiements, ni la connexion à un service externe, ni le fonctionnement de chaque bouton.</p><div id="eloah-check-results" role="status">Vérification en cours…</div><button type="button" id="eloah-check-again">Relancer le contrôle</button>';document.body.append(modal);$('eloah-check-close').onclick=()=>modal.close();$('eloah-check-again').onclick=perform}
 modal.showModal();perform();
}
async function perform(){const target=$('eloah-check-results');target.textContent='Vérification en cours…';const results=await tests();target.replaceChildren();for(const result of results){const p=document.createElement('p');p.textContent=(result.ok?'✓ ':'⚠ ')+result.name+' — '+result.detail;target.append(p)}const p=document.createElement('p');p.textContent=results.filter(x=>x.ok).length+'/8 contrôles techniques réussis. Pour tester les actions réelles, ouvre chaque onglet.';target.append(p)}
function mount(){if($('eloah-check-button'))return;const head=document.querySelector('.project-head');if(!head)return;const button=document.createElement('button');button.id='eloah-check-button';button.type='button';button.textContent='✓ Tester les rubriques';button.onclick=show;head.append(button);const css=document.createElement('style');css.textContent='#eloah-check-dialog{width:min(640px,95vw);max-height:85vh;overflow:auto;border:1px solid #aaa;border-radius:16px;background:var(--panel,#fff);color:var(--ink,#222);padding:24px}#eloah-check-dialog::backdrop{background:#1118}.eloah-check-head{display:flex;justify-content:space-between;gap:10px;align-items:center}#eloah-check-results p{padding:7px 0;border-bottom:1px solid var(--line,#ddd)}';document.head.append(css)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();