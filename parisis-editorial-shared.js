/* PARISIS ENGINE · revue partagée · progressive enhancement */
(()=>{"use strict";
 if(document.documentElement.dataset.parisisEditorialReady)return;
 document.documentElement.dataset.parisisEditorialReady="1";
 const script=document.currentScript;
 function init(){
  if(document.querySelector(".pe-masthead")||!document.body)return;
  const file=decodeURI(location.pathname.split("/").pop());
  if(file==="eloah-parisis.html"||file==="parisis-publications.html")return;
  const tool=/^(parisis-(?:hugo-axes|cartography-lab|005-alpage-sig|hum-002-atlas|control|ghost-trace|text-atlas|sources-liaisons|vasserot-feuilles-audit|par-isis-004-atlas-avant-apres|par-isis-002-ankh-atlas)|parisis-par-isis-005-feuilles-vasserot)\.html$/.test(file);
  document.body.classList.add("pe-unified",tool?"pe-tool":"pe-document");
  const escText=(value)=>String(value||"").replace(/\s+/g," ").trim();
  const title=escText(document.querySelector("h1")?.textContent||document.querySelector("header strong")?.textContent||document.title.replace(/PARISIS ENGINE[ ·—-]*/ig,"")).slice(0,145)||"Recherche historique";
  const desc=escText(document.querySelector("header p,.hero p,main > p,.lead p,.intro")?.textContent).slice(0,230)||"Enquête historique, documents et contrôles des sources.";
  const area=/nesle|le-vau|levau|axe-01[456]/.test(file)?"Nesle · Seine · Archives":/hugo|ananke|notre-dame/.test(file)?"Victor Hugo · Paris":/vasserot|alpage|1551|cartography/.test(file)?"Cartes · Plans · Géométrie":/fouquet|dagobert|ghost|trace/.test(file)?"Manuscrits · Iconographie":/par-isis/.test(file)?"PAR ISIS · Atlas des symboles":/hum-002|abel-gance/.test(file)?"HUM-002 · Histoire urbaine":"PARISIS · Humanités numériques";
  const commons={
   nesle:{image:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Vue_de_la_Tour_de_Nesle_et_du_Louvre._G.287%282%29.jpg/960px-Vue_de_la_Tour_de_Nesle_et_du_Louvre._G.287%282%29.jpg",link:"https://commons.wikimedia.org/wiki/File:Vue_de_la_Tour_de_Nesle_et_du_Louvre._G.287(2).jpg",caption:"Vue historique de la Tour de Nesle et du Louvre · Wikimedia Commons"},
   turgot:{image:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Plan_de_Turgot_detail.jpg/960px-Plan_de_Turgot_detail.jpg",link:"https://commons.wikimedia.org/wiki/File:Plan_de_Turgot_detail.jpg",caption:"Plan de Turgot, Paris au XVIIIe siècle · Wikimedia Commons"},
   fouquet:{image:"https://upload.wikimedia.org/wikipedia/commons/f/fc/Notre_Dame_%28La_Descente_du_Saint-Esprit%29.jpg",link:"https://commons.wikimedia.org/wiki/File:Notre_Dame_(La_Descente_du_Saint-Esprit).jpg",caption:"Document iconographique historique · Wikimedia Commons"}
  };
  const visual=/nesle|le-vau|levau|axe-01[456]/.test(file)?commons.nesle:/fouquet|dagobert/.test(file)?commons.fouquet:commons.turgot;
  function a(text,url){const el=document.createElement("a");el.textContent=text;el.href=url;return el}
  const nav=document.createElement("div");nav.className="pe-masthead";nav.setAttribute("role","navigation");nav.setAttribute("aria-label","Navigation de la revue PARISIS");
  const logo=a("PARISIS ENGINE","eloah-parisis.html");logo.className="pe-logo";nav.append(logo);
  const links=document.createElement("nav");[
   ["Accueil PARISIS","eloah-parisis.html"],
   ["Toutes les enquêtes","parisis-publications.html"],
   ["Atlas complet","parisis-hugo-axes.html?all=1"],
   ["Cartographie","parisis-cartography-lab.html"],
   ["Mes univers","mes-univers.html"]
  ].forEach(([label,url])=>links.append(a(label,url)));nav.append(links);
  const originalBodyDisplay=getComputedStyle(document.body).display;
  const target=(originalBodyDisplay==="grid"||originalBodyDisplay==="flex")?(document.querySelector("main")||document.body):document.body;
  target.prepend(nav);
  const hero=document.createElement("section");hero.className="pe-cover"+(tool?" pe-compact":"");
  hero.setAttribute("aria-label","Présentation du dossier");
  const copy=document.createElement("div");copy.className="pe-cover-copy";
  const kicker=document.createElement("div");kicker.className="pe-kicker";kicker.textContent="ELOAH · PARISIS ENGINE · "+area;
  const heading=document.createElement("h2");heading.textContent=title;
  const sub=document.createElement("p");sub.textContent=desc;copy.append(kicker,heading,sub);
  const actions=document.createElement("div");actions.className="pe-cover-actions";
  const read=a(tool?"Accéder à l’outil ↓":"Lire le dossier ↓","#pe-reading");
  actions.append(read,a("Toutes les enquêtes ↗","parisis-publications.html"));copy.append(actions);hero.append(copy);
  if(!tool){
   const figure=document.createElement("figure");figure.className="pe-cover-image";
   const im=document.createElement("img");im.src=visual.image;im.alt=visual.caption;im.loading="lazy";im.width=960;im.height=620;
   const figcap=document.createElement("figcaption");figcap.append(visual.caption+" · ",a("Source et crédits ↗",visual.link));
   figure.append(im,figcap);hero.append(figure);
  }
  nav.after(hero);
  const originalTarget=target===document.body?[...document.body.children].find(child=>child!==nav&&child!==hero&&!child.classList.contains("eloah-global-nav")):target.querySelector("main,header,.layout,.card")||target;
  if(originalTarget&&originalTarget!==nav&&originalTarget!==hero)originalTarget.id=originalTarget.id||"pe-reading";
  else {const marker=document.createElement("span");marker.id="pe-reading";hero.after(marker)}
  if(!tool){
   const related={
    nesle:[["Atlas cartographique","parisis-hugo-axes.html?all=1"],["Le Vau et Nesle","parisis-axe-014-levau-archives.html"],["Vasserot","parisis-vasserot-1810-1836.html"]],
    hugo:[["Victor Hugo · Atlas","parisis-hugo-axes.html"],["Notre-Dame","parisis-hugo-notre-dame.html"],["L’axe nord–sud","parisis-axe-spirituel-nord-sud.html"]],
    source:[["Les manuscrits","parisis-dagobert-manuscrits-comparaison.html"],["Archives Vasserot","parisis-vasserot-1810-1836.html"],["Toutes les enquêtes","parisis-publications.html"]]
   };
   const list=/nesle|le-vau|levau|axe-01[456]/.test(file)?related.nesle:/hugo|ananke|notre-dame/.test(file)?related.hugo:related.source;
   const tail=document.createElement("section");tail.className="pe-tail";tail.setAttribute("aria-label","Poursuivre les recherches");
   const h=document.createElement("h2");h.textContent="Poursuivre l’enquête";tail.append(h);
   const grid=document.createElement("div");grid.className="pe-tail-items";
   list.filter(x=>x[1]!==file).slice(0,3).forEach(([label,url])=>{const link=a(label,url);const small=document.createElement("small");small.textContent="PARISIS · DOSSIER LIÉ";link.prepend(small);grid.append(link)});tail.append(grid);
   (document.querySelector("main")||target).append(tail);
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
