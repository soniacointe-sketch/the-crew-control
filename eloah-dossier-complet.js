/* ELOAH : dossier portable texte, images locales et couverture réellement créée. */
(()=>{
'use strict';
const encoder=new TextEncoder();
const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function archive(files){
 const pieces=[],central=[];let offset=0,size=0;
 for(const file of files){
  const name=encoder.encode(file.name),content=file.bytes,sum=crc32(content);
  const header=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(sum),...u32(content.length),...u32(content.length),...u16(name.length),...u16(0)]);
  pieces.push(header,name,content);
  const record=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(sum),...u32(content.length),...u32(content.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
  central.push(record,name);offset+=header.length+name.length+content.length;size+=record.length+name.length;
 }
 const end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(size),...u32(offset),...u16(0)]);
 return new Blob([...pieces,...central,end],{type:'application/zip'});
}
const txt=(name,content)=>({name,bytes:encoder.encode(content)});
function init(){
 const guide=document.getElementById('eloah-result-guide');
 const log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('eloah-final-package'))return;
 const button=document.createElement('button');button.type='button';button.id='eloah-final-package';button.textContent='Télécharger tout mon dossier (ZIP)';
 guide.querySelector('.eloah-result-buttons')?.append(button);
 const status=document.createElement('p');status.id='eloah-final-package-status';status.setAttribute('role','status');guide.append(status);
 const answer=()=>[...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||'';
 const update=()=>button.disabled=!answer();
 new MutationObserver(update).observe(log,{childList:true,subtree:true});update();
 button.addEventListener('click',async()=>{
  const result=answer();if(!result)return;
  button.disabled=true;status.textContent='Assemblage du dossier…';
  try{
   const universe=document.getElementById('home-ai-project')?.value||'ELOAH';
   const sources=window.EloahAutoSources?.sources?.()||[];
   const files=[txt('01-TEXTE.md',result),txt('02-SOURCES.json',JSON.stringify(sources,null,2))];
   const images=[...document.getElementById('eloah-media-input')?.files||[]].slice(0,3);
   const accepted=['image/jpeg','image/png','image/webp'];
   let number=0;
   for(const file of images){
    if(!accepted.includes(file.type)||file.size>4*1024*1024)continue;
    number++;const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
    files.push({name:'images/photo-'+number+'.'+extension,bytes:new Uint8Array(await file.arrayBuffer())});
   }
   const cover=window.EloahCoverAsset;
   const coverMatches=cover?.blob&&cover.universe===universe;
   if(coverMatches)files.push({name:'images/couverture.png',bytes:new Uint8Array(await cover.blob.arrayBuffer())});
   const manifest={created_at:new Date().toISOString(),universe,sources_used:sources.length,photos_included:number,cover_included:Boolean(coverMatches),visual_generation_ai:false,published:false};
   files.push(txt('03-MANIFEST.json',JSON.stringify(manifest,null,2)));
   files.push(txt('LIRE-MOI.txt','ELOAH — Dossier de travail\nTexte généré : 01-TEXTE.md\nSources : 02-SOURCES.json\nPhotographies : images/ (si sélectionnées)\nCouverture PNG : images/couverture.png (si créée auparavant)\nRelire le contenu et vérifier les droits des photographies avant publication.\nAucune publication automatique.'));
   const blob=archive(files);const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='eloah-dossier-complet.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
   status.textContent='Dossier ZIP préparé : texte, sources, '+number+' photo(s)'+(coverMatches?' et couverture PNG.':'. Pour inclure la couverture, crée-la avant cet export.');
  }catch(e){status.textContent='Export impossible : '+(e?.message||'erreur inconnue')}
  finally{update()}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();