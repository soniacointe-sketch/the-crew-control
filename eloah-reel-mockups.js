(()=>{
'use strict';
const frames=window.ELOAHFrames;
if(!frames)return;
const colors=[
 ['Crème','#eee9df','#fffaf3','#c4a16d','#333c45'],
 ['Noir or','#252327','#3c3b42','#d3ac63','#e9e0d1'],
 ['Rose','#f5e4e7','#fff4f7','#c28ba1','#654756'],
 ['Bleu','#e0eff4','#f7fcff','#70a1bd','#31495c'],
 ['Vert sauge','#e5ece2','#f4faf4','#83aa90','#364d3e'],
 ['Blanc','#f0f2f5','#ffffff','#a4b3c4','#2b3849']
];
const specs=[
 ['Maquettes vidéo','video',['story','video-duo','cinema','stage','film','video-phone','video-three','wide-video']],
 ['Cadres','frame',['wall','wood','wall-double','wall-three','poster-frame','round-frame','arch-frame','desk-frame']],
 ['Smartphones','phone',['smartphone','hand-phone','phone-duo','phone-story','phone-dark','phone-light','phone-flat','phone-pair']],
 ['Impression','print',['poster','magazine','book','postcard','sheet','brochure','card-duo','notebook','flyer','packaging']],
 ['Vêtements','garment',['tshirt','hoodie','sweatshirt','tote','apron','cap','tshirt-flat','tee-and-poster']],
 ['Écrans & objets','device',['tablet','laptop','monitor','tv','watch','mug','monitor-duo','tablet-duo']]
];
const pretty={'story':'Reel vertical','video-duo':'Vidéo double','cinema':'Cinéma','stage':'Scène vidéo','film':'Bande film','video-phone':'Reel smartphone','video-three':'Vidéo triple','wide-video':'Vidéo panoramique','wall':'Cadre mural','wood':'Cadre bois','wall-double':'Deux cadres','wall-three':'Galerie murale','poster-frame':'Affiche encadrée','round-frame':'Cadre rond','arch-frame':'Cadre arche','desk-frame':'Cadre de bureau','smartphone':'Smartphone','hand-phone':'Téléphone en main','phone-duo':'Deux smartphones','phone-story':'Story téléphone','phone-dark':'Smartphone noir','phone-light':'Smartphone clair','phone-flat':'Téléphone à plat','phone-pair':'Duo mobile','poster':'Poster','magazine':'Magazine','book':'Livre','postcard':'Carte postale','sheet':'Feuille','brochure':'Brochure','card-duo':'Cartes de visite','notebook':'Carnet','flyer':'Flyer','packaging':'Emballage','tshirt':'T-shirt','hoodie':'Sweat à capuche','sweatshirt':'Sweat-shirt','tote':'Tote bag','apron':'Tablier','cap':'Casquette','tshirt-flat':'T-shirt à plat','tee-and-poster':'T-shirt et poster','tablet':'Tablette','laptop':'Ordinateur portable','monitor':'Écran PC','tv':'Télévision','watch':'Montre','mug':'Mug','monitor-duo':'Double écran','tablet-duo':'Deux tablettes'};
const R=(x,y,w,h,shape='round')=>({x,y,w,h,shape});
function slots(type,style){
 if(style==='video-duo'||style==='wall-double'||style==='phone-duo'||style==='phone-pair'||style==='card-duo'||style==='monitor-duo'||style==='tablet-duo')return [R(104,240,370,520),R(526,240,370,520)];
 if(style==='video-three'||style==='wall-three')return [R(61,250,276,510),R(362,250,276,510),R(663,250,276,510)];
 if(style==='film')return Array.from({length:4},(_,i)=>R(37+i*238,300,214,402,'rect'));
 if(type==='garment'){
  if(style==='tote')return [R(326,388,350,372,'rect')];
  if(style==='cap')return [R(362,445,276,160)];
  if(style==='hoodie'||style==='sweatshirt')return [R(349,424,302,320,'rect')];
  return [R(352,380,296,302,'rect')];
 }
 if(type==='phone'||style==='video-phone'||style==='story'||style==='phone-story')return [R(330,115,340,775)];
 if(type==='device'){
  if(style==='watch')return [R(359,330,282,335)];
  if(style==='mug')return [R(365,426,295,296)];
  return [R(140,255,720,445,'rect')];
 }
 if(style==='round-frame')return [R(245,220,510,510,'circle')];
 if(style==='arch-frame')return [R(241,150,518,690,'arch')];
 if(style==='postcard')return [R(144,312,712,385,'rect')];
 if(style==='cinema'||style==='stage'||style==='wide-video')return [R(108,288,784,442,'rect')];
 if(style==='magazine'||style==='book'||style==='notebook'||style==='poster'||style==='sheet'||style==='brochure'||style==='flyer'||style==='packaging'||style==='poster-frame'||style==='wall'||style==='wood'||style==='desk-frame')return [R(222,175,556,650,'rect')];
 return [R(170,235,660,530,'rect')];
}
function size(type,style){
 if(type==='phone'||type==='garment'||style==='story'||style==='video-phone')return {w:650,h:860};
 if(type==='print'||style==='round-frame'||style==='arch-frame')return {w:750,h:800};
 return {w:870,h:680};
}
const groups=specs.map(([name,type,names],gi)=>{
 const items=[];
 for(let si=0;si<names.length;si++)for(let v=0;v<3;v++){
  const style=names[si],p=colors[(gi+si*2+v)%colors.length];
  const id='eloah-mock-'+String(gi+1).padStart(2,'0')+'-'+String(si+1).padStart(2,'0')+'-'+(v+1);
  const obj={id,group:name,type,style,name:(pretty[style]||style)+' · '+p[0],
   palette:{name:p[0],bg:p[1],surface:p[2],accent:p[3],ink:p[4]},
   shape:'rect',layout:'mockup',chrome:'clean',accent:p[3],isMockup:true,
   customSlots:slots(type,style),customDims:size(type,style),defaultGap:0,
   video:type==='video'};
  items.push(obj);frames.byId.set(id,obj);
 }
 return {name,items};
});
const catalogue=groups.flatMap(g=>g.items),byId=new Map(catalogue.map(x=>[x.id,x])),cache=new Map();
function rounded(c,x,y,w,h,r,fill,outline=null,weight=0){
 c.beginPath();c.roundRect(x,y,w,h,r);
 if(fill){c.fillStyle=fill;c.fill()}
 if(outline&&weight){c.strokeStyle=outline;c.lineWidth=weight;c.stroke()}
}
function garment(c,item){
 const {style,palette:p}=item;
 c.save();c.shadowColor='#1c2b3f3c';c.shadowBlur=27;c.shadowOffsetY=11;
 c.beginPath();
 if(style==='tote'){c.moveTo(221,310);c.lineTo(779,310);c.lineTo(749,866);c.lineTo(250,866);c.closePath()}
 else if(style==='cap'){c.moveTo(200,575);c.bezierCurveTo(185,310,800,310,802,574);c.quadraticCurveTo(799,665,740,671);c.lineTo(260,671);c.quadraticCurveTo(193,658,200,575);c.closePath()}
 else if(style==='apron'){c.moveTo(370,173);c.lineTo(630,173);c.lineTo(718,392);c.lineTo(787,862);c.lineTo(212,862);c.lineTo(282,392);c.closePath()}
 else{c.moveTo(354,195);c.quadraticCurveTo(500,222,647,195);c.lineTo(743,214);c.lineTo(930,405);c.lineTo(812,537);c.lineTo(737,465);c.lineTo(765,858);c.lineTo(235,858);c.lineTo(260,465);c.lineTo(188,537);c.lineTo(70,405);c.lineTo(257,214);c.closePath()}
 c.fillStyle=p.surface;c.fill();c.shadowBlur=0;c.strokeStyle=p.accent;c.lineWidth=9;c.stroke();
 if(style==='tote'){c.lineWidth=28;c.strokeStyle=p.ink;c.beginPath();c.moveTo(350,328);c.bezierCurveTo(344,110,652,105,650,328);c.stroke()}
 if(style==='hoodie'){c.strokeStyle=p.accent;c.lineWidth=12;c.beginPath();c.ellipse(500,221,145,98,0,0,Math.PI*2);c.stroke()}
 if(style==='cap'){c.fillStyle=p.surface;c.beginPath();c.ellipse(500,658,315,65,0,0,Math.PI);c.fill()}
 c.restore();
}
function backdrop(c,item){
 const p=item.palette,g=c.createLinearGradient(0,0,850,1000);
 g.addColorStop(0,p.bg);g.addColorStop(1,p.surface);c.fillStyle=g;c.fillRect(0,0,1000,1000);
 c.fillStyle='#0000000b';c.beginPath();c.ellipse(500,905,330,48,0,0,Math.PI*2);c.fill();
 if(item.type==='garment'){garment(c,item);return}
 const S=item.customSlots;
 if(item.type==='phone'||item.style==='video-phone'||item.style==='story'){
  if(S.length===2){rounded(c,58,185,451,640,50,p.ink,p.accent,12);rounded(c,492,185,450,640,50,p.ink,p.accent,12)}
  else rounded(c,283,67,434,875,60,p.ink,p.accent,13);
  if(item.style==='hand-phone'){c.fillStyle='#dbb6a2';c.beginPath();c.ellipse(283,667,89,188,-.23,0,Math.PI*2);c.ellipse(728,671,90,188,.2,0,Math.PI*2);c.fill()}
  return;
 }
 if(item.type==='device'){
  if(item.style==='mug'){
   rounded(c,287,307,439,529,73,p.surface,p.accent,12);
   c.beginPath();c.arc(748,542,105,-Math.PI/2,Math.PI/2);c.strokeStyle=p.surface;c.lineWidth=44;c.stroke();c.strokeStyle=p.accent;c.lineWidth=9;c.stroke();
  }else if(item.style==='watch'){
   rounded(c,414,54,172,900,45,p.accent);
   rounded(c,318,250,364,510,90,p.ink,p.accent,13);
  }else {
   rounded(c,93,214,815,561,29,p.ink,p.accent,13);
   if(['laptop','monitor','monitor-duo'].includes(item.style)){
    c.fillStyle='#758692';c.fillRect(460,772,80,116);rounded(c,351,879,299,23,9,'#758692');
   }
  }
  return;
 }
 if(item.type==='print'){
  const paper=item.style==='postcard'?{x:98,y:263,w:806,h:476}:item.style==='card-duo'?{x:65,y:191,w:870,h:620}:{x:160,y:111,w:680,h:779};
  rounded(c,paper.x,paper.y,paper.w,paper.h,8,p.surface,p.accent,10);
  if(['magazine','book','brochure'].includes(item.style)){c.fillStyle='#11111127';c.fillRect(paper.x+16,paper.y+9,19,paper.h-18)}
  if(item.style==='notebook')for(let i=0;i<9;i++){c.beginPath();c.arc(163,180+i*75,18,Math.PI*.5,Math.PI*1.5);c.strokeStyle=p.ink;c.lineWidth=5;c.stroke()}
  return;
 }
 for(const sl of S)rounded(c,sl.x-24,sl.y-24,sl.w+48,sl.h+48,12,p.accent);
 if(item.style==='desk-frame'){c.strokeStyle=p.ink;c.lineWidth=19;c.beginPath();c.moveTo(500,826);c.lineTo(420,937);c.moveTo(500,826);c.lineTo(580,937);c.stroke()}
}
function landscape(c){
 const g=c.createLinearGradient(0,0,0,1000);g.addColorStop(0,'#bfe4ef');g.addColorStop(.6,'#e1f3eb');g.addColorStop(1,'#bfdca1');c.fillStyle=g;c.fillRect(0,0,1000,1000);
 c.fillStyle='#fffdfbc0';c.beginPath();c.ellipse(485,280,160,70,0,0,Math.PI*2);c.ellipse(374,300,98,55,0,0,Math.PI*2);c.fill();
 c.fillStyle='#a5d37c';c.beginPath();c.moveTo(0,765);c.quadraticCurveTo(315,535,604,765);c.quadraticCurveTo(824,929,1000,710);c.lineTo(1000,1000);c.lineTo(0,1000);c.fill();
 c.fillStyle='#65ac54';c.beginPath();c.moveTo(0,872);c.quadraticCurveTo(333,724,604,878);c.quadraticCurveTo(824,1020,1000,831);c.lineTo(1000,1000);c.lineTo(0,1000);c.fill();
}
function cover(c,im,settings={}){
 const w=im.naturalWidth||im.videoWidth||im.width,h=im.naturalHeight||im.videoHeight||im.height;
 if(!(w>0&&h>0))return;
 const z=Math.max(1,Number(settings.zoom)||1),f=Math.max(1000/w,1000/h)*z;
 const dw=w*f,dh=h*f;
 c.drawImage(im,(1000-dw)/2+(Number(settings.panX)||0)*Math.max(0,dw-1000)/2,(1000-dh)/2+(Number(settings.panY)||0)*Math.max(0,dh-1000)/2,dw,dh);
}
function draw(c,e,photos,activeSlot=-1,video=null){
 const item=byId.get(e.variant);if(!item)return;
 c.save();c.translate(e.x,e.y);c.scale(e.w/1000,e.h/1000);
 backdrop(c,item);
 for(let i=0;i<item.customSlots.length;i++){
  const sl=item.customSlots[i],pic=photos?.get(e.id+':'+i),option=e.frameSlots?.[i]||{};
  c.save();c.translate(sl.x,sl.y);c.scale(sl.w/1000,sl.h/1000);
  const path=new Path2D(frames.shapePath(sl.shape));c.clip(path);
  if(e.mockVideo&&e.videoSlot===i&&video&&video.readyState>=2&&video.videoWidth)cover(c,video,option);
  else if(pic?.complete&&pic.naturalWidth)cover(c,pic,option);
  else landscape(c);
  c.restore();
  c.save();c.translate(sl.x,sl.y);c.scale(sl.w/1000,sl.h/1000);
  c.lineWidth=e.borderSize===undefined?9:Math.max(0,Number(e.borderSize)||0);
  if(c.lineWidth){c.strokeStyle=e.color||item.palette.accent;c.stroke(path)}
  if(i===activeSlot){c.strokeStyle='#2e84e1';c.lineWidth=18;c.setLineDash([22,12]);c.stroke(path)}
  c.restore();
 }
 if(item.type==='phone'||item.style==='video-phone'||item.style==='story'){rounded(c,423,78,154,28,14,'#19202a')}
 c.restore();
}
function thumb(id){
 const item=byId.get(id);if(!item)return '';
 if(cache.has(id))return cache.get(id);
 const p=item.palette,slots=item.customSlots;
 let out='<rect width="1000" height="1000" fill="'+p.bg+'"/><ellipse cx="500" cy="903" rx="300" ry="40" fill="#11111114"/>';
 if(item.type==='garment'){
  const sh=item.style==='tote'?'M221 310H779L749 866H250Z':item.style==='cap'?'M200 575Q185 310 800 574Q820 665 740 671H260Q193 658 200 575Z':
 'M354 195Q500 222 647 195L743 214 930 405 812 537 737 465 765 858H235L260 465 188 537 70 405 257 214Z';
  out+='<path d="'+sh+'" fill="'+p.surface+'" stroke="'+p.accent+'" stroke-width="12"/>';
  if(item.style==='tote')out+='<path d="M350 328Q344 110 650 328" stroke="'+p.ink+'" stroke-width="28" fill="none"/>';
 }else if(item.type==='phone'||item.style==='story'||item.style==='video-phone'){
  out+='<rect x="283" y="67" width="434" height="875" rx="60" fill="'+p.ink+'" stroke="'+p.accent+'" stroke-width="13"/>';
 }else if(item.type==='device'){
  const d=item.style==='watch'?[318,250,364,510,90]:item.style==='mug'?[287,307,439,529,65]:[93,214,815,561,27];
  out+='<rect x="'+d[0]+'" y="'+d[1]+'" width="'+d[2]+'" height="'+d[3]+'" rx="'+d[4]+'" fill="'+p.ink+'" stroke="'+p.accent+'" stroke-width="13"/>';
 }else if(item.type==='print'){out+='<rect x="160" y="111" width="680" height="779" rx="8" fill="'+p.surface+'" stroke="'+p.accent+'" stroke-width="11"/>'}
 else for(const sl of slots)out+='<rect x="'+(sl.x-25)+'" y="'+(sl.y-25)+'" width="'+(sl.w+50)+'" height="'+(sl.h+50)+'" rx="12" fill="'+p.accent+'"/>';
 const sample=slots.map((sl,i)=>{
 const clip='m'+i,pth=frames.shapePath(sl.shape),tr='translate('+sl.x+' '+sl.y+') scale('+(sl.w/1000)+' '+(sl.h/1000)+')';
 return '<defs><clipPath id="'+clip+'"><path d="'+pth+'"/></clipPath></defs><g transform="'+tr+'"><g clip-path="url(#'+clip+')"><rect width="1000" height="1000" fill="#c7ebf0"/><path d="M0 780Q330 570 590 800Q822 936 1000 717V1000H0Z" fill="#aed57f"/><path d="M0 880Q333 711 590 886Q819 1010 1000 828V1000H0Z" fill="#73ad5b"/></g></g>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 1000 1000">'+out+sample+'</svg>';
 const uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 cache.set(id,uri);return uri;
}
window.ELOAHMockups={groups,catalogue,byId,draw,thumb};
})();