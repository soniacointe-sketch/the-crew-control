/* ELOAH - Atelier carrousel : dix PNG réellement composés dans le navigateur.
   Pas de génération photographique IA, de recherche implicite, ni de publication automatique. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const THEMES={
 'Power & Glam':{name:'POWER & GLAM',bg:'#F4EFE7',ink:'#111111',accent:'#D32027',soft:'#DECCC5',tag:'ÉDITION'},
 'The Crew Orchies':{name:'THE CREW',bg:'#151515',ink:'#F8F1DF',accent:'#D2AB5F',soft:'#3C3428',tag:'ENSEMBLE'},
 'Sonia Velka':{name:'SONIA VELKA',bg:'#191919',ink:'#FFFFFF',accent:'#CD3539',soft:'#393031',tag:'LIBERTÉ'},
 'PARISIS ENGINE':{name:'PARISIS ENGINE',bg:'#E8DFD0',ink:'#211F1B',accent:'#85623A',soft:'#C4AD90',tag:'RECHERCHE'},
 'Le Lion Blanc':{name:'LE LION BLANC',bg:'#F2EFE8',ink:'#262620',accent:'#B39A68',soft:'#D8CEBA',tag:'COLLECTIF'},
 'SONIA OS':{name:'SONIA OS',bg:'#171D29',ink:'#F2F4F5',accent:'#87A2BD',soft:'#364354',tag:'PILOTAGE'},
 'ELOAH':{name:'ELOAH',bg:'#F5F2EB',ink:'#242923',accent:'#587267',soft:'#D3DED3',tag:'STUDIO'}
};
const LAYOUT_RULES={
 'Power & Glam':'Fond crème #F4EFE7, noir #111111, rouge #D32027. Écriture adulte, éditoriale, élégante et documentée. Refuse les clichés du luxe et les slogans empilés.',
 'The Crew Orchies':'Univers noir et or, convivial, danse accessible, tous niveaux. Ne parle pas de cours de Zumba comme activité officielle de The Crew sans preuve.',
 'Sonia Velka':'Voix directe, drôle, parfois mordante et rock. Aucun événement biographique inventé. Évite de simuler une photographie personnelle.',
 'PARISIS ENGINE':'Ton de recherche. Distingue texte original, source documentaire, interprétation, conjecture et objection ; aucune certitude fabriquée.',
 'Le Lion Blanc':'Voix citoyenne, claire, digne, concrète. Les actions et partenaires doivent être établis, non imaginés.',
 'SONIA OS':'Sépare fonctions opérationnelles, prototypes, projets et intégrations non vérifiées.',
 'ELOAH':'Assistante de création en construction : distingue les capacités effectivement testées des nouvelles fonctionnalités seulement proposées.'
};
const encoder=new TextEncoder(), txt=(name,value)=>({name,bytes:encoder.encode(value)});
const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function zip(files){
 const parts=[],central=[];let offset=0,size=0;
 for(const f of files){
  const name=encoder.encode(f.name),data=f.bytes,sum=crc32(data);
  const local=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(sum),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0)]);
  parts.push(local,name,data);
  const entry=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x800),...u16(0),...u16(0),...u16(0),...u32(sum),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
  central.push(entry,name);offset+=local.length+name.length+data.length;size+=entry.length+name.length;
 }
 return new Blob([...parts,...central,Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(size),...u32(offset),...u16(0)])],{type:'application/zip'});
}
const clean=s=>String(s||'').replace(/\r/g,'').trim();
function parse(answer){
 const value=String(answer||'').replace(/\r/g,'');
 const headings=[...value.matchAll(/^\s*(?:#{1,4}\s*)?(?:slide|diapositive)\s*0?([1-9]|10)\s*(?:[.:—–-]\s*(.*))?$/gim)];
 const slides=Array.from({length:10},(_,i)=>({number:i+1,title:'',body:'',cta:''}));
 function pick(txt,key){
  const hit=txt.match(new RegExp('^\\s*(?:[-*]\\s*)?(?:\\*\\*)?(?:'+key+')(?:\\*\\*)?\\s*[:：]\\s*(.+)$','im'));
  return clean(hit?.[1]||'').replace(/\*\*/g,'');
 }
 headings.forEach((m,k)=>{
  const i=Number(m[1])-1;if(i<0||i>=10)return;
  const end=headings[k+1]?.index??value.length;
  const chunk=value.slice(m.index+m[0].length,end);
  const title=pick(chunk,'titre|title')||clean(m[2]);
  const body=pick(chunk,'texte|text|message')||clean(chunk.split('\n').filter(x=>x.trim()&&!/^\s*(?:titre|direction|visuel|image|légende|cta|appel à action|source)\s*[:：]/i.test(x)).slice(0,3).join(' '));
  const cta=pick(chunk,'cta|appel à action');
  slides[i]={number:i+1,title:title.slice(0,100),body:body.slice(0,340),cta:cta.slice(0,100)};
 });
 const final=value.match(/^\s*(?:#{1,4}\s*)?(?:légende\s+finale|légende\s+du\s+carrousel|caption\s+finale)\s*[:：]\s*([\s\S]*)$/im);
 return {slides,caption:clean(final?.[1]||'').slice(0,1800),detected:headings.length};
}
const issue=({slides,caption})=>{
 const errors=[];
 slides.forEach((s,i)=>{if(s.title.trim().length<3||s.body.trim().length<12)errors.push('Slide '+(i+1)+' : titre ou texte incomplet.')});
 if(caption.trim().length<20)errors.push('La légende finale manque ou est trop courte.');
 return errors;
};
function paths(ctx){
 let lines=[];const width=ctx.canvas.width;
 ctx.lineWidth=3;ctx.strokeStyle=ctx.__accent;ctx.globalAlpha=.75;
 for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(i%2?width*0.9:width*.12,135+i*195,100+i*105,0,Math.PI*1.4);ctx.stroke()}
 ctx.globalAlpha=1;
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function wrap(ctx,text,maxWidth){
 const words=clean(text).split(/\s+/),lines=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word}else line=next}
 if(line)lines.push(line);
 return lines;
}
function fitText(ctx,text,maxWidth,maxLines,start,min,weight,font){
 let size=start,lines=[];
 do{ctx.font=weight+' '+size+'px '+font;lines=wrap(ctx,text,maxWidth);if(lines.length<=maxLines)break;size-=2}while(size>=min);
 return {size,lines};
}
function draw(canvas,slide,index,theme,photo,concept){
 const ctx=canvas.getContext('2d',{alpha:false});
 canvas.width=1080;canvas.height=1350;
 const white=theme.bg=== '#151515'||theme.bg==='#191919'||theme.bg==='#171D29';
 const textColor=photo?'#FFFFFF':theme.ink;
 ctx.fillStyle=theme.bg;ctx.fillRect(0,0,1080,1350);
 if(photo){
  const ratio=Math.max(1080/photo.width,1350/photo.height);
  const w=photo.width*ratio,h=photo.height*ratio;ctx.drawImage(photo,(1080-w)/2,(1350-h)/2,w,h);
  let fade=ctx.createLinearGradient(0,0,0,1350);fade.addColorStop(0,'rgba(0,0,0,.7)');fade.addColorStop(.42,'rgba(0,0,0,.42)');fade.addColorStop(1,'rgba(0,0,0,.88)');
  ctx.fillStyle=fade;ctx.fillRect(0,0,1080,1350);
 }else{
  ctx.__accent=theme.accent;paths(ctx);
  ctx.fillStyle=theme.soft;ctx.globalAlpha=.4;
  if(index%3===0)ctx.fillRect(690,0,390,310);
  else if(index%3===1){ctx.beginPath();ctx.arc(990,870,310,0,Math.PI*2);ctx.fill()}
  else ctx.fillRect(0,810,245,540);
  ctx.globalAlpha=1;
 }
 ctx.fillStyle=theme.accent;ctx.fillRect(78,76,82,9);
 ctx.fillStyle=textColor;ctx.textAlign='left';ctx.font='bold 30px Arial, sans-serif';ctx.fillText(theme.name,78,143);
 ctx.font='25px Arial, sans-serif';ctx.globalAlpha=.84;ctx.fillText(theme.tag,78,187);ctx.globalAlpha=1;
 ctx.textAlign='right';ctx.font='bold 29px Arial, sans-serif';ctx.fillText(String(index+1).padStart(2,'0')+' / 10',1004,140);
 ctx.textAlign='left';ctx.fillStyle=textColor;
 const pos=index%3===1?430:330,maxW=895;
 const heading=fitText(ctx,slide.title,maxW,4,91,50,'bold','Georgia, serif');
 ctx.font='bold '+heading.size+'px Georgia, serif';
 let y=pos;
 for(const line of heading.lines){ctx.fillText(line,78,y);y+=heading.size*1.14}
 y+=44;
 const body=fitText(ctx,slide.body,maxW,9,49,32,'normal','Arial, sans-serif');
 ctx.font=body.size+'px Arial, sans-serif';let by=y;
 for(const line of body.lines){ctx.fillText(line,78,by);by+=body.size*1.47}
 if(by>1155)throw Error('Texte de la slide '+(index+1)+' trop long pour un rendu lisible : raccourcis-le.');
 const footerY=1240;
 ctx.fillStyle=photo?'#FFFFFF':theme.accent;ctx.fillRect(78,footerY-38,924,2);
 ctx.fillStyle=textColor;ctx.font='bold 24px Arial, sans-serif';ctx.fillText(slide.cta||'À RETROUVER DANS LA LÉGENDE',78,footerY+13);
 if(concept){ctx.textAlign='right';ctx.font='22px Arial, sans-serif';ctx.fillText('CONCEPT · PROPOSITION',1004,1302)}
}
function init(){
 const studio=$('eloah-factory'),log=$('home-ai-log');if(!studio||!log||$('eloah-carousel-production'))return;
 const root=document.createElement('section');root.id='eloah-carousel-production';root.hidden=true;
 root.innerHTML='<h3>Mon carrousel · 10 vrais visuels</h3>'
  +'<p id="ecp-mode">Chaque slide sera composée en PNG 1080 × 1350 dans ton navigateur. Sans photo importée, il s’agit de créations graphiques typographiques — pas de photographies générées par IA.</p>'
  +'<p id="ecp-notice" role="status" aria-live="polite"></p>'
  +'<div id="ecp-fields"></div>'
  +'<label for="ecp-caption">Légende finale prête à publier</label><textarea id="ecp-caption" rows="5" maxlength="1800" placeholder="Rédige la légende complète…" aria-label="Légende finale du carrousel"></textarea>'
  +'<label for="ecp-photos">Mes photographies (facultatif, 10 maximum, une par slide dans l’ordre, droits à vérifier)</label><input id="ecp-photos" type="file" accept="image/png,image/jpeg,image/webp" multiple>'
  +'<p id="ecp-photos-note">Aucune photographie sélectionnée.</p>'
  +'<button id="ecp-compose" type="button">Composer mes 10 PNG</button> <button id="ecp-download" type="button" disabled>Télécharger les 10 visuels + légende (ZIP)</button>'
  +'<div id="ecp-previews" class="ecp-previews" aria-label="Aperçu de mes dix visuels"></div>';
 const guide=$('eloah-result-guide');(guide||log).after(root);
 const fields=$('ecp-fields'),caption=$('ecp-caption'),button=$('ecp-compose'),download=$('ecp-download'),notice=$('ecp-notice'),photos=$('ecp-photos'),gallery=$('ecp-previews');
 let data=null,assets=[],urls=[],origin='',subject='',mode='',sources=[],files=[],generation=0;
 function revoke(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
 function invalidate(){generation++;assets=[];download.disabled=true;revoke();gallery.replaceChildren()}
 function snapshot(){return {slides:[...fields.querySelectorAll('[data-slide]')].map((el,i)=>({number:i+1,title:el.querySelector('[data-title]').value.trim(),body:el.querySelector('[data-body]').value.trim(),cta:el.querySelector('[data-cta]').value.trim()})),caption:caption.value.trim()}}
 function check(){const errors=issue(snapshot());notice.textContent=errors.length?errors.slice(0,6).join(' ')+' Complète les champs avant de composer.':'Les dix textes et la légende sont prêts. Tu peux composer les visuels PNG.';return errors}
 function renderFields(slides){
  fields.replaceChildren();
  slides.forEach((slide,i)=>{
   const el=document.createElement('article');el.className='ecp-field';el.dataset.slide=String(i+1);
   const title=document.createElement('h4');title.textContent='Slide '+String(i+1).padStart(2,'0');
   const a=document.createElement('label');a.textContent='Titre';const input=document.createElement('input');input.dataset.title='';input.maxLength=100;input.value=slide.title;
   const b=document.createElement('label');b.textContent='Texte définitif';const textarea=document.createElement('textarea');textarea.dataset.body='';textarea.rows=3;textarea.maxLength=340;textarea.value=slide.body;
   const c=document.createElement('label');c.textContent='Appel à action (facultatif)';const cta=document.createElement('input');cta.dataset.cta='';cta.maxLength=100;cta.value=slide.cta;
   a.append(input);b.append(textarea);c.append(cta);el.append(title,a,b,c);fields.append(el);
  });
  fields.addEventListener('input',()=>{invalidate();check()},{once:true});
 }
 function handleAnswer(e){
  const detail=e.detail||{},request=String(detail.question||'');
  if(!/MISSION DE PRODUCTION\s*[—-]\s*Carrousel/i.test(request)){root.hidden=true;invalidate();return}
  const parsed=parse(detail.answer||'');origin=detail.universe||$('home-ai-project')?.value||'ELOAH';
  subject=(request.match(/^SUJET\s*:\s*(.+)$/im)||[])[1]||'Carrousel';
  mode=/STATUT DU SUJET\s*:\s*CONCEPT À INVENTER/i.test(request)?'proposition':'documentaire';
  sources=window.EloahEvidence?.sources?.()||[];
  data=parsed;root.hidden=false;invalidate();caption.value=parsed.caption;renderFields(parsed.slides);
  check();notice.textContent='Texte reçu : '+parsed.detected+'/10 slides reconnues. '+notice.textContent;
  root.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function image(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Photo impossible à décoder.'))};img.src=url})}
 async function compose(){
  const draft=snapshot(),errors=issue(draft);if(errors.length){check();return}
  invalidate();const token=generation;button.disabled=true;notice.textContent='Composition réelle des 10 images PNG en cours…';
  try{
   const theme=THEMES[origin]||THEMES.ELOAH,photosList=[...files];
   const pictures=[];
   for(let i=0;i<Math.min(10,photosList.length);i++)pictures.push(await image(photosList[i]));
   const generated=[];
   for(let i=0;i<10;i++){
    if(token!==generation)return;
    const canvas=document.createElement('canvas');
    draw(canvas,draft.slides[i],i,theme,pictures[i]||null,mode==='proposition');
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob||!blob.size)throw Error('Export PNG impossible pour la slide '+(i+1));
    generated.push({name:'slide-'+String(i+1).padStart(2,'0')+'.png',bytes:new Uint8Array(await blob.arrayBuffer()),blob,photo:!!pictures[i]});
   }
   if(token!==generation)return;
   assets=generated;
   for(const asset of assets){
    const url=URL.createObjectURL(asset.blob);urls.push(url);
    const figure=document.createElement('figure'),img=document.createElement('img'),cap=document.createElement('figcaption');
    img.src=url;img.alt='Visuel réellement composé '+asset.name;img.loading='lazy';cap.textContent=asset.name+(asset.photo?' · photographie fournie':' · création typographique');
    figure.append(img,cap);gallery.append(figure);
   }
   download.disabled=false;
   notice.textContent='10 PNG produits et prévisualisés. '+assets.filter(x=>x.photo).length+' photo(s) fournies. Relis les textes et les droits avant diffusion.';
  }catch(e){assets=[];notice.textContent='Composition non terminée : '+String(e.message||e);download.disabled=true}
  finally{button.disabled=false}
 }
 photos.addEventListener('change',()=>{invalidate();files=[...photos.files].slice(0,10).filter(f=>['image/jpeg','image/png','image/webp'].includes(f.type)&&f.size<=8*1024*1024);$('ecp-photos-note').textContent=files.length+' photo(s) acceptée(s), 8 Mo maximum chacune. Les autres fichiers éventuels ne seront pas utilisés.'});
 fields.addEventListener('input',()=>{invalidate();check()});
 caption.addEventListener('input',()=>{invalidate();check()});
 button.addEventListener('click',compose);
 download.addEventListener('click',()=>{
  if(assets.length!==10||issue(snapshot()).length){notice.textContent='Export impossible : il faut dix images composées et une légende complète.';return}
  const draft=snapshot(),rows=assets.map(a=>({name:'images/'+a.name,bytes:a.bytes}));
  rows.push(txt('legende.txt',draft.caption));
  rows.push(txt('slides.txt',draft.slides.map(x=>'SLIDE '+x.number+'\nTITRE : '+x.title+'\nTEXTE : '+x.body+'\nCTA : '+x.cta).join('\n\n')));
  rows.push(txt('sources.json',JSON.stringify({source_type:'Références internes, non vérifiées indépendamment',sources},null,2)));
  rows.push(txt('manifest.json',JSON.stringify({universe:origin,subject,kind:'carrousel',images:assets.length,image_type:assets.map(a=>a.photo?'Photo fournie et mise en page':'Graphisme typographique'),fact_check:'Non effectué automatiquement',intent:mode,published:false,ai_photographs_generated:false},null,2)));
  const url=URL.createObjectURL(zip(rows)),a=document.createElement('a');a.href=url;a.download='eloah-carrousel-10-visuels.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  notice.textContent='Export ZIP demandé : 10 PNG, légende, textes, sources et manifeste. Aucune publication automatique.';
 });
 window.addEventListener('eloah:answer',handleAnswer);
 const css=document.createElement('style');
 css.textContent='#eloah-carousel-production{background:#F7F6F1;color:#242923;border:1px solid #cfd6cf;border-radius:14px;padding:18px;margin:20px 0;scroll-margin-top:24px}#eloah-carousel-production[hidden]{display:none!important}#eloah-carousel-production h3,#eloah-carousel-production h4{color:#242923;margin:8px 0}#eloah-carousel-production p{color:#445349;font:14px/1.6 system-ui}#eloah-carousel-production label{display:block;margin:9px 0;font:600 13px/1.5 system-ui}#eloah-carousel-production :is(input:not([type=file]),textarea){display:block;box-sizing:border-box;width:100%;font:16px/1.5 system-ui;padding:10px;margin-top:4px;border:1px solid #aebbae;border-radius:7px;background:#fff;color:#151515}#eloah-carousel-production .ecp-field{padding:14px;background:white;border:1px solid #d8ded8;border-radius:10px}#ecp-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,255px),1fr));gap:12px;margin:18px 0}#eloah-carousel-production button{min-height:46px;margin:7px;padding:11px 15px;border-radius:8px;border:1px solid #657a6a;background:#293d38;color:white;font:600 13px system-ui;cursor:pointer}#eloah-carousel-production button:disabled{opacity:.45;cursor:not-allowed}#eloah-carousel-production .ecp-previews{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:10px;margin-top:16px}#eloah-carousel-production figure{min-width:0;margin:0}#eloah-carousel-production figure img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:contain;background:#ddd;border-radius:7px}#eloah-carousel-production figcaption{font:12px/1.4 system-ui;margin:5px;color:#404d43}';
 document.head.append(css);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
// Service graphique partagé avec l'export complet : 10 PNG réels, sans téléchargement implicite.
async function makePNGSet(text,universe,opts={}){
 const parsed=parse(text),errors=issue(parsed);
 if(parsed.detected!==10)errors.unshift('Le texte ne contient pas dix slides distinctes reconnues.');
 if(errors.length)return {ok:false,issues:errors,detected:parsed.detected,images:[]};
 if(typeof document==='undefined')return {ok:false,issues:['Le rendu nécessite un navigateur.'],detected:10,images:[]};
 const theme=THEMES[universe]||THEMES.ELOAH;
 const images=[];
 for(let i=0;i<10;i++){
  const canvas=document.createElement('canvas');
  draw(canvas,parsed.slides[i],i,theme,null,opts.concept===true);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob||!blob.size)throw Error('Le visuel '+(i+1)+' n’a pas pu être créé.');
  images.push({name:'slide-'+String(i+1).padStart(2,'0')+'.png',bytes:new Uint8Array(await blob.arrayBuffer()),type:'graphisme-typographique'});
 }
 return {ok:true,issues:[],detected:10,images,caption:parsed.caption};
}
window.EloahCarouselProduction={parse,issue,makePNGSet,theme:universe=>THEMES[universe]||THEMES.ELOAH,identity:universe=>LAYOUT_RULES[universe]||LAYOUT_RULES.ELOAH};
})();