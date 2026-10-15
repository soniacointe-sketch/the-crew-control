/* PARISIS ENGINE — passerelles contextuelles entre les enquêtes.
   Charge uniquement les relations explicites du registre public parisis-relations.json.
   Aucune relation n'est inférée à partir de simples mots communs. */
(function(){
"use strict";
var filename=decodeURIComponent(location.pathname.split("/").pop()||"");
if(!/^parisis-[a-z0-9-]+\.html$/i.test(filename))return;
var css=String.raw; // Scoped CSS is inserted below, no dependency on a framework.
function el(tag,cls,text){var x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
function add(parent,child){parent.appendChild(child);return child}
function safeHref(name){return /^parisis-[a-z0-9-]+\.html$/i.test(name)?name:"parisis-publications.html"}
fetch("parisis-relations.json",{cache:"no-store"}).then(function(resp){if(!resp.ok)throw Error("Registre indisponible");return resp.json()}).then(function(data){
if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.links))return;
var me=data.nodes.find(function(n){return n.href===filename});if(!me)return;
var connections=data.links.filter(function(l){return l.from===me.id||l.to===me.id});if(!connections.length)return;
var target=document.querySelector("main")||document.body;
var style=document.createElement("style");
style.textContent=".parisis-related{font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;color:#f8efdf;background:#23252a;border:1px solid #82704d;border-top:4px solid #e6bf7b;padding:clamp(17px,3vw,36px);margin:52px auto 24px;max-width:1250px;clear:both;position:relative;isolation:isolate}.parisis-related *{box-sizing:border-box}.parisis-related .pr-eyebrow{color:#e5bd75;text-transform:uppercase;letter-spacing:.12em;font-size:11px;font-weight:800}.parisis-related h2{font:normal clamp(27px,3vw,38px)/1.2 Georgia,serif;color:#fff2de;margin:9px 0 10px}.parisis-related .pr-intro{color:#d9cdbd;max-width:860px;margin:0 0 24px}.parisis-related .pr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.parisis-related .pr-card{background:#303138;border:1px solid #696055;padding:17px;min-width:0}.parisis-related .pr-kind{color:#e6c085;font-size:10px;letter-spacing:.09em;text-transform:uppercase;font-weight:800}.parisis-related h3{font:normal 20px/1.25 Georgia,serif;color:#fff0d7;margin:9px 0}.parisis-related .pr-card p{font-size:12px;color:#d5c9b9;margin:8px 0}.parisis-related .pr-card strong{color:#ebcb9a}.parisis-related a{color:#f0cb88;text-decoration:underline;text-underline-offset:3px}.parisis-related .pr-nav{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:13px}.parisis-related .pr-nav a{font-weight:750;font-size:12px}.parisis-related .pr-actions{display:flex;gap:12px;flex-wrap:wrap;padding-top:19px}.parisis-related .pr-actions a{font-size:12px;font-weight:800}.parisis-related a:focus-visible{outline:3px solid #ebc983;outline-offset:3px}@media(max-width:500px){.parisis-related{margin:26px 12px;padding:15px}.parisis-related .pr-grid{grid-template-columns:1fr}}";
document.head.appendChild(style);
var section=add(target,el("section","parisis-related"));section.setAttribute("aria-labelledby","parisis-related-heading");
add(section,el("div","pr-eyebrow","PARISIS ENGINE · CONTINUITÉ D'ENQUÊTE"));
var h=add(section,el("h2","", "Les indices reliés à ce chapitre"));h.id="parisis-related-heading";
add(section,el("p","pr-intro",connections.length+" relation"+(connections.length>1?"s":"")+" recensée"+(connections.length>1?"s":"")+" dans les dossiers. Elles montrent des documents, des motifs ou des méthodes à comparer ; pas nécessairement une cause historique commune."));
var grid=add(section,el("div","pr-grid"));
connections.forEach(function(r){var other=data.nodes.find(function(n){return n.id===(r.from===me.id?r.to:r.from)});if(!other)return;
var card=add(grid,el("article","pr-card"));add(card,el("div","pr-kind",data.types[r.type]||r.type));
add(card,el("h3","",r.label));add(card,el("p","",r.why));
var caution=add(card,el("p",""));add(caution,el("strong","","Limite : "));caution.appendChild(document.createTextNode(r.caution));
var nav=add(card,el("div","pr-nav"));var link=add(nav,el("a","",other.code+" · "+other.title+" ↗"));link.href=safeHref(other.href);
var link2=add(nav,el("a","","Voir les preuves et contre-tests ↗"));link2.href="parisis-reseau-indices.html?d="+encodeURIComponent(me.id);
});
var actions=add(section,el("div","pr-actions"));var network=add(actions,el("a","","↔ Explorer tout le réseau des indices"));network.href="parisis-reseau-indices.html?d="+encodeURIComponent(me.id);
var trail=add(actions,el("a","","→ Reprendre le fil chronologique"));trail.href="parisis-fil-enquetes.html";
}).catch(function(){/* Une panne réseau ne masque jamais la page d'enquête principale. */});
})();