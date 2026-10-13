(()=>{
'use strict';
/* ELOAH Text Studio : créations typographiques originales, rendu Canvas autonome. */
const families={
 sans:{name:'Sans moderne',css:'Arial,Helvetica,sans-serif'},
 rounded:{name:'Arrondie',css:'Trebuchet MS,Verdana,sans-serif'},
 editorial:{name:'Éditoriale',css:'Georgia,Times New Roman,serif'},
 bodoni:{name:'Bodoni Moda',css:'"Bodoni Moda",Georgia,serif'},
 inter:{name:'Inter',css:'"Inter",Arial,sans-serif'},
 caveat:{name:'Caveat',css:'"Caveat","Segoe Script",cursive'},
 classic:{name:'Classique chic',css:'Palatino Linotype,Georgia,serif'},
 poster:{name:'Affiche impactante',css:'Impact,Arial Black,Arial,sans-serif'},
 hand:{name:'Manuscrite',css:'Brush Script MT,Segoe Script,cursive'},
 mono:{name:'Machine à écrire',css:'Courier New,monospace'},
 condensed:{name:'Condensée',css:'Arial Narrow,Impact,Arial,sans-serif'}
};
const baseThemes=[{"group":"Éditorial & magazines","back":"#f4efe7","ink":"#181818","accent":"#a63d57","family":"editorial","secondary":"hand","heads":["LA SORTIE","LE GRAND DÉPART","LE DOSSIER","NOUVELLE ÉDITION","UNE HISTOIRE","CHRONIQUES","LE MOT DU JOUR","NOS REGARDS","EN COUVERTURE","ÉDITION LIMITÉE"],"subs":["de la semaine","sur nos envies","en profondeur","pour vous","à raconter","de la vie","à retenir","sans filtre","et coulisses","du moment"]},{"group":"Rock & audacieux","back":"#171717","ink":"#fff4dc","accent":"#d7ac53","family":"poster","secondary":"hand","heads":["ROCK","BOLD MOVES","ON OSE","BOOM !","SANS LIMITES","DARK ENERGY","GO WILD","SOIS LIBRE","NO RULES","UNSTOPPABLE"],"subs":["sans excuses","avec énergie","jusqu’au bout","on avance","on choisit","en mouvement","tout commence","pas à moitié","ce soir","ensemble"]},{"group":"Amour & Glam","back":"#f6e8e5","ink":"#a63d57","accent":"#e27b62","family":"editorial","secondary":"hand","heads":["LOVE","JE ME CHOISIS","DÉSIR","LA VIE EN ROSE","BEAUTÉ BRUTE","CŒUR LIBRE","POWER & GLAM","PASSION","OUI À MOI","RENAISSANCE"],"subs":["yourself","chaque jour","en grand","et douceur","sans masque","sans regrets","la maison éditoriale","intérieure","tout simplement","de soi"]},{"group":"The Crew & danse","back":"#151515","ink":"#f7de98","accent":"#ceaa49","family":"poster","secondary":"sans","heads":["THE CREW","ON DANSE","DANCE PARTY","TOGETHER","KIDS CREW","MOVE WITH US","FLASHBACK","100 % ÉNERGIE","LET’S DANCE","NOTRE TRIBU"],"subs":["Orchies","ensemble","ce soir","sur la piste","en mouvement","toujours","années 80","sans niveau requis","et souris","famille de danse"]},{"group":"Nature & douceur","back":"#eff6ef","ink":"#28664f","accent":"#a4b777","family":"classic","secondary":"hand","heads":["RESPIRE","DOUCEUR","PRENDS TON TEMPS","ÉQUILIBRE","LA VIE","ÉCLORE","GREEN DAY","AU NATUREL","PETITS BONHEURS","LIBERTÉ"],"subs":["aujourd’hui","et lumière","pour toi","intérieur","sans filtre","à ton rythme","slow living","sauvage","quotidiens","de grandir"]},{"group":"Créatif & fun","back":"#fff1bf","ink":"#f06a43","accent":"#248ea5","family":"rounded","secondary":"poster","heads":["SPOOKY","STATIC","YES !","COULEUR POP","HELLO !","ÇA BOUGE","JOY","WOW","HAPPY VIBES","SUPER STAR"],"subs":["story","in motion","let’s go","sans peur","good vibes","tout le temps","partout","du jour","en couleur","à fond"]},{"group":"Minimal & élégant","back":"#fffdfa","ink":"#2b3135","accent":"#a5aab2","family":"classic","secondary":"sans","heads":["ESSENTIEL","EN UN MOT","STUDIO","L’INSTANT","SIMPLICITÉ","L’ART DE VIVRE","ÉDITO","LA FORME","L’HORIZON","MA SIGNATURE"],"subs":["à retenir","tout commence","aujourd’hui","présent","et sens","sans artifices","numéro un","est libre","s’ouvre","personnelle"]},{"group":"Histoires & émotions","back":"#f6f0e8","ink":"#544455","accent":"#b87d8f","family":"hand","secondary":"editorial","heads":["IL ÉTAIT UNE FOIS","MON HISTOIRE","AVANCER","SOUS LA PEAU","LETTRE À MOI","PETITS RIENS","JE GRANDIS","AUJOURD’HUI","ET DEMAIN","RETROUVAILLES"],"subs":["un nouveau départ","en quelques mots","sans me retourner","des mots","plus libre","grands moments","encore","j’ose","on verra","avec moi-même"]},{"group":"Reels & réseaux","back":"#1c3047","ink":"#ffffff","accent":"#e9b65a","family":"poster","secondary":"sans","heads":["À LA UNE","RESTE ICI","NOUVEAU REEL","DÉCOUVRE","3 CONSEILS","ABONNE-TOI","POUR TOI","LES COULISSES","PARTAGE","LE TOP"],"subs":["du jour","pour la suite","maintenant","en vidéo","à retenir","à l’aventure","avec amour","de la semaine","ton avis","en images"]}];
const modes=['stack','poster','offset','ribbon','outline','mini','stripe','poster','offset','stack'];
const presets=baseThemes.flatMap((theme,g)=>theme.heads.map((title,i)=>{
 const id='eloah-text-'+(g+1)+'-'+String(i+1).padStart(2,'0');
 return {id,group:theme.group,title,subtitle:theme.subs[i],eyebrow:i%3===0?'ELOAH · CRÉATION':i%3===1?'COLLECTION 0'+(g+1):'STUDIO ORIGINAL',
  back:theme.back,ink:theme.ink,accent:theme.accent,font:theme.family,subFont:theme.secondary,layout:modes[(i+g)%modes.length],
  defaultSize:i%2===0?112:124};
}));
const groups=baseThemes.map(theme=>({name:theme.group,items:presets.filter(x=>x.group===theme.group)}));
const byId=new Map(presets.map(x=>[x.id,x]));
const escapeXml=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&apos;'}[x]));
const fontFor=key=>families[key]?.css||families.sans.css;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const color=(value,fallback)=>/^#[\da-f]{6}$/i.test(value||'')?value:fallback;
const rgb=(hex)=>{const h=color(hex,'#111111').slice(1);return [0,2,4].map(k=>parseInt(h.slice(k,k+2),16))};
function preview(id){
 const p=byId.get(id);if(!p)return '';
 const headline=escapeXml(p.title.length>19?p.title.slice(0,19)+'…':p.title);
 const subtitle=escapeXml(p.subtitle.length>27?p.subtitle.slice(0,27)+'…':p.subtitle);
 const eyebrow=escapeXml(p.eyebrow.slice(0,17));
 const palette=p.layout==='outline'?'fill="none" stroke="'+p.ink+'" stroke-width="1.4"':'fill="'+p.ink+'"';
 const base=p.layout==='ribbon'?'<rect x="11" y="101" width="278" height="40" rx="4" fill="'+p.accent+'" opacity=".82"/>':
  p.layout==='stripe'?'<rect x="14" y="14" width="7" height="168" fill="'+p.accent+'"/>':
  p.layout==='poster'?'<path d="M20 150L280 130V149L20 169Z" fill="'+p.accent+'" opacity=".84"/>':'';
 const headlineSize=p.title.length>16?24:p.title.length>10?32:p.layout==='poster'?58:44;
 const font=fontFor(p.font).split(',')[0].replaceAll('"','');
 const subFont=fontFor(p.subFont).split(',')[0].replaceAll('"','');
 const titleY=p.layout==='mini'?80:94;
 const underY=p.layout==='ribbon'?127:145;
 const text='<text x="150" y="39" text-anchor="middle" fill="'+p.accent+'" font-size="12" font-family="Arial" letter-spacing="2">'+eyebrow+'</text>'+
 '<text x="150" y="'+titleY+'" font-family="'+font+'" font-weight="800" font-size="'+headlineSize+'" text-anchor="middle" '+palette+'>'+headline+'</text>'+
 '<text x="150" y="'+underY+'" font-family="'+subFont+'" font-weight="600" font-style="'+(p.subFont==='hand'?'italic':'normal')+'" font-size="'+(p.subtitle.length>19?18:25)+'" text-anchor="middle" fill="'+(p.layout==='ribbon'?'#ffffff':p.accent)+'">'+subtitle+'</text>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="190" viewBox="0 0 300 190"><rect width="300" height="190" rx="9" fill="'+p.back+'"/>'+base+text+'</svg>');
}
const textModes=['none','typewriter','words','lines','caption','counter'];
const modeNames={none:'Aucun',typewriter:'Machine à écrire',words:'Mots qui apparaissent',lines:'Ligne par ligne',caption:'Sous-titres synchronisés (temps)',counter:'Numérotation dynamique'};
function dynamicText(e,t){
 const val=String(e.text||''),mode=e.textMode||'none';
 if(mode==='counter'){
  const interval=Math.max(.2,Number(e.pageInterval)||2),duration=Math.max(.1,(Number(e.end)||5)-(Number(e.start)||0));
  const current=Math.min(Math.max(1,Math.ceil(duration/interval)),Math.floor(Math.max(0,t-e.start)/interval)+1);
  const total=Math.max(1,Math.ceil(duration/interval));
  return String(current).padStart(2,'0')+' / '+String(total).padStart(2,'0');
 }
 if(mode==='none'||!val)return val;
 const since=Math.max(0,t-(Number(e.start)||0)),duration=Math.max(.1,(Number(e.end)||5)-(Number(e.start)||0));
 if(mode==='typewriter')return val.slice(0,Math.max(0,Math.min(val.length,Math.floor(since*18))));
 if(mode==='lines'){const lines=val.split('\n');return lines.slice(0,Math.max(1,Math.ceil((since/duration)*lines.length))).join('\n')}
 const words=val.split(/\s+/).filter(Boolean);
 if(!words.length)return '';
 if(mode==='caption'){const groupSize=3,groups=Math.ceil(words.length/groupSize),i=Math.min(groups-1,Math.floor((since/duration)*groups));return words.slice(i*groupSize,i*groupSize+groupSize).join(' ')}
 return words.slice(0,Math.max(1,Math.ceil((since/duration)*words.length))).join(' ');
}
function fontSpec(e,size){
 const weight=[300,400,500,600,700,800,900].includes(Number(e.fontWeight))?Number(e.fontWeight):800;
 const italic=e.italic?'italic ':'';
 return italic+weight+' '+size+'px '+fontFor(e.fontFamily||'sans');
}
function breakLines(ctx,value,maxWidth,size,style,limit=6,tracking=0){
 ctx.font=style;
 const result=[];
 const available=Math.max(35,maxWidth);
 for(const line of String(value).split('\n')){
  if(!line.trim()){result.push('');continue}
  const words=line.split(/\s+/),segments=[];let segment='';
  for(const word of words){
   const candidate=segment?segment+' '+word:word;
   const measured=ctx.measureText(candidate).width+tracking*Math.max(0,candidate.length-1);
   if(segment&&measured>available){segments.push(segment);segment=word}else segment=candidate;
  }
  if(segment)segments.push(segment);
  result.push(...segments);
 }
 return result.slice(0,limit);
}
function paintString(ctx,text,x,y,opts={}){
 const size=Math.max(12,Number(opts.size)||40);
 ctx.save();ctx.font=opts.font||('800 '+size+'px Arial,sans-serif');
 ctx.textAlign=opts.align||'center';ctx.textBaseline='middle';
 ctx.globalAlpha*=Math.max(0,Math.min(1,opts.alpha??1));
 ctx.lineJoin='round';ctx.miterLimit=2;
 if(opts.shadow){ctx.shadowColor=opts.shadowColor||'#00000065';ctx.shadowBlur=opts.shadowBlur??14;ctx.shadowOffsetY=opts.shadowOffsetY??5}
 const tracking=Math.max(-3,Math.min(28,Number(opts.tracking)||0));
 if(opts.outline>0){ctx.strokeStyle=opts.strokeColor||'#121212';ctx.lineWidth=opts.outline}
 ctx.fillStyle=opts.color||'#ffffff';
 if(tracking===0){if(opts.outline>0)ctx.strokeText(text,x,y);ctx.fillText(text,x,y);ctx.restore();return}
 const chars=Array.from(text),metrics=chars.map(char=>ctx.measureText(char).width);
 const total=metrics.reduce((a,b)=>a+b,0)+tracking*(chars.length-1);
 let left=opts.align==='left'?x:opts.align==='right'?x-total:x-total/2;
 ctx.textAlign='left';
 for(let i=0;i<chars.length;i++){
  if(opts.outline>0)ctx.strokeText(chars[i],left,y);
  ctx.fillText(chars[i],left,y);
  left+=metrics[i]+tracking;
 }
 ctx.restore();
}
function drawLabelBg(ctx,e,background){
 if(!background||background==='none')return;
 const fill=color(background,'#121212');
 ctx.save();ctx.fillStyle=fill;ctx.globalAlpha*=clamp(e.bgOpacity??.86,0,1);
 ctx.beginPath();ctx.roundRect(e.x,e.y,e.w,e.h,Math.min(40,e.h*.1));ctx.fill();ctx.restore();
}
function drawPlain(ctx,e,t){
 const mode=e.textMode||'none',value=dynamicText(e,t);
 const font=Math.min(250,Math.max(14,Number(e.font)||70));
 const mainFont=fontSpec(e,font);
 const tracking=Number(e.tracking)||0;
 const align=['left','center','right'].includes(e.align)?e.align:'center';
 const tx=align==='left'?e.x+30:align==='right'?e.x+e.w-30:e.x+e.w/2;
 const lines=breakLines(ctx,value,e.w-44,font,mainFont,14,tracking);
 const gap=font*clamp(e.lineHeight||1.16,.7,2);
 const height=gap*Math.max(1,lines.length);
 const start=e.y+e.h/2-height/2+gap/2;
 if(mode==='caption'||e.backgroundColor)drawLabelBg(ctx,e,mode==='caption'?(e.backgroundColor||'#1b1b1b'):e.backgroundColor);
 lines.forEach((text,i)=>paintString(ctx,text,tx,start+i*gap,{font:mainFont,size:font,align,
  color:e.color||'#ffffff',tracking,outline:Math.max(0,Number(e.outlineWidth)||0),strokeColor:e.outlineColor||'#111111',shadow:!!e.shadow,shadowColor:e.shadowColor,shadowBlur:22}));
}
function drawCombo(ctx,e,t){
 const p=byId.get(e.variant);if(!p){drawPlain(ctx,e,t);return}
 const x=e.x,y=e.y,w=e.w,h=e.h;
 ctx.save();ctx.globalAlpha*=clamp(e.textOpacity??1,0,1);
 const bg=e.comboBackground??p.back;
 if(e.comboBackground!=='transparent'){ctx.fillStyle=color(bg,p.back);ctx.fillRect(x,y,w,h)}
 const border=e.comboBorder??0;
 if(border>0){ctx.lineWidth=border;ctx.strokeStyle=e.accentColor||p.accent;ctx.strokeRect(x+border/2,y+border/2,w-border,h-border)}
 const base=Math.min(250,Math.max(30,+e.font||p.defaultSize));
 const alignment=['left','center','right'].includes(e.align)?e.align:'center';
 const innerWidth=w*.86,centerX=alignment==='left'?x+w*.08:alignment==='right'?x+w*.92:x+w/2;
 const mainColor=e.color||p.ink,accent=e.accentColor||p.accent;
 const primary=String(e.textMode&&e.textMode!=='none'?dynamicText(e,t):e.text||p.title);
 const sub=String(e.subtext??p.subtitle),top=String(e.eyebrow??p.eyebrow);
 const mainFamily=fontFor(e.fontFamily||p.font),secondaryFamily=fontFor(e.secondaryFont||p.subFont);
 let size=base;
 ctx.font=(e.italic?'italic ':'')+(e.fontWeight||800)+' '+size+'px '+mainFamily;
 while(size>27&&ctx.measureText(primary).width>innerWidth){size-=2;ctx.font=(e.italic?'italic ':'')+(e.fontWeight||800)+' '+size+'px '+mainFamily}
 const titleFont=(e.italic?'italic ':'')+(e.fontWeight||800)+' '+size+'px '+mainFamily;
 const subSize=Math.max(24,Math.min(92,base*.47));
 const subFont=(e.subItalic?'italic ':'')+'600 '+subSize+'px '+secondaryFamily;
 let mainY=y+h*.47,subY=y+h*.72,topY=y+h*.16;
 if(p.layout==='mini'){mainY=y+h*.43;subY=y+h*.62}
 if(p.layout==='offset'){mainY=y+h*.38;subY=y+h*.79}
 if(p.layout==='ribbon'){
  ctx.fillStyle=accent;ctx.globalAlpha*=.9;ctx.beginPath();ctx.roundRect(x+w*.05,y+h*.63,w*.90,h*.2,12);ctx.fill();ctx.globalAlpha/= .9;subY=y+h*.73;
 }else if(p.layout==='stripe'){ctx.fillStyle=accent;ctx.fillRect(x+w*.04,y+h*.1,Math.max(5,w*.024),h*.8)}
 else if(p.layout==='poster'){ctx.save();ctx.globalAlpha*=.23;ctx.fillStyle=accent;ctx.fillRect(x+w*.09,y+h*.51,w*.82,h*.12);ctx.restore()}
 const mainLines=breakLines(ctx,primary,innerWidth,size,titleFont,3,0);
 const spacing=size*.97;
 const mainTop=mainY-(mainLines.length-1)*spacing/2;
 mainLines.forEach((line,i)=>paintString(ctx,line,centerX,mainTop+i*spacing,{font:titleFont,size,align:alignment,color:mainColor,
  outline:p.layout==='outline'?Math.max(2,size*.025):0,strokeColor:accent,shadow:!!e.shadow,shadowBlur:15}));
 const subColor=p.layout==='ribbon'?'#ffffff':accent;
 paintString(ctx,sub,centerX,subY,{font:subFont,size:subSize,align:alignment,color:e.subColor||subColor,shadow:false});
 const topSize=Math.max(16,Math.min(32,base*.18));
 paintString(ctx,top.toUpperCase(),centerX,topY,{font:'600 '+topSize+'px Arial,sans-serif',size:topSize,align:alignment,color:accent,tracking:Math.max(1,base*.02)});
 ctx.restore();
}
function draw(ctx,e,t){
 if(e.kind==='textCombo')drawCombo(ctx,e,t);
 else drawPlain(ctx,e,t);
}
function textElement(kind,content,opts={}){
 if(kind==='heading')return {kind:'text',text:content||'MON GRAND TITRE',font:104,fontFamily:'editorial',fontWeight:800,color:'#20262c',x:100,y:700,w:880,h:320,align:'center',...opts};
 if(kind==='subtitle')return {kind:'text',text:content||'Ton sous-titre ici',font:58,fontFamily:'classic',fontWeight:500,color:'#404b59',x:130,y:1030,w:820,h:200,align:'center',...opts};
 if(kind==='body')return {kind:'text',text:content||'Écris ton texte ici.',font:41,fontFamily:'sans',fontWeight:400,color:'#28303a',x:115,y:930,w:850,h:260,align:'center',...opts};
 if(kind==='caption')return {kind:'text',text:content||'Bienvenue dans mon Reel. Ici, on danse, on crée et on avance ensemble.',font:60,fontFamily:'sans',fontWeight:900,color:'#ffffff',x:90,y:1480,w:900,h:225,align:'center',textMode:'caption',backgroundColor:'#161616',bgOpacity:.78,...opts};
 if(kind==='page')return {kind:'text',text:'01 / 05',font:50,fontFamily:'mono',fontWeight:800,color:'#ffffff',x:710,y:1730,w:280,h:88,align:'center',textMode:'counter',pageInterval:2,backgroundColor:'#1c1c1c',bgOpacity:.67,...opts};
 return {kind:'text',text:content||'Écris ton texte',font:70,fontFamily:'sans',fontWeight:800,color:'#2b2b2b',x:100,y:850,w:880,h:230,align:'center',...opts};
}
window.ELOAHText={families,presets,groups,byId,preview,draw,drawPlain,drawCombo,textElement,textModes,modeNames};
})();