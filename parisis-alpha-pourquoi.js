/* PARISIS ENGINE · ALPHA-017 · POURQUOI les puissances, les nombres et les lettres ?
 * Reconstruction critique des MOTIVATIONS EXPRESSÉES chez Irénée I,14–15.
 * Attribution hostile par Irénée. Source URL + niveau de preuve pour chaque motif.
 * Une analogie n'est ni un emprunt attesté ni une propriété spirituelle mesurable.
 */
(function(root){
"use strict";
const R=root?.PARISIS_ALPHA_READER;
if(!R)return;
const I14="https://www.newadvent.org/fathers/0103114.htm";
const I15="https://www.newadvent.org/fathers/0103115.htm";
const HIPP="https://ccel.org/ccel/hippolytus/refutation/anf05.iii.iii.iv.xlii.html";
const SOURCES=Object.freeze([
{id:"I14-3",label:"Irénée · I,14,3",url:I14,type:"témoignage hostile"},
{id:"I14-4",label:"Irénée · I,14,4",url:I14,type:"témoignage hostile"},
{id:"I14-5",label:"Irénée · I,14,5",url:I14,type:"témoignage hostile"},
{id:"I14-6",label:"Irénée · I,14,6",url:I14,type:"témoignage hostile"},
{id:"I14-7",label:"Irénée · I,14,7–8",url:I14,type:"témoignage hostile"},
{id:"I15-1",label:"Irénée · I,15,1",url:I15,type:"témoignage hostile"},
{id:"I15-2",label:"Irénée · I,15,2",url:I15,type:"témoignage hostile"},
{id:"I15-3",label:"Irénée · I,15,3",url:I15,type:"témoignage hostile"},
{id:"I15-4",label:"Irénée · I,15,4–5",url:I15,type:"objection polémique"},
{id:"HIPP",label:"Hippolyte · Réfutation VI,41",url:HIPP,type:"témoin textuel partiellement dépendant"}
]);
const ENTRIES=Object.freeze([
{id:"mutes",name:"9 lettres muettes · Pater / Alètheia",short:"Père et Vérité",tag:"GRAMMAIRE → IMAGE",sourceIds:["I14-5","HIPP"],number:9,
 explanation:"Selon Irénée, les lettres dites muettes représentent le Père et la Vérité parce qu'elles sont privées de voix autonome : ce caractère figure leur ineffabilité.",
 mechanism:"Correspondance établie par analogie entre une propriété grammaticale grecque et l'idée de l'indicible.",
 distinct:"Le chiffre neuf correspond au nombre des lettres classées comme muettes, pas à une valeur calculée du nom « Père ».",
 limit:"Cela ne démontre pas que les lettres possèdent réellement ces puissances."},
{id:"semivoyelles",name:"8 semi-voyelles · Logos / Zoè",short:"Parole et Vie",tag:"MÉDIATION",sourceIds:["I14-5","HIPP"],number:8,
 explanation:"Leur position intermédiaire entre muettes et voyelles sert d'image à Logos et Zoè, associés à une circulation entre niveaux supérieurs et inférieurs.",
 mechanism:"Fonction symbolique de médiation, différente de la simple addition 8.",
 distinct:"Les huit lettres sont une catégorie grammaticale ancienne : leur rôle n'est pas prouvé par leur fréquence dans un verset.",
 limit:"Les différents témoins et traductions présentent des variantes sur l'écoulement et le retour."},
{id:"voyelles",name:"7 voyelles · Anthropos / Ecclesia",short:"Homme et Église",tag:"VOIX → FORME",sourceIds:["I14-5","I14-7"],number:7,
 explanation:"La voix de l'Homme céleste est dite donner forme aux réalités ; c'est pourquoi les sept voyelles symbolisent Anthropos et Ecclesia.",
 mechanism:"C'est une interprétation religieuse de la capacité à vocaliser, prolongée par les sept cieux.",
 distinct:"Sept cieux et sept voyelles constituent une correspondance du récit ; aucune hauteur musicale antique n'est établie.",
 limit:"La voix dite créatrice est une proposition cosmologique, pas une propriété physique démontrée."},
{id:"corps",name:"12 parties · Corps de la Vérité",short:"Alètheia",tag:"ALPHABET → PERSONNIFICATION",sourceIds:["I14-3"],number:12,
 explanation:"Les paires qui rapprochent les extrémités de l'alphabet constituent le corps d'Alètheia, image d'un ensemble complet.",
 mechanism:"12 couples de rangs 1+24 jusqu'à 12+13 ; chaque somme vaut 25, parce que la liste contient 24 lettres.",
 distinct:"Le texte attribue des régions du corps, mais ne conserve pas un schéma original indépendant de Marcus.",
 limit:"Le chiffre 25, conséquence des rangs, n'est pas décrit en I,14,3 comme clé cosmique spécifique."},
{id:"six",name:"6 · Le nom Jésus et l'Épisémon",short:"Le six",tag:"NOM → RÉGÉNÉRATION",sourceIds:["I14-4","I14-6","I15-1"],number:6,
 explanation:"Le nom grec ΙΗΣΟΥΣ compte six lettres. La spéculation relie ce six au sixième jour, à l'image du Sauveur manifesté et à l'Épisémon comme signe de régénération.",
 mechanism:"Accord de longueur du nom et de récits scripturaires relatifs au six, puis complément analogique de 24 vers 30.",
 distinct:"Il faut distinguer la longueur de ΙΗΣΟΥΣ, le signe numérique de six et les trois lettres dites doubles ζ, ξ et ψ.",
 limit:"Ni la puissance créatrice du chiffre six ni son lien causal avec un événement évangélique n'est démontré par calcul."},
{id:"vingtquatre",name:"24 · Complétude des formes",short:"24 lettres",tag:"TÉTRADE + LETTRES",sourceIds:["I14-3","I14-5","I15-1"],number:24,
 explanation:"L'alphabet fournit 24 lettres ; 9+8+7 et 8+8+8 le représentent sous deux partitions. Les quatre noms de la Tétrade sont aussi comptés 7+5+5+7.",
 mechanism:"Recouvrement voulu de plusieurs constructions numériques, avec graphie particulière de Seigê.",
 distinct:"En écrivant le mot usuel ΣΙΓΗ (4 lettres) plutôt que ΣΕΙΓΗ (5), la somme des quatre noms ne vaut plus 24 mais 23.",
 limit:"La valeur 24 résulte des graphies choisies et de la structure de l'alphabet, non d'une invariance translinguistique."},
{id:"trente",name:"30 · Plérôme / Nom inexprimable",short:"30",tag:"TOTALISATION",sourceIds:["I14-5","I15-1"],number:30,
 explanation:"Irénée rapporte plusieurs chemins analogiques vers trente : quatre émissions 4+4+10+12, et une complétion symbolique 24+6 liée aux puissances ou à l'Épisémon.",
 mechanism:"Faire converger la représentation alphabétique et la totalité des Éons.",
 distinct:"Le nom complet de trente lettres n'est pas fourni ; le nombre n'autorise pas à inventer les caractères manquants.",
 limit:"Les lettres dites doubles sont déjà dans l'alphabet grec : elles ne constituent pas six lettres ajoutées."},
{id:"huitcentun",name:"801 · Alpha–Oméga et colombe",short:"801",tag:"ISOPSÉPHIE → RÉCIT",sourceIds:["I14-6","I15-1"],number:801,
 explanation:"Α+Ω se calcule 1+800=801 ; ΠΕΡΙΣΤΕΡΑ, colombe en grec, donne aussi 801. Le système rapproche donc les extrémités de l'alphabet de la colombe du baptême.",
 mechanism:"Une égalité isopséphique soutient une lecture typologique du baptême.",
 distinct:"L'égalité est arithmétiquement exacte dans ce système numéral grec, mais n'implique pas que les deux termes soient synonymes.",
 limit:"La coïncidence numérique ne démontre ni emprunt caché ni message codé par l'auteur de l'Évangile."},
{id:"huitcentquatrevingthuit",name:"888 · Jésus et l'Ogdóade",short:"888",tag:"ISOPSÉPHIE + GÉNÉALOGIE",sourceIds:["I15-2"],number:888,
 explanation:"ΙΗΣΟΥΣ vaut 10+8+200+70+400+200=888. Irénée rapporte aussi un récit qui forme symboliquement 8, 80 et 800 à partir de l'Ogdóade et de la Décade.",
 mechanism:"Une somme de lettres est doublée d'une généalogie symbolique : 8 + 80 + 800 = 888.",
 distinct:"« Huit unités, huit dizaines et huit centaines » dans le récit ne signifie pas la somme de toutes les valeurs des vingt-quatre lettres de l'alphabet.",
 limit:"La construction ne prouve pas une propriété métaphysique du nom, seulement sa cohérence dans la doctrine rapportée."},
{id:"douze",name:"12 · Christ et le Fils",short:"Douze",tag:"DÉNOMBREMENT DE GRAPHIES",sourceIds:["I15-1","I15-2"],number:12,
 explanation:"Le texte emploie la graphie ΧΡΕΙΣΤΟΣ (8 lettres) et ΥΙΟΣ (4 lettres) pour présenter une Duodécade de douze signes.",
 mechanism:"Longueur de deux noms : 8+4=12 ; cette opération dépend de la variante ΧΡΕΙΣΤΟΣ.",
 distinct:"La graphie ΧΡΙΣΤΟΣ est plus courte d'une lettre : 7+4=11.",
 limit:"Une variante orthographique ne doit pas être remplacée sans signaler l'effet sur le résultat."},
{id:"septcieux",name:"7 cieux · Les sept émissions",short:"Sept voix",tag:"ORDRE DE VOCALISATION",sourceIds:["I14-7"],number:7,
 explanation:"Les sept cieux émettent successivement Α Ε Η Ι Ο Υ Ω ; le quatrième prononce Ι, au centre de la série.",
 mechanism:"Correspondance ordonnée entre voyelles et puissances célestes.",
 distinct:"L'attribution d'une hauteur sonore précise aux cieux n'est pas fournie.",
 limit:"La doctrine ne permet pas de calculer des fréquences cosmologiques."},
{id:"silence",name:"Silence · Nom audible et puissance",short:"L'inexprimable",tag:"ÉPISTÉMOLOGIE",sourceIds:["I14-4","I15-3"],number:null,
 explanation:"Alètheia prononce Christ Jésus puis se tait ; la Tétrade reproche à Marcus de connaître seulement le son du nom, non sa puissance. Le récit lie connaissance et libération de l'ignorance.",
 mechanism:"Distinguer une énonciation accessible et une réalité spirituelle réservée aux puissances d'en haut.",
 distinct:"La puissance spirituelle alléguée n'est pas récupérable avec une somme des lettres.",
 limit:"Le programme peut vérifier les textes et les nombres, pas confirmer une puissance divine."}
]);
const INDEX=Object.freeze(Object.fromEntries(ENTRIES.map(x=>[x.id,x])));
const SOURCE_INDEX=Object.freeze(Object.fromEntries(SOURCES.map(x=>[x.id,x])));
function greekNumber(word){
 return R.analyzeWord(word).isopsephy;
}
function checks(){
 const tests=[
 {id:"T1",name:"ΙΗΣΟΥΣ = 888",pass:greekNumber("ΙΗΣΟΥΣ")===888},
 {id:"T2",name:"888 = 8 + 80 + 800",pass:8+80+800===888},
 {id:"T3",name:"ΑΩ = 801",pass:greekNumber("ΑΩ")===801},
 {id:"T4",name:"ΠΕΡΙΣΤΕΡΑ = 801",pass:greekNumber("ΠΕΡΙΣΤΕΡΑ")===801},
 {id:"T5",name:"ΙΗΣΟΥΣ compte 6 lettres",pass:R.analyzeWord("ΙΗΣΟΥΣ").length===6},
 {id:"T6",name:"Les 24 lettres forment 12 paires de rangs 25",pass:R.pairs.length===12&&R.pairs.every(x=>x.ranks[0]+x.ranks[1]===25)},
 {id:"T7",name:"9 + 8 + 7 = 24",pass:9+8+7===24},
 {id:"T8",name:"8 + 8 + 8 = 24",pass:8+8+8===24},
 {id:"T9",name:"4 + 4 + 10 + 12 = 30",pass:4+4+10+12===30},
 {id:"T10",name:"24 + 6 = 30",pass:24+6===30},
 {id:"T11",name:"ΣΕΙΓΗ (5) contre ΣΙΓΗ (4)",pass:R.analyzeWord("ΣΕΙΓΗ").length===5&&R.analyzeWord("ΣΙΓΗ").length===4},
 {id:"T12",name:"ΧΡΕΙΣΤΟΣ (8) contre ΧΡΙΣΤΟΣ (7)",pass:R.analyzeWord("ΧΡΕΙΣΤΟΣ").length===8&&R.analyzeWord("ΧΡΙΣΤΟΣ").length===7},
 {id:"T13",name:"ΥΙΟΣ compte 4 lettres",pass:R.analyzeWord("ΥΙΟΣ").length===4},
 {id:"T14",name:"Graphie choisie : 8 + 4 = 12, sinon 7 + 4 = 11",pass:R.analyzeWord("ΧΡΕΙΣΤΟΣ").length+R.analyzeWord("ΥΙΟΣ").length===12&&R.analyzeWord("ΧΡΙΣΤΟΣ").length+R.analyzeWord("ΥΙΟΣ").length===11},
 {id:"T15",name:"7 voyelles α ε η ι ο υ ω",pass:[..."ΑΕΗΙΟΥΩ"].length===7},
 {id:"T16",name:"Toutes les justifications documentées ont une source connue",pass:ENTRIES.every(x=>x.sourceIds.length&&x.sourceIds.every(id=>Boolean(SOURCE_INDEX[id])))}
 ];
 return {total:tests.length,passed:tests.filter(x=>x.pass).length,tests};
}
function variants(){
 const sigma=R.analyzeWord("ΣΕΙΓΗ").length,us=R.analyzeWord("ΣΙΓΗ").length;
 const long=R.analyzeWord("ΧΡΕΙΣΤΟΣ").length,short=R.analyzeWord("ΧΡΙΣΤΟΣ").length;
 const son=R.analyzeWord("ΥΙΟΣ").length;
 return {
 tetrad:{reported:["ΑΡΡΗΤΟΣ","ΣΕΙΓΗ","ΠΑΤΗΡ","ΑΛΗΘΕΙΑ"],standard:["ΑΡΡΗΤΟΣ","ΣΙΓΗ","ΠΑΤΗΡ","ΑΛΗΘΕΙΑ"],reportedCount:7+sigma+5+7,standardCount:7+us+5+7},
 duodecad:{reported:["ΧΡΕΙΣΤΟΣ","ΥΙΟΣ"],alternate:["ΧΡΙΣΤΟΣ","ΥΙΟΣ"],reportedCount:long+son,alternateCount:short+son}
 };
}
function explain(id){
 const entry=INDEX[id];
 if(!entry)throw Error("Correspondance non répertoriée.");
 const sources=entry.sourceIds.map(id=>SOURCE_INDEX[id]);
 return {...entry,sourceDocuments:sources,
  whyLevel:"T · JUSTIFICATION RAPPORTÉE PAR IRÉNÉE",
  mathsLevel:"N · CALCUL REPRODUCTIBLE QUAND APPLICABLE",
  uncertaintyLevel:"H · INTERPRÉTATION RELIGIEUSE, NON DÉMONTRÉE EMPIRIQUEMENT"};
}
function audit(){
 const r=checks();
 return {version:"ALPHA-017/1.0.0",...r,variants:variants(),
  rules:"Les sources rapportent des correspondances ; les opérations vérifient les nombres ; les assertions de puissance spirituelle restent non démontrées par le programme."};
}
const api=Object.freeze({version:"ALPHA-017/1.0.0",entries:ENTRIES,sources:SOURCES,explain,variants,audit,greekNumber});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_POURQUOI=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
