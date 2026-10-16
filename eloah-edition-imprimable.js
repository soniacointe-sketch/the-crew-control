/* ELOAH — édition imprimable autonome. PDF via Imprimer > Enregistrer en PDF. */
(()=>{
'use strict';
const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const palette={
 'Power & Glam':['#F4EFE7','#111111','#D32027'],
 'The Crew Orchies':['#141414','#F4EFE7','#C9A65A'],
 'PARISIS ENGINE':['#EDE6D9','#25211D','#8A6449'],
 'Sonia Velka':['#211820','#FCF1E9','#C44952'],
 'SONIA OS':['#EDF1F2','#19232B','#526C81'],
 'ELOAH':['#F4EFE7','#2D2030','#9B6683']
};
function paragraphs(text){
 const lines=String(text).split(/\n/),out=[];let group=[];
 const flush=()=>{if(group.length){out.push('<p>'+safe(group.join(' '))+'</p>');group=[]}};
 for(const raw of lines){
  const t=raw.trim();
  if(!t){flush();continue}
  if(/^#{1,3}\s/.test(t)){flush();const level=Math.min(3,(t.match(/^#+/)||['#'])[0].length);out.push('<h'+level+'>'+safe(t.replace(/^#+\s*/,''))+'</h'+level+'>')}
  else if(/^\d+[.)]\s/.test(t)||/^[-•]\s/.test(t)){flush();out.push('<p class="point">'+safe(t)+'</p>')}
  else group.push(t);
 }
 flush();return out.join('\n');
}
function readFile(file){return new Promise(resolve=>{if(!file){resolve(null);return}const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>resolve(null);r.readAsDataURL(file)})}
function init(){
 const log=document.getElementById('home-ai-log'),guide=document.getElementById('eloah-result-guide');
 if(!log||!guide||document.getElementById('eloah-editorial-print'))return;
 const button=document.createElement('button');button.id='eloah-editorial-print';button.type='button';button.textContent='Mon édition prête à imprimer / PDF';
 guide.querySelector('.eloah-result-buttons')?.append(button);
 const note=document.createElement('p');note.id='eloah-editorial-print-status';note.setAttribute('role','status');guide.append(note);
 const latest=()=>[...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||'';
 const update=()=>button.disabled=!latest();
 new MutationObserver(update).observe(log,{childList:true,subtree:true});update();
 button.addEventListener('click',async()=>{
  const result=latest();if(!result)return;
  try{
   const universe=document.getElementById('home-ai-project')?.value||'ELOAH';
   const [bg,ink,accent]=palette[universe]||palette.ELOAH;
   const title=document.getElementById('eloah-cover-title')?.value.trim()||document.getElementById('ef-subject')?.value.trim()||'Dossier éditorial';
   const sourceFiles=[...document.getElementById('eloah-media-input')?.files||[]].slice(0,3);
   const images=[];
   for(const file of sourceFiles){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024)continue;const data=await readFile(file);if(data)images.push({data,caption:file.name})}
   const coverBlob=window.EloahCoverAsset?.universe===universe?window.EloahCoverAsset.blob:null;
   const cover=coverBlob?await readFile(coverBlob):null;
   const photos=images.map((x,i)=>'<figure class="photo"><img src="'+x.data+'" alt="Photographie fournie '+(i+1)+'"><figcaption>'+safe(x.caption)+'</figcaption></figure>').join('');
   const html='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+safe(title)+' · ELOAH</title><style>'+
    '@page{size:A4;margin:17mm}*{box-sizing:border-box}body{margin:0;background:#e8e5e1;color:'+ink+';font:16px/1.7 Georgia,serif}.sheet{max-width:210mm;margin:20px auto;background:'+bg+';padding:24mm 21mm;min-height:280mm;box-shadow:0 9px 30px #0002}.cover{min-height:240mm;display:flex;flex-direction:column;justify-content:space-between}.topline{font:700 12px/1.5 Arial;letter-spacing:.24em;color:'+accent+'}.rule{height:3px;width:74px;background:'+accent+';margin-top:20px}h1{font-size:clamp(42px,5vw,70px);line-height:1.05;font-weight:400;overflow-wrap:anywhere}h2{font-size:29px;line-height:1.2;margin:32px 0 13px}h3{font-size:21px;margin:24px 0 11px}p{margin:0 0 17px;orphans:3;widows:3}.point{padding-left:13px;border-left:2px solid '+accent+'}.photo{margin:22px 0;break-inside:avoid}.photo img{display:block;max-width:100%;max-height:185mm;object-fit:contain;margin:auto}.photo figcaption{font:12px Arial;margin-top:7px}footer{font:11px/1.5 Arial;margin-top:35px;border-top:1px solid '+accent+';padding-top:12px}.cover-image{max-width:100%;max-height:200mm;object-fit:contain;margin:auto;display:block}@media print{body{background:white}.sheet{box-shadow:none;margin:0;max-width:none;min-height:0;padding:0}.cover{break-after:page;min-height:255mm}h2,h3{break-after:avoid}.photo{break-inside:avoid}}'+
    '</style></head><body><section class="sheet cover">'+
    (cover?'<img class="cover-image" src="'+cover+'" alt="Couverture créée dans ELOAH">':'<div><div class="topline">'+safe(universe.toUpperCase())+' · ELOAH ÉDITIONS</div><div class="rule"></div><h1>'+safe(title)+'</h1><p>Édition de travail</p></div>')+
    '<div class="topline">'+safe(new Date().toLocaleDateString('fr-FR'))+'</div></section><main class="sheet"><div class="topline">'+safe(universe)+' · DOSSIER</div>'+paragraphs(result)+photos+'<footer>Dossier à relire. Photographies fournies manuellement. Aucune publication externe effectuée. Pour obtenir un PDF : Imprimer → Enregistrer au format PDF.</footer></main></body></html>';
   const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='eloah-edition-imprimable.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
   note.textContent='Édition HTML créée. Ouvre le fichier, puis Imprimer → Enregistrer au format PDF. Vérifie les sauts de page.';
  }catch(e){note.textContent='Export impossible : '+(e?.message||'erreur inconnue')}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();