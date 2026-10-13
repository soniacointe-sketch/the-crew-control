(()=>{
'use strict';
// ELOAH Shapes. Original vector shapes, reusable across Reel Studio; no Canva artwork.
const groups=[],byId=new Map(),thumbnailCache=new Map();
function group(name,items){
 const list=items.map(([id,label,generator,params={}])=>{
  const value={id:'shape-'+id,label,group:name,generator,params};
  if(byId.has(value.id))throw Error('Forme en doublon : '+value.id);
  byId.set(value.id,value);return value;
 });
 groups.push({name,items:list});
}
group('Lignes',[
 ['line-solid','Ligne droite','line',{style:'solid'}],['line-thin','Ligne fine','line',{style:'thin'}],
 ['line-thick','Ligne épaisse','line',{style:'thick'}],['line-dash','Ligne tirets','line',{style:'dash'}],
 ['line-dot','Ligne pointillée','line',{style:'dot'}],['line-double','Lignes parallèles','doubleline'],
 ['line-vertical','Ligne verticale','line',{style:'vertical'}],['line-diagonal','Ligne diagonale','line',{style:'diag'}],
 ['line-arrow','Ligne fléchée','line',{style:'arrow'}],['line-left','Flèche vers la gauche','line',{style:'left'}],
 ['line-double-arrow','Double flèche fine','line',{style:'both'}],['line-arrow-dash','Flèche en tirets','line',{style:'arrowdash'}],
 ['line-elbow','Ligne en angle','line',{style:'elbow'}],['line-step','Ligne à deux angles','line',{style:'step'}],
 ['line-wave','Ligne ondulée','line',{style:'wave'}],['line-zigzag','Ligne zigzag','line',{style:'zigzag'}],
 ['line-arc','Arc','line',{style:'arc'}],['line-curve','Courbe','line',{style:'curve'}],
 ['line-hook','Flèche courbe','line',{style:'hook'}],['line-bracket','Accolade','line',{style:'bracket'}],
 ['line-measure','Cotation','line',{style:'measure'}],['line-loop','Boucle','line',{style:'loop'}]
]);
group('Formes de base',[
 ['square','Carré','base',{shape:'square'}],['rectangle','Rectangle','base',{shape:'rectangle'}],
 ['rounded','Carré arrondi','base',{shape:'rounded'}],['round-rect','Rectangle arrondi','base',{shape:'round-rect'}],
 ['circle','Cercle','base',{shape:'circle'}],['ellipse','Ovale','base',{shape:'ellipse'}],
 ['triangle-up','Triangle','base',{shape:'triangle-up'}],['triangle-down','Triangle inversé','base',{shape:'triangle-down'}],
 ['triangle-left','Triangle gauche','base',{shape:'triangle-left'}],['triangle-right','Triangle droite','base',{shape:'triangle-right'}],
 ['diamond','Losange','base',{shape:'diamond'}],['parallelogram','Parallélogramme','base',{shape:'parallelogram'}],
 ['trapezoid','Trapèze','base',{shape:'trapezoid'}],['semicircle','Demi-cercle','base',{shape:'semicircle'}],
 ['quarter','Quart de cercle','base',{shape:'quarter'}],['capsule','Capsule','base',{shape:'capsule'}],
 ['pill-vertical','Pilule verticale','base',{shape:'pill-vertical'}],['arch','Arche','base',{shape:'arch'}],
 ['cut-corner','Coins coupés','base',{shape:'cut-corner'}],['droplet','Goutte','base',{shape:'droplet'}],
 ['cloud','Nuage','base',{shape:'cloud'}],['cross','Croix','base',{shape:'cross'}],
 ['ring','Anneau','base',{shape:'ring'}],['crescent','Croissant','base',{shape:'crescent'}],
 ['pie-quarter','Secteur circulaire','base',{shape:'pie-quarter'}],['heart','Cœur','base',{shape:'heart'}]
]);
const polys=[];
for(let n=3;n<=16;n++)polys.push(['poly-'+n,'Polygone '+n+' côtés','polygon',{sides:n}]);
polys.push(['poly-hex-wide','Hexagone aplati','polygon',{sides:6,sy:.7}],['poly-long','Hexagone allongé','polygon',{sides:6,sx:1,sy:.52}],['poly-stop','Panneau stop','polygon',{sides:8,rotation:Math.PI/8}],['poly-kite','Cerf-volant','base',{shape:'kite'}],['poly-dart','Flèche découpée','base',{shape:'dart'}]);
group('Polygones',polys);
const stars=[];
for(let n=4;n<=16;n++)stars.push(['star-'+n,'Étoile '+n+' branches','star',{sides:n,inner:.43}]);
for(let n of [5,6,8,10,12,16,20])stars.push(['burst-'+n,'Soleil '+n+' rayons','star',{sides:n,inner:.66}]);
stars.push(['sparkle-4','Étincelle 4 pointes','star',{sides:4,inner:.2}],['sparkle-8','Étincelle 8 pointes','star',{sides:8,inner:.2}],['burst-24','Explosion 24 pointes','star',{sides:24,inner:.73}]);
group('Étoiles',stars);
group('Flèches',[
 ['arrow-right','Flèche droite','arrow',{dir:'right'}],['arrow-left','Flèche gauche','arrow',{dir:'left'}],
 ['arrow-up','Flèche haut','arrow',{dir:'up'}],['arrow-down','Flèche bas','arrow',{dir:'down'}],
 ['arrow-ne','Flèche haut-droite','arrow',{dir:'ne'}],['arrow-nw','Flèche haut-gauche','arrow',{dir:'nw'}],
 ['arrow-se','Flèche bas-droite','arrow',{dir:'se'}],['arrow-sw','Flèche bas-gauche','arrow',{dir:'sw'}],
 ['arrow-double-h','Double flèche horizontale','arrow',{dir:'double-h'}],
 ['arrow-double-v','Double flèche verticale','arrow',{dir:'double-v'}],
 ['arrow-four','Flèche quatre directions','arrow',{dir:'four'}],
 ['arrow-chevron','Chevron droit','arrow',{dir:'chevron'}],
 ['arrow-chevron-left','Chevron gauche','arrow',{dir:'chevron-left'}],
 ['arrow-circle','Flèche circulaire','arrow',{dir:'circle'}],
 ['arrow-turn','Flèche demi-tour','arrow',{dir:'turn'}],
 ['arrow-bent','Flèche coudée','arrow',{dir:'bent'}],
 ['arrow-curved','Flèche arrondie','arrow',{dir:'curved'}],
 ['arrow-thick','Grosse flèche','arrow',{dir:'thick'}],
 ['arrow-notched','Flèche ruban','arrow',{dir:'notched'}],
 ['arrow-ribbon','Ruban fléché','arrow',{dir:'ribbon'}],
 ['arrow-merge','Deux flèches réunies','arrow',{dir:'merge'}],
 ['arrow-split','Deux flèches séparées','arrow',{dir:'split'}],
 ['arrow-uptrend','Tendance montante','arrow',{dir:'uptrend'}],
 ['arrow-downtrend','Tendance descendante','arrow',{dir:'downtrend'}]
]);
group('Formes de logigramme',[
 ['flow-process','Processus','flow',{type:'process'}],['flow-end','Début et fin','flow',{type:'end'}],
 ['flow-decision','Décision','flow',{type:'decision'}],['flow-data','Entrée ou sortie','flow',{type:'data'}],
 ['flow-document','Document','flow',{type:'document'}],['flow-documents','Documents','flow',{type:'documents'}],
 ['flow-database','Base de données','flow',{type:'database'}],['flow-storage','Stockage','flow',{type:'storage'}],
 ['flow-display','Affichage','flow',{type:'display'}],['flow-delay','Délai','flow',{type:'delay'}],
 ['flow-preparation','Préparation','flow',{type:'preparation'}],
 ['flow-manual-input','Saisie manuelle','flow',{type:'manual-input'}],
 ['flow-manual-operation','Opération manuelle','flow',{type:'manual-operation'}],
 ['flow-predefined','Sous-processus','flow',{type:'predefined'}],
 ['flow-connector','Connecteur','flow',{type:'connector'}],
 ['flow-off-page','Renvoi de page','flow',{type:'offpage'}],
 ['flow-comment','Annotation','flow',{type:'comment'}],
 ['flow-or','Opérateur OU','flow',{type:'or'}],
 ['flow-sum','Somme','flow',{type:'sum'}]
]);
group('Bulles & étiquettes',[
 ['bubble-round','Bulle ronde','bubble',{type:'round'}],['bubble-rect','Bulle carrée','bubble',{type:'rect'}],
 ['bubble-chat','Bulle discussion','bubble',{type:'chat'}],['bubble-left','Bulle vers la gauche','bubble',{type:'left'}],
 ['bubble-right','Bulle vers la droite','bubble',{type:'right'}],
 ['bubble-thought','Bulle pensée','bubble',{type:'thought'}],
 ['bubble-cloud','Nuage de parole','bubble',{type:'cloud'}],
 ['bubble-star','Bulle explosion','bubble',{type:'star'}],
 ['bubble-banner','Bandeau','bubble',{type:'banner'}],
 ['bubble-ribbon','Ruban','bubble',{type:'ribbon'}],
 ['bubble-ticket','Étiquette ticket','bubble',{type:'ticket'}],
 ['bubble-tag','Étiquette prix','bubble',{type:'tag'}],
 ['bubble-flag','Fanion','bubble',{type:'flag'}],
 ['bubble-marker','Marqueur de lieu','bubble',{type:'marker'}],
 ['bubble-pin','Épingle','bubble',{type:'pin'}],
 ['bubble-burst','Pastille soleil','bubble',{type:'burst'}],
 ['bubble-speech-square','Bulle carrée arrondie','bubble',{type:'speech-square'}]
]);
group('Cœurs & symboles',[
 ['symbol-heart','Cœur classique','base',{shape:'heart'}],['symbol-double-heart','Cœurs doubles','symbol',{type:'doubleheart'}],
 ['symbol-broken-heart','Cœur brisé','symbol',{type:'brokenheart'}],
 ['symbol-infinity','Infini','symbol',{type:'infinity'}],
 ['symbol-lightning','Éclair','symbol',{type:'lightning'}],
 ['symbol-sun','Soleil','symbol',{type:'sun'}],
 ['symbol-moon','Lune','base',{shape:'crescent'}],
 ['symbol-check','Coche','symbol',{type:'check'}],
 ['symbol-plus','Plus','base',{shape:'cross'}],
 ['symbol-x','Croix X','symbol',{type:'x'}],
 ['symbol-question','Point d’interrogation','symbol',{type:'question'}],
 ['symbol-info','Information','symbol',{type:'info'}],
 ['symbol-target','Cible','symbol',{type:'target'}],
 ['symbol-location','Localisation','bubble',{type:'marker'}],
 ['symbol-crown','Couronne','symbol',{type:'crown'}],
 ['symbol-flower','Fleur','symbol',{type:'flower'}]
]);
const catalogue=groups.flatMap(g=>g.items);
const coordsToPath=(points,close=true)=>points.map(([x,y],i)=>(i?'L':'M')+Math.round(x*100)/100+' '+Math.round(y*100)/100).join(' ')+(close?'Z':'');
function polygon(n,sx=1,sy=1,rotation=-Math.PI/2){
 return coordsToPath(Array.from({length:n},(_,i)=>{
  const a=rotation+i*2*Math.PI/n;
  return [500+445*sx*Math.cos(a),500+445*sy*Math.sin(a)];
 }));
}
function star(sides,inner=.43){
 return coordsToPath(Array.from({length:sides*2},(_,i)=>{
  const r=i%2?440*inner:445,a=-Math.PI/2+i*Math.PI/sides;
  return [500+r*Math.cos(a),500+r*Math.sin(a)];
 }));
}
function rr(x,y,w,h,r){return 'M'+(x+r)+' '+y+'H'+(x+w-r)+'Q'+(x+w)+' '+y+' '+(x+w)+' '+(y+r)+'V'+(y+h-r)+'Q'+(x+w)+' '+(y+h)+' '+(x+w-r)+' '+(y+h)+'H'+(x+r)+'Q'+x+' '+(y+h)+' '+x+' '+(y+h-r)+'V'+(y+r)+'Q'+x+' '+y+' '+(x+r)+' '+y+'Z'}
function pathFor(def){
 const {generator:g,params:p,id}=def;
 if(g==='polygon')return {d:polygon(p.sides,p.sx||1,p.sy||1,p.rotation??-Math.PI/2),mode:'fill'};
 if(g==='star')return {d:star(p.sides,p.inner),mode:'fill'};
 if(g==='base'){
  const x=p.shape;
  const base={
   square:rr(130,130,740,740,0),rectangle:rr(85,250,830,500,0),
   rounded:rr(128,130,744,740,125),'round-rect':rr(85,260,830,480,95),
   circle:'M500 60A440 440 0 1 0 500 940A440 440 0 1 0 500 60Z',
   ellipse:'M500 230A450 276 0 1 0 500 782A450 276 0 1 0 500 230Z',
   'triangle-up':'M500 68L944 878H56Z','triangle-down':'M56 123H944L500 932Z',
   'triangle-left':'M90 500L900 61V939Z','triangle-right':'M910 500L100 61V939Z',
   diamond:'M500 53L952 500 500 947 48 500Z',
   parallelogram:'M255 210H944L746 790H56Z',trapezoid:'M240 180H760L949 820H51Z',
   semicircle:'M54 750A446 446 0 0 1 946 750Z',
   quarter:'M95 905V95A810 810 0 0 1 905 905Z',
   capsule:rr(60,295,880,410,205),'pill-vertical':rr(305,70,390,860,195),
   arch:'M120 921V492A380 380 0 0 1 880 492V921Z',
   'cut-corner':'M225 95H773L905 227V773L773 905H225L95 773V227Z',
   droplet:'M500 55C625 210 915 501 915 680C915 890 748 944 500 944C257 944 84 865 84 680C84 498 375 210 500 55Z',
   cloud:'M180 811Q27 705 127 572Q108 414 286 363Q344 165 535 280Q707 134 822 338Q981 344 928 520Q1044 687 870 789Q744 925 538 826Q311 964 180 811Z',
   cross:'M390 90H610V391H910V609H610V910H390V609H90V391H390Z',
   ring:'M500 72A428 428 0 1 0 500 928A428 428 0 1 0 500 72Z M500 269A231 231 0 1 1 500 731A231 231 0 1 1 500 269Z',
   crescent:'M500 60A440 440 0 1 0 500 940A440 440 0 0 0 500 60Z M670 185A335 335 0 1 1 670 815A335 335 0 1 1 670 185Z',
   'pie-quarter':'M500 500V55A445 445 0 0 1 945 500Z',
   heart:'M500 927C370 808 65 596 65 346C65 112 360 80 500 296C640 80 935 112 935 346C935 596 630 808 500 927Z',
   kite:'M500 45L915 428 500 947 85 428Z',
   dart:'M55 210H840L948 500 840 790H55L215 500Z'
  };
  return {d:base[x]||base.square,mode:'fill'};
 }
 if(g==='line'||g==='doubleline'){
  const lines={
   solid:'M80 500H920',thin:'M80 500H920',thick:'M80 500H920',dash:'M80 500H920',dot:'M80 500H920',
   vertical:'M500 84V916',diag:'M130 780L870 220',
   arrow:'M100 500H900 M755 365L900 500 755 635',
   left:'M900 500H100 M245 365L100 500 245 635',
   both:'M100 500H900 M245 365L100 500 245 635 M755 365L900 500 755 635',
   arrowdash:'M100 500H900 M755 365L900 500 755 635',
   elbow:'M170 820V500H830',step:'M110 780V590H485V310H890',
   wave:'M55 500Q155 220 270 500T500 500T730 500T960 500',
   zigzag:'M95 720L255 280 415 720 575 280 735 720 905 280',
   arc:'M135 695A370 370 0 0 1 865 695',
   curve:'M105 730C240 125 665 875 900 285',
   hook:'M135 720Q445 145 830 460 M695 365L830 460 765 600',
   bracket:'M780 90Q430 90 430 300V405Q430 500 230 500Q430 500 430 595V700Q430 910 780 910',
   measure:'M115 500H885 M115 385V615 M885 385V615 M245 425L115 500 245 575 M755 425L885 500 755 575',
   loop:'M840 680C940 130 195 135 215 545C235 750 565 925 740 615 M610 650L740 615 775 747'
  };
  return {d:g==='doubleline'?'M80 440H920 M80 560H920':(lines[p.style]||lines.solid),mode:'line'};
 }
 if(g==='arrow'){
  const primary=[[85,345],[620,345],[620,185],[935,500],[620,815],[620,655],[85,655]];
  const reflect=(pts,a)=>{
   return pts.map(([x,y])=>{
    const dx=x-500,dy=y-500;
    return [500+dx*Math.cos(a)-dy*Math.sin(a),500+dx*Math.sin(a)+dy*Math.cos(a)];
   });
  };
  const dir=p.dir,rot={right:0,left:Math.PI,up:-Math.PI/2,down:Math.PI/2,ne:-Math.PI/4,nw:-3*Math.PI/4,se:Math.PI/4,sw:3*Math.PI/4}[dir];
  if(rot!==undefined)return {d:coordsToPath(reflect(primary,rot)),mode:'fill'};
  const paths={
   'double-h':'M52 500L337 190V345H663V190L948 500L663 810V655H337V810Z',
   'double-v':'M500 55L810 331H650V669H810L500 945L190 669H350V331H190Z',
   four:'M500 38L685 254H576V424H746V315L960 500L746 685V576H576V746H685L500 960L315 746H424V576H254V685L40 500L254 315V424H424V254H315Z',
   chevron:'M250 75L685 500L250 925L95 750 530 500 95 250Z',
   'chevron-left':'M750 75L315 500L750 925L905 750 470 500 905 250Z',
   circle:'M787 205A376 376 0 1 0 890 629L715 602L808 905L988 705L898 692A445 445 0 1 1 659 139Z',
   turn:'M160 801V480Q160 188 470 188H760V76L951 293L760 510V389H490Q385 389 385 500V801Z',
   bent:'M135 852V408Q135 232 330 232H668V87L936 338L668 583V439H400V852Z',
   curved:'M160 790Q205 185 757 240L720 90L950 325L650 475L701 361Q375 319 330 790Z',
   thick:'M40 312H665V94L963 500L665 906V688H40Z',
   notched:'M75 304H642V145L944 500L642 855V696H75L202 500Z',
   ribbon:'M100 260H760L936 500L760 740H100L230 500Z',
   merge:'M85 180H280L500 430L721 180H916V365H793L613 530L793 700H916V885H721L500 640L280 885H85V700H205L385 530L205 365H85Z',
   split:'M70 390H400V190L680 500L400 810V610H70Z M615 252H870V748H615L772 500Z',
   uptrend:'M110 836L330 623 480 724 756 345L615 345L615 214H944V544H814V450L494 860L341 761L227 906Z',
   downtrend:'M110 200L330 413L480 312L756 691L615 691L615 822H944V492H814V586L494 176L341 275L227 130Z'
  };
  return {d:paths[dir]||coordsToPath(primary),mode:'fill'};
 }
 if(g==='flow'){
  const shapes={
   process:rr(80,265,840,470,0),end:rr(90,275,820,450,224),
   decision:'M500 80L930 500 500 920 70 500Z',
   data:'M220 237H933L781 763H67Z',
   document:'M105 135H895V809Q710 685 500 812T105 812Z',
   documents:'M160 200H850V760Q710 660 520 780T160 776Z M105 125H795V670Q615 560 440 687T105 693Z',
   database:'M113 275A387 111 0 0 1 887 275V760A387 111 0 0 1 113 760Z M113 275A387 111 0 0 0 887 275',
   storage:'M90 248Q150 195 246 195H912V805H246Q150 805 90 752Z M246 195Q394 500 246 805',
   display:'M198 214H765Q916 500 765 786H198L70 500Z',
   delay:'M120 213H620A287 287 0 0 1 620 787H120Z',
   preparation:'M239 200H765L934 500 765 800H239L66 500Z',
   'manual-input':'M100 365L900 195V800H100Z',
   'manual-operation':'M105 220H895L755 790H245Z',
   predefined:'M80 220H920V780H80Z M216 220V780 M784 220V780',
   connector:'M500 110A390 390 0 1 0 500 890A390 390 0 1 0 500 110Z',
   offpage:'M140 128H860V610L500 897 140 610Z',
   comment:'M330 150H770M330 850H770M330 150V850',
   or:'M500 100A400 400 0 1 0 500 900A400 400 0 1 0 500 100Z M250 500H750 M500 250V750',
   sum:'M500 100A400 400 0 1 0 500 900A400 400 0 1 0 500 100Z M260 260L740 740 M740 260L260 740'
  };
  return {d:shapes[p.type]||shapes.process,mode:['comment'].includes(p.type)?'line':'fill'};
 }
 if(g==='bubble'){
  const cloud='M182 809Q49 706 130 572Q85 414 265 362Q330 151 532 254Q700 126 818 323Q984 330 927 528Q1040 701 859 806Q732 943 535 831Q310 955 182 809Z';
  const shapes={
   round:'M500 95A410 410 0 1 0 500 915A410 410 0 1 0 500 95Z M290 796L205 966 470 881Z',
   rect:rr(100,205,800,600,50)+' M180 803L160 955 352 805Z',
   chat:rr(98,178,804,606,180)+' M255 777L198 947 432 788Z',
   left:rr(130,220,765,570,100)+' M150 661L45 908 322 770Z',
   right:rr(95,220,775,565,100)+' M845 666L962 921 665 776Z',
   thought:rr(110,166,780,605,220)+' M285 800A55 55 0 1 0 285 910A55 55 0 1 0 285 800Z M166 914A30 30 0 1 0 166 974A30 30 0 1 0 166 914Z',
   cloud,star:star(12,.67),banner:'M77 264H923V733H77L193 500Z',
   ribbon:'M123 278H878V721H123L35 862V138Z',
   ticket:'M65 225H935V395A105 105 0 0 0 935 605V775H65V605A105 105 0 0 0 65 395Z',
   tag:'M190 145H757L954 500 757 855H190Z M311 447A53 53 0 1 0 311 553A53 53 0 1 0 311 447Z',
   flag:'M230 110H792V885L504 720 230 885Z',
   marker:'M500 60C737 60 916 233 916 463C916 681 650 856 500 955C342 851 83 672 83 463C83 233 262 60 500 60Z M500 295A170 170 0 1 0 500 635A170 170 0 1 0 500 295Z',
   pin:'M500 50A350 350 0 1 0 500 750A350 350 0 1 0 500 50Z M500 500L420 956H580Z',
   burst:star(18,.75),'speech-square':rr(91,205,817,560,80)+' M164 756L177 945 420 768Z'
  };
  return {d:shapes[p.type]||shapes.chat,mode:'fill'};
 }
 if(g==='symbol'){
  const basic={
   doubleheart:'M352 710C225 610 93 475 104 342C113 215 275 178 353 291C430 178 591 215 601 342C611 475 480 610 352 710Z M680 882C550 782 420 648 429 522C438 399 599 371 681 485C759 371 923 404 934 524C945 653 819 785 680 882Z',
   brokenheart:'M500 936C355 810 88 604 92 350C96 111 370 86 505 292L441 451 562 512 470 690 582 788 500 936Z M515 295C649 83 908 111 911 349C915 588 664 797 500 936L582 788 470 690 562 512 441 451Z',
   infinity:'M500 500C400 220 95 268 95 500C95 732 378 792 500 500C622 208 905 268 905 500C905 732 600 780 500 500Z',
   lightning:'M590 55L195 544H432L346 945L820 399H573Z',
   sun:star(16,.79)+' M500 331A169 169 0 1 0 500 669A169 169 0 1 0 500 331Z',
   check:'M132 506L365 754 868 244 952 334 365 906 47 592Z',
   x:'M198 102L500 404 802 102 898 198 596 500 898 802 802 898 500 596 198 898 102 802 404 500 102 198Z',
   question:'M353 370A159 159 0 1 1 656 461C589 502 510 535 510 654H430C430 480 521 448 567 419A79 79 0 1 0 434 370Z M470 710A80 80 0 1 0 470 870A80 80 0 1 0 470 710Z',
   info:'M500 82A418 418 0 1 0 500 918A418 418 0 1 0 500 82Z M440 408H560V745H440Z M500 250A63 63 0 1 0 500 376A63 63 0 1 0 500 250Z',
   target:'M500 70A430 430 0 1 0 500 930A430 430 0 1 0 500 70Z M500 223A277 277 0 1 1 500 777A277 277 0 1 1 500 223Z M500 380A120 120 0 1 0 500 620A120 120 0 1 0 500 380Z',
   crown:'M90 251L245 408 500 122 759 408 909 249 827 818H173Z M192 849H807V917H192Z',
   flower:star(10,.42)
  };
  return {d:basic[p.type]||basic.check,mode:'fill'};
 }
 return {d:rr(100,100,800,800,50),mode:'fill'};
}
function isLine(def){return pathFor(def).mode==='line'}
function thumb(def){
 const id=typeof def==='string'?def:def.id,item=byId.get(id);if(!item)return '';
 if(thumbnailCache.has(id))return thumbnailCache.get(id);
 const {d,mode}=pathFor(item);
 const clr='#182331';
 const line=mode==='line',lineWidth=item.params.style==='thin'?9:item.params.style==='thick'?41:20;
 const dash=item.params.style==='dash'||item.params.style==='arrowdash'?'stroke-dasharray="58 35"':item.params.style==='dot'?'stroke-dasharray="1 41"':'';
 const shape='<path d="'+d+'" fill="'+(line?'none':clr)+'" fill-rule="evenodd" stroke="'+(line?clr:'none')+'" stroke-width="'+lineWidth+'" stroke-linecap="round" stroke-linejoin="round" '+dash+'/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 1000 1000">'+shape+'</svg>';
 const data='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 thumbnailCache.set(id,data);return data;
}
function draw(ctx,e){
 const def=byId.get(e.variant);if(!def)return;
 const geo=pathFor(def),linear=geo.mode==='line';
 const x=Number(e.x)||0,y=Number(e.y)||0,w=Math.max(1,Number(e.w)||1),h=Math.max(1,Number(e.h)||1);
 const color=/^#[0-9a-f]{6}$/i.test(e.color||'')?e.color:'#192633';
 ctx.save();
 ctx.globalAlpha*=Math.min(1,Math.max(0,Number.isFinite(+e.opacity)?+e.opacity:1));
 const cx=x+w/2,cy=y+h/2,rotation=(Number(e.rotation)||0)*Math.PI/180;
 ctx.translate(cx,cy);ctx.rotate(rotation);ctx.scale(e.flipX?-1:1,e.flipY?-1:1);ctx.translate(-w/2,-h/2);
 ctx.scale(w/1000,h/1000);
 const path=new Path2D(geo.d);
 const lineWidth=Math.max(0,Math.min(150,Number(e.lineWidth)??18));
 ctx.lineJoin='round';ctx.lineCap='round';
 const style=e.lineStyle||(def.params.style==='dash'||def.params.style==='arrowdash'?'dash':def.params.style==='dot'?'dot':'solid');
 ctx.setLineDash(style==='dash'?[55,38]:style==='dot'?[1,44]:[]);
 if(linear){
  ctx.strokeStyle=color;
  ctx.lineWidth=(e.lineWidth===undefined?(def.params.style==='thick'?43:def.params.style==='thin'?10:20):lineWidth);
  ctx.stroke(path);
 }else{
  ctx.fillStyle=color;
  ctx.fill(path,'evenodd');
  const stroke=Number(e.strokeWidth)||0;
  if(stroke>0){
   ctx.strokeStyle=/^#[0-9a-f]{6}$/i.test(e.strokeColor||'')?e.strokeColor:'#ffffff';
   ctx.lineWidth=Math.min(100,Math.max(0,stroke));
   ctx.stroke(path);
  }
 }
 ctx.restore();
}
window.ELOAHShapes={groups,catalogue,byId,pathFor,thumb,draw,isLine};
})();