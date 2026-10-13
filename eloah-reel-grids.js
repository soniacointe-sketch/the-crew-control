(()=>{
'use strict';
// ELOAH GRID STUDIO : compositions originales, chaque cellule est un emplacement photo.
const frames=window.ELOAHFrames;
if(!frames){console.warn('Cadres indisponibles, galerie Grilles non chargée');return}
const groups=[];
const byId=new Map(),thumbCache=new Map();
const presets=[
 {name:'Grilles classiques',prefix:'classiques',format:'square'},
 {name:'Deux & trois photos',prefix:'duos',format:'square'},
 {name:'Photo principale',prefix:'vedette',format:'square'},
 {name:'Mosaïques créatives',prefix:'mosaiques',format:'square'},
 {name:'Bande film & storyboard',prefix:'film',format:'wide'},
 {name:'Portraits & stories',prefix:'stories',format:'portrait'},
 {name:'Paysages & panoramas',prefix:'paysages',format:'wide'},
 {name:'Magazine & éditorial',prefix:'magazine',format:'portrait'},
 {name:'Photos de groupe',prefix:'groupes',format:'square'},
 {name:'The Crew · danse',prefix:'crew',format:'portrait'},
 {name:'Power & Glam · éditorial',prefix:'glam',format:'portrait'}
];
for(const p of presets)groups.push({...p,items:[]});
const fmt={square:{w:810,h:810},portrait:{w:650,h:1070},wide:{w:970,h:560},story:{w:870,h:1540}};
function rect(x,y,w,h){return {x,y,w,h,shape:'rect'}}
function widths(weights){
 const sum=weights.reduce((a,b)=>a+b,0);
 let c=0;return weights.map((weight,i)=>{const from=Math.round(c/sum*1000);c+=weight;return [from,Math.round(c/sum*1000)-from]})
}
function grid(cols,rows,wx=null,wy=null){
 const x=widths(wx||Array(cols).fill(1)),y=widths(wy||Array(rows).fill(1));
 return y.flatMap(([sy,sh])=>x.map(([sx,sw])=>rect(sx,sy,sw,sh)))
}
function splitRows(leftFrac,n,right=true){
 const x=Math.round(1000*leftFrac),minor=grid(1,n);
 return [rect(right?0:x,0,right?x:1000-x,1000),...minor.map(s=>rect(right?x:0,s.y,right?1000-x:x,s.h))]
}
function splitColumns(topFrac,n,top=true){
 const y=Math.round(topFrac*1000),small=grid(n,1);
 return [rect(0,top?0:y,1000,top?y:1000-y),...small.map(s=>rect(s.x,top?y:0,s.w,top?1000-y:y))]
}
function mixed(seed,count){
 let cells=[rect(0,0,1000,1000)];
 for(let step=0;step<count-1;step++){
  const order=cells.map((c,i)=>({i,area:c.w*c.h,weight:1+Math.sin((seed+5)*11+i*7+step*3)*.12})).sort((a,b)=>b.area*b.weight-a.area*a.weight);
  let target=order.find(({i})=>Math.max(cells[i].w,cells[i].h)>250&&Math.min(cells[i].w,cells[i].h)>170);
  if(!target)break;
  const c=cells[target.i],vertical=c.w>c.h*1.08?true:c.h>c.w*1.08?false:(seed+step)%2===0;
  const fraction=.3+(((seed*13+step*7)%5)/10);
  let a,b;
  if(vertical){const first=Math.round(c.w*fraction);a=rect(c.x,c.y,first,c.h);b=rect(c.x+first,c.y,c.w-first,c.h)}
  else{const first=Math.round(c.h*fraction);a=rect(c.x,c.y,c.w,first);b=rect(c.x,c.y+first,c.w,c.h-first)}
  if([a,b].some(t=>t.w<100||t.h<100))break;
  cells.splice(target.i,1,a,b);
 }
 return cells;
}
function add(group,label,cells,format=null){
 const def=groups[group],slots=cells.map(c=>rect(Math.round(c.x),Math.round(c.y),Math.round(c.w),Math.round(c.h)));
 if(slots.length<2||slots.length>24||slots.some(s=>s.w<45||s.h<45||s.x<0||s.y<0||s.x+s.w>1000||s.y+s.h>1000))return;
 const id='eloah-grid-'+def.prefix+'-'+String(def.items.length+1).padStart(2,'0');
 const size=fmt[format||def.format]||fmt.square;
 const item={id,label,group:def.name,shape:'rect',layout:'custom-grid',customSlots:slots,customDims:size,accent:'#ffffff',chrome:'clean',isGrid:true,defaultGap:12};
 def.items.push(item);byId.set(id,item);frames.byId.set(id,item);
}
// Base grid patterns
for(let rows=1;rows<=5;rows++)for(let cols=1;cols<=6;cols++){
 if(cols===1&&rows===1||cols*rows>20)continue;
 add(0,cols+' colonnes · '+rows+' rangée'+(rows>1?'s':''),grid(cols,rows),cols>rows+1?'wide':rows>cols+1?'portrait':'square');
}
for(const arr of [[.5,.5],[.32,.68],[.68,.32],[.25,.75],[.75,.25],[.4,.6],[.6,.4],[.2,.8],[.8,.2]]){
 add(1,'Duo vertical '+Math.round(arr[0]*100)+'/'+Math.round(arr[1]*100),grid(2,1,arr),'portrait');
 add(1,'Duo horizontal '+Math.round(arr[0]*100)+'/'+Math.round(arr[1]*100),grid(1,2,null,arr),'wide');
}
for(const weights of [[.25,.5,.25],[.5,.25,.25],[.25,.25,.5],[.2,.3,.5],[.5,.3,.2],[.3,.4,.3],[.15,.7,.15]]){
 add(1,'Trio portrait '+weights.map(n=>Math.round(n*100)).join(' · '),grid(3,1,weights),'wide');
 add(1,'Trio paysage '+weights.map(n=>Math.round(n*100)).join(' · '),grid(1,3,null,weights),'portrait');
}
for(const fraction of [.35,.45,.55,.65]){
 for(let n=2;n<=5;n++){
  add(2,'Grande photo gauche + '+n,splitRows(fraction,n,true),'square');
  add(2,'Grande photo droite + '+n,splitRows(fraction,n,false),'square');
 }
}
for(const fraction of [.38,.55])for(let n=2;n<=5;n++){
 add(2,'Une photo en haut + '+n,splitColumns(fraction,n,true),'square');
 add(2,'Une photo en bas + '+n,splitColumns(fraction,n,false),'square');
}
for(let seed=1;seed<=34;seed++){
 const count=3+(seed*7%9);
 add(3,'Mosaïque '+String(seed).padStart(2,'0')+' · '+count+' images',mixed(seed,count),seed%5===0?'portrait':seed%4===0?'wide':'square');
}
for(let n=3;n<=8;n++){
 add(4,'Pellicule '+n+' plans',grid(n,1),'wide');
 add(4,'Storyboard '+n*2+' plans',grid(n,2),'wide');
}
for(let n=3;n<=7;n++)add(4,'Montage '+n*3+' scènes',grid(n,3),'wide');
for(let cols=2;cols<=4;cols++)for(let rows=1;rows<=5;rows++){
 add(5,'Story '+cols+' × '+rows,grid(cols,rows),'portrait');
}
for(let n=2;n<=5;n++){
 add(5,'Portrait principal · '+(n+1)+' cases',splitRows(.64,n,true),'portrait');
 add(5,'Portrait à droite · '+(n+1)+' cases',splitRows(.64,n,false),'portrait');
}
for(let rows=2;rows<=6;rows++){
 add(6,rows+' paysages empilés',grid(1,rows),'wide');
 add(6,rows*2+' paysages',grid(2,rows),'wide');
}
for(let n=2;n<=6;n++){
 add(6,'Bandeau supérieur '+(n+1)+' photos',splitColumns(.42,n,true),'wide');
 add(6,'Bandeau inférieur '+(n+1)+' photos',splitColumns(.42,n,false),'wide');
}
for(let seed=51;seed<=75;seed++){
 const count=3+(seed*3%8);
 add(7,'Éditorial '+(seed-50)+' · '+count+' images',mixed(seed,count),'portrait');
}
for(const [cols,rows] of [[3,3],[3,4],[4,3],[4,4],[5,3],[5,4],[6,3],[6,2],[2,6],[2,5]]){
 add(8,'Groupe '+cols+' × '+rows,grid(cols,rows),'square');
}
for(let i=1;i<=12;i++)add(8,'Équipe en vedette '+i,mixed(i+120,5+i%7),'square');
for(const [cols,rows] of [[2,2],[2,3],[3,2],[3,3],[4,2],[4,3],[3,4]]){
 add(9,'Crew collectif '+cols+' × '+rows,grid(cols,rows),'portrait');
}
for(let n=2;n<=7;n++){
 add(9,'Crew scène principale + '+n,splitRows(.62,n,n%2===0),'portrait');
}
for(let i=1;i<=10;i++)add(9,'Chorégraphie '+i,mixed(i+208,3+i%7),'portrait');
for(let i=1;i<=18;i++){
 const n=3+i%7;
 add(10,'Power & Glam · revue '+i,mixed(302+i,n),i%4===0?'square':'portrait');
}
for(let n=2;n<=5;n++){
 add(10,'Portraits éditoriaux '+n,grid(n,1),'portrait');
 add(10,'Histoire en '+n+' chapitres',grid(1,n),'portrait');
}
function thumbnail(item){
 if(thumbCache.has(item.id))return thumbCache.get(item.id);
 const slots=frames.slots(item,item.defaultGap);
 const defs='<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#bfe7ef"/><stop offset="1" stop-color="#e7f3ee"/></linearGradient></defs>';
 const items=slots.map(s=>{
 const x=s.x,y=s.y,w=s.w,h=s.h;
 const hill='M'+x+' '+(y+h*.79)+' Q'+(x+w*.36)+' '+(y+h*.53)+' '+(x+w*.64)+' '+(y+h*.77)+' Q'+(x+w*.83)+' '+(y+h*.89)+' '+(x+w)+' '+(y+h*.73)+' V'+(y+h)+'H'+x+'Z';
 const hill2='M'+x+' '+(y+h*.87)+' Q'+(x+w*.31)+' '+(y+h*.71)+' '+(x+w*.57)+' '+(y+h*.9)+' Q'+(x+w*.8)+' '+(y+h*.98)+' '+(x+w)+' '+(y+h*.83)+'V'+(y+h)+'H'+x+'Z';
 return '<g><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#sky)"/><path d="'+hill+'" fill="#a2d67a"/><path d="'+hill2+'" fill="#64aa51"/>'+
 '<ellipse cx="'+(x+w*.48)+'" cy="'+(y+h*.31)+'" rx="'+Math.min(110,w*.23)+'" ry="'+Math.min(40,h*.08)+'" fill="#ffffffa4"/></g>';
 }).join('');
 const str='<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 1000 1000">'+defs+items+'</svg>';
 const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str);
 thumbCache.set(item.id,url);return url;
}
window.ELOAHGrids={groups,catalogue:groups.flatMap(g=>g.items),byId,thumbnail,formats:fmt};
})();