/* Power & Glam : mise en page magazine autonome et export HTML imprimable. */
(()=>{
'use strict';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileData=f=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('Image illisible'));r.readAsDataURL(f)});
function sections(text){
 const paragraphs=String(text).split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
 const output=[];let current={heading:'Le dossier',body:[]};
 const flush=()=>{if(current.body.length){output.push(current);current={heading:'',body:[]}}};
 for(const p of paragraphs){
  const lines=p.split('\n').map(x=>x.trim()).filter(Boolean);
  if(lines.length===1&&(/^#{1,3}\s/.test(lines[0])||(/^[A-ZÀ-Ÿ0-9 ,’':-]{6,90}$/.test(lines[0])&&lines[0].length<75))){
   flush();current.heading=lines[0].replace(/^#{1,3}\s/,'');continue;
  }
  current.body.push(p.replace(/^#{1,3}\s/gm,''));
 }
 flush();return output.length?output:[{heading:'Le dossier',body:[text]}];
}
function page(title,body,cls=''){
 return '<section class="page '+cls+'"><div class="kicker">POWER & GLAM / ÉDITIONS</div><h2>'+esc(title)+'</h2>'+body+'</section>';
}
function init(){
 const guide=document.getElementById('eloah-result-guide'),log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('pg-magazine-export'))return;
 const b=document.createElement('button');b.type='button';b.id='pg-magazine-export';b.textContent='Édition magazine Power & Glam';
 guide.querySelector('.eloah-result-buttons')?.append(b);
 const info=document.createElement('p');info.id='pg-magazine-status';info.setAttribute('role','status');guide.append(info);
 const answer=()=>[...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||'';
 function active(){b.disabled=!answer()||document.getElementById('home-ai-project')?.value!=='Power & Glam'}
 new MutationObserver(active).observe(log,{childList:true,subtree:true});
 document.getElementById('home-ai-project')?.addEventListener('change',active);active();
 b.addEventListener('click',async()=>{
  const text=answer();if(!text)return;
  b.disabled=true;info.textContent='Composition de ton édition…';
  try{
   const title=document.getElementById('eloah-cover-title')?.value.trim()||document.getElementById('ef-subject')?.value.trim()||'Édition spéciale';
   const files=[...document.getElementById('eloah-media-input')?.files||[]].filter(x=>['image/jpeg','image/png','image/webp'].includes(x.type)&&x.size<=4*1024*1024).slice(0,3);
   const photos=await Promise.all(files.map(fileData));
   const cover=window.EloahCoverAsset?.universe==='Power & Glam'?await fileData(window.EloahCoverAsset.blob):null;
   const images=photos.map((src,i)=>'<figure class="image"><img src="'+src+'" alt="Photographie éditoriale fournie '+(i+1)+'"><figcaption>Photographie fournie · '+esc(files[i].name)+'</figcaption></figure>');
   const articles=sections(text);
   let documentPages='';
   articles.forEach((part,i)=>{
    const blocks=part.body.flatMap(v=>v.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ÿ])/).reduce((a,t)=>{if(!a.length||a[a.length-1].length+t.length>550)a.push(t);else a[a.length-1]+=' '+t;return a},[])).filter(Boolean);
    const chunks=[];let current=[],size=0;
    for(const block of blocks){if(size+block.length>1700&&current.length){chunks.push(current);current=[];size=0}current.push(block);size+=block.length}
    if(current.length)chunks.push(current);
    if(!chunks.length)chunks.push(['']);
    chunks.forEach((chunk,j)=>{
      const body=chunk.map(x=>'<p>'+esc(x)+'</p>').join('');
      const figure=j===0&&images[i]?'<div class="inline-photo">'+images[i]+'</div>':'';
      if(i===0&&j===0&&images[0])documentPages+=page(part.heading||'Ouverture',figure+'<div class="editorial-lead">'+body+'</div>','opening-page');
      else documentPages+=page(j===0?(part.heading||'Chapitre '+(i+1)):(part.heading||'Suite')+' · suite',body+(figure&&!images[0]?'':figure),'article-page');
    });
    const quote=(part.body.join(' ').match(/[^.!?]{30,180}[.!?]/)||[])[0];
    if(quote&&i===0)documentPages+=page('À retenir','<blockquote>'+esc(quote.trim())+'</blockquote>','quote-page');
   });
   if(images.length>1)documentPages+=page('Regards',images.slice(1).join(''),'portfolio');
   const css='blockquote{font:italic 38px/1.35 Georgia,serif;color:#A63D57;margin:24mm 0;border-left:5px solid #D32027;padding-left:12mm}.quote-page{display:flex;flex-direction:column;justify-content:center}.opening-page .inline-photo .image img{max-height:95mm;object-fit:cover}.editorial-lead p:first-child:first-letter{float:left;font:76px/.8 Georgia,serif;color:#D32027;padding:7px 12px 0 0}.article-page p{break-inside:avoid}.article-page{break-inside:avoid}@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#dedbd5;color:#111;font:16px/1.68 Georgia,serif}.page{width:210mm;min-height:297mm;margin:14px auto;padding:23mm 21mm;background:#F4EFE7;break-after:page;overflow-wrap:anywhere;box-shadow:0 8px 28px #0002}.kicker{font:600 10px/1.5 Arial,sans-serif;letter-spacing:.28em;color:#D32027;border-bottom:1px solid #D32027;padding-bottom:12px;margin-bottom:28px}h1{font:400 68px/1.05 Georgia,serif;margin:15mm 0 9mm}h2{font:400 43px/1.12 Georgia,serif;margin:10mm 0 13mm}p{margin:0 0 1em;orphans:3;widows:3}.cover{display:flex;flex-direction:column;justify-content:space-between}.cover p{font:15px/1.5 Arial;letter-spacing:.15em}.cover-image{width:100%;max-height:215mm;object-fit:contain}.accent{width:90px;height:5px;background:#D32027}.image{break-inside:avoid;margin:12mm 0}.image img{width:100%;height:auto;max-height:170mm;object-fit:contain}.image figcaption{font:11px/1.5 Arial;color:#655a5d;margin-top:7px}.inline-photo{margin-top:12mm}.portfolio{display:block}.colophon{font:12px/1.7 Arial}.printhelp{padding:15px;text-align:center;font:13px Arial}@media print{body{background:white}.page{margin:0;box-shadow:none;break-after:page}.printhelp{display:none}}@media screen and (max-width:850px){.page{width:100%;min-height:0;padding:28px 24px}.cover{min-height:85vh}h1{font-size:clamp(44px,9vw,68px)}h2{font-size:clamp(30px,7vw,43px)}}';
   const coverBody=cover?'<img class="cover-image" src="'+cover+'" alt="Couverture ELOAH créée par Sonia">':'<div><div class="accent"></div><h1>'+esc(title)+'</h1><p>UNE ÉDITION POWER & GLAM</p></div>';
   const final='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+css+'</style></head><body><div class="printhelp">Pour exporter en PDF : Ctrl/Cmd + P → Enregistrer au format PDF, format A4, marges aucune, arrière-plans activés.</div><section class="page cover"><div class="kicker">POWER & GLAM · MAGAZINE</div>'+coverBody+'<p>ÉDITION DE TRAVAIL · '+esc(new Date().toLocaleDateString('fr-FR'))+'</p></section>'+documentPages+page('Notes de production','<p class="colophon">Édition de travail à relire et vérifier. Les photographies éventuellement présentes ont été fournies manuellement. Aucune image n’a été générée ni aucun contenu publié automatiquement.</p>','colophon')+'</body></html>';
   const url=URL.createObjectURL(new Blob([final],{type:'text/html;charset=utf-8'})),link=document.createElement('a');
   link.href=url;link.download='power-glam-edition-magazine.html';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
   info.textContent='Édition créée. Ouvre le fichier HTML pour vérifier la pagination avant de l’enregistrer en PDF.';
  }catch(e){info.textContent='Impossible de composer l’édition : '+(e.message||'erreur inconnue')}
  finally{active()}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();