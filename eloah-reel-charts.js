(()=>{
'use strict';
// ELOAH · Graphiques. Module autonome Canvas2D, sans service externe ni contenu Canva.
const groups=[];
const addGroup=(name,items)=>groups.push({name,items:items.map(([id,label,type,options])=>({id:'eloah-chart-'+id,label,type,options:options||{},group:name}))});
addGroup('Diagrammes en bâtons',[
 ['vertical','Barres verticales','bar',{series:1}],
 ['horizontal','Barres horizontales','bar',{orientation:'horizontal',series:1}],
 ['multicolor','Barres multicolores','bar',{series:1,multicolor:true}],
 ['grouped','Barres groupées','bar',{series:3}],
 ['stacked','Barres empilées','bar',{stacked:true,series:3}],
 ['stacked-100','Barres empilées à 100 %','bar',{stacked:true,percent:true,series:3}],
 ['rounded','Barres arrondies','bar',{series:1,rounded:true}],
 ['horizontal-grouped','Barres horizontales groupées','bar',{orientation:'horizontal',series:3}],
 ['horizontal-stack','Barres horizontales empilées','bar',{orientation:'horizontal',stacked:true,series:3}],
 ['thin','Colonnes fines','bar',{series:1,thin:true}],
 ['lollipop','Graphique sucette','bar',{series:1,lollipop:true}],
 ['waterfall','Évolution positive et négative','bar',{series:1,diverging:true}]
]);
addGroup('Graphiques en courbe',[
 ['line','Courbe simple','line',{series:1}],
 ['multiline','Plusieurs courbes','line',{series:3}],
 ['smooth','Courbe arrondie','line',{smooth:true,series:1}],
 ['smooth-multi','Courbes arrondies multiples','line',{smooth:true,series:3}],
 ['dot-line','Courbe avec points','line',{points:true,series:1}],
 ['dashed-line','Courbe en pointillés','line',{dashed:true,series:1}],
 ['step-line','Courbe en escalier','line',{step:true,series:1}],
 ['line-area','Courbe et zone colorée','area',{series:1,opacity:.2}],
 ['line-markers','Courbes comparatives','line',{series:3,points:true}]
]);
addGroup('Graphiques circulaires et en anneaux',[
 ['pie','Graphique circulaire','pie',{hole:0}],
 ['donut','Graphique en anneau','pie',{hole:.55}],
 ['donut-thick','Anneau épais','pie',{hole:.38}],
 ['donut-thin','Anneau fin','pie',{hole:.74}],
 ['half-donut','Demi-anneau','pie',{hole:.52,half:true}],
 ['pie-exploded','Secteurs séparés','pie',{hole:0,explode:true}],
 ['pie-percentage','Répartition en pourcentage','pie',{hole:.48,showTotal:true}]
]);
addGroup('Graphiques en aires',[
 ['area','Aire simple','area',{series:1}],
 ['area-multi','Aires superposées','area',{series:3,opacity:.32}],
 ['area-stack','Aires empilées','area',{series:3,stacked:true}],
 ['area-stack-100','Aires empilées 100 %','area',{series:3,stacked:true,percent:true}],
 ['area-smooth','Aire arrondie','area',{series:1,smooth:true}],
 ['area-step','Aire en escalier','area',{series:1,step:true}],
 ['area-highlight','Aire avec marqueurs','area',{series:2,opacity:.36,points:true}]
]);
addGroup('Graphiques de dispersion',[
 ['scatter','Nuage de points','scatter',{series:1}],
 ['scatter-multi','Nuage de points multicolore','scatter',{series:3}],
 ['scatter-bubble','Diagramme à bulles','scatter',{series:2,bubbles:true}],
 ['scatter-line','Points reliés','scatter',{series:1,connect:true}],
 ['scatter-grid','Nuages comparatifs','scatter',{series:3,points:true}],
 ['scatter-large','Points visibles','scatter',{series:1,large:true}],
 ['scatter-trend','Dispersion et tendance','scatter',{series:1,trend:true}]
]);
const catalogue=groups.flatMap(x=>x.items),byId=new Map(catalogue.map(x=>[x.id,x]));
const palettes={
 original:['#3677cf','#8671c9','#e1b34f','#57a4ae','#dc7f78'],
 editorial:['#a63d57','#d7654f','#c98e9a','#789477','#28705a'],
 crew:['#c69b46','#edcb73','#a58035','#735a28','#e0b857'],
 ocean:['#267eb8','#41a9c4','#74bddb','#6977c5','#8acac7'],
 nature:['#28705a','#789477','#c0ae67','#a0be9f','#476b62'],
 pastel:['#c194dc','#7ba8df','#f1d277','#9ccdad','#d99aae']
};
const DEFAULT_DATA='Catégorie;Ventes;Objectif;Prévisions\nLundi;35;24;18\nMardi;52;32;28\nMercredi;41;36;34\nJeudi;65;45;37\nVendredi;59;51;45';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
const safeNum=x=>{const n=Number(String(x).trim().replace(/\s/g,'').replace(/,/,'.'));return Number.isFinite(n)?clamp(n,-1000000000,1000000000):0};
function parseCSVLine(line,sep){
 const out=[];let cell='',quoted=false;
 for(let i=0;i<line.length;i++){
  const ch=line[i];
  if(ch==='"'){if(quoted&&line[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(ch===sep&&!quoted){out.push(cell.trim());cell=''}
  else cell+=ch;
 }
 out.push(cell.trim());
 return out;
}
function parse(text){
 const clean=String(text||'').replace(/^\uFEFF/,'').trim();
 if(!clean)return {labels:[],names:[],values:[]};
 const lines=clean.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,80);
 const first=lines[0]||'';
 const sep=first.includes('\t')?'\t':first.includes(';')?';':',';
 const rows=lines.map(x=>parseCSVLine(x,sep));
 const header=rows[0]||[];
 const headerIsData=header.length>1&&Number.isFinite(Number((header[1]||'').replace(',','.')));
 const cols=Math.max(1,Math.min(4,header.length-1));
 const names=headerIsData?Array.from({length:cols},(_,i)=>'Série '+(i+1)):header.slice(1,cols+1).map((h,i)=>h||'Série '+(i+1));
 const data=rows.slice(headerIsData?0:1).filter(row=>row.length>1&&String(row[0]||'').trim()).slice(0,24);
 return {labels:data.map(r=>String(r[0]).slice(0,25)),names,values:data.map(r=>Array.from({length:cols},(_,i)=>safeNum(r[i+1]??0)))};
}
function migrateLegacy(e){
 if(typeof e?.dataText==='string'&&e.dataText.trim())return e.dataText;
 const values=String(e?.values||'35,55,25,45').split(/[,;\s]+/).map(Number).filter(Number.isFinite).slice(0,16);
 return 'Catégorie;Valeur\n'+(values.length?values:[35,55,25,45]).map((v,i)=>'Élément '+(i+1)+';'+v).join('\n');
}
function template(e){
 if(byId.has(e?.variant))return byId.get(e.variant);
 return byId.get(e?.variant==='pie'?'eloah-chart-pie':'eloah-chart-vertical');
}
function settings(id){
 const def=byId.get(id)||catalogue[0];
 return {variant:def.id,kind:'chart',dataText:DEFAULT_DATA,chartPalette:'original',chartTitle:'Résultats',chartShowTitle:false,chartShowGrid:true,chartShowLegend:def.options.series>1,chartShowValues:false,chartBackground:'#ffffff',chartFontSize:24,values:'35,52,41,65,59'};
}
function dataset(e){
 const d=parse(migrateLegacy(e)),def=template(e);
 if(!d.labels.length)return parse(DEFAULT_DATA);
 if(def.options.series===1)return {...d,names:d.names.slice(0,1),values:d.values.map(x=>x.slice(0,1))};
 return {...d,names:d.names.slice(0,3),values:d.values.map(x=>x.slice(0,3))};
}
function colors(e){return palettes[e?.chartPalette]||palettes.original}
function short(v){
 const n=Number(v);
 if(!Number.isFinite(n))return '0';
 if(Math.abs(n)>=1e6)return (n/1e6).toFixed(1)+'M';
 if(Math.abs(n)>=1e3)return (n/1e3).toFixed(1)+'k';
 return Number(n.toFixed(1)).toLocaleString('fr-FR');
}
function canvasLine(ctx,path,color,width=5,dash=[]){
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke(path);ctx.setLineDash([]);
}
function roundBar(c,x,y,w,h,color,r=0){
 if(w<=0||h<=0)return;
 c.fillStyle=color;
 c.beginPath();
 c.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
 c.fill();
}
function guide(c,e,min,max,vertical=false){
 if(e.chartShowGrid===false)return;
 c.save();c.lineWidth=2;c.strokeStyle='#e5e9ef';c.setLineDash([8,11]);
 if(vertical){for(let k=0;k<=4;k++){const x=174+625*k/4;c.beginPath();c.moveTo(x,206);c.lineTo(x,772);c.stroke()}}
 else{for(let k=0;k<=4;k++){const y=215+510*k/4;c.beginPath();c.moveTo(160,y);c.lineTo(870,y);c.stroke()}}
 c.restore();
}
function text(c,s,x,y,size=25,color='#546171',align='center',weight='500'){
 c.textAlign=align;c.textBaseline='middle';c.font=weight+' '+size+'px system-ui,Arial';
 c.fillStyle=color;c.fillText(String(s),x,y,280);
}
function axisRange(v,stacked=false,percent=false){
 if(percent)return {min:0,max:100};
 const all=stacked?v.map(r=>r.reduce((a,n)=>a+Math.max(0,n),0)):v.flat();
 const mn=Math.min(0,...all),mx=Math.max(1,...all);
 const span=mx-mn||1,pad=span*.08;
 return {min:mn<0?mn-pad:0,max:mx+pad};
}
function drawBars(c,e,d,def,colorList){
 const opts=def.options,series=Math.max(1,Math.min(opts.series||1,d.names.length)),rows=d.values;
 if(!rows.length)return;
 const vertical=opts.orientation!=='horizontal';
 const range=axisRange(rows.map(r=>r.slice(0,series)),opts.stacked,opts.percent);
 const mapY=v=>725-(v-range.min)/(range.max-range.min)*493;
 const mapX=v=>174+(v-range.min)/(range.max-range.min)*625;
 const zero=vertical?mapY(0):mapX(0);
 guide(c,e,range.min,range.max,!vertical);
 const len=rows.length,gap=vertical?660/len:540/len;
 c.save();
 rows.forEach((row,i)=>{
  const vals=row.slice(0,series);
  const total=vals.reduce((a,v)=>a+Math.max(0,v),0)||1;
  let cumulative=0;
  for(let j=0;j<series;j++){
   const orig=vals[j]||0,v=opts.percent?Math.max(0,orig)/total*100:orig;
   const grouped=!opts.stacked&&series>1;
   const count=grouped?series:1;
   const cell=gap*.76/count;
   const color=opts.multicolor?colorList[i%colorList.length]:colorList[j%colorList.length];
   if(vertical){
    const cx=180+i*gap+gap*.12+(grouped?j*cell:0);
    const low=opts.stacked?cumulative:0,high=low+v,top=Math.min(mapY(low),mapY(high)),h=Math.abs(mapY(low)-mapY(high));
    if(opts.lollipop){
     c.beginPath();c.moveTo(cx+cell*.34,zero);c.lineTo(cx+cell*.34,mapY(v));c.strokeStyle=color;c.lineWidth=5;c.stroke();
     c.fillStyle=color;c.beginPath();c.arc(cx+cell*.34,mapY(v),13,0,Math.PI*2);c.fill();
    }else roundBar(c,cx,top,Math.max(7,cell*(opts.thin?.5:.78)),Math.max(1,h),color,opts.rounded?17:4);
    if(e.chartShowValues&&(!opts.stacked||j===series-1))text(c,short(opts.stacked?orig:v),cx+cell*.4,Math.max(184,top-21),20,'#555e67');
   }else{
    const cy=230+i*gap+gap*.09+(grouped?j*cell:0);
    const low=opts.stacked?cumulative:0,high=low+v,xx=Math.min(mapX(low),mapX(high)),ww=Math.abs(mapX(low)-mapX(high));
    roundBar(c,xx,cy,Math.max(1,ww),Math.max(7,cell*.78),color,7);
    if(e.chartShowValues&&(!opts.stacked||j===series-1))text(c,short(orig),Math.min(865,mapX(high)+22),cy+cell*.4,20,'#555e67','left');
   }
   if(opts.stacked)cumulative+=v;
  }
  if(vertical)text(c,d.labels[i].slice(0,10),180+i*gap+gap*.42,781,Math.min(23,160/Math.max(1,len/3)));
  else text(c,d.labels[i].slice(0,12),155,230+i*gap+gap*.5,19,'#4b5565','right');
 });
 c.restore();
}
function pathThrough(c,points,smooth=false,step=false){
 if(!points.length)return;
 c.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++){
  const [x,y]=points[i],prev=points[i-1];
  if(step){const middle=(x+prev[0])/2;c.lineTo(middle,prev[1]);c.lineTo(middle,y);c.lineTo(x,y)}
  else if(smooth){const mid=(x+prev[0])/2;c.bezierCurveTo(mid,prev[1],mid,y,x,y)}
  else c.lineTo(x,y);
 }
}
function drawLines(c,e,d,def,colors){
 const o=def.options,isArea=def.type==='area',series=Math.min(o.series||1,d.names.length),rows=d.values;
 if(!rows.length)return;
 const ranges=axisRange(rows.map(r=>r.slice(0,series)),!!o.stacked,!!o.percent);
 const y=v=>724-(v-ranges.min)/(ranges.max-ranges.min)*490,xx=i=>180+i*(685/Math.max(1,rows.length-1));
 guide(c,e,ranges.min,ranges.max);
 for(let j=0;j<series;j++){
  let acc=0;
  const coords=rows.map((row,i)=>{let val=row[j]||0;if(o.stacked){val=row.slice(0,j+1).reduce((a,b)=>a+Math.max(0,b),0);if(o.percent){const sum=row.slice(0,series).reduce((a,b)=>a+Math.max(0,b),0)||1;val=val/sum*100}}return [xx(i),y(val)]});
  c.save();
  if(isArea){
   c.beginPath();pathThrough(c,coords,!!o.smooth,!!o.step);
   c.lineTo(coords[coords.length-1][0],y(0));c.lineTo(coords[0][0],y(0));c.closePath();
   c.fillStyle=colors[j%colors.length];c.globalAlpha=o.opacity||(.23+j*.06);c.fill();c.globalAlpha=1;
  }
  c.beginPath();pathThrough(c,coords,!!o.smooth,!!o.step);
  c.strokeStyle=colors[j%colors.length];c.lineWidth=7;c.lineJoin='round';c.lineCap='round';c.setLineDash(o.dashed?[17,12]:[]);c.stroke();c.setLineDash([]);
  if(o.points||e.chartShowValues){coords.forEach(([x,cy],i)=>{c.fillStyle=colors[j%colors.length];c.beginPath();c.arc(x,cy,10,0,Math.PI*2);c.fill();if(e.chartShowValues)text(c,short(rows[i][j]),x,cy-22,18,'#516071')})}
  c.restore();
 }
 rows.forEach((r,i)=>text(c,d.labels[i].slice(0,10),xx(i),785,21,'#566271'));
}
function drawPie(c,e,d,def,colors){
 const o=def.options;const sums=d.values.map(r=>Math.max(0,r[0]||0));const total=sums.reduce((a,b)=>a+b,0);
 if(!total){text(c,'Aucune valeur positive',500,500,29);return}
 const half=!!o.half,centerY=half?670:490,r=half?340:315,hole=clamp(o.hole||0,0,.89)*r;
 let angle=-Math.PI/2,turn=half?Math.PI:Math.PI*2;
 if(half)angle=Math.PI;
 sums.forEach((value,i)=>{
  if(value<=0)return;
  const portion=value/total*turn,next=angle+portion,middle=(angle+next)/2;
  const shift=o.explode?18:0,cx=500+Math.cos(middle)*shift,cy=centerY+Math.sin(middle)*shift;
  c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r,angle,next);c.closePath();c.fillStyle=colors[i%colors.length];c.fill();
  if(e.chartShowValues&&portion>.2){
   const tx=cx+Math.cos(middle)*r*.72,ty=cy+Math.sin(middle)*r*.72;
   text(c,Math.round(value/total*100)+'%',tx,ty,23,'#fff','center','800');
  }
  angle=next;
 });
 if(hole>0){c.fillStyle=e.chartBackground||'#ffffff';c.beginPath();c.arc(500,centerY,hole,0,2*Math.PI);c.fill()}
 if(o.showTotal){text(c,'TOTAL',500,centerY-24,28,'#6f7581');text(c,short(total),500,centerY+24,57,'#273447','center','800')}
 if(e.chartShowLegend!==false)d.labels.slice(0,10).forEach((label,i)=>{
  const yy=half?834+(i%4)*33:844+(i%4)*33,xx=95+Math.floor(i/4)*300;
  c.fillStyle=colors[i%colors.length];c.fillRect(xx,yy-8,18,18);text(c,label.slice(0,14),xx+28,yy,21,'#556271','left');
 });
}
function drawScatter(c,e,d,def,colors){
 const opt=def.options,rows=d.values,series=Math.min(opt.series||1,d.names.length);
 if(!rows.length)return;
 guide(c,e,0,100);
 const xs=d.labels.map((label,i)=>Number.isFinite(Number(label))?Number(label):i+1);
 const minX=Math.min(...xs),maxX=Math.max(...xs),all=rows.flatMap(row=>row.slice(0,series));
 const minY=Math.min(0,...all),maxY=Math.max(1,...all),spanX=maxX-minX||1,spanY=maxY-minY||1;
 const px=x=>180+((x-minX)/spanX)*680,py=y=>725-((y-minY)/spanY)*490;
 for(let j=0;j<series;j++){
  const points=rows.map((r,i)=>[px(xs[i]),py(r[j]||0)]);
  if(opt.connect){c.beginPath();pathThrough(c,points);c.strokeStyle=colors[j%colors.length];c.lineWidth=5;c.stroke()}
  points.forEach(([x,y],i)=>{c.fillStyle=colors[j%colors.length];c.beginPath();let radius=opt.bubbles?clamp(Math.abs(rows[i][j]||0)/3,8,43):opt.large?17:11;c.arc(x,y,radius,0,2*Math.PI);c.globalAlpha=.76;c.fill();c.globalAlpha=1});
  if(opt.trend&&points.length>1){
   const n=points.length,means=[0,1].map(k=>points.reduce((a,p)=>a+p[k],0)/n);
   let cov=0,variance=0;points.forEach(p=>{cov+=(p[0]-means[0])*(p[1]-means[1]);variance+=(p[0]-means[0])**2});
   const slope=variance?cov/variance:0,intercept=means[1]-slope*means[0];
   c.beginPath();c.moveTo(180,intercept+slope*180);c.lineTo(860,intercept+slope*860);c.strokeStyle=colors[j];c.lineWidth=4;c.setLineDash([15,9]);c.stroke();c.setLineDash([]);
  }
 }
 for(let i=0;i<=4;i++)text(c,short(minX+i*spanX/4),180+i*680/4,785,18,'#67778b');
}
function render(c,e){
 const d=dataset(e),def=template(e),colorList=colors(e);
 c.save();
 const width=Math.max(80,Number(e.w)||780),height=Math.max(80,Number(e.h)||580);
 c.translate(Number(e.x)||0,Number(e.y)||0);c.scale(width/1000,height/1000);
 c.fillStyle=e.chartBackground||'#ffffff';c.fillRect(0,0,1000,1000);
 c.font='26px system-ui';c.textAlign='center';c.textBaseline='middle';
 if(e.chartShowTitle)text(c,String(e.chartTitle||'Graphique').slice(0,65),500,98,clamp(e.chartFontSize||34,20,65),'#25364a','center','750');
 if(def.type==='pie')drawPie(c,e,d,def,colorList);
 else if(def.type==='bar')drawBars(c,e,d,def,colorList);
 else if(def.type==='line'||def.type==='area')drawLines(c,e,d,def,colorList);
 else if(def.type==='scatter')drawScatter(c,e,d,def,colorList);
 if(def.type!=='pie'&&e.chartShowLegend!==false&&d.names.length>1){
  d.names.slice(0,3).forEach((name,i)=>{
   const left=120+i*285;
   c.fillStyle=colorList[i%colorList.length];c.fillRect(left,898,24,17);text(c,name.slice(0,16),left+35,907,20,'#48586d','left');
  });
 }
 c.restore();
}
function sector(cx,cy,r,start,end,color){
 const sx=cx+Math.cos(start)*r,sy=cy+Math.sin(start)*r,ex=cx+Math.cos(end)*r,ey=cy+Math.sin(end)*r;
 return '<path d="M'+cx+' '+cy+'L'+sx.toFixed(1)+' '+sy.toFixed(1)+'A'+r+' '+r+' 0 '+(end-start>Math.PI?1:0)+' 1 '+ex.toFixed(1)+' '+ey.toFixed(1)+'Z" fill="'+color+'"/>';
}
function thumbnail(id){
 const def=byId.get(id);if(!def)return '';
 const colors=palettes.original,opts=def.options;
 let parts='',v=[.68,.44,.86,.56,.77,.31],ys=[113,85,117,64,105,71];
 if(def.type==='bar'){
  const horizontal=opts.orientation==='horizontal';
  for(let i=0;i<(horizontal?5:6);i++){
   const cl=colors[opts.multicolor?i%5:0];
   if(horizontal)parts+='<rect x="28" y="'+(24+i*27)+'" width="'+(v[i]*136)+'" height="17" rx="2" fill="'+cl+'"/>';
   else{
    const width=opts.series>1?10:18;
    for(let j=0;j<(opts.series>1?3:1);j++)parts+='<rect x="'+(27+i*25+j*width)+'" y="'+(160-v[i]*123*(.7+j*.14))+'" width="'+(width-1)+'" height="'+(v[i]*123*(.7+j*.14))+'" rx="2" fill="'+colors[j]+'"/>';
   }
  }
 }else if(def.type==='line'||def.type==='area'){
  for(let j=0;j<(opts.series>1?3:1);j++){
   const coords=ys.map((y,i)=>[20+i*30,y+j*6-(j===2?11:0)]);
   const points=coords.map(p=>p.join(',')).join(' ');
   if(def.type==='area')parts+='<polygon points="20,164 '+points+' 170,164" fill="'+colors[j]+'" opacity=".3"/>';
   parts+='<polyline points="'+points+'" stroke="'+colors[j]+'" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
   if(opts.points)parts+=coords.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="4.5" fill="'+colors[j]+'"/>').join('');
  }
 }else if(def.type==='pie'){
  let a=-Math.PI/2;const sizes=[.51,.27,.14,.08];for(let i=0;i<4;i++){const next=a+sizes[i]*Math.PI*2;parts+=sector(95,95,65,a,next,colors[i]);a=next}
  if(opts.hole)parts+='<circle cx="95" cy="95" r="'+(65*opts.hole)+'" fill="#fff"/>';
 }else if(def.type==='scatter'){
  parts=Array.from({length:26},(_,i)=>{
   const x=23+i*19%148,y=24+((i*63+i*i*11)%141),size=opts.bubbles?4+i%4*2:4.5;
   return '<circle cx="'+x+'" cy="'+y+'" r="'+size+'" fill="'+colors[i%(opts.series>1?3:1)]+'" opacity=".75"/>';
  }).join('');
 }
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="190" height="190" viewBox="0 0 190 190"><rect width="190" height="190" rx="9" fill="#fff"/>'+parts+'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
window.ELOAHCharts={groups,catalogue,byId,palettes,parse,dataset,settings,migrateLegacy,render,thumbnail,DEFAULT_DATA};
})();