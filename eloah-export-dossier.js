/* ELOAH : exporter le dernier résultat comme document HTML lisible et texte Markdown. */
(()=>{
'use strict';
function init(){
 const guide=document.getElementById('eloah-result-guide'),log=document.getElementById('home-ai-log');
 if(!guide||!log||document.getElementById('eloah-export-document'))return;
 const media=document.createElement('div');media.id='eloah-media-assets';
 media.innerHTML='<label for="eloah-media-input">Photographies à intégrer au dossier (3 maximum, JPEG/PNG/WebP, 4 Mo par image)</label><input id="eloah-media-input" type="file" accept="image/jpeg,image/png,image/webp" multiple><p id="eloah-media-status" role="status">Aucune image sélectionnée. Elles restent dans ton navigateur et sont incluses uniquement dans le HTML téléchargé.</p>';
 guide.querySelector('.eloah-result-buttons')?.before(media);
 const attachments=[];
 media.querySelector('input').addEventListener('change',async event=>{
  attachments.length=0;
  const files=[...event.target.files].slice(0,3);
  const valid=['image/jpeg','image/png','image/webp'];
  for(const f of files){
   if(!valid.includes(f.type)||f.size>4*1024*1024)continue;
   const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>resolve(null);reader.readAsDataURL(f)});
   if(data)attachments.push({name:f.name,data});
  }
  media.querySelector('#eloah-media-status').textContent=attachments.length+' image(s) intégrable(s). '+(files.length!==attachments.length?'Certains fichiers ont été refusés.':'');
 });
 const button=document.createElement('button');button.id='eloah-export-document';button.type='button';button.textContent='Télécharger mon dossier (HTML)';
 guide.querySelector('.eloah-result-buttons')?.append(button);
 function output(){return [...log.querySelectorAll('.hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||''}
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function update(){button.disabled=!output()}
 button.addEventListener('click',()=>{
  const answer=output();if(!answer)return;
  const project=document.getElementById('home-ai-project')?.value||'ELOAH';
  const date=new Date().toLocaleDateString('fr-FR');
  const evidence=window.EloahEvidence?.audit?.(answer);
  const refs=evidence?.sources||[];
  const sourcesMarkup='<section class="sources"><h2>Sources et vérifications</h2><p>Ces références sont des extraits réellement transmis au moteur, et non des preuves indépendantes. Un identifiant cité ne garantit pas la véracité de la phrase.</p>'
    +(refs.length?'<ol>'+refs.map(ref=>'<li><strong>['+escape(ref.id)+'] '+escape(ref.title)+'</strong><p>'+escape(ref.origin)+' · '+escape(ref.universe)+'</p><pre>'+escape(ref.excerpt)+'</pre></li>').join('')+'</ol>':'<p>Aucune référence consultée pour cette réponse.</p>')
    +(evidence?.warnings?.length?'<h3>Points à vérifier</h3><ul>'+evidence.warnings.map(w=>'<li>'+escape(w)+'</li>').join('')+'</ul>':'<p>Aucune anomalie formelle détectée par ce contrôle automatique ; vérification factuelle toujours nécessaire.</p>')
    +'</section>';
  const imageMarkup=attachments.map((f,i)=>'<figure><img src="'+f.data+'" alt="Photographie fournie pour le dossier, image '+(i+1)+'"><figcaption>'+escape(f.name)+'</figcaption></figure>').join('');
  const content='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dossier ELOAH</title><style>body{font:16px/1.8 Georgia,serif;color:#272127;background:#f8f3eb;margin:0}.page{max-width:760px;margin:0 auto;padding:64px 30px}header{border-bottom:2px solid #9d7e76;margin-bottom:30px;padding-bottom:20px}h1{font-size:38px;font-weight:normal}h2{font-size:25px;font-weight:normal}h3{font-size:19px}.sources{border-top:1px solid #c5b6ac;padding-top:18px;margin-top:35px}.sources li{margin-bottom:18px;overflow-wrap:anywhere}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}figure{margin:24px 0}figure img{display:block;max-width:100%;height:auto;border-radius:6px}figcaption{font:12px/1.5 system-ui;color:#605460;margin-top:6px}small{color:#6a5b60}@media print{body{background:white}.page{padding:20px}}</style></head><body><article class="page"><header><small>ELOAH · '+escape(project)+' · '+escape(date)+'</small><h1>Mon dossier de création</h1></header><pre>'+escape(answer)+'</pre>'+imageMarkup+sourcesMarkup+'<footer><small>Document à relire avant diffusion. Images incluses uniquement si sélectionnées ; publication non effectuée.</small></footer></article></body></html>';
  const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='eloah-dossier-'+new Date().toISOString().slice(0,10)+'.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 });
 new MutationObserver(update).observe(log,{childList:true,subtree:true});update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();