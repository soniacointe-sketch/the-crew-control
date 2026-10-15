/* PARISIS ENGINE — navigation "précédent / suivant" dans chaque dossier.
   Le repère de progression garde seulement le dernier chapitre ouvert, local à l'appareil. */
(function(){
"use strict";
var currentFile=decodeURIComponent(location.pathname.split("/").pop()||"");
if(!currentFile||!/^parisis-[a-z0-9-]+\.html$/i.test(currentFile))return;
var data=null,bar=null;
var progressKey="parisis-last-opened-v1",selectedKey="parisis-active-series-v1";
function make(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function add(p,c){p.appendChild(c);return c}
function save(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(e){}}
function hrefOk(h){return /^([a-z0-9-]+\.html|foi-control\.html)(?:\?[^"#]*)?(?:#[a-z0-9-]+)?$/i.test(h)}
function safe(h){return hrefOk(h)?h:"parisis-fil-enquetes.html"}
function filename(h){return h.split(/[?#]/)[0]}
function stepMatches(s){
if(filename(s.href)!==currentFile)return false;
var anchor=s.href.split("#")[1]||"";
if(anchor)return decodeURIComponent(location.hash.slice(1))===anchor;
return true;
}
function lookup(){
if(!data)return null;
var special=null,regular=null;
data.cycles.forEach(function(c){c.steps.forEach(function(s,i){
if(filename(s.href)!==currentFile)return;
if(s.href.includes("#")&&stepMatches(s))special={cycle:c,index:i};
if(!s.href.includes("#")&&!regular)regular={cycle:c,index:i};
})});
return special||regular;
}
function initStyles(){
if(document.getElementById("peReaderNavStyles"))return;
var style=document.createElement("style");style.id="peReaderNavStyles";
style.textContent=".pe-reader-nav{background:#24262c;color:#f5ead8;border:1px solid #a88b60;border-top:4px solid #eac37d;padding:clamp(16px,3vw,31px);max-width:1180px;margin:52px auto 30px;font:14px/1.6 system-ui,-apple-system,Segoe UI,sans-serif;clear:both;isolation:isolate}.pe-reader-nav *{box-sizing:border-box}.pe-reader-nav .pe-reader-overline{font-size:11px;font-weight:850;color:#eac37d;letter-spacing:.1em;text-transform:uppercase}.pe-reader-nav h2{font:normal clamp(26px,3vw,37px)/1.16 Georgia,serif;color:#fff1dd;margin:9px 0}.pe-reader-nav p{color:#d6c8b6;margin:7px 0 16px;font-size:12px}.pe-reader-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pe-reader-links a{display:flex;flex-direction:column;gap:6px;min-width:0;border:1px solid #7d705d;padding:15px;text-decoration:none;color:#f6ead6;background:#353434;font-size:15px;font-weight:700}.pe-reader-links a:hover{background:#4c4235}.pe-reader-links a.pe-reader-primary{background:#e5bd78;border-color:#e5bd78;color:#26221c}.pe-reader-links a.pe-reader-primary:hover{background:#f3d79b}.pe-reader-links a span{font-size:10px;letter-spacing:.08em;text-transform:uppercase;font-weight:850;opacity:.85}.pe-reader-tools{display:flex;gap:13px;flex-wrap:wrap;margin:16px 0 0}.pe-reader-tools a{font-size:12px;color:#ebcd91;text-decoration:underline;text-underline-offset:3px}.pe-reader-nav a:focus-visible{outline:3px solid #fff1d1;outline-offset:4px}@media(max-width:560px){.pe-reader-nav{margin:30px 10px;padding:17px}.pe-reader-links{grid-template-columns:1fr}.pe-reader-links a{padding:12px}}";
document.head.appendChild(style);
}
function render(){
var found=lookup();if(!found)return;
var c=found.cycle,i=found.index,s=c.steps[i];
save(progressKey,{cycle:c.id,index:i,time:Date.now()});save(selectedKey,c.id);
if(!bar){initStyles();bar=make("section","pe-reader-nav");bar.setAttribute("aria-label","Navigation dans cette suite d'enquêtes");var target=document.querySelector("main")||document.body;target.appendChild(bar)}
bar.replaceChildren();
add(bar,make("div","pe-reader-overline","PARISIS ENGINE · "+c.short+" · CHAPITRE "+(i+1)+" / "+c.steps.length));
add(bar,make("h2","","Cette enquête continue"));
add(bar,make("p","", "Tu viens d'ouvrir « "+s.title+" ». Passe au document suivant ou reviens à l'étape précédente. L'ouverture ne signifie pas que les preuves ont été vérifiées."));
var links=add(bar,make("div","pe-reader-links"));
var prev=add(links,make("a","",""));
if(i>0){add(prev,make("span","","← ÉTAPE PRÉCÉDENTE"));prev.appendChild(document.createTextNode(c.steps[i-1].title));prev.href=safe(c.steps[i-1].href)}
else{add(prev,make("span","","← TOUS LES PARCOURS"));prev.appendChild(document.createTextNode("Voir les enquêtes"));prev.href="eloah-parisis.html#peHomeGuide"}
var next=add(links,make("a","pe-reader-primary",""));
if(i<c.steps.length-1){add(next,make("span","","ÉTAPE SUIVANTE →"));next.appendChild(document.createTextNode(c.steps[i+1].title));next.href=safe(c.steps[i+1].href)}
else{add(next,make("span","","FIN DES ÉTAPES ACTUELLES →"));next.appendChild(document.createTextNode("Ouvrir les indices et pistes à vérifier"));next.href=safe(c.network)}
var tools=add(bar,make("nav","pe-reader-tools"));tools.setAttribute("aria-label","Autres outils de ce dossier");
var full=add(tools,make("a","","Toutes les étapes de cette enquête ↗"));full.href=safe(c.trail);
var home=add(tools,make("a","","Retour à l'accueil guidé ↗"));home.href="eloah-parisis.html#peHomeGuide";
var net=add(tools,make("a","","Correspondances et contre-tests ↗"));net.href=safe(c.network);
}
fetch("parisis-parcours.json",{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(function(d){if(!d||!Array.isArray(d.cycles))return;data=d;render();window.addEventListener("hashchange",render)}).catch(function(){/* Original chapter remains readable if guide unavailable. */});
})();