/* ELOAH · PARISIS ENGINE · ALPHA / REPONSE 1.0
  Moteur explicatif déterministe sur des références explicitement documentées.
  Aucune donnée privée, aucun réseau, aucune conclusion mystique générée par calcul.
*/
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER,P=root?.PARISIS_ALPHA_PAROLES;
if(!R||!P)return;
const SOURCES=Object.freeze([
 {id:"JEAN-14-6",title:"Évangile de Jean, 14,6",ref:"Jean 14,6",url:"https://www.biblegateway.com/passage/?search=John%2014%3A6&version=SBLGNT",date:"Évangile généralement daté vers la fin du Ier siècle ; datation débattue",category:"source antique transmise",scope:"Dans la version grecque de Jean, Jésus dit être le chemin, la vérité et la vie.",limitation:"Texte grec transmis, non enregistrement vocal de Jésus historique."},
 {id:"IRENEE-14-3",title:"Irénée, Contre les hérésies I,14,3",ref:"I,14,3",url:"https://www.newadvent.org/fathers/0103114.htm",date:"Vers 180",category:"témoignage polémique",scope:"Irénée rapporte un corps personnifiant Alètheia, composé des 24 lettres grecques par douze paires.",limitation:"Parole rapportée par un adversaire ; aucun dessin anatomique original de Marcus conservé."},
 {id:"IRENEE-14-4",title:"Irénée, Contre les hérésies I,14,4",ref:"I,14,4",url:"https://www.newadvent.org/fathers/0103114.htm",date:"Vers 180",category:"témoignage polémique",scope:"Dans le récit marcosien transmis par Irénée, Alètheia prononce le nom de Christ Jésus.",limitation:"Ne constitue pas une citation démontrée de Jean 14,6."},
 {id:"IRENEE-14-5",title:"Irénée, Contre les hérésies I,14,5",ref:"I,14,5",url:"https://www.newadvent.org/fathers/0103114.htm",date:"Vers 180",category:"témoignage polémique",scope:"Irénée rapporte 9 muettes, 8 semi-voyelles et 7 voyelles.",limitation:"Grammaire religieuse antique, pas phonétique contemporaine."},
 {id:"IRENEE-14-7",title:"Irénée, Contre les hérésies I,14,7",ref:"I,14,7",url:"https://www.newadvent.org/fathers/0103114.htm",date:"Vers 180",category:"témoignage polémique",scope:"Sept voyelles distribuées entre sept cieux dans la doctrine rapportée.",limitation:"Le passage ne permet pas de déduire une doctrine commune à tous les auteurs chrétiens."}
]);
const source=id=>SOURCES.find(x=>x.id===id);
function check(text,condition,yes,no){
 return {check:text,result:!!condition,meaning:condition?yes:no};
}
function answerFor(id){
 const verse=P.select(id);
 if(!verse)throw Error("Aucun passage référencé sous cet identifiant.");
 const observation=P.decode(id);
 const focus=R.analyzeWord(verse.marker);
 const byVerse=verse.id==="jn14-6";
 const controls=["ζωή","ὁδός","λόγος"].map(g=>{
  const a=R.analyzeWord(g);
  return {word:g,normalized:a.normalized,number:a.isopsephy,letters:a.length,anatomicalParts:a.bodyCounts.length,completedPairs:a.pairCompletionCount};
 });
 const tests=[
  check("Le mot analysé est présent dans l'extrait grec éditorial de l'Évangile.",observation.words.some(w=>w.normalized===focus.normalized),"Forme grecque relevée dans le passage.","La graphie du mot-clé n'est pas présente."),
  check("Chacune des douze paires totalise 25 par rang dans l'alphabet grec.",R.pairs.length===12&&R.pairs.every(p=>p.ranks[0]+p.ranks[1]===25),"Propriété de construction de l'alphabet à 24 lettres.","Échec de la règle numérique attendue."),
  check("Le mot-clé contient toutes les douze paires, soit les 24 lettres.",focus.pairCompletionCount===12,"Ensemble de paires complet dans la forme sélectionnée.","Non : le corps d'Alètheia correspond à l'alphabet entier, et non au seul mot analysé."),
  check("Les valeurs des lettres donnent un total isopséphique reproductible.",focus.letters.reduce((s,x)=>s+x.value,0)===focus.isopsephy,"Somme vérifiée, sans signification religieuse automatique.","Somme incohérente."),
  check("Les sources étudiées citent explicitement Jean 14,6 comme origine de la doctrine de Marcus.",false,"Transmission directe documentée.","Aucune citation explicite identifiée dans les pièces examinées : filiation non prouvée.")
 ];
 const conclusions=byVerse?[
  {level:"T · ATTESTÉ",statement:"Dans Jean 14,6, Jésus est désigné comme la Vérité (ἀλήθεια).",sourceIds:["JEAN-14-6"]},
  {level:"T · ATTESTÉ",statement:"Dans le témoignage d'Irénée, Alètheia représente les 24 lettres, puis prononce le nom de Christ Jésus.",sourceIds:["IRENEE-14-3","IRENEE-14-4"]},
  {level:"N · CALCUL",statement:"Le mot ΑΛΗΘΕΙΑ compte "+focus.length+" lettres, a pour somme isopséphique "+focus.isopsephy+" et mobilise "+focus.bodyCounts.length+" parties du corps, sans paire complète à lui seul.",sourceIds:[]},
  {level:"H · NON DÉMONTRÉ",statement:"La reprise directe de Jean 14,6 par Marcus et l'existence d'un code intentionnel transmis par Jésus ne sont pas établies.",sourceIds:["JEAN-14-6","IRENEE-14-4"]}
 ]:[
  {level:"T · ATTESTÉ",statement:"La parole étudiée figure dans la tradition grecque de "+verse.ref+".",sourceIds:["JEAN-14-6"].filter(()=>false)},
  {level:"N · CALCUL",statement:"Le mot "+focus.normalized+" compte "+focus.length+" lettres et sa somme isopséphique vaut "+focus.isopsephy+".",sourceIds:[]},
  {level:"H · NON DÉMONTRÉ",statement:"Aucun lien direct avec la doctrine des douze parties d'Alètheia n'est établi par ces résultats.",sourceIds:["IRENEE-14-3"]}
 ];
 const answer=byVerse?
 "La réponse est une convergence historique de vocabulaire et de représentation de la Vérité : Jean attribue à Jésus la formule « je suis la vérité » ; un courant chrétien du IIe siècle décrit Alètheia comme un corps de lettres et lui fait prononcer le nom de Christ Jésus. Ces rapprochements sont textuellement attestés. Le nombre 64 et les paires corporelles sont calculables, mais ne prouvent ni que Marcus a copié Jean 14,6, ni que Jésus a dissimulé une structure alphabétique dans ses paroles.":
 "Pour "+verse.ref+", le code identifie exactement les lettres grecques et leur correspondance dans le corps d'Alètheia. La somme numérique obtenue est un fait arithmétique ; elle ne fournit, à elle seule, aucune preuve d'un message caché ou d'une transmission doctrinale.";
 const missing=byVerse?[
  "Un texte marcosien de première main, ou une citation ancienne explicite, établissant la reprise de Jean 14,6.",
  "Une étude contrôlée des variantes grecques pertinentes, et la mise en contexte des usages ordinaires du mot ἀλήθεια.",
  "Une justification ancienne d'une signification doctrinale attachée spécifiquement à la valeur 64 — absente des passages contrôlés."
 ]:[
  "Une mention ancienne explicitant que la graphie de "+focus.normalized+" avait une interprétation marcosienne.",
  "Des parallèles textuels datés et un canal de transmission documenté plutôt qu'une seule ressemblance formelle."
 ];
 return {version:"ALPHA-REPONSE/1.0.0",id:verse.id,ref:verse.ref,greek:verse.greek,french:verse.french,focus:{
  original:verse.marker,normalized:focus.normalized,letters:focus.length,isopsephy:focus.isopsephy,ranksTotal:focus.alphabetRanksTotal,
  parts:focus.bodyCounts.map(p=>({body:p.part,letters:p.letters,count:p.count})),completedPairs:focus.pairedLetterSets,
  decomposition:focus.letters.map(l=>({letter:l.letter,partner:l.partner,body:l.body,rank:l.rank,value:l.value}))
 }, tests,controls,conclusions,answer,missing,sources:byVerse?SOURCES:SOURCES.filter(s=>s.id.startsWith("IRENEE")),limitation:"Analyse sur un corpus éditorial limité : aucune enquête exhaustive des manuscrits ou preuve de transmission n'est automatiquement établie."};
}
function markdown(out){
 const ls=[
 "# "+out.ref+" — ALPHA, réponse documentée",
 "**ELOAH · PARISIS ENGINE · HUMANITIES LAB**",
 "", "## Parole étudiée",out.french,"",out.greek,"",
 "## Calcul contrôlé",out.focus.normalized+" : "+out.focus.letters+" lettres · rangs cumulés "+out.focus.ranksTotal+" · isopséphie "+out.focus.isopsephy+".",
 "Paires complètes dans le mot : "+out.focus.completedPairs.length+".",
 ...out.focus.decomposition.map(l=>"- "+l.letter+" · rang "+l.rank+" · opposée "+l.partner+" · "+l.body+" · isopséphie "+l.value),
 "", "## Contrôles",...out.tests.map(x=>"- "+x.check+" — "+(x.result?"OUI":"NON")+" : "+x.meaning),
 "", "## Conclusion",out.answer,"", "## Sources",
 ...out.sources.map(x=>"- "+x.title+" — "+x.url+" ("+x.limitation+")"),
 "", "## À rechercher",...out.missing.map(x=>"- "+x),"",out.limitation
 ];
 return ls.join("\n")+"\n";
}
const api=Object.freeze({version:"ALPHA-REPONSE/1.0.0",sources:SOURCES,answerFor,markdown});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_REPONSE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
