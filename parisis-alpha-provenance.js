/* ELOAH · PARISIS ENGINE · ALPHA-019
 * Une citation répétée n'est pas un nouveau témoin indépendant.
 * Critique des sources : dépendance explicitée, enquête alléguée, tradition voisine.
 * Aucun accès aux données privées ni import de contenu distant implicite.
 */
(function(root) {
"use strict";
const WITNESSES=Object.freeze([
 {id:"iren14",short:"Irénée I,14–15",author:"Irénée de Lyon",period:"vers 180",kind:"témoin polémique principal",url:"https://www.newadvent.org/fathers/0103114.htm",family:"tradition-irenee",note:"Expose le système alphabétique attribué à Marcus. L'auteur combat la doctrine."},
 {id:"iren21",short:"Irénée I,21",author:"Irénée de Lyon",period:"vers 180",kind:"autre section du même auteur",url:"https://www.newadvent.org/fathers/0103121.htm",family:"tradition-irenee",note:"Relate plusieurs rites de rédemption, certains rejetant les rites au profit de la connaissance."},
 {id:"hip36",short:"Réfutation VI,36–37",author:"Auteur de la Réfutation (trad. Hippolyte)",period:"IIIe siècle",kind:"déclare avoir enquêté au-delà d'Irénée",url:"https://www.newadvent.org/fathers/050106.htm",family:"refutation-hippolyte",note:"Décrit l'énoncé d'une parole secrète et revendique une recherche plus approfondie sur les bains et la rédemption."},
 {id:"hip37",short:"Réfutation VI,37–38",author:"Auteur de la Réfutation (trad. Hippolyte)",period:"IIIe siècle",kind:"cite Irénée et reprend Marcus",url:"https://www.newadvent.org/fathers/050106.htm",family:"tradition-irenee",note:"Le texte reconnaît expressément Irénée comme antécédent et reproduit le cadre doctrinal."},
 {id:"epiph21",short:"Épiphane, Panarion 34,21,1",author:"Épiphane de Salamine",period:"vers 374–377",kind:"déclare reproduire Irénée",url:"https://www.sophiascriptura.com/fathers/epiphanius-panarion/34-19-1/#p-34-21-1",family:"tradition-irenee",note:"Épiphane présente l'enquête d'Irénée comme la source reproduite dans le dossier marcosien."},
 {id:"theod78",short:"Clément, Extraits de Théodote 78,2",author:"Clément d'Alexandrie / tradition théodotienne",period:"fin IIe – début IIIe siècle (compilation)",kind:"autre tradition valentinienne",url:"https://www.sophiascriptura.com/fathers/clement-excerpta/39-1/#p-78-2",family:"tradition-theodote",note:"Connaissance salvatrice et nouvelle naissance ; attribution directe à Marcus non établie."},
 {id:"clement6",short:"Clément, Stromates VI,16",author:"Clément d'Alexandrie",period:"fin IIe – début IIIe siècle",kind:"parallèle chrétien sur nombres et épisémon",url:"https://www.ldysinger.com/@texts/0216_clement/06_Strom_6_16-18.htm",family:"clement-stromates",note:"Présente le six, l'épisémon et des analogies christologiques sans attribuer ce passage à Marcus."}
]);
const LINKS=Object.freeze([
 {from:"iren14",to:"hip37",type:"usage-reconnu",confidence:"explicite dans la Réfutation VI,37",description:"L'auteur s'appuie sur Irénée pour exposer Marcus."},
 {from:"iren14",to:"epiph21",type:"copie-avouee",confidence:"explicite dans Panarion 34,21,1",description:"Épiphane dit reproduire l'exposé d'Irénée."},
 {from:"iren21",to:"hip36",type:"enquete-supplementaire-revendiquee",confidence:"revendiquée, non vérifiée indépendamment",description:"La Réfutation décrit davantage le rite de rédemption et affirme avoir enquêté."},
 {from:"iren21",to:"theod78",type:"parallele-tradition-distincte",confidence:"comparaison textuelle, emprunt non démontré",description:"Une autre tradition valentinienne associe rédemption et connaissance."},
 {from:"iren14",to:"clement6",type:"parallele-motif",confidence:"même famille de nombres, contact non établi",description:"Six, épisémon, sixième jour ou heure appartiennent à d'autres lectures chrétiennes anciennes."}
]);
const CLAIMS=Object.freeze([
 {id:"alphabet24",label:"Marcus : 24 lettres, douze paires et corps d'Alètheia",reported:["iren14","hip37","epiph21"],directBase:"iren14",status:"un témoignage polémique principal, copies ou reprises ultérieures",verdict:"Les répétitions ne multiplient pas les témoins indépendants de la doctrine."},
 {id:"secret-redemption",label:"Une parole secrète accompagne certains rites de rédemption",reported:["iren21","hip36"],directBase:"iren21",status:"un même courant décrit par deux auteurs, avec prétention d'enquête additionnelle",verdict:"Le témoignage d'Hippolyte peut apporter des détails ; l'observation indépendante du rite n'est pas confirmée."},
 {id:"knowledge",label:"La connaissance libère de l'ignorance dans certaines traditions valentiniennes",reported:["iren21","theod78"],directBase:"iren21",status:"attestations textuelles dans deux dossiers de traditions voisines",verdict:"Le rapprochement de la connaissance salvatrice est renforcé à l'échelle valentinienne, pas prouvé comme parole de Marcus lui-même."},
 {id:"episemon-six",label:"Le six et l'Épisémon servent d'analogie christologique",reported:["iren14","clement6"],directBase:"iren14",status:"parallèle littéraire distinct et doctrinalement différent",verdict:"La circulation du motif dépasse le seul exposé marcosien ; ni contact direct ni emprunt ne sont démontrés."},
 {id:"autograph",label:"Un écrit autographe de Marcus atteste précisément ces propos",reported:[],directBase:null,status:"non attesté dans ce corpus",verdict:"Aucun autographe de Marcus n'est établi par les sources sélectionnées."}
]);
const WM=Object.fromEntries(WITNESSES.map(x=>[x.id,x]));
function study(id){
 const claim=CLAIMS.find(x=>x.id===id);
 if(!claim)throw Error("Affirmation absente du registre.");
 const refs=claim.reported.map(id=>WM[id]);
 const clusters=[...new Set(refs.map(r=>r.family))];
 const shared=LINKS.filter(x=>claim.reported.includes(x.from)&&claim.reported.includes(x.to));
 const isAllDerived=refs.length>0&&clusters.length===1;
 return {claim:claim.id,label:claim.label,refs,clusters,claimsOfIndependence:refs.filter(r=>r.kind.includes("déclare avoir enquêté")).map(x=>x.id),
   countDocuments:refs.length,countFamilies:clusters.length,links:shared,status:claim.status,verdict:claim.verdict,
   disclaimer:isAllDerived?"Plusieurs titres pour une seule lignée documentaire principale.":"Familles textuelles différentes ≠ pratique de Marcus confirmée indépendamment."};
}
function runAudit(){
 const tests=[
  {id:"A1",condition:WITNESSES.length===7,description:"Sept notices distinctes"},
  {id:"A2",condition:WITNESSES.every(x=>/^https:\/\//.test(x.url)),description:"Chaque témoin possède une référence URL"},
  {id:"A3",condition:study("alphabet24").countDocuments===3,description:"Trois livres parlent de la construction alphabétique"},
  {id:"A4",condition:study("alphabet24").countFamilies===1,description:"Ces trois livres appartiennent à la même lignée irénéenne pour ce contenu"},
  {id:"A5",condition:LINKS.some(x=>x.type==="copie-avouee"),description:"Copie reconnue par Épiphane"},
  {id:"A6",condition:LINKS.some(x=>x.type==="enquete-supplementaire-revendiquee"),description:"Enquête supplémentaire revendiquée, pas certifiée"},
  {id:"A7",condition:study("knowledge").countFamilies===2,description:"Deux traditions textuelles concernant la connaissance"},
  {id:"A8",condition:study("episemon-six").countFamilies===2,description:"Deux contextes textuels du six et de l'épisémon"},
  {id:"A9",condition:study("autograph").countDocuments===0,description:"Pas d'autographe supposé"},
  {id:"A10",condition:CLAIMS.every(x=>x.reported.every(id=>Boolean(WM[id]))),description:"Aucune source inventée dans les affirmations"}
 ];
 return {passed:tests.filter(x=>x.condition).length,total:tests.length,tests:tests.map(x=>({...x,pass:x.condition}))};
}
function analyze(){
 return {version:"ALPHA-019/1.0.0",witnesses:WITNESSES,relations:LINKS,
   claims:CLAIMS.map(x=>study(x.id)),audit:runAudit(),
   mainConclusion:"Épiphane se déclare copiste du dossier d'Irénée. Hippolyte reconnaît Irénée mais revendique une enquête supplémentaire sur certains rites. Clément transmet des parallèles valentinien et chrétien distincts ; aucun ne prouve à lui seul l'autographe de Marcus ni son enseignement personnel d'un système salvifique.",
   categories:["copie explicitement attestée","dépendance déclarée","enquête supplémentaire revendiquée","tradition voisine","simple analogie","absent du corpus"],
   caveat:"Cartographie critique de sept documents et de leurs relations connues, non stemma exhaustif ni preuve historique d'un contact entre toutes les écoles."};
}
const api=Object.freeze({version:"ALPHA-019/1.0.0",witnesses:WITNESSES,relations:LINKS,claims:CLAIMS,study,analyze,audit:runAudit});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_PROVENANCE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
