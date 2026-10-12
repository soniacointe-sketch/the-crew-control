/* Portable local backup. No network transmission; authentication is excluded. */
(()=>{
'use strict';
const arrays=new Set(['eloah-sonia-maia-v1','eloah-sonia-velka-v1','eloah-sosso-notes-v1']);
const objects=new Set(['eloah-crew-dedicated-v1','eloah-sonia-maia-modules-v1','eloah-maia-concrete-v1','eloah-maia-week-v1','eloah-velka-studio-v1','pg-control-v1','pg-atelier-choices-v1']);
const markers=new Set(['eloah-crew-dedicated-v1-reference-v1','eloah-crew-dedicated-v1-editorial-ideas-v1','eloah-sonia-maia-v1-initialised','eloah-sonia-maia-history-v1','eloah-sonia-maia-v1-checklists-v1','eloah-sonia-maia-modules-v1-lists-v1','eloah-sonia-velka-v1-seed-v1','eloah-sonia-velka-v1-curated-202610','eloah-sosso-notes-v1-reference-202610-v1']);
const osKey=k=>/^sonia_os_command_center_v2_(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|unset)_(transactions|contacts|members|events|products|tasks|agents|decisions|knowledge|workflows|audits|seats|expanded_agents_20261011_v1|le_siege_v1|starter_20261011_v1)$/i.exec(k);
const isMarker=k=>markers.has(k)||!!osKey(k)?.[1].match(/^(expanded_agents_20261011_v1|le_siege_v1|starter_20261011_v1)$/);
const allowed=k=>typeof k==='string'&&(k.startsWith('eloah-project-v1:')||k.startsWith('sonia-universe-v1-')||['eloah-expertise-v1','eloah-planning-v1'].includes(k)||arrays.has(k)||objects.has(k)||markers.has(k)||!!osKey(k));
function area(k){if(osKey(k))return 'SONIA OS';if(k.startsWith('pg-'))return 'Power & Glam';if(k.includes('maia'))return 'MAIA';if(k.includes('velka')||k.includes('sosso'))return 'Sonia Velka & SOSSO';if(k.includes('crew-dedicated'))return 'The Crew';return 'ELOAH & notes des univers'}
function validate(p){
 if(!p||p.format!=='eloah-portable'||![1,2].includes(p.version)||!Array.isArray(p.entries)||!Array.isArray(p.files))throw Error('Format de sauvegarde incompatible.');
 const keys=new Set(),ids=new Set();
 for(const e of p.entries){if(!e||!allowed(e.key)||keys.has(e.key)||typeof e.value!=='string')throw Error('Clé inconnue ou répétée.');keys.add(e.key);if(isMarker(e.key)){if(!['1','ok','installed'].includes(e.value))throw Error('Marqueur invalide.');continue}if(e.key.startsWith('sonia-universe-v1-')&&e.value==='installed')continue;const v=JSON.parse(e.value);if(e.key.startsWith('eloah-project-v1:')){if(!v||!Array.isArray(v.threads))throw Error('Projet invalide.');}else if(objects.has(e.key)){if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Tableau de bord invalide.');const required={'eloah-crew-dedicated-v1':['Conversations','Planning','Idées','Mémoire'],'eloah-sonia-maia-modules-v1':['rooms','stocks','repairs'],'eloah-velka-studio-v1':['calendar','media'],'pg-control-v1':['tasks','contents','offers','finance']}[e.key]||[];if(required.some(k=>!Array.isArray(v[k])))throw Error('Rubrique de tableau de bord invalide.');}else if(!Array.isArray(v))throw Error('Liste de données invalide.');}
 let bytes=0;
 for(const f of p.files){if(!f||typeof f.id!=='string'||!f.id||ids.has(f.id)||typeof f.project!=='string'||typeof f.name!=='string'||typeof f.type!=='string'||!Number.isSafeInteger(f.size)||f.size<0||typeof f.data!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.data))throw Error('Fichier invalide.');ids.add(f.id);const n=f.data.length/4*3-(f.data.endsWith('==')?2:f.data.endsWith('=')?1:0);if(n!==f.size)throw Error('Fichier incomplet : '+f.name);bytes+=n;}
 if(bytes>100*1024*1024)throw Error('Cette version dépasse 100 Mo de pièces jointes.');
 return {areas:[...new Set(p.entries.map(e=>area(e.key)))],entries:p.entries.length,files:p.files.length,bytes,projects:p.entries.filter(e=>e.key.startsWith('eloah-project-v1:')).length};
}
if(typeof module!=='undefined'&&module.exports){module.exports={validate,allowed};return}
const $=id=>document.getElementById(id);let pending=null,db;
const status=s=>$('backup-status').textContent=s;
async function database(){if(db)return db;return new Promise((resolve,reject)=>{const r=indexedDB.open('eloah-project-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Ferme les autres onglets ELOAH puis réessaie.'));r.onsuccess=()=>{db=r.result;resolve(db)}})}
async function allFiles(){const d=await database();return new Promise((resolve,reject)=>{const r=d.transaction('files').objectStore('files').getAll();r.onsuccess=()=>resolve(r.result.filter(f=>!String(f.project).startsWith('eloah-recovery:')));r.onerror=()=>reject(r.error)})}
const to64=b=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(b)});
const encoder=new TextEncoder(),decoder=new TextDecoder();
const b64=bytes=>{let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)};
const un64=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
async function keyFor(pass,salt){const material=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(p,pass){if(!crypto?.subtle)throw Error('Chiffrement indisponible : utilise une page HTTPS.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await keyFor(pass,salt);const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encoder.encode(JSON.stringify(p)));return {format:'eloah-encrypted-backup',version:1,kdf:'PBKDF2-SHA256',iterations:310000,cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(encrypted))}}
async function unseal(p,pass){if(p.version!==1||p.kdf!=='PBKDF2-SHA256'||p.iterations!==310000||p.cipher!=='AES-256-GCM')throw Error('Paramètres de chiffrement non reconnus.');try{const k=await keyFor(pass,un64(p.salt)),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(p.iv)},k,un64(p.data));return JSON.parse(decoder.decode(plain))}catch{throw Error('Mot de passe incorrect ou sauvegarde chiffrée endommagée.')}}
function download(p,label){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(p)],{type:'application/json'}));a.href=url;a.download=label+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function snapshot(){
 const entries=Object.keys(localStorage).filter(allowed).sort().map(key=>({key,value:localStorage.getItem(key)}));
 const raw=await allFiles();if(raw.reduce((n,f)=>n+f.blob.size,0)>104857600)throw Error('Plus de 100 Mo de pièces jointes : utilise les sauvegardes par projet.');
 const files=[];for(const f of raw){status('Lecture du fichier '+(files.length+1)+' / '+raw.length+'…');files.push({id:f.id,project:f.project,name:f.name,type:f.blob.type||'',size:f.blob.size,date:f.date||'',folder:f.folder||'',data:await to64(f.blob)})}
 const p={format:'eloah-portable',version:2,createdAt:new Date().toISOString(),entries,files};validate(p);return p;
}
async function run(fn){document.querySelectorAll('button,input').forEach(e=>e.disabled=true);try{await fn()}catch(e){status('Opération interrompue : '+e.message)}finally{document.querySelectorAll('button,input').forEach(e=>e.disabled=false);$('apply').disabled=!pending||!$('consent').checked}}
$('export-all').onclick=()=>run(async()=>{const pass=$('backup-password').value,repeat=$('backup-password-again').value;if(pass.length<12)throw Error('Choisis une phrase secrète d’au moins 12 caractères.');if(pass!==repeat)throw Error('Les deux phrases secrètes sont différentes.');if(!confirm('Créer une sauvegarde chiffrée sur cet appareil ? Si tu perds la phrase secrète, cette sauvegarde sera irrécupérable.'))return;const p=await snapshot();status('Chiffrement local de la sauvegarde…');const sealed=await seal(p,pass);download(sealed,'ELOAH-sauvegarde-CHIFFREE');$('backup-password').value='';$('backup-password-again').value='';const n=validate(p);status('Sauvegarde chiffrée préparée : '+n.projects+' projets et '+n.files+' fichiers. Conserve séparément ta phrase secrète, elle n’est ni enregistrée ni envoyée.');});
$('import-file').onchange=e=>run(async()=>{
 pending=null;$('preview').hidden=true;const file=e.target.files[0];if(!file)return;
 if(file.size>150*1024*1024)throw Error('Fichier trop volumineux (maximum 150 Mo).');
 const loaded=JSON.parse(await file.text());let p;if(loaded?.format==='eloah-encrypted-backup'){const pass=$('restore-password').value;if(!pass)throw Error('Saisis la phrase secrète pour ouvrir la sauvegarde chiffrée.');status('Déchiffrement local…');p=await unseal(loaded,pass);$('restore-password').value='';}else{if(!confirm('Cette ancienne sauvegarde JSON est NON chiffrée. Elle sera lue localement. Continuer ?'))return;p=loaded;}const n=validate(p);
 const conflicts=p.entries.filter(e=>localStorage.getItem(e.key)!==null).length;
 const files=await allFiles(),existing=new Set(files.map(f=>f.id));const fileConflicts=p.files.filter(f=>existing.has(f.id)).length;
 $('summary').textContent='Espaces inclus : '+n.areas.join(', ')+'. '+n.projects+' projets · '+n.entries+' ensembles de données · '+n.files+' fichiers ('+(n.bytes/1048576).toFixed(1)+' Mo). '+conflicts+' ensembles et '+fileConflicts+' fichiers existent déjà ici et seront remplacés. Les autres données seront conservées.';
 pending=p;$('consent').checked=false;$('preview').hidden=false;status('Structure du fichier vérifiée. Aucune donnée restaurée pour le moment.');
});
$('consent').onchange=()=>{$('apply').disabled=!pending||!$('consent').checked};
$('apply').onclick=()=>run(async()=>{
 if(!pending||!$('consent').checked)return;
 const p=pending;validate(p);const before=await snapshot();download(before,'ELOAH-avant-restauration');
 const decoded=p.files.map(f=>{const s=atob(f.data),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return {id:f.id,project:f.project,name:f.name,date:f.date,folder:f.folder,blob:new Blob([u],{type:f.type})}});
 const original=new Map(p.entries.map(e=>[e.key,localStorage.getItem(e.key)]));let touched=false;
 try{
  touched=true;for(const e of p.entries)localStorage.setItem(e.key,e.value);
  const d=await database();await new Promise((resolve,reject)=>{const tx=d.transaction('files','readwrite');tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Transaction annulée'));tx.onerror=()=>reject(tx.error);try{for(const f of decoded)tx.objectStore('files').put(f)}catch(e){tx.abort();reject(e)}});
 }catch(e){
  if(touched){try{for(const k of original.keys())localStorage.removeItem(k);for(const [k,v] of original){if(v!==null)localStorage.setItem(k,v)}}catch{throw Error('Restauration interrompue et retour local incomplet. Utilise le fichier ELOAH-avant-restauration téléchargé.');}}
  throw e;
 }
 pending=null;$('preview').hidden=true;$('import-file').value='';status('Restauration terminée. Recharge tes autres onglets ELOAH avant de travailler. La copie précédente a été proposée au téléchargement.');$('back-home').hidden=false;
});
})();
