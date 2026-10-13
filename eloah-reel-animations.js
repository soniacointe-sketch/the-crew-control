(()=>{
'use strict';
// Stickers originaux ELOAH animés localement. Aucun élément graphique Canva copié.
const grouped=[{"group":"Recommandations magiques","entries":[{"id":"follow","name":"Follow","type":"pill","color":"#19a6d7","motion":"pulse"},{"id":"like","name":"Like","type":"pill","color":"#3478c9","motion":"bounce"},{"id":"subscribe","name":"S’abonner","type":"pill","color":"#e35072","motion":"pop"},{"id":"sparkly","name":"Étincelles","type":"symbol","color":"#e8ad51","motion":"twinkle"},{"id":"new-badge","name":"Nouveau !","type":"pill","color":"#7a62bd","motion":"wobble"},{"id":"swipe","name":"Glisser","type":"arrow","color":"#53a4c4","motion":"slide"},{"id":"double-heart","name":"Double cœur","type":"emoji","color":"#de6696","motion":"float"},{"id":"spotlight","name":"Lumière","type":"symbol","color":"#dfba63","motion":"pulse"}]},{"group":"Animations flèche","entries":[{"id":"arrow-right","name":"Flèche droite","type":"arrow","color":"#497bc5","motion":"slide"},{"id":"arrow-curve","name":"Flèche courbe","type":"arrow","color":"#252525","motion":"swing"},{"id":"arrow-loop","name":"Flèche en boucle","type":"arrow","color":"#3b3f4c","motion":"rotate"},{"id":"arrow-down","name":"Vers le bas","type":"arrow","color":"#378caf","motion":"bounce"},{"id":"arrow-double","name":"Double flèche","type":"arrow","color":"#75b2d5","motion":"slide"},{"id":"arrow-zigzag","name":"Flèche zigzag","type":"arrow","color":"#d89151","motion":"wobble"},{"id":"arrow-up","name":"Flèche montante","type":"arrow","color":"#5c9e83","motion":"bounce"},{"id":"arrow-circle","name":"Flèche circulaire","type":"arrow","color":"#8570ba","motion":"rotate"}]},{"group":"Animations mot","entries":[{"id":"wow","name":"WOW !","type":"word","color":"#e68552","motion":"pop"},{"id":"hello","name":"HELLO","type":"word","color":"#569bb6","motion":"float"},{"id":"love","name":"LOVE","type":"word","color":"#a63d57","motion":"pulse"},{"id":"go","name":"GO !","type":"word","color":"#d4a654","motion":"bounce"},{"id":"bravo","name":"BRAVO","type":"word","color":"#458a71","motion":"pop"},{"id":"yes","name":"YES !","type":"word","color":"#8659af","motion":"wobble"},{"id":"merci","name":"MERCI","type":"word","color":"#bd7891","motion":"float"},{"id":"click","name":"CLIQUE !","type":"word","color":"#4892bc","motion":"pulse"}]},{"group":"Animations nourriture","entries":[{"id":"coffee","name":"Café","type":"emoji","color":"#9d7657","motion":"float"},{"id":"avocado","name":"Avocat","type":"emoji","color":"#61a56e","motion":"wobble"},{"id":"strawberry","name":"Fraise","type":"emoji","color":"#d45a69","motion":"bounce"},{"id":"lemon","name":"Citron","type":"emoji","color":"#dfb84d","motion":"rotate"},{"id":"pizza","name":"Pizza","type":"emoji","color":"#d59f48","motion":"swing"},{"id":"cake","name":"Gâteau","type":"emoji","color":"#db86aa","motion":"float"},{"id":"icecream","name":"Glace","type":"emoji","color":"#9a89c5","motion":"bounce"},{"id":"croissant","name":"Croissant","type":"emoji","color":"#d8a052","motion":"float"}]},{"group":"Animations forme","entries":[{"id":"ring","name":"Anneau","type":"shape","color":"#5f92ce","motion":"pulse"},{"id":"square","name":"Carré","type":"shape","color":"#dba9b5","motion":"rotate"},{"id":"triangle","name":"Triangle","type":"shape","color":"#a98ed9","motion":"wobble"},{"id":"blobby","name":"Tache organique","type":"shape","color":"#8ec1b2","motion":"float"},{"id":"orbit","name":"Orbites","type":"shape","color":"#8e94d3","motion":"rotate"},{"id":"wave","name":"Vagues","type":"shape","color":"#78b8dc","motion":"slide"},{"id":"starburst","name":"Étoile","type":"shape","color":"#eab763","motion":"twinkle"},{"id":"zigzag","name":"Zigzag","type":"shape","color":"#d3878a","motion":"wobble"}]},{"group":"Animations emoji","entries":[{"id":"ghost","name":"Fantôme","type":"emoji","color":"#d1d5e0","motion":"float"},{"id":"smile","name":"Sourire","type":"emoji","color":"#e8ba5e","motion":"bounce"},{"id":"laugh","name":"Rire","type":"emoji","color":"#e1b34b","motion":"wobble"},{"id":"wink","name":"Clin d’œil","type":"emoji","color":"#edba52","motion":"pop"},{"id":"heart-eyes","name":"Yeux en cœur","type":"emoji","color":"#da7993","motion":"pulse"},{"id":"fire","name":"Feu","type":"emoji","color":"#d97d50","motion":"float"},{"id":"surprised","name":"Surprise","type":"emoji","color":"#dab862","motion":"bounce"},{"id":"star-eyes","name":"Étoiles dans les yeux","type":"emoji","color":"#d8bd68","motion":"twinkle"}]},{"group":"Animations festives","entries":[{"id":"confetti","name":"Confettis","type":"festive","color":"#b889ce","motion":"fall"},{"id":"balloon","name":"Ballon","type":"festive","color":"#df7ca1","motion":"float"},{"id":"gift","name":"Cadeau","type":"festive","color":"#cf9e5c","motion":"bounce"},{"id":"disco","name":"Boule disco","type":"festive","color":"#7d9dd1","motion":"rotate"},{"id":"party","name":"Fête !","type":"festive","color":"#d56b9b","motion":"pop"},{"id":"sparkle-shower","name":"Pluie d'étoiles","type":"festive","color":"#d8ab53","motion":"fall"},{"id":"heart-rain","name":"Pluie de cœurs","type":"festive","color":"#d97d9b","motion":"fall"},{"id":"firework","name":"Feu d’artifice","type":"festive","color":"#d0a05a","motion":"pulse"}]}];
const catalogue=grouped.flatMap(g=>g.entries.map(e=>({...e,group:g.group})));
const byId=new Map(catalogue.map(e=>[e.id,e]));
const cache=new Map();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function graphic(e){
 const {id,type,color:c}=e,stroke='stroke="'+c+'" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"';
 if(type==='word'||type==='pill'){
  const words={follow:'Follow',like:'LIKE ♡',subscribe:"S’ABONNER",'new-badge':'NOUVEAU',wow:'WOW !',hello:'HELLO',love:'LOVE',go:'GO !',bravo:'BRAVO',yes:'YES !',merci:'MERCI',click:'CLIQUE !',party:'FÊTE !'};
  const label=words[id]||e.name.toUpperCase();const fill=type==='pill'?c:'#fffaf0',ink=type==='pill'?'#fff':c;
  return '<rect x="13" y="43" width="134" height="72" rx="17" fill="'+fill+'" '+(type==='word'?'stroke="'+c+'" stroke-width="5"':'')+'/>'+
   '<text x="80" y="89" font-family="Arial,sans-serif" font-weight="900" font-size="'+(label.length>8?17:label.length>6?23:32)+'" text-anchor="middle" fill="'+ink+'">'+esc(label)+'</text>';
 }
 if(type==='arrow'){
  switch(id){
  case 'arrow-curve':return '<path d="M25 137 Q13 19 131 30 L103 11 M131 30 L109 58" '+stroke+'/>';
  case 'arrow-loop':return '<path d="M111 47 A59 59 0 1 0 133 97 M110 17 L111 49 79 49" '+stroke+'/>';
  case 'arrow-down':return '<path d="M80 15V138 M42 100L80 138 118 100" '+stroke+'/>';
  case 'arrow-double':return '<path d="M22 58H138 M112 33L138 58 112 83 M22 115H138 M112 90L138 115 112 140" '+stroke+'/>';
  case 'arrow-zigzag':return '<path d="M13 132 L51 85 L75 106 L116 38 M83 40L119 35 119 71" '+stroke+'/>';
  case 'arrow-up':return '<path d="M80 145V20 M42 58L80 20 118 58" '+stroke+'/>';
  case 'arrow-circle':return '<path d="M120 47A58 58 0 1 0 136 99 M106 15L122 47 89 50" '+stroke+'/>';
  case 'swipe':return '<path d="M18 80H136 M103 44L138 80 103 117" '+stroke+'/><circle cx="35" cy="80" r="10" fill="'+c+'"/>';
  default:return '<path d="M17 80H138 M103 44L138 80 103 117" '+stroke+'/>';
  }
 }
 if(type==='emoji'){
  const emoji={ghost:'👻',smile:'😊',laugh:'🤣',wink:'😉','heart-eyes':'😍',fire:'🔥',surprised:'😲','star-eyes':'🤩',coffee:'☕',avocado:'🥑',strawberry:'🍓',lemon:'🍋',pizza:'🍕',cake:'🧁',icecream:'🍦',croissant:'🥐','double-heart':'💕'};
  return '<text x="80" y="118" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif" font-size="107" text-anchor="middle">'+(emoji[id]||'✨')+'</text>';
 }
 if(type==='shape'||type==='symbol'){
  switch(id){
  case 'ring':return '<circle cx="80" cy="80" r="56" stroke="'+c+'" stroke-width="16" fill="none"/>';
  case 'square':return '<rect x="26" y="26" width="108" height="108" rx="16" fill="'+c+'"/>';
  case 'triangle':return '<path d="M80 15L150 141H10Z" fill="'+c+'"/>';
  case 'blobby':return '<path d="M27 50Q41 14 82 23Q127 4 142 59Q160 109 119 130Q73 150 45 125Q-1 111 27 50Z" fill="'+c+'"/>';
  case 'orbit':return '<circle cx="80" cy="80" r="24" fill="'+c+'"/><ellipse cx="80" cy="80" rx="67" ry="31" transform="rotate(-25 80 80)" fill="none" stroke="'+c+'" stroke-width="8"/><circle cx="23" cy="113" r="12" fill="#edbd65"/>';
  case 'wave':return '<path d="M5 65Q25 30 46 65T89 65T132 65T175 65 M5 105Q25 70 46 105T89 105T132 105" '+stroke+'/>';
  case 'zigzag':return '<path d="M12 112L38 49 69 114 100 44 135 111 150 61" '+stroke+'/>';
  case 'spotlight':return '<circle cx="80" cy="80" r="27" fill="#f3d4a2"/><circle cx="80" cy="80" r="62" stroke="'+c+'" stroke-width="7" opacity=".5" fill="none"/>';
  default:return Array.from({length:12},(_,i)=>'<path d="M80 20V7" stroke="'+(i%2?c:'#efc86b')+'" stroke-width="8" stroke-linecap="round" transform="rotate('+(30*i)+' 80 80)"/>').join('')+'<circle cx="80" cy="80" r="29" fill="'+c+'"/>';
  }
 }
 if(type==='festive'){
  if(id==='balloon')return '<ellipse cx="80" cy="61" rx="43" ry="53" fill="'+c+'"/><path d="M80 111L69 124 91 124Z" fill="'+c+'"/><path d="M80 124Q57 142 89 156" stroke="#a67b8d" stroke-width="3" fill="none"/><ellipse cx="62" cy="41" rx="11" ry="20" fill="#fff6"/>';
  if(id==='gift')return '<rect x="23" y="66" width="114" height="80" rx="8" fill="'+c+'"/><rect x="15" y="51" width="130" height="29" rx="5" fill="#e6b758"/><path d="M72 54V146H89V54" fill="#fff2c2"/><path d="M80 53Q30 42 50 17Q72 2 80 52Q99 0 119 18Q134 40 80 53" stroke="'+c+'" fill="none" stroke-width="8"/>';
  if(id==='disco')return '<circle cx="80" cy="80" r="64" fill="#99aad1" stroke="#566895" stroke-width="4"/>'+Array.from({length:7},(_,i)=>'<path d="M20 '+(33+i*16)+'H140" stroke="#f8faff" stroke-width="4"/>').join('')+Array.from({length:7},(_,i)=>'<path d="M'+(31+i*16)+' 20V140" stroke="#e3e9f5" stroke-width="4"/>').join('');
  if(id==='party')return '<text x="80" y="113" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif" font-size="115">🎉</text>';
  if(id==='heart-rain')return Array.from({length:9},(_,i)=>'<text x="'+(15+(i%3)*51)+'" y="'+(40+Math.floor(i/3)*47)+'" font-size="'+(22+i%3*5)+'" fill="'+c+'">♥</text>').join('');
  return Array.from({length:18},(_,i)=>{const x=(i*49+17)%148+7,y=(i*67+29)%144+6,v=['#e9b45c','#84c6d1','#c385bc','#93ba8f','#dd8075'][i%5];return '<path d="M'+x+' '+y+'l'+(4+i%5*2)+' '+(3+i%4*4)+'" stroke="'+v+'" stroke-width="7" stroke-linecap="round"/>'}).join('');
 }
 return '<circle cx="80" cy="80" r="48" fill="'+c+'"/>';
}
function svg(id,color){
 const item=byId.get(id);if(!item)return '';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">'+graphic({...item,color:color||item.color})+'</svg>';
}
function uri(id,color){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(id,color))}
const motions=['none','fade','pop','slide','pulse','float','bounce','wobble','swing','rotate','twinkle','fall','shake'];
const motionNames={'none':'Aucune','fade':'Apparition douce','pop':'Zoom dynamique','slide':'Entrée latérale','pulse':'Pulsation','float':'Flottement','bounce':'Rebond','wobble':'Oscillation','swing':'Balancement','rotate':'Rotation','twinkle':'Clignotement','fall':'Pluie descendante','shake':'Vibration'};
function applyMotion(ctx,e,t,enabled=true){
 if(!enabled)return;
 const motion=e.motion||e.animation||'none';
 if(!motions.includes(motion)||motion==='none')return;
 const speed=Math.max(.2,Math.min(4,Number(e.speed)||1));
 const elapsed=Math.max(0,t-(Number(e.start)||0));
 const u=elapsed*speed,p=u*Math.PI*2;
 const cx=(Number(e.x)||0)+(Number(e.w)||0)/2,cy=(Number(e.y)||0)+(Number(e.h)||0)/2;
 const relative=(angle,scale=1,dx=0,dy=0)=>{
   ctx.translate(cx+dx,cy+dy);ctx.rotate(angle);ctx.scale(scale,scale);ctx.translate(-cx,-cy);
 };
 const intro=Math.max(0,Math.min(1,u/.55));
 switch(motion){
 case 'fade':ctx.globalAlpha*=intro;break;
 case 'pop':relative(0,.35+.65*(1-Math.pow(1-intro,3)));break;
 case 'slide':relative(0,1,-420*(1-intro),0);ctx.globalAlpha*=.3+.7*intro;break;
 case 'pulse':relative(0,1+.075*Math.sin(p*1.25));break;
 case 'float':relative(0,1,0,24*Math.sin(p*.35));break;
 case 'bounce':relative(0,1,0,-Math.abs(Math.sin(p*.7))*72);break;
 case 'wobble':relative(.12*Math.sin(p*.75));break;
 case 'swing':relative(.24*Math.sin(p*.42));break;
 case 'rotate':relative(u*.75);break;
 case 'twinkle':relative(0,.87+.13*Math.sin(p*1.2));ctx.globalAlpha*=.65+.35*Math.abs(Math.sin(p*1.4));break;
 case 'fall':relative(.08*Math.sin(p*.3),1,10*Math.sin(p*.3),((elapsed*65*speed)%(Number(e.h)||300))-Number(e.h||300)/4);break;
 case 'shake':relative(.034*Math.sin(p*3),1,7*Math.sin(p*3),5*Math.cos(p*4));break;
 }
}
function render(ctx,e){
 const item=byId.get(e.variant);if(!item)return;
 const key=e.variant+'|'+(e.color||item.color);let im=cache.get(key);
 if(!im){im=new Image();im.src=uri(e.variant,e.color||item.color);cache.set(key,im);
  if(cache.size>170)cache.delete(cache.keys().next().value);
 }
 if(im.complete&&im.naturalWidth)try{ctx.drawImage(im,e.x,e.y,e.w,e.h)}catch{}
}
window.ELOAHAnimations={grouped,catalogue,byId,motions,motionNames,uri,applyMotion,render};
})();