/* ELOAH — couverture PNG réalisée localement à partir du texte et d'une vraie photo. */
(() => {
'use strict';
const themes={
 'Power & Glam':{bg:'#F4EFE7',ink:'#111111',accent:'#D32027'},
 'The Crew Orchies':{bg:'#111111',ink:'#F4EFE7',accent:'#D6B46D'},
 'PARISIS ENGINE':{bg:'#ECE6D9',ink:'#25211D',accent:'#805F44'},
 'Sonia Velka':{bg:'#17131A',ink:'#F9EFE5',accent:'#C84C54'},
 'SONIA OS':{bg:'#F0F0F0',ink:'#172129',accent:'#4F7182'},
 'ELOAH':{bg:'#F4EFE7',ink:'#261D29',accent:'#9B6683'}
};
const getResult=()=>[...document.querySelectorAll('#home-ai-log .hai-message[data-author="eloah"]')].pop()?.querySelector('p')?.textContent?.trim()||'';
function wrap(ctx,str,maxWidth,maxLines){
 const words=String(str).split(/\s+/);let lines=[],line='';
 for(const word of words){const attempt=line?line+' '+word:word;if(ctx.measureText(attempt).width>maxWidth&&line){lines.push(line);line=word}else line=attempt}
 if(line)lines.push(line);
 return lines.slice(0,maxLines).map((v,i,a)=>i===a.length-1&&lines.length>maxLines?v.replace(/\s+\S*$/,'')+'…':v);
}
async function picture(file){
 if(!file)return null;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw Error('Choisis une image JPG, PNG ou WebP de moins de 8 Mo.');
 return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Image illisible.'))};img.src=url});
}
function render(ctx,canvas,photo,title,universe){
 const t=themes[universe]||themes.ELOAH,W=canvas.width,H=canvas.height;
 ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H);
 if(photo){const area={x:64,y:155,w:W-128,h:760};const ratio=Math.max(area.w/photo.width,area.h/photo.height);const w=photo.width*ratio,h=photo.height*ratio;ctx.save();ctx.beginPath();ctx.rect(area.x,area.y,area.w,area.h);ctx.clip();ctx.drawImage(photo,area.x+(area.w-w)/2,area.y+(area.h-h)/2,w,h);ctx.restore()}
 else{ctx.fillStyle=t.accent;ctx.globalAlpha=.12;ctx.fillRect(64,155,W-128,760);ctx.globalAlpha=1}
 ctx.fillStyle=t.accent;ctx.fillRect(64,69,110,7);
 ctx.fillStyle=t.ink;ctx.font='600 31px Arial,sans-serif';ctx.fillText(universe.toUpperCase(),64,122);
 ctx.fillStyle=t.bg;ctx.fillRect(45,800,W-90,380);
 ctx.fillStyle=t.ink;ctx.font='bold 66px Georgia,serif';
 const lines=wrap(ctx,title,950,4);
 lines.forEach((line,i)=>ctx.fillText(line,75,900+i*78));
 ctx.fillStyle=t.accent;ctx.fillRect(75,1202,95,7);
 ctx.fillStyle=t.ink;ctx.font='26px Arial,sans-serif';ctx.fillText('ELOAH · ÉDITION DE TRAVAIL',75,1260);
}
function init(){
 const guide=document.getElementById('eloah-result-guide');if(!guide||document.getElementById('eloah-cover-maker'))return;
 const panel=document.createElement('section');panel.id='eloah-cover-maker';
 panel.innerHTML='<h3>Créer ma couverture</h3><p>Une vraie image PNG produite sur ton appareil, à partir du titre et d’une photographie de ton choix.</p><label>Titre de couverture<input id="eloah-cover-title" maxlength="180" placeholder="Titre du dossier"></label><label>Ma photographie (facultative)<input id="eloah-cover-photo" type="file" accept="image/jpeg,image/png,image/webp"></label><button id="eloah-cover-export" type="button">Créer et télécharger la couverture PNG</button><p id="eloah-cover-status" role="status"></p>';
 guide.after(panel);
 const style=document.createElement('style');style.textContent='#eloah-cover-maker{max-width:1160px;padding:20px;margin:15px auto;background:#f8f2e9;color:#2a2028;border:1px solid #dacbce;border-radius:14px}#eloah-cover-maker h3{font:400 25px Georgia,serif;margin:0 0 10px}#eloah-cover-maker label{display:grid;gap:7px;margin:12px 0}#eloah-cover-maker input{background:#fff;color:#272027;border:1px solid #b8aab2;border-radius:8px;padding:11px;width:100%;box-sizing:border-box;font:16px Arial}#eloah-cover-maker button{min-height:44px;padding:10px 16px;background:#291f2b;color:#fff;border:0;border-radius:8px;cursor:pointer}';
 document.head.append(style);
 panel.querySelector('#eloah-cover-export').addEventListener('click',async()=>{
  const status=panel.querySelector('#eloah-cover-status');const title=panel.querySelector('#eloah-cover-title').value.trim()||document.getElementById('ef-subject')?.value.trim()||getResult().split('\n')[0]?.slice(0,140);
  if(!title){status.textContent='Saisis un titre ou génère un dossier.';return}
  try{
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Dessin indisponible.');
   const photo=await picture(panel.querySelector('#eloah-cover-photo').files[0]);
   render(ctx,canvas,photo,title,document.getElementById('home-ai-project')?.value||'ELOAH');
   const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));if(!blob)throw Error('Export impossible.');
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eloah-couverture.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
   status.textContent='Couverture PNG produite sur cet appareil. Vérifie le cadrage et le titre.';
  }catch(e){status.textContent=e.message}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();