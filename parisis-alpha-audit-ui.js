/* ELOAH · PARISIS ENGINE · ALPHA-C7 — interface d'exécution de l'audit historique.
 * Réexécute les règles de parisis-alpha-engine.js, permet les comparaisons et exports.
 */
(function(){
  "use strict";
  const engine=window.PARISIS_ALPHA_ENGINE;
  const host=document.querySelector("main.wrap");
  if(!engine||!host){console.warn("PARISIS ALPHA : moteur ou page indisponible");return;}
  const styles=document.createElement("style");
  styles.textContent=`
  #alpha-audit{background:#221f28;border:1px solid #a68864;padding:clamp(16px,3vw,29px);margin:10px 0 35px}
  #alpha-audit .aa-heading{display:flex;justify-content:space-between;gap:14px;align-items:center;flex-wrap:wrap}
  #alpha-audit h2{font:normal clamp(27px,3vw,40px) Georgia,serif;margin:8px 0}
  #alpha-audit p{color:#ded2c4;font-size:13px;max-width:100%}
  #alpha-audit button,#alpha-audit select,#alpha-audit input{font:inherit}
  #alpha-audit button{border:1px solid #c59b65;background:#412d42;color:#f4dfb8;border-radius:3px;padding:10px 13px;cursor:pointer}
  #alpha-audit button:hover{background:#5d4156}
  #alpha-audit .aa-primary{background:#ebc780;color:#242124;font-weight:800}
  #alpha-audit .aa-tools{display:flex;gap:8px;flex-wrap:wrap}
  #alpha-audit .aa-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:18px 0}
  #alpha-audit .aa-kpi{border:1px solid #6c5a52;background:#2d2b34;padding:13px}
  #alpha-audit .aa-kpi strong{font:normal 31px Georgia,serif;display:block;color:#f4d394}
  #alpha-audit .aa-kpi small{color:#c9beb6;font-size:11px}
  #alpha-audit details{border:1px solid #66564b;margin:8px 0;background:#302d35}
  #alpha-audit summary{cursor:pointer;padding:12px 14px;color:#f1d59b;font-size:13px;font-weight:750}
  #alpha-audit details .aa-detail{padding:0 14px 14px}
  #alpha-audit .aa-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #alpha-audit label{font-size:12px;color:#dfcfbb;display:block}
  #alpha-audit select,#alpha-audit input{width:100%;color:#242024;background:#fff6e9;border:0;border-radius:3px;padding:12px;margin-top:6px;min-height:44px}
  #alpha-audit .aa-tools-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  #alpha-audit .aa-row{display:flex;align-items:center;gap:10px;margin:14px 0;flex-wrap:wrap}
  #alpha-audit .aa-result{padding:13px 16px;background:#3a303a;border-left:3px solid #dfb872;color:#f7eddd;min-height:56px;margin-top:10px;line-height:1.6;font-size:13px}
  #alpha-audit .aa-warning{color:#ffd9b0}
  #alpha-audit .aa-table-wrap{overflow:auto;max-height:260px}
  #alpha-audit table{width:100%;border-collapse:collapse;min-width:500px;font-size:12px}
  #alpha-audit td,#alpha-audit th{padding:9px 8px;text-align:left;border-bottom:1px solid #65554d}
  #alpha-audit th{color:#f0cd8f}
  #alpha-audit ul{padding-left:18px;color:#e9dece}
  #alpha-audit li{margin:9px 0;font-size:12px}
  #alpha-audit a{color:#f0d295}
  #alpha-audit .aa-foot{margin:19px 0 0;font-size:11px;color:#c5b6a9}
  @media(max-width:720px){#alpha-audit .aa-grid{grid-template-columns:1fr}#alpha-audit .aa-kpis{grid-template-columns:repeat(2,1fr)}#alpha-audit .aa-tools-form{grid-template-columns:1fr}}
  `;
  document.head.appendChild(styles);
  const card=document.createElement("section");
  card.id="alpha-audit";
  card.setAttribute("aria-label","Programme d'enquête ALPHA-C7");
  card.innerHTML=`
  <div class="aa-heading">
    <div><span class="kicker">MOTEUR D'ENQUÊTE · 7 MÉTHODES EXÉCUTÉES</span><h2>ALPHA-C7 · Analyse automatique</h2></div>
    <div class="aa-tools"><button id="aaRerun" type="button" class="aa-primary">↻ Exécuter l'audit</button><button id="aaExport" type="button">↓ Rapport JSON</button></div>
  </div>
  <p>Programme réel : règles mathématiques, vérification du corpus, croisements de motifs, sens de circulation et détection des lacunes. Les sources sont cataloguées et vérifiées manuellement ; il ne s'agit pas d'une veille web automatique.</p>
  <div class="aa-kpis" id="aaKpis" aria-live="polite"></div>
  <div class="aa-grid">
    <div>
      <details open><summary>Résultats des contrôles (calculés)</summary><div class="aa-detail aa-table-wrap" id="aaChecks"></div></details>
      <details open><summary>Hypothèses croisées (sans faux liens)</summary><div class="aa-detail" id="aaHypotheses"></div></details>
      <details><summary>Problèmes à instruire / sources manquantes</summary><div class="aa-detail" id="aaIssues"></div></details>
    </div>
    <div>
      <div class="kicker">STEMMA · COMPARAISON À LA DEMANDE</div>
      <p>Choisis deux sources : le programme calcule les motifs communs, la compatibilité chronologique et le niveau de preuve. La ressemblance n'est jamais affichée comme preuve d'un emprunt.</p>
      <div class="aa-tools-form"><label>Source antérieure supposée<select id="aaSourceA"></select></label><label>Source comparée<select id="aaSourceB"></select></label></div>
      <div class="aa-row"><button id="aaCompare" type="button">Croiser ces deux témoins</button></div>
      <div class="aa-result" role="status" aria-live="polite" id="aaCompared">Sélectionne deux sources à comparer.</div>
      <div class="kicker" style="margin-top:25px">ARITHMOS · ANALYSEUR GREC</div>
      <p>Saisis un mot grec : l'outil calcule son isopséphie avec les valeurs traditionnelles. Un résultat numérique n'est pas une preuve de doctrine.</p>
      <label>Mot grec<input id="aaGreek" type="text" autocomplete="off" spellcheck="false" maxlength="120" value="Ἰησοῦς" placeholder="ΙΗΣΟΥΣ, περιστερά ou autre mot grec"></label>
      <div class="aa-row"><button type="button" id="aaCompute">Calculer les valeurs des lettres</button></div>
      <div class="aa-result" id="aaGreekResult" aria-live="polite">Lance le calcul pour obtenir la somme décomposée.</div>
    </div>
  </div>
  <p class="aa-foot" id="aaFooter"></p>
  `;
  host.insertBefore(card,host.firstChild);
  const byId=id=>document.getElementById(id);
  const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const buildOption=(s)=>'<option value="'+esc(s.id)+'">'+esc(s.short)+'</option>';
  byId("aaSourceA").innerHTML=engine.corpus.sources.map(buildOption).join("");
  byId("aaSourceB").innerHTML=engine.corpus.sources.map(buildOption).join("");
  byId("aaSourceA").value="apocalypse-tonnerres";byId("aaSourceB").value="irenee-14";
  let current=null;
  function render(){
    current=engine.run();
    const n=current.report;
    const kpis=[[""+n.passed+"/"+n.checks,"Contrôles calculés réussis"],[n.sources,"Sources indexées"],[n.hypotheses,"Hypothèses examinées"],[n.unproven,"Filiations non démontrées"]];
    byId("aaKpis").innerHTML=kpis.map(([num,desc])=>'<div class="aa-kpi"><strong>'+esc(num)+'</strong><small>'+esc(desc)+'</small></div>').join("");
    byId("aaChecks").innerHTML='<table><thead><tr><th>Opération</th><th>Résultat</th><th>Test</th></tr></thead><tbody>'+current.checks.map(c=>'<tr><td>'+esc(c.label)+'</td><td>'+esc(c.actual)+'</td><td>'+(c.ok?'✓':'ÉCHEC')+'</td></tr>').join("")+'</tbody></table>';
    byId("aaHypotheses").innerHTML='<ul>'+current.hypotheses.map(h=>'<li><strong>'+esc(h.id+' · '+h.name)+'</strong><div>'+esc(h.status)+' · <a href="'+esc(h.sourceURLs[0])+'" target="_blank" rel="noopener noreferrer">'+esc(h.sourceA)+'</a> / <a href="'+esc(h.sourceURLs[1])+'" target="_blank" rel="noopener noreferrer">'+esc(h.sourceB)+'</a> · points communs : '+esc(h.shared.join(", ")||"aucun")+'</div><small class="aa-warning">Objection : '+esc(h.objection)+'</small></li>').join("")+'</ul>';
    byId("aaIssues").innerHTML=current.issues.length?'<ul>'+current.issues.map(x=>'<li>'+esc(x.type+' : '+x.text)+'</li>').join("")+'</ul>':"Aucune lacune détectée par ces règles limitées.";
    byId("aaFooter").textContent="Corpus éditorial daté du "+engine.corpus.asOf+" · Logiciel "+engine.version+" · Les "+n.checks+" contrôles valident seulement les données et opérations encodées, pas l'exactitude indépendante de tous les récits antiques. Aucun transfert de données privées.";
  }
  byId("aaRerun").addEventListener("click",render);
  byId("aaCompare").addEventListener("click",function(){
    const idA=byId("aaSourceA").value,idB=byId("aaSourceB").value;
    const a=engine.corpus.sources.find(s=>s.id===idA),b=engine.corpus.sources.find(s=>s.id===idB);
    if(!a||!b||a.id===b.id){byId("aaCompared").textContent="Choisis deux sources différentes.";return;}
    const shared=a.motifs.filter(m=>b.motifs.includes(m));
    const informative=shared.filter(m=>!["7","son","nom-lettres"].includes(m));
    let chrono;
    if(a.date.min==null||b.date.max==null)chrono="ordre indéterminé (datation insuffisante)";
    else if(a.date.min>b.date.max)chrono="ordre défavorable à une transmission A vers B";
    else if(a.date.max!=null&&b.date.min!=null&&a.date.max<b.date.min)chrono="antériorité compatible";
    else chrono="périodes qui se chevauchent ou bornes insuffisantes";
    byId("aaCompared").textContent="Motifs communs : "+(shared.join(", ")||"aucun")+". Motifs distinctifs partagés : "+(informative.join(", ")||"aucun")+". Chronologie : "+chrono+". Verdict : COMPARAISON POSSIBLE, EMPRUNT NON DÉMONTRÉ. Un témoin indépendant ou une citation directe manque.";
  });
  byId("aaCompute").addEventListener("click",function(){
    const raw=byId("aaGreek").value;
    const normal=raw.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\u03C2/g,"Σ").replace(/[\s\-·.,;:!?]/g,"");
    if(!normal){byId("aaGreekResult").textContent="Entre un mot grec.";return;}
    const values=engine.corpus.numerals;
    const letters=[...normal];
    const unknown=letters.filter(c=>!Object.prototype.hasOwnProperty.call(values,c));
    if(unknown.length){byId("aaGreekResult").textContent="Caractères non reconnus par cette table grecque : "+unknown.join(", ")+". Aucune valeur inventée.";return;}
    const nums=letters.map(c=>values[c]);
    const sum=nums.reduce((a,b)=>a+b,0);
    byId("aaGreekResult").textContent=normal+" : "+nums.join(" + ")+" = "+sum+". Somme formelle, pas preuve historique.";
  });
  byId("aaExport").addEventListener("click",function(){
    const report=JSON.stringify({generatedAt:new Date().toISOString(),corpusVersion:engine.version,scope:engine.corpus.editorialScope,...engine.run()},null,2);
    const blob=new Blob([report],{type:"application/json;charset=utf-8"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="PARISIS-ALPHA-C7-audit.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  });
  render();
})();
