/* ELOAH · Dossier complet en un clic : texte, traçabilité, mise en page et visuels réels.
   Pas de source externe inventée, pas de photographie générée ni de publication implicite. */
(()=>{
'use strict';
const encoder=new TextEncoder();
const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function archive(files){
 const pieces=[],central=[];let offset=0,size=0;
 for(const file of files){
  const name=encoder.encode(file.name),content=file.bytes,sum=crc32(content);
  if(content.length>0xffffffff||offset>0xffffffff)throw Error('Dossier trop volumineux pour cet export.');
  const header=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(sum),...u32(content.length),...u32(content.length),...u16(name.length),...u16(0)]);
  pieces.push(header,name,content);
  const record=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u32(sum),...u32(content.length),...u32(content.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
  central.push(record,name);offset+=header.length+name.length+content.length;size+=record.length+name.length;
 }
 if(files.length>65535)throw Error('Trop de fichiers.');
 const end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(size),...u32(offset),...u16(0)]);
 return new Blob([...pieces,...central,end],{type:'application/zip'});
}
const txt=(name,value)=>({name,bytes:encoder.encode(String(value))});
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileDate=()=>new Date().toISOString().slice(0,10);
function titleOf(text,subject){
 const match=String(text).match(/^\s*#{1,3}\s+(.+)$/m);
 return (match?.[1]||subject||String(text).split('\n').find(x=>x.trim())||'Création ELOAH').replace(/[*#]/g,'').trim().slice(0,130);
}
function colorOf(universe){
 return window.EloahCarouselProduction?.theme?.(universe)||{name:'ELOAH',bg:'#F4EFE7',ink:'#242923',accent:'#587267',tag:'STUDIO'};
}
function renderText(text){
 return String(text).replace(/\r/g,'').split('\n').map(line=>{
  const t=line.trim();
  if(!t)return '<div class="space"></div>';
  const h=t.match(/^(#{1,3})\s+(.+)$/);
  if(h)return '<h'+Math.min(3,h[1].length)+'>'+safe(h[2])+'</h'+Math.min(3,h[1].length)+'>';
  if(/^(?:[-*•]\s+|\d+[.)]\s+)/.test(t))return '<p class="point">'+safe(t)+'</p>';
  return '<p>'+safe(t)+'</p>';
 }).join('\n');
}
function wrap(ctx,text,maxWidth,maxLines){
 const words=String(text).split(/\s+/),lines=[];let current='';
 for(const word of words){const attempt=current?current+' '+word:word;if(ctx.measureText(attempt).width>maxWidth&&current){lines.push(current);current=word}else current=attempt;}
 if(current)lines.push(current);return lines.slice(0,maxLines);
}
async function makeCover(text,universe,subject,origin){
 const colors=colorOf(universe);
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas indisponible pour la couverture.');
 ctx.fillStyle=colors.bg;ctx.fillRect(0,0,1200,1500);
 ctx.fillStyle=colors.accent;ctx.fillRect(86,97,120,10);ctx.fillRect(86,1310,1025,4);
 ctx.fillStyle=colors.ink;ctx.textAlign='left';
 ctx.font='bold 38px Georgia, serif';ctx.fillText(colors.name||universe,86,190);
 ctx.font='25px Arial, sans-serif';ctx.fillText('DOSSIER DE CRÉATION · '+fileDate(),86,254);
 const title=titleOf(text,subject);let font=85,lines=[];
 while(font>=48){ctx.font='bold '+font+'px Georgia, serif';lines=wrap(ctx,title,1005,6);if(ctx.measureText(title).width<1005||lines.length<=4)break;font-=4}
 ctx.font='bold '+font+'px Georgia, serif';
 lines.forEach((line,i)=>ctx.fillText(line,86,455+i*(font*1.3)));
 ctx.font='26px Arial, sans-serif';ctx.fillText(origin==='import'?'TEXTE FOURNI · NON VÉRIFIÉ':'PRODUCTION ELOAH · À VALIDER',86,1370);
 ctx.font='23px Arial, sans-serif';ctx.fillText('Photographie IA : aucune · Publication : aucune',86,1420);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
 if(!blob?.size)throw Error('Impossible de créer la couverture PNG.');
 return {name:'images/couverture.png',bytes:new Uint8Array(await blob.arrayBuffer())};
}
function makeHtml(text,universe,subject,sources,manifest,photoNames,slideNames){
 const colors=colorOf(universe);
 const sourceItems=sources.map(s=>'<li><strong>['+safe(s.id)+'] '+safe(s.title)+'</strong><div>'+safe(s.origin)+' · '+safe(s.universe)+'</div><pre>'+safe(s.excerpt)+'</pre></li>').join('');
 const figures=photoNames.map((name,i)=>'<figure><img src="'+safe(name)+'" alt="Photographie fournie '+(i+1)+'"><figcaption>Photographie fournie · droits à vérifier</figcaption></figure>').join('');
 const slides=slideNames.map((name,i)=>'<figure><img src="'+safe(name)+'" alt="Slide '+(i+1)+'"><figcaption>Visuel graphique '+(i+1)+' / 10 · sans photographie IA</figcaption></figure>').join('');
 const css='*{box-sizing:border-box}body{margin:0;background:'+colors.bg+';color:'+colors.ink+';font:17px/1.65 Georgia,serif}article{max-width:970px;margin:auto;background:#fffefb;color:#252525;min-height:100vh;padding:clamp(22px,6vw,75px)}header{border-bottom:3px solid '+colors.accent+';padding-bottom:24px;margin-bottom:36px}header small,.eyebrow,footer{font:13px/1.6 Arial,sans-serif;letter-spacing:.06em}h1{font:normal clamp(30px,5vw,55px)/1.15 Georgia,serif;margin:14px 0}h2{font-size:29px;margin:35px 0 12px}h3{font-size:22px;margin:26px 0 10px}p{margin:9px 0;overflow-wrap:anywhere}.space{height:10px}.point{padding-left:18px}.cover{width:100%;max-width:400px;height:auto;display:block;margin:0 auto 35px}.photos,.slides{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px}figure{margin:0 0 17px;break-inside:avoid}figure img{width:100%;height:auto;display:block}figcaption{font:12px/1.5 Arial,sans-serif;margin:6px 0}li{margin:12px 0;overflow-wrap:anywhere}pre{white-space:pre-wrap;word-break:break-word;font:13px/1.6 Arial,sans-serif}footer{border-top:1px solid #bbb;margin-top:50px;padding-top:15px;color:#575757}.muted{color:#666}@media print{body{background:white}article{max-width:none;padding:13mm}.cover{max-height:80vh;page-break-after:always}h1,h2,h3,figure{break-after:avoid}.no-print{display:none!important}}';
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+safe(titleOf(text,subject))+' · ELOAH</title><style>'+css+'</style></head><body><article><p class="no-print muted">Document local : ouvre ce fichier dans ton navigateur pour le lire ou l’imprimer en PDF.</p><img class="cover" src="images/couverture.png" alt="Couverture graphique du dossier"><header><small>'+safe(universe)+' · '+fileDate()+'</small><h1>'+safe(titleOf(text,subject))+'</h1><p>'+safe(manifest.origin==='import'?'Texte importé manuellement':'Texte produit par le moteur ELOAH')+' · à relire et vérifier</p></header><section aria-label="Texte du dossier">'+renderText(text)+'</section>'+(slideNames.length?'<section><h2>Les 10 visuels</h2><div class="slides">'+slides+'</div></section>':'')+(photoNames.length?'<section><h2>Photographies fournies</h2><div class="photos">'+figures+'</div></section>':'')+'<section><h2>Sources et limites</h2><p>Les références ci-dessous sont des extraits internes transmis à ELOAH, non des vérifications indépendantes.</p>'+(sourceItems?'<ol>'+sourceItems+'</ol>':'<p>Aucune source justificative identifiée pour ce résultat.</p>')+'<p>Statut : faits non vérifiés automatiquement, aucune publication effectuée.</p></section><footer>Ce document est une préparation éditoriale. Vérifie les affirmations et les droits des images avant diffusion.</footer></article></body></html>';
}
function init(){
 const guide=document.getElementById('eloah-result-guide');
 const log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('eloah-final-package'))return;
 const button=document.createElement('button');
 button.type='button';button.id='eloah-final-package';button.textContent='Créer et télécharger mon dossier complet (ZIP)';
 guide.querySelector('.eloah-result-buttons')?.append(button);
 const status=document.createElement('p');status.id='eloah-final-package-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const fallback=document.createElement('a');fallback.id='eloah-final-package-link';fallback.hidden=true;fallback.download='eloah-dossier-complet.zip';
 fallback.textContent='Téléchargement bloqué ? Ouvrir mon fichier ZIP ici';
 guide.append(status,fallback);
 let activeURL=null,working=false,generation=0;
 const latest=()=>[...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()||null;
 const update=()=>{button.disabled=working||!latest()?.querySelector('p')?.textContent?.trim()};
 const clearDownload=()=>{generation++;fallback.hidden=true;fallback.removeAttribute('href');if(activeURL){URL.revokeObjectURL(activeURL);activeURL=null}status.textContent='';update()};
 new MutationObserver(clearDownload).observe(log,{childList:true,subtree:true});update();
 button.addEventListener('click',async()=>{
  const article=latest(),result=article?.querySelector('p')?.textContent?.trim()||'';
  if(!result||working)return;
  working=true;update();status.textContent='ELOAH assemble ton dossier et crée les visuels…';
  const job=generation;
  try{
   const universe=document.getElementById('home-ai-project')?.value||'ELOAH';
   const subject=document.getElementById('ef-subject')?.value?.trim()||'';
   const origin=article.dataset.eloahImport==='true'?'import':'moteur IA';
   const evidence=origin==='import'?null:window.EloahEvidence?.audit?.(result)||null;
   const sources=(evidence?.sources||[]).map(s=>({id:s.id,title:s.title,origin:s.origin,universe:s.universe,excerpt:s.excerpt}));
   const check={sources_available:sources.length,source_ids_cited:evidence?.cited||[],source_ids_unknown:evidence?.unknown||[],uncited_statements:evidence?.uncited||[],warnings:evidence?.warnings||[],independent_fact_check:false};
   const files=[txt('01-CONTENU.md',result)];
   const photos=[...document.getElementById('eloah-media-input')?.files||[]].slice(0,3);
   const photoNames=[],accepted=['image/jpeg','image/png','image/webp'];
   for(const file of photos){
    if(!accepted.includes(file.type)||file.size>4*1024*1024)continue;
    const extension=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
    const name='images/photo-'+(photoNames.length+1)+'.'+extension;
    files.push({name,bytes:new Uint8Array(await file.arrayBuffer())});photoNames.push(name);
   }
   if(job!==generation){status.textContent='Le contenu a changé pendant la préparation. Relance l’export.';return}
   files.push(await makeCover(result,universe,subject,origin));
   const visual=window.EloahCarouselProduction;
   let slideNames=[],visualNotes=[];
   const parsed=visual?.parse?.(result);
   const isCarousel=Boolean(parsed&&parsed.detected>=1);
   if(isCarousel){
    if(parsed.detected===10&&!visual.issue(parsed).length){
     const rendered=await visual.makePNGSet(result,universe,{concept:/Nature du contenu\s*:\s*proposition créative/i.test(result)});
     if(rendered.ok){for(const png of rendered.images){const name='images/'+png.name;files.push({name,bytes:png.bytes});slideNames.push(name)}}
     else visualNotes=rendered.issues;
    }else visualNotes=['Carrousel non complet : '+(parsed.detected||0)+'/10 slides détectées. Visuels non créés.',...(visual.issue(parsed)||[]).slice(0,4)];
   }
   if(job!==generation){status.textContent='Le contenu a changé pendant la préparation. Relance l’export.';return}
   const manifest={version:2,created_at:new Date().toISOString(),universe,subject:titleOf(result,subject),origin,generated_images:slideNames.length,cover_generated:true,images_kind:'Composition graphique locale, sans photographie IA',provided_photos:photoNames.length,sources_count:sources.length,source_validation:'Non vérifiées indépendamment',visual_notes:visualNotes,source_claims_automatically_verified:false,complete:article.dataset.eloahComplete!=='false',published:false,remote_files_created:false};
   files.push(txt('02-SOURCES.json',JSON.stringify({nature:'Extraits internes, non vérifiés indépendamment',references:sources},null,2)));
   files.push(txt('03-CONTROLE.json',JSON.stringify(check,null,2)));
   files.push(txt('04-MANIFEST.json',JSON.stringify(manifest,null,2)));
   files.push(txt('LIRE-MOI.txt','ELOAH — DOSSIER PORTABLE\n\nindex.html : édition lisible et imprimable au format PDF depuis le navigateur.\n01-CONTENU.md : texte intégral.\n02-SOURCES.json : extraits consultés s’ils existent (PAS des preuves indépendantes).\n03-CONTROLE.json : points à examiner.\n04-MANIFEST.json : traçabilité des fichiers et des limites.\nimages/couverture.png : visuel graphique créé localement.\nimages/slide-01.png à slide-10.png : si 10 slides correctement rédigées.\nimages/photo-* : photos fournies manuellement, si présentes.\n\nAucune recherche externe, publication, création de photo IA ou certification factuelle implicite.\nLes exports PDF passent par Imprimer > Enregistrer en PDF dans index.html.'));
   files.push(txt('index.html',makeHtml(result,universe,subject,sources,manifest,photoNames,slideNames)));
   if(files.reduce((sum,f)=>sum+f.bytes.length,0)>55*1024*1024)throw Error('Dossier supérieur à 55 Mo. Réduis les photos importées.');
   const blob=archive(files);
   if(job!==generation)return;
   if(activeURL)URL.revokeObjectURL(activeURL);
   activeURL=URL.createObjectURL(blob);
   fallback.href=activeURL;fallback.hidden=false;
   fallback.download='eloah-dossier-'+fileDate()+'.zip';
   fallback.click();
   status.textContent='Dossier assemblé : '+files.length+' fichiers, couverture PNG'+(slideNames.length?', '+slideNames.length+' visuels de carrousel':'')+', '+photoNames.length+' photo(s) fournies, '+sources.length+' source(s) internes. Si le téléchargement ne démarre pas, utilise le lien juste dessous.'+(visualNotes.length?' '+visualNotes[0]:'');
  }catch(e){
   status.textContent='Impossible de terminer le dossier : '+String(e?.message||e);
  }finally{working=false;update()}
 });
 const style=document.createElement('style');
 style.textContent='#eloah-final-package-link:not([hidden]){display:inline-flex;align-items:center;padding:11px 14px;margin:8px 0;border-radius:8px;border:1px solid #9aaa9f;background:#eef4ec;color:#213b30;font:600 14px/1.5 system-ui;overflow-wrap:anywhere}#eloah-final-package-status{overflow-wrap:anywhere}';
 document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();