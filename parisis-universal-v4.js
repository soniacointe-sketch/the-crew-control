/* PARISIS ENGINE — V4: accessible cross-page navigation.
 * Runs only on standalone pages, never inside embedded atlas iframe.
 * Intentionally does not touch existing research state, map scripts or forms.
 */
(function(){
"use strict";
if(window.__peUniversalV4)return;window.__peUniversalV4=true;
if(!document.body)return;
try{if(window.self!==window.top)return}catch(e){return}
var file=decodeURIComponent((location.pathname.split("/").pop()||"").toLowerCase());
if(!/^parisis-[a-z0-9-]+\.html$/.test(file))return;
/* Le Grand Livre possède déjà son en-tête et son sommaire : aucun second menu. */
if(file==="parisis-lecteur.html")return;
var tool=/^(?:parisis-(?:005-alpage-sig|alpha-laboratoire|cartography-lab|control|ghost-trace|hugo-axes|hum-002-atlas|text-atlas|reseau-indices|vasserot-1810-1836|vasserot-feuilles-audit))\.html$/.test(file);
var hub=/^parisis-(?:fil-enquetes|publications|lecteur)\.html$/.test(file);
var mode=tool?"tool":hub?"hub":"editorial";
document.body.classList.add("pe-v4-ready","pe-skin-"+mode);
var background=window.getComputedStyle(document.body).backgroundColor;
var nums=(background.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
var luminance=nums.length>=3?(nums[0]*.2126+nums[1]*.7152+nums[2]*.0722):64;
document.body.classList.add(luminance>145?"pe-legacy-light":"pe-legacy-dark");
var title=(document.title||"Enquête").split(/\s*[·|—]\s*/).filter(Boolean).filter(function(t){return !/^(ELOAH|PARISIS ENGINE)$/i.test(t)}).slice(0,2).join(" · ")||"Enquête";
var navItems=[
["Accueil","eloah-parisis.html"],
["Les enquêtes","parisis-fil-enquetes.html"],
["Indices","parisis-reseau-indices.html"],
["Archives","parisis-publications.html"],
["Grand Livre","parisis-lecteur.html"]
];
function mk(tag,cls,text){var a=document.createElement(tag);if(cls)a.className=cls;if(text!==undefined)a.textContent=text;return a}
function add(p,x){p.appendChild(x);return x}
var skip=mk("a","pe-universal-skip","Aller au contenu");
skip.href="#peUniversalContent";
var bar=mk("div","pe-universal-bar");bar.setAttribute("role","navigation");bar.setAttribute("aria-label","Navigation PARISIS ENGINE");
var brand=add(bar,mk("a","pe-universal-brand"));brand.href="eloah-parisis.html";brand.setAttribute("aria-label","Accueil PARISIS ENGINE");
var brandText=add(brand,mk("strong"));brandText.appendChild(document.createTextNode("PARISIS "));add(brandText,mk("em","","ENGINE"));
add(brand,mk("small","","ELOAH · HUMANITIES LAB"));
add(bar,mk("div","pe-universal-label",title.slice(0,90)));
function links(container){
var section=add(container,mk("nav","pe-universal-links"));section.setAttribute("aria-label","Accès aux sections");
navItems.forEach(function(item){
var a=add(section,mk("a",item[0]==="Grand Livre"?"pe-universal-primary":"",item[0]));a.href=item[1];
if(file===item[1])a.setAttribute("aria-current","page");
});
return section
}
var desktop=links(bar);desktop.classList.add("pe-universal-desktop");
var mobile=add(bar,mk("details","pe-universal-mobile"));add(mobile,mk("summary","","☰ Menu"));
links(mobile);
var first=document.body.firstChild;
document.body.insertBefore(skip,first);
document.body.insertBefore(bar,first);
if(mode==="editorial"){
var headings=Array.from(document.querySelectorAll("main h2,main h3,article h2,article h3,.wrap h2,.wrap h3,.container h2,.container h3"));
var seen=new Set();headings=headings.filter(function(h){if(seen.has(h)||!h.textContent.trim())return false;seen.add(h);return true}).slice(0,32);
if(headings.length>=3){
var toc=mk("div","pe-universal-toc");
add(toc,mk("span","pe-universal-toc-label","LECTURE · "+headings.length+" SECTIONS"));
var toggle=add(toc,mk("details","pe-universal-toc-details"));add(toggle,mk("summary","","Sommaire du dossier"));
var list=add(toggle,mk("nav","pe-universal-toc-links"));list.setAttribute("aria-label","Sections de l'enquête");
headings.forEach(function(h,i){
if(!h.id)h.id="pe-v4-section-"+String(i+1);
var a=add(list,mk("a","",h.textContent.trim().slice(0,96)));
a.href="#"+encodeURIComponent(h.id);if(h.tagName==="H3")a.classList.add("pe-universal-toc-sub");
a.addEventListener("click",function(){toggle.open=false});
});
document.body.insertBefore(toc,first);
}
}
var content=(document.querySelector("main")||document.querySelector("article")||document.querySelector(".container")||document.querySelector(".wrap")||document.querySelector(".shell")||document.body);
if(!content.id)content.id="peUniversalContent";
else skip.href="#"+content.id;
if(mode==="editorial"){
var footer=mk("div","pe-v4-reading-footer");var inside=add(footer,mk("div","pe-v4-reading-footer-inner"));
add(inside,mk("p","","PARISIS ENGINE · Enquête documentaire. Une ressemblance ou un alignement ne démontre pas, à lui seul, une relation historique."));
var fnav=add(inside,mk("nav"));fnav.setAttribute("aria-label","Poursuivre la recherche");
var a=add(fnav,mk("a","","Voir toutes les enquêtes ↗"));a.href="parisis-fil-enquetes.html";
var b=add(fnav,mk("a","","Consulter les sources et indices ↗"));b.href="parisis-reseau-indices.html";
document.body.appendChild(footer);
}
fetch("parisis-parcours.json",{cache:"no-store"}).then(function(res){if(!res.ok)throw Error("Dossier indisponible");return res.json()}).then(function(manifest){
var result=null;
(manifest.cycles||[]).some(function(c){return(c.steps||[]).some(function(s,i){
if(String(s.href||"").split(/[?#]/)[0]===file){result={cycle:c,index:i};return true}return false})});
if(!result)return;
var direct="parisis-lecteur.html?cycle="+encodeURIComponent(result.cycle.id)+"&step="+(result.index+1);
var link=mk("a","pe-universal-focus","Lire dans "+result.cycle.short+" ↗");link.href=direct;
desktop.insertBefore(link,desktop.lastChild);
var mobnav=mobile.querySelector(".pe-universal-links");if(mobnav)mobnav.insertBefore(link.cloneNode(true),mobnav.lastChild);
}).catch(function(){/* The independent pages remain usable without the manifest. */});
})();
