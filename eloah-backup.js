/* Portable local backup. No network transmission; authentication is excluded. */
(()=>{
'use strict';
const allowed=k=>typeof k==='string'&&(k.startsWith('eloah-project-v1:')||k.startsWith('sonia-universe-v1-')||['eloah-expertise-v1','eloah-planning-v1'].includes(k));
function validate(p){
 if(!p||p.format!=='eloah-portable'||p.version!==1||!Array.isArray(p.entries)||!Array.isArray(p.files))throw Error('Format de sauvegarde incompatible.');
 const keys=new Set(),ids=new Set();
 for(const e of p.entries){if(!e||!allowed(e.key)||keys.has(e.key)||typeof e.value!=='string')throw Error('Clé inconnue ou répétée.');keys.add(e.key);const v=JSON.parse(e.value);if(e.key.startsWith('eloah-project-v1:')){if(!v||!Array.isArray(v.threads))throw Error('Projet invalide.');}else if(!Array.isArray(v))throw Error('Liste de données invalide.');}
 let bytes=0;
 for(const f of p.files){if(!f||typeof f.id!=='string'||!f.id||ids.has(f.id)||typeof f.project!=='string'||typeof f.name!=='string'||typeof f.type!=='string'||!Number.isSafeInteger(f.size)||f.size<0||typeof f.data!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(f.data))throw Error('Fichier invalide.');ids.add(f.id);const n=f.data.length/4*3-(f.data.endsWith('==')?2:f.data.endsWith('=')?1:0);if(n!==f.size)throw Error('Fichier incomplet : '+f.name);bytes+=n;}
 if(bytes>100*1024*1024)throw Error('Cette version dépasse 100 Mo de pièces jointes.');
 return {entries:p.entries.length,files:p.files.length,bytes,projects:p.entries.filter(e=>e.key.startsWith('eloah-project-v1:')).length};
}
if(typeof module!=='undefined'&&module.exports){module.exports={validate,allowed};return}
const $=id=>document.getElementById(id);let pending=null,db;
const status=s=>$('backup-status').textContent=s;
async function database(){if(db)return db;return new Promise((resolve,reject)=>{const r=indexedDB.open('eloah-project-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Ferme les autres onglets ELOAH puis réessaie.'));r.onsuccess=()=>{db=r.result;resolve(db)}})}
async function allFiles(){const d=await database();return new Promise((resolve,reject)=>{const r=d.transaction('files').objectStore('files').getAll();r.onsuccess=()=>resolve(r.result.filter(f=>!String(f.project).startsWith('eloah-recovery:')));r.onerror=()=>reject(r.error)})}
const to64=b=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(r.error);r.readAsDataURL(b)});
function download(p,label){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(p)],{type:'application/json'}));a.href=url;a.download=label+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function snapshot(){
 const entries=Object.keys(localStorage).filter(allowed).sort().map(key=>({key,value:localStorage.getItem(key)}));
 const raw=await allFiles();if(raw.reduce((n,f)=>n+f.blob.size,0)>104857600)throw Error('Plus de 100 Mo de pièces jointes : utilise les sauvegardes par projet.');
 const files=[];for(const f of raw){status('Lecture du fichier '+(files.length+1)+' / '+raw.length+'…');files.push({id:f.id,project:f.project,name:f.name,type:f.blob.type||'',size:f.blob.size,date:f.date||'',folder:f.folder||'',data:await to64(f.blob)})}
 const p={format:'eloah-portable',version:1,createdAt:new Date().toISOString(),entries,files};validate(p);return p;
}
async function run(fn){document.querySelectorAll('button,input').forEach(e=>e.disabled=true);try{await fn()}catch(e){status('Opération interrompue : '+e.message)}finally{document.querySelectorAll('button,input').forEach(e=>e.disabled=false);$('apply').disabled=!pending||!$('consent').checked}}
$('export-all').onclick=()=>run(async()=>{const p=await snapshot();download(p,'ELOAH-sauvegarde');const n=validate(p);status('Fichier préparé : '+n.projects+' projets, '+n.entries+' ensembles de données et '+n.files+' pièces jointes. Vérifie sa présence dans tes téléchargements.');});
$('import-file').onchange=e=>run(async()=>{
 pending=null;$('preview').hidden=true;const file=e.target.files[0];if(!file)return;
 if(file.size>150*1024*1024)throw Error('Fichier trop volumineux (maximum 150 Mo).');
 const p=JSON.parse(await file.text()),n=validate(p);
 const conflicts=p.entries.filter(e=>localStorage.getItem(e.key)!==null).length;
 const files=await allFiles(),existing=new Set(files.map(f=>f.id));const fileConflicts=p.files.filter(f=>existing.has(f.id)).length;
 $('summary').textContent=n.projects+' projets · '+n.entries+' ensembles de données · '+n.files+' fichiers ('+(n.bytes/1048576).toFixed(1)+' Mo). '+conflicts+' ensembles et '+fileConflicts+' fichiers existent déjà ici et seront remplacés. Les autres données seront conservées.';
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
  if(touched){try{for(const [k,v] of original){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}}catch{throw Error('Restauration interrompue et retour local incomplet. Utilise le fichier ELOAH-avant-restauration téléchargé.');}}
  throw e;
 }
 pending=null;$('preview').hidden=true;$('import-file').value='';status('Restauration terminée. Recharge tes autres onglets ELOAH avant de travailler. La copie précédente a été proposée au téléchargement.');$('back-home').hidden=false;
});
})();
