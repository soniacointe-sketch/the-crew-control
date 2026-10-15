/* ELOAH · PARISIS ENGINE · ALPHA-020 — Redeption, mots, rites, gnose.
 * Corpus fermé de témoins vérifiés : Irénée I.21, Réfutation VI.36–37,
 * Clément, Excerpta ex Theodoto 22 / 77–82.
 * Les données paraphrasent de courts passages pour recherche historique :
 * ne constituent ni une liturgie, ni un protocole d'initiation, ni une traduction critique.
 * Aucun accès aux espaces privés ELOAH, aucun réseau, aucun stockage.
 */
(function(root){
"use strict";
const SOURCES=Object.freeze([
 {id:"ir21",author:"Irénée de Lyon",short:"Irénée I,21",work:"Contre les hérésies I,21, §§1–5",url:"https://www.newadvent.org/fathers/0103121.htm",century:"Fin IIe siècle",stance:"adversaire",family:"irenee",note:"Énumère des usages divergents ; ne les attribue pas tous personnellement à Marcus."},
 {id:"hip36",author:"Auteur de la Réfutation, traditionnellement Hippolyte",short:"Réfutation VI,36–37",work:"Réfutation de toutes les hérésies VI,36–37",url:"https://www.newadvent.org/fathers/050106.htm",century:"IIIe siècle",stance:"adversaire",family:"hippolyte-derive",note:"Cite Irénée ; revendique une enquête plus précise et décrit une parole secrète. L'accès direct au rite n'est pas démontré."},
 {id:"theo22",author:"Clément d'Alexandrie / extraits valentiniens",short:"Extraits de Théodote 22,4–5",work:"Excerpta ex Theodoto, 22",url:"https://www.earlychristianwritings.com/text/theodotusexcerpts.html",century:"Fin IIe – début IIIe siècle, compilation",stance:"compilation",family:"clement-excerpta",note:"Le nom du baptême et la rédemption de l'ange appartiennent à un dossier valentinien voisin."},
 {id:"theo78",author:"Clément d'Alexandrie / extraits valentiniens",short:"Extraits de Théodote 77–82",work:"Excerpta ex Theodoto 77–82, surtout 78,2",url:"https://www.earlychristianwritings.com/text/theodotusexcerpts.html",century:"Fin IIe – début IIIe siècle, compilation",stance:"compilation",family:"clement-excerpta",note:"Le bain et la connaissance sont distingués. Il n'est pas dit que tout rite matériel soit inutile pour tous."}
]);
const S=Object.fromEntries(SOURCES.map(x=>[x.id,x]));
const OPERATIONS=Object.freeze([
 {id:"marriage",title:"Union spirituelle figurée",source:"ir21",section:"I,21,3",group:"certains groupes décrits par Irénée",mode:"rite",voice:"formules prononcées",water:false,anointing:false,roles:["initiants","personne initiée"],
  report:"Un lit nuptial est préparé et une union spirituelle est mimée pour évoquer les couples célestes.",
  point:"Les paroles s'accompagnent d'un geste symbolique, sans que le texte détaille tous les mots ni l'identité de chaque officiant.",
  caution:"Pas d'attestation directe d'une cérémonie inventée par Marcus."},
 {id:"water",title:"Eau et invocation du Père inconnu",source:"ir21",section:"I,21,3",group:"d'autres groupes selon Irénée",mode:"rite",voice:"invocation du Père inconnu, de la Vérité mère et de celui descendu sur Jésus",water:true,anointing:false,roles:["officiant","personne initiée"],
  report:"Le rite dans l'eau est accompagné de formules invoquant le Père inconnu, Alètheia comme mère de toute chose, et celui qui descend sur Jésus.",
  point:"Lien textuel explicite entre eau, nom prononcé, Vérité et Jésus dans UNE variante de rédemption.",
  caution:"Ne prouve pas qu'on récite le nom ΑΛΗΘΕΙΑ selon les douze paires corporelles."},
 {id:"names",title:"Noms non grecs transmis par écrit",source:"ir21",section:"I,21,3",group:"d'autres variantes du dossier",mode:"formule",voice:"suite de mots désignés par Irénée comme hébreux",water:null,anointing:null,roles:["officiant"],
  report:"Irénée transcrit des séries de noms dont les formes grecques et latines divergent selon les traditions éditoriales.",
  point:"Un texte transmet des sons rituels, mais leur orthographe et leur sens demandent une édition critique.",
  caution:"Ne pas reconstruire les valeurs isopséphiques de ces mots comme si leur transcription grecque était certaine."},
 {id:"dialogue",title:"Rédemption dialoguée et onction",source:"ir21",section:"I,21,3",group:"une formule décrite par Irénée",mode:"rite",voice:"officiant → personne initiée → assistants",water:null,anointing:true,roles:["officiant","personne initiée","assemblée"],
  report:"Une série de déclarations est transmise ; l'initié répond, puis les assistants prononcent une formule de paix. Une onction parfumée suit.",
  point:"La parole est distribuée entre trois rôles, avec une réponse de l'initié et des témoins.",
  caution:"Ne pas attribuer à tous les marcosiens cette dramaturgie particulière ni reproduire un rituel moderne prétendument authentique."},
 {id:"oil",title:"Mélange huile-eau sans immersion",source:"ir21",section:"I,21,4",group:"d'autres groupes selon Irénée",mode:"rite",voice:"formules comparables",water:true,anointing:true,roles:["officiant","personne initiée"],
  report:"Certains jugent l'immersion superflue et placent sur la tête un mélange d'huile et d'eau accompagné de paroles.",
  point:"La matière change selon les groupes, même quand des noms sont prononcés.",
  caution:"La présence d'eau ici ne signifie pas immersion baptismale."},
 {id:"knowledge",title:"Connaissance seule comme rédemption",source:"ir21",section:"I,21,4",group:"d'autres groupes selon Irénée",mode:"knowledge",voice:"aucune formule nécessaire selon cette option",water:false,anointing:false,roles:["personne instruite"],
  report:"D'autres rejettent les rites visibles et présentent la connaissance de la grandeur ineffable comme la rédemption parfaite.",
  point:"Contre-exemple essentiel : dans le même corpus, la libération peut être conçue sans action rituelle matérielle.",
  caution:"Il serait erroné de fusionner cette position avec les rites avec eau."},
 {id:"death",title:"Rédemption à l'approche de la mort",source:"ir21",section:"I,21,5",group:"encore d'autres groupes selon Irénée",mode:"rite",voice:"invocations et paroles de passage auprès des puissances",water:true,anointing:true,roles:["officiant","mourant"],
  report:"Irénée décrit des préparations à la mort avec huile ou eau et des paroles à prononcer lors d'un passage cosmologique imaginé.",
  point:"La parole fonctionne alors comme déclaration d'origine et de destination de l'âme, selon le récit.",
  caution:"Cette cosmologie n'est pas une description vérifiée d'un voyage post mortem."},
 {id:"hip-secret",title:"Seconde initiation et parole réservée",source:"hip36",section:"VI,36–37",group:"pratiques associées par la Réfutation aux marcosiens",mode:"claimed-secret",voice:"énoncé discret, parfois à l'oreille en fin de vie",water:true,anointing:false,roles:["officiant","personne présentée comme initiée"],
  report:"L'auteur parle d'un second baptême nommé « Rédemption », d'imposition des mains et d'une parole difficile à divulguer, parfois chuchotée au mourant.",
  point:"Les mots ne sont plus seulement une exégèse numérique : l'auteur rapporte un geste et une circulation restreinte de la parole.",
  caution:"Sa narration est accusatrice et son supplément d'enquête est une revendication, pas un témoignage direct vérifié."},
 {id:"theo-name",title:"Rédemption et baptême dans le Nom",source:"theo22",section:"22,4–5",group:"tradition valentinienne transmise par Clément",mode:"rite",voice:"invocation du même Nom que l'ange",water:true,anointing:false,roles:["personne baptisée","ange associé (dans la doctrine)"],
  report:"L'extrait explique que la rédemption angélique est liée à un baptême dans le même Nom que celui reçu par l'ange.",
  point:"Un autre texte valentinien donne au Nom un rôle de médiation dans la rédemption.",
  caution:"Le passage n'identifie pas automatiquement ce Nom à l'alphabet du corps d'Alètheia chez Marcus."},
 {id:"theo-gnosis",title:"Le bain ne suffit pas sans connaissance",source:"theo78",section:"78,2",group:"tradition valentinienne compilée par Clément",mode:"knowledge-plus-rite",voice:"questions sur origine, devenir, destination et renaissance",water:true,anointing:false,roles:["personne instruite"],
  report:"Le bain et la connaissance sont distingués : les questions sur qui nous étions, ce que nous sommes devenus, où nous allons, et ce qu'est la renaissance participent de la libération.",
  point:"Cette position n'est pas le rejet intégral du bain ; la connaissance vient s'ajouter comme critère essentiel.",
  caution:"Le compilateur ne présente pas cela comme une formule de Marcus."}
]);
const OP=Object.fromEntries(OPERATIONS.map(x=>[x.id,x]));
const HYPOTHESES=Object.freeze([
{id:"H1",question:"Les mots ont-ils un usage rituel attesté dans ces textes ?",support:["water","dialogue","hip-secret"],status:"OUI — usage rapporté dans des sources anciennes",limit:"L'historicité de chaque description n'est pas vérifiée indépendamment."},
{id:"H2",question:"La Vérité et celui qui est descendu sur Jésus figurent-ils ensemble dans une formule ?",support:["water"],status:"OUI — chez Irénée I,21,3",limit:"Cela ne prouve pas que l'ensemble du corps d'Alètheia était récité."},
{id:"H3",question:"Tous les groupes utilisaient-ils eau et formules identiques ?",support:["water","oil","knowledge","death"],status:"NON — variantes parfois incompatibles",limit:"Irénée signale lui-même la diversité et utilise une rhétorique hostile."},
{id:"H4",question:"Une parole secrète est-elle attribuée aux marcosiens ?",support:["hip-secret"],status:"OUI — attribution par la Réfutation VI,36",limit:"Revendication polémique sans accès direct établi au texte secret."},
{id:"H5",question:"La connaissance pouvait-elle tenir lieu de rédemption sans rite ?",support:["knowledge","theo-gnosis"],status:"OUI chez certains selon Irénée ; MAIS Théodote dit plutôt que le bain ne suffit pas",limit:"Deux positions différentes, à ne pas fusionner."},
{id:"H6",question:"Les douze paires d'Alètheia constituaient-elles le mot de passe du rite ?",support:["water","dialogue","theo-name"],status:"NON DÉMONTRÉ",limit:"Aucun des passages du corpus ne décrit une récitation des douze paires en rite."}
]);
function sourceFor(id){const v=S[id];if(!v)throw Error("Source inconnue");return v}
function readOperation(id){
 const o=OP[id];if(!o)throw Error("Opération non répertoriée");
 return {...o,sourceDocument:sourceFor(o.source),evidenceLevel:"DESCRIPTION ANCIENNE — NON VÉRIFICATION DIRECTE"};
}
function investigate(id){
 const h=HYPOTHESES.find(x=>x.id===id);if(!h)throw Error("Hypothèse inconnue");
 return {...h,operations:h.support.map(readOperation),sourceDocuments:[...new Set(h.support.map(x=>OP[x].source))].map(sourceFor)};
}
function compare(a,b){
 const x=readOperation(a),y=readOperation(b);
 const shared=["water","anointing","mode"].filter(k=>x[k]===y[k]);
 const roles=x.roles.filter(k=>y.roles.includes(k));
 return {a:x,b:y,sharedProperties:shared,sharedRoles:roles,
  sameSourceFamily:x.source===y.source||(x.source.startsWith("theo")&&y.source.startsWith("theo")),
  conclusion:"Points communs de description, sans preuve que ces deux opérations aient été exécutées par une seule et même communauté."};
}
function audit(){
 const t=[],test=(id,p)=>t.push({id,pass:Boolean(p)});
 test("R01 · 4 sources historiques définies",SOURCES.length===4);
 test("R02 · 10 formes ou situations",OPERATIONS.length===10);
 test("R03 · 6 hypothèses",HYPOTHESES.length===6);
 test("R04 · Référence valide pour chaque pratique",OPERATIONS.every(x=>!!S[x.source]));
 test("R05 · Formule eau + Vérité + Jésus",OP.water.water&&OP.water.voice.includes("Vérité")&&OP.water.voice.includes("Jésus"));
 test("R06 · Le dialogue possède trois voix",OP.dialogue.roles.length===3);
 test("R07 · Rites rejetés par certains",OP.knowledge.mode==="knowledge"&&!OP.knowledge.water&&!OP.knowledge.anointing);
 test("R08 · Théodote 78 = bain et connaissance",OP["theo-gnosis"].mode==="knowledge-plus-rite"&&OP["theo-gnosis"].water);
 test("R09 · Hippolyte ne devient pas autographe",OP["hip-secret"].caution.includes("revendication"));
 test("R10 · Aucun mot de passe des douze paires affirmé",investigate("H6").status==="NON DÉMONTRÉ");
 test("R11 · Distinction source Irenaeus et Clément",sourceFor("ir21").family!==sourceFor("theo78").family);
 test("R12 · Formats avec et sans rite distincts",OPERATIONS.some(x=>x.mode==="knowledge")&&OPERATIONS.some(x=>x.mode==="rite"));
 return {passed:t.filter(x=>x.pass).length,total:t.length,checks:t};
}
function report(){
 return {version:"ALPHA-020/1.0.0",sources:SOURCES,operations:OPERATIONS,hypotheses:HYPOTHESES.map(x=>investigate(x.id)),audit:audit(),
  conclusion:"La parole a un rôle rituel rapporté dans des groupes valentiniens et associés aux marcosiens : invocation, réplique, nom initiatique, déclaration de passage. D'autres formes refusent tout rite matériel, et une autre tradition insiste sur la connaissance en plus du bain. Aucun des passages étudiés ne prouve l'usage liturgique des douze paires alphabétiques d'Alètheia.",
  caveat:"Sources hostiles ou compilées, diverses communautés, aucun rituel historiquement reconstitué avec certitude."};
}
const api=Object.freeze({version:"ALPHA-020/1.0.0",sources:SOURCES,operations:OPERATIONS,hypotheses:HYPOTHESES,sourceFor,readOperation,investigate,compare,audit,report});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_REDEMPTION=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
