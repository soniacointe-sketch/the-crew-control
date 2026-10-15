/* PARISIS ENGINE · ALPHA-014 — écouter le concepteur par les témoignages antiques.
 * Le discours de Marcus est médiatisé par Irénée : aucune fausse citation à la première personne.
 */
(function(){
"use strict";
const M=window.PARISIS_ALPHA_MARCUS;
const reader=document.getElementById("alpha-jesus");
if(!M||!reader)return;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const css=document.createElement("style");
css.textContent=`
#alpha-marcus{background:linear-gradient(130deg,#26212d,#2e2835);border:1px solid #997453;border-top:4px solid #e5c17f;padding:clamp(16px,3vw,28px);color:#fff0df;margin:23px 0;font:13px/1.7 system-ui;min-width:0}
#alpha-marcus h2,#alpha-marcus h3{font-family:Georgia,serif;font-weight:normal;color:#ffefdd}
#alpha-marcus h2{font-size:clamp(29px,3.5vw,43px);line-height:1.15;margin:9px 0}
#alpha-marcus h3{font-size:24px;margin:19px 0 9px}
#alpha-marcus p{color:#e1cfc3;font-size:13px}
#alpha-marcus .m-eyebrow{letter-spacing:.15em;color:#e8cb93;font-size:11px;font-weight:800}
#alpha-marcus .m-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
#alpha-marcus .m-panel{border:1px solid #665b62;background:#302d38;padding:17px;min-width:0}
#alpha-marcus .m-number{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin:13px 0}
#alpha-marcus .m-number span{background:#4b384a;color:#fae2be;border:1px solid #977883;min-width:43px;padding:8px;font:23px Georgia,serif;text-align:center}
#alpha-marcus .m-number strong{font:29px Georgia,serif;color:#f5d39b}
#alpha-marcus .m-note{border-left:3px solid #e6c17f;padding:11px 14px;background:#403440;color:#f3e0c9;margin:13px 0;font-size:12px}
#alpha-marcus .m-alert{border-left:3px solid #d6a178;padding:12px;background:#432e3a;color:#ffead3}
#alpha-marcus .m-list{display:grid;gap:8px}
#alpha-marcus .m-list article{padding:11px 12px;background:#302c35;border:1px solid #705b61}
#alpha-marcus .m-list b{color:#edcb9a}
#alpha-marcus a{color:#f1d097;overflow-wrap:anywhere}
#alpha-marcus button,#alpha-marcus select{font:inherit}
#alpha-marcus button{border:1px solid #bb9564;background:#563f52;padding:9px 12px;color:#ffe2bd;cursor:pointer}
#alpha-marcus button:hover{background:#745468}
#alpha-marcus select{padding:9px;color:#241b21;background:#fff6eb;border:1px solid #b8a19f}
#alpha-marcus .m-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:11px 0}
#alpha-marcus .m-result{background:#332e39;border:1px solid #80636b;margin-top:12px;padding:12px;min-height:50px}
#alpha-marcus .m-stage{padding:6px 0;border-bottom:1px solid #705e64;word-break:break-word;font-size:12px}
#alpha-marcus .m-stage strong{color:#f4d09f}
#alpha-marcus .m-sources{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
#alpha-marcus .m-sources a{border:1px solid #75616b;padding:8px 11px;font-size:11px;text-decoration:none}
@media(max-width:730px){#alpha-marcus .m-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(css);
const app=document.createElement("section");
app.id="alpha-marcus";
app.setAttribute("aria-label","Enquête sur les propres enseignements attribués à Marcus");
app.innerHTML=`
<div class="m-eyebrow">HUMANITIES LAB · ALPHA-014 · LIRE L'AUTEUR DU SYSTÈME</div>
<h2>Et que disait Marcus <em style="color:#e8c47e">de ce qu'il avait élaboré ?</em></h2>
<p>Nous ne connaissons pas ses paroles directement : Irénée rapporte et combat sa doctrine vers 180. Au lieu de lancer seulement des additions sur les paroles de Jésus, le programme examine maintenant <strong>ce que le système prétend expliquer</strong> et quels calculs appartiennent réellement au témoignage antique.</p>
<div class="m-grid">
<div class="m-panel">
 <h3>La naissance du Nom</h3>
 <p>Quatre émissions symboliques selon <a href="https://www.newadvent.org/fathers/0103114.htm" target="_blank" rel="noopener noreferrer">Irénée I,14,1</a>.</p>
 <div id="mThirty" class="m-number"></div>
 <div class="m-note">Il s'agit de tailles annoncées dans un récit théologique, pas du nom de trente lettres conservé sous sa forme intégrale.</div>
 <h3>La Tétrade des quatre noms</h3>
 <div id="mTetrad" class="m-list"></div>
 <div id="mVariant" class="m-alert" role="status"></div>
</div>
<div class="m-panel">
 <h3>Les trois familles de lettres</h3>
 <div id="mClasses" class="m-number"></div>
 <p>Les catégories sont celles d'une grammaire antique investie de correspondances religieuses, non des phonèmes contemporains.</p>
 <h3>La voix et les sept cieux</h3>
 <div id="mVowels" class="m-number"></div>
 <div class="m-note">Le son, la naissance et la création sont associés dans le récit d'Irénée I,14,7–8. Rien ne permet de les réduire à des fréquences mesurées.</div>
</div>
</div>
<div class="m-grid">
<div class="m-panel">
 <h3>Une lettre qui engendre d'autres lettres</h3>
 <p>Marcus utilise notamment le nom de <strong>Delta</strong> pour représenter un développement des noms de lettres. Simule ce mécanisme, sans l'assimiler à une transcription d'un rituel ancien.</p>
 <div class="m-controls">
 <label for="mLetter">Lettre grecque
 <select id="mLetter"></select></label>
 <label for="mDepth">Niveaux
 <select id="mDepth"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="4">4</option></select></label>
 <button type="button" id="mExpand">Développer les noms</button>
 </div>
 <div id="mExpansion" class="m-result" role="status" aria-live="polite"></div>
</div>
<div class="m-panel">
 <h3>La différence qui change tout</h3>
 <div class="m-list">
  <article><b>Ce qu'on prononce</b><div>Le nom audible, accessible à tous selon la Tétrade rapportée par Irénée.</div></article>
  <article><b>Ce qu'on calcule</b><div>Le nombre des lettres, les classes et certaines valeurs numérales.</div></article>
  <article><b>Ce qu'on prétend connaître</b><div>La « puissance » spirituelle du nom. Elle ne se déduit pas mécaniquement des calculs.</div></article>
 </div>
 <p>Dans I,14,4, Alètheia prononce le nom de Christ Jésus et se tait. Le texte attribue à la Tétrade la distinction entre le <em>son</em> du nom et sa <em>puissance</em>.</p>
</div>
</div>
<h3>Contrôle critique de la doctrine rapportée</h3>
<div id="mAudit" class="m-list"></div>
<div id="mVerdict" class="m-note"></div>
<div class="m-sources">
<a href="https://www.newadvent.org/fathers/0103114.htm" target="_blank" rel="noopener noreferrer">Source · Irénée I,14 ↗</a>
<a href="https://www.newadvent.org/fathers/0103115.htm" target="_blank" rel="noopener noreferrer">Source · Irénée I,15 ↗</a>
<a href="https://github.com/soniacointe-sketch/the-crew-control/blob/main/corpus/parisis-alpha-014-voix-marcus.md" target="_blank" rel="noopener noreferrer">Enquête critique ALPHA-014 ↗</a>
</div>
`;
reader.insertAdjacentElement("afterend",app);
const $=id=>app.querySelector("#"+id);
const audit=M.audit(),d=audit.result;
$("mThirty").innerHTML=d.nameOfThirty.segments.map(x=>'<span>'+x+'</span>').join(" + ")+' <strong> = '+d.nameOfThirty.sum+'</strong>';
$("mTetrad").innerHTML=d.tetrad.names.map(n=>'<article><b>'+esc(n.greek)+'</b> · '+n.calculated+' lettres · '+esc(n.name)+' ('+esc(n.meaning)+')</article>').join("")+
 '<article><b>Total de cette graphie : '+d.tetrad.total+'</b></article>';
$("mVariant").textContent="TEST DE VARIANTE : avec ΣΕΙΓΗ (5 lettres), le total est 24 ; avec ΣΙΓΗ (4 lettres), il tombe à 23. Une graphie doit être attestée et justifiée, jamais modifiée en cachette pour obtenir le nombre voulu.";
$("mClasses").innerHTML=[d.languageClasses.mutes,d.languageClasses.semivowels,d.languageClasses.vowels].map(n=>'<span>'+n+'</span>').join(" + ")+'<strong> = 24</strong>';
$("mVowels").innerHTML=d.heavens.vowels.map(l=>'<span>'+l+'</span>').join("")+'<strong>7 cieux</strong>';
$("mLetter").innerHTML=Object.keys(M.letterNames).map(l=>'<option value="'+l+'"'+(l==="Δ"?" selected":"")+'>'+l+" · "+esc(M.letterNames[l])+'</option>').join("");
$("mAudit").innerHTML=audit.checks.map(ch=>'<article><b>'+esc(ch.pass?"✓":"ÉCHEC")+' · '+esc(ch.id)+'</b> · '+esc(ch.name)+'</article>').join("");
$("mVerdict").textContent=audit.conclusion+" Contrôles automatiques réussis : "+audit.passed+"/"+audit.total+". Ces tests vérifient la cohérence du système reconstitué, pas son origine divine.";
function expand(){
 try{
  const out=M.expand($("mLetter").value,Number($("mDepth").value),8000);
  $("mExpansion").innerHTML=out.stages.map(s=>
   '<div class="m-stage"><strong>Niveau '+s.level+'</strong> · '+esc(s.length==null?"limite atteinte":s.length+" caractères")+
   '<div>'+esc(s.preview)+'</div></div>'
  ).join("")+'<p>'+esc(out.warning)+'</p>';
 }catch(err){$("mExpansion").textContent=err.message}
}
$("mExpand").addEventListener("click",expand);
expand();
})();
