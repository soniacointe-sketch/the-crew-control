/* PARISIS Grand Livre — content-only reader, no nested menus or scripts. */
(function(){
"use strict";
var frame=document.getElementById("chapterFrame"),cache=new Map(),run=0;
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var css=[
"*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0!important;overflow-x:hidden!important}",
"body.pe-extract main{max-width:1000px!important;width:100%!important;min-width:0!important;margin:0 auto!important;padding:clamp(20px,4vw,54px)!important}",
"body.pe-extract main :is(p,li,blockquote){line-height:1.72}",
"body.pe-extract main :is(img,video,canvas,svg){max-width:100%;height:auto}",
"body.pe-extract main figure{max-width:100%;overflow-wrap:anywhere}",
"body.pe-extract main table{display:block;max-width:100%;overflow-x:auto}",
"body.pe-extract main pre{white-space:pre-wrap;overflow-wrap:anywhere}",
"body.pe-extract main h1{font-size:clamp(29px,4vw,48px)!important;line-height:1.14!important}",
"body.pe-extract main h2{font-size:clamp(23px,3vw,33px)!important;line-height:1.23!important}",
"body.pe-extract main h3{font-size:clamp(19px,2vw,26px)!important;line-height:1.3!important}",
"body.pe-extract main :is(.shell,.layout,.wrap,.full){max-width:100%!important}",
"body.pe-extract main .layout:not(.images){display:block!important;grid-template-columns:1fr!important}",
"body.pe-extract main :is(nav,form,button,input,textarea,select,dialog){display:none!important}",
".pe-doc-label{padding:11px clamp(18px,4vw,54px);background:#f5efe7;border-bottom:1px solid #d3c6b9;color:#664e67;font:700 11px/1.5 system-ui}",
".pe-doc-label a{color:#604266}",
"body.pe-md{background:#fffdfa!important;color:#342936!important;font:16px/1.8 system-ui,sans-serif}",
"body.pe-md :is(h1,h2,h3){font-family:Georgia,serif}",
"body.pe-md blockquote{border-left:3px solid #bd936b;padding:8px 20px;background:#f4ede5}",
"@media(max-width:650px){body.pe-extract main{padding:20px 15px!important}}"
].join("\n");
function sourceUrl(path){
var u=new URL(path,location.href);
if(u.origin!==location.origin||!u.pathname.endsWith(".html"))throw Error("Adresse non autorisée");
return u
}
function pageHtml(url,raw){
var source=new DOMParser().parseFromString(raw,"text/html");
var target=source.querySelector("main")||source.querySelector("article")||source.querySelector(".reader");
if(!target)throw Error("Aucun contenu de chapitre détecté");
var main=target.cloneNode(true);
main.querySelectorAll("script,style,nav,aside,footer,form,button,input,textarea,select,dialog,template,noscript,object,embed").forEach(function(n){n.remove()});
main.querySelectorAll(".pe-universal-bar,.pe-universal-toc,.pe-v4-reading-footer,.pe-reader-nav,.parisis-related,.top-actions,.sidebar,.side,.toc").forEach(function(n){n.remove()});
main.querySelectorAll("*").forEach(function(n){
Array.from(n.attributes).forEach(function(a){if(/^on/i.test(a.name))n.removeAttribute(a.name)});
if(n.tagName==="A"&&!String(n.getAttribute("href")||"").startsWith("#")){n.target="_blank";n.rel="noopener noreferrer"}
});
var styles=Array.from(source.head.querySelectorAll("style")).map(function(el){return el.textContent}).join("\n");
var links=Array.from(source.head.querySelectorAll('link[rel="stylesheet"]')).filter(function(el){return !/universal-v4|navigation|home-studio/i.test(el.getAttribute("href")||"")}).map(function(el){return '<link rel="stylesheet" href="'+esc(new URL(el.getAttribute("href"),url.href).href)+'">'}).join("");
var dark=/color-scheme\s*:\s*dark|--bg\s*:\s*#(?:1[0-9a-f]|2[0-9a-f])|background\s*:\s*#(?:1[0-9a-f]|2[0-9a-f])/i.test(styles);
var bg=dark?"#221d29":"#fffdfa",fg=dark?"#f6eee5":"#322b35";
return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="'+esc(url.href)+'">'+links+'<style>'+styles+'</style><style>'+css+'</style><style>body.pe-extract{background:'+bg+'!important;color:'+fg+'!important}</style></head><body class="pe-extract"><div class="pe-doc-label">PARISIS ENGINE · VERSION DE LECTURE · <a href="'+esc(url.href)+'" target="_blank" rel="noopener noreferrer">Voir le document original et les outils ↗</a></div>'+main.outerHTML+'</body></html>';
}
function mdHtml(raw){
var out=[],parts=[],list=false;
function flush(){if(parts.length){out.push("<p>"+esc(parts.join(" "))+"</p>");parts=[]}}
String(raw).split(/\r?\n/).forEach(function(line){var t=line.trim();if(!t){flush();if(list){out.push("</ul>");list=false}return}
var h=t.match(/^(#{1,5})\s+(.+)$/);if(h){flush();if(list){out.push("</ul>");list=false}var n=Math.min(h[1].length,3);out.push("<h"+n+">"+esc(h[2])+"</h"+n+">");return}
var li=t.match(/^[-*+]\s+(.+)$/);if(li){flush();if(!list){out.push("<ul>");list=true}out.push("<li>"+esc(li[1])+"</li>");return}
if(list){out.push("</ul>");list=false}parts.push(t)});
flush();if(list)out.push("</ul>");return out.join("\n");
}
function markdownPage(url){
var name=url.searchParams.get("file");
if(!name||!/^[a-z0-9-]+\.md$/i.test(name))throw Error("Texte non disponible");
return fetch(name,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("Source non trouvée");return r.text()}).then(function(md){
return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body class="pe-extract pe-md"><div class="pe-doc-label">PARISIS ENGINE · VERSION DE LECTURE · <a target="_blank" rel="noopener noreferrer" href="'+esc(url.href)+'">Original ↗</a></div><main>'+mdHtml(md)+'</main></body></html>';
});
}
function message(text){return '<!doctype html><html lang="fr"><meta charset="utf-8"><body style="background:#fffdfa;color:#45364a;font:14px/1.8 system-ui;padding:45px 25px;text-align:center">'+esc(text)+'</body></html>'}
function load(path){
if(!frame)return;
var seq=++run,key=String(path);
if(cache.has(key)){frame.srcdoc=cache.get(key);return}
frame.srcdoc=message("Ouverture du chapitre…");
var url;try{url=sourceUrl(key)}catch(e){frame.srcdoc=message(e.message);return}
var op=url.pathname.endsWith("/foi-control.html")?markdownPage(url):
fetch(url.href,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.text()}).then(function(t){return pageHtml(url,t)});
Promise.resolve(op).then(function(html){cache.set(key,html);if(seq===run)frame.srcdoc=html}).catch(function(e){if(seq===run)frame.srcdoc=message("Lecture indisponible dans ce mode. Utilise « Ouvrir le document original ». "+e.message)});
}
window.PARISIS_READER_EXTRACT={load:load};
})();
