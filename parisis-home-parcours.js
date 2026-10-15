/* PARISIS ENGINE — primary guided home reading UX.
   Progress means only last chapter opened on this browser, never "read" or "validated". */
(function(){
"use strict";
var wrap=document.getElementById("peHomeGuide");
if(!wrap)return;
var buttons=document.getElementById("peJourneys");
var steps=document.getElementById("peJourneySteps");
var cycleHeading=document.getElementById("peCycleHeading");
var cycleDescription=document.getElementById("peCycleDescription");
var next=document.getElementById("peJourneyNext");
var last=document.getElementById("peLastOpened");
var key="parisis-last-opened-v1",selectionKey="parisis-active-series-v1";
var cycles=[],active="alpha";
function make(tag,cls,value){var e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e}
function add(parent,child){parent.appendChild(child);return child}
function stored(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function safeHref(value){return /^([a-z0-9-]+\.html|foi-control\.html)(?:\?[^#"]*)?(?:#[a-z0-9-]+)?$/i.test(value)?value:"parisis-fil-enquetes.html"}
function cycle(id){return cycles.find(function(c){return c.id===id})}
function getLast(){var data=stored(key);if(!data)return null;var c=cycle(data.cycle);if(!c||!c.steps[data.index])return null;return{cycle:c,index:data.index,step:c.steps[data.index],time:data.time}}
function track(c,i){save(key,{cycle:c.id,index:i,time:Date.now()});render()}
function renderLast(){
var info=getLast();last.replaceChildren();
add(last,make("div","pe-kicker","MA DERNIÈRE OUVERTURE"));
if(!info){
add(last,make("h3","", "Par où commencer ?"));
add(last,make("p","", "Choisis une série ci-dessous. À chaque chapitre ouvert, tu retrouveras ici ton dernier point de lecture sur cet appareil."));
var a=add(last,make("a","","Voir le premier parcours ↓"));a.href="#peJourneys";return;
}
add(last,make("h3","",info.step.code+" · "+info.step.title));
add(last,make("p","", "Dernier chapitre ouvert sur cet appareil. Ce repère ne signifie pas qu'il a été lu ou terminé."));
var index=Math.min(info.index+1,info.cycle.steps.length-1),target=info.cycle.steps[index];
var link=add(last,make("a","",index>info.index?"Continuer avec "+target.code+" →":"Rouvrir ce chapitre ↗"));link.href=safeHref(target.href);
link.addEventListener("click",function(){track(info.cycle,index)});
}
function renderButtons(){
buttons.replaceChildren();
cycles.forEach(function(c){
var b=add(buttons,make("button",""));b.type="button";b.setAttribute("aria-pressed",String(active===c.id));b.setAttribute("aria-controls","peJourneyPanel");
add(b,make("span","pe-tiny",c.kicker));
add(b,make("span","pe-journey-title",c.short));
add(b,make("span","pe-tiny-count",c.steps.length+" étapes"));
b.addEventListener("click",function(){active=c.id;save(selectionKey,active);render()});
});
}
function renderSteps(c){
steps.replaceChildren();
var progress=getLast();
c.steps.forEach(function(s,i){
var li=add(steps,make("li",""));
var current=!!(progress&&progress.cycle.id===c.id&&progress.index===i);
li.dataset.current=String(current);
add(li,make("span","pe-step-n",String(i+1).padStart(2,"0")));
var body=add(li,make("div","pe-step-copy"));
add(body,make("span","",s.code));
var a=add(body,make("a","",s.title+" ↗"));a.href=safeHref(s.href);a.addEventListener("click",function(){track(c,i)});
add(body,make("small","",s.note));
if(current)add(li,make("span","pe-step-state","Dernier ouvert"));
});
}
function renderNext(c){
next.replaceChildren();
var progress=getLast(),same=progress&&progress.cycle.id===c.id;
var targetIndex=same?Math.min(progress.index+1,c.steps.length-1):0;
var target=c.steps[targetIndex];
add(next,make("div","pe-kicker",same?"POURSUIVRE CETTE ENQUÊTE":"COMMENCER CETTE ENQUÊTE"));
add(next,make("span","pe-step-code","ÉTAPE "+String(targetIndex+1).padStart(2,"0")+" / "+String(c.steps.length).padStart(2,"0")+" · "+target.code));
add(next,make("h3","",target.title));
add(next,make("p","",target.note));
var actions=add(next,make("div","pe-next-actions"));
var btn=add(actions,make("a","pe-start",same&&targetIndex>progress.index?"Ouvrir l'étape suivante →":"Ouvrir ce chapitre ↗"));btn.href=safeHref(target.href);btn.addEventListener("click",function(){track(c,targetIndex)});
var full=add(actions,make("a","pe-secondary","Voir tout le fil de cette enquête →"));full.href=safeHref(c.trail);
add(next,make("p","pe-method","À garder en tête : "+c.method));
}
function render(){
var c=cycle(active)||cycles[0];if(!c)return;
active=c.id;renderButtons();
cycleHeading.textContent=c.title;
cycleDescription.textContent=c.description;
renderSteps(c);renderNext(c);renderLast();
}
fetch("parisis-parcours.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(function(d){
if(!d||!Array.isArray(d.cycles))throw Error("Manifest incomplet");
cycles=d.cycles;
var remembered=stored(selectionKey);active=cycle(remembered)?remembered:"alpha";
render();
}).catch(function(){
var explanation=document.getElementById("peJourneyLoadError");
if(explanation){explanation.hidden=false;explanation.textContent="Le suivi interactif est indisponible. Les liens directs restent accessibles dans le fil des enquêtes."}
});
})();