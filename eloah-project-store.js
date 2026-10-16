/* Shared local project deletion. No network or remote deletion. */
(function(){
'use strict';
async function clearFiles(project){
 if(!('indexedDB' in window))throw new Error('Stockage des fichiers indisponible');
 const db=await new Promise((resolve,reject)=>{
  const r=indexedDB.open('eloah-project-files',1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('files'))r.result.createObjectStore('files',{keyPath:'id'})};
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
 });
 try{
  await new Promise((resolve,reject)=>{
   const tx=db.transaction('files','readwrite'),store=tx.objectStore('files'),cursor=store.openCursor();
   cursor.onsuccess=()=>{const entry=cursor.result;if(!entry)return;if(entry.value?.project===project)entry.delete();entry.continue()};
   cursor.onerror=()=>reject(cursor.error);
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
 }finally{db.close()}
}
window.EloahProjectStore={
 async remove(project){
  if(typeof project!=='string'||!project.trim())throw new Error('Nom de projet invalide');
  const key='eloah-project-v1:'+project;
  // Preserve the original project if file deletion fails.
  await clearFiles(project);
  const raw=localStorage.getItem('eloah-expertise-v1');
  if(raw!==null){
   const data=JSON.parse(raw);
   if(!Array.isArray(data))throw new Error('Bases partagées illisibles, suppression interrompue');
   const updated=data.map(base=>{
    if(!base||typeof base!=='object'||!base.attachments?.[project])return base;
    const attachments={...base.attachments};delete attachments[project];
    return {...base,attachments};
   });
   localStorage.setItem('eloah-expertise-v1',JSON.stringify(updated));
  }
  localStorage.removeItem(key);
  return true;
 }
};
})();