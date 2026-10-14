(()=>{
'use strict';
/* ELOAH Reel Studio — palette d'annotation originale.
 * Les tracés sont des éléments éditables conservés dans le projet JSON et dans les exports.
 */
const tools=[
 {id:'select',icon:'↖',label:'Sélectionner',description:'Déplacer et redimensionner les éléments du Reel'},
 {id:'pen',icon:'✎',label:'Stylo',description:'Dessiner à main levée sur le Reel'},
 {id:'marker',icon:'◉',label:'Surligneur',description:'Marquer une zone de couleur translucide'},
 {id:'eraser',icon:'▱',label:'Gomme',description:'Supprimer un trait dessiné en le touchant'},
 {id:'line',icon:'╱',label:'Ligne',description:'Tracer une ligne droite'},
 {id:'arrow',icon:'➜',label:'Flèche',description:'Dessiner une flèche orientée'},
 {id:'note',icon:'▣',label:'Note',description:'Ajouter une note colorée à l’endroit choisi'},
 {id:'text',icon:'T',label:'Texte',description:'Ajouter un texte éditable à l’endroit choisi'},
 {id:'signature',icon:'〰',label:'Signature',description:'Insérer une signature écrite en police manuscrite'}
];
const map=new Map(tools.map(item=>[item.id,item]));
const limit=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const isDrawTool=id=>['pen','marker','line','arrow'].includes(id);
const isPlaceTool=id=>['note','text','signature'].includes(id);
function nearSegment(px,py,ax,ay,bx,by){
 const vx=bx-ax,vy=by-ay,den=vx*vx+vy*vy;
 const f=den?limit(((px-ax)*vx+(py-ay)*vy)/den,0,1):0;
 return Math.hypot(px-(ax+f*vx),py-(ay+f*vy));
}
function rawPoints(e){
 const points=Array.isArray(e.points)?e.points:[];
 if(!points.length)return [];
 const x=Number(e.x)||0,y=Number(e.y)||0,w=Number(e.w)||1,h=Number(e.h)||1;
 return points.filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite))
  .slice(0,1800).map(([a,b])=>[x+a*w,y+b*h]);
}
function fromDraft(draft){
 const pts=draft.points.filter(p=>Array.isArray(p)&&p.every(Number.isFinite));
 if(!pts.length)return null;
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
 const x=limit(Math.min(...xs),0,1080),y=limit(Math.min(...ys),0,1920);
 const w=Math.max(2,Math.min(1080-x,Math.max(...xs)-x));
 const h=Math.max(2,Math.min(1920-y,Math.max(...ys)-y));
 return {kind:'inkStroke',x,y,w,h,color:draft.color,
  inkWidth:limit(draft.width,2,70),
  inkOpacity:draft.tool==='marker'?.35:1,
  inkMode:draft.tool==='marker'?'marker':draft.tool,
  points:pts.slice(0,1800).map(([px,py])=>[limit((px-x)/w,0,1),limit((py-y)/h,0,1)]),
  start:Number(draft.start)||0,end:Number(draft.end)||5};
}
function paintPath(c,pts,width,color,opacity,mode){
 if(!pts.length)return;
 c.save();c.strokeStyle=color;c.fillStyle=color;c.lineCap='round';c.lineJoin='round';
 c.globalAlpha*=limit(opacity,0,1);c.lineWidth=limit(width,1,110);
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 if(mode==='line'||mode==='arrow'){const p=pts[pts.length-1];c.lineTo(p[0],p[1])}
 else for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
 if(pts.length===1){c.arc(pts[0][0],pts[0][1],c.lineWidth/2,0,Math.PI*2);c.fill()}
 else c.stroke();
 if(mode==='arrow'&&pts.length>1){
  const [x,y]=pts[pts.length-1],[ax,ay]=pts[0],angle=Math.atan2(y-ay,x-ax);
  const length=Math.min(88,Math.max(32,2.6*c.lineWidth));
  c.beginPath();c.moveTo(x,y);
  c.lineTo(x-Math.cos(angle-.48)*length,y-Math.sin(angle-.48)*length);
  c.moveTo(x,y);c.lineTo(x-Math.cos(angle+.48)*length,y-Math.sin(angle+.48)*length);c.stroke();
 }
 c.restore();
}
function draw(c,e){
 if(!e||e.kind!=='inkStroke')return;
 paintPath(c,rawPoints(e),e.inkWidth||12,e.color||'#d34260',
  e.inkOpacity??1,e.inkMode||'pen');
}
function drawDraft(c,draft){
 if(!draft?.points?.length)return;
 paintPath(c,draft.points,draft.width||12,draft.color||'#d34260',
  draft.tool==='marker'?.35:1,draft.tool);
}
function intersects(e,pt,range=18){
 const pts=rawPoints(e);if(!pts.length)return false;
 const threshold=limit(e.inkWidth,2,70)/2+range;
 if(pts.length===1)return Math.hypot(pt.x-pts[0][0],pt.y-pts[0][1])<threshold;
 for(let i=1;i<pts.length;i++){
  if(nearSegment(pt.x,pt.y,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1])<threshold)return true;
 }
 return false;
}
function description(id){return map.get(id)?.description||''}
window.ELOAHCanvasTools={tools,map,isDrawTool,isPlaceTool,fromDraft,draw,drawDraft,intersects,description};
})();