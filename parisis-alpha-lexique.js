/* ELOAH · PARISIS / ALPHA — lexique philologique de travail
 * Gloses françaises contrôlées pour une liste fermée de formes grecques.
 * Pas de traduction automatique, pas d'analyse morphologique générale, pas de requête distante.
 * Dictionnaires de référence consultables : Logeion (University of Chicago), LSJ.
 */
(function(root){
"use strict";
const DICTIONARY=[
  {
    "lemma": "ἀλήθεια",
    "gloss": "vérité, réalité",
    "category": "nom féminin",
    "forms": [
      "ΑΛΗΘΕΙΑ",
      "ΑΛΗΘΕΙΑΣ",
      "ΑΛΗΘΕΙΑΝ",
      "ΑΛΗΘΕΙΑΙ"
    ],
    "note": "Dans le corpus marcosien, la Vérité est personnifiée (Alètheia).",
    "ref": "https://logeion.uchicago.edu/%E1%BC%80%CE%BB%CE%AE%CE%B8%CE%B5%CE%B9%CE%B1"
  },
  {
    "lemma": "λόγος",
    "gloss": "parole, discours, raison, compte",
    "category": "nom masculin",
    "forms": [
      "ΛΟΓΟΣ",
      "ΛΟΓΟΥ",
      "ΛΟΓΟΝ",
      "ΛΟΓΩ",
      "ΛΟΓΟΙ",
      "ΛΟΓΩΝ"
    ],
    "note": "Le sens de Logos dépend fortement du passage et de son contexte.",
    "ref": "https://logeion.uchicago.edu/%CE%BB%CF%8C%CE%B3%CE%BF%CF%82"
  },
  {
    "lemma": "ζωή",
    "gloss": "vie, moyen de vivre",
    "category": "nom féminin",
    "forms": [
      "ΖΩΗ",
      "ΖΩΗΣ",
      "ΖΩΗΝ",
      "ΖΩΗΣ",
      "ΖΩΑΙ"
    ],
    "note": "Le sens ancien peut aller des moyens d'existence à la vie.",
    "ref": "https://logeion.uchicago.edu/%CE%B6%CF%89%CE%AE"
  },
  {
    "lemma": "πατήρ",
    "gloss": "père",
    "category": "nom masculin",
    "forms": [
      "ΠΑΤΗΡ",
      "ΠΑΤΕΡΑ",
      "ΠΑΤΡΟΣ",
      "ΠΑΤΡΙ",
      "ΠΑΤΕΡΕΣ"
    ],
    "note": "Titre humain ou divin selon la source.",
    "ref": "https://logeion.uchicago.edu/%CF%80%CE%B1%CF%84%CE%AE%CF%81"
  },
  {
    "lemma": "ἄνθρωπος",
    "gloss": "être humain, personne",
    "category": "nom masculin",
    "forms": [
      "ΑΝΘΡΩΠΟΣ",
      "ΑΝΘΡΩΠΟΥ",
      "ΑΝΘΡΩΠΟΝ",
      "ΑΝΘΡΩΠΟΙ"
    ],
    "note": "Le genre grammatical ne constitue pas une restriction au sexe masculin.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%84%CE%BD%CE%B8%CF%81%CF%89%CF%80%CE%BF%CF%82"
  },
  {
    "lemma": "ἐκκλησία",
    "gloss": "assemblée, communauté réunie",
    "category": "nom féminin",
    "forms": [
      "ΕΚΚΛΗΣΙΑ",
      "ΕΚΚΛΗΣΙΑΣ",
      "ΕΚΚΛΗΣΙΑΝ",
      "ΕΚΚΛΗΣΙΑΙ"
    ],
    "note": "Dans les premiers écrits chrétiens, peut désigner une assemblée de croyants.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%90%CE%BA%CE%BA%CE%BB%CE%B7%CF%83%CE%AF%CE%B1"
  },
  {
    "lemma": "Ἰησοῦς",
    "gloss": "Jésus (nom propre grec)",
    "category": "nom propre",
    "forms": [
      "ΙΗΣΟΥΣ",
      "ΙΗΣΟΥ",
      "ΙΗΣΟΥΝ"
    ],
    "note": "La valeur 888 est un calcul d'isopséphie ; elle ne détermine pas le sens du nom.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%B8%CE%B7%CF%83%CE%BF%E1%BF%A6%CF%82"
  },
  {
    "lemma": "ἀρχή",
    "gloss": "commencement, origine ; pouvoir, commandement",
    "category": "nom féminin",
    "forms": [
      "ΑΡΧΗ",
      "ΑΡΧΗΣ",
      "ΑΡΧΗΝ",
      "ΑΡΧΑΙ",
      "ΑΡΧΑΙΣ"
    ],
    "note": "Plusieurs sens classiques sont possibles selon le contexte.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%80%CF%81%CF%87%CE%AE"
  },
  {
    "lemma": "τέλος",
    "gloss": "fin, but, accomplissement",
    "category": "nom neutre",
    "forms": [
      "ΤΕΛΟΣ",
      "ΤΕΛΟΥΣ",
      "ΤΕΛΕΙ",
      "ΤΕΛΗ"
    ],
    "note": "Ne signifie pas toujours uniquement la fin chronologique.",
    "ref": "https://logeion.uchicago.edu/%CF%84%CE%AD%CE%BB%CE%BF%CF%82"
  },
  {
    "lemma": "θεός",
    "gloss": "dieu, divinité",
    "category": "nom masculin",
    "forms": [
      "ΘΕΟΣ",
      "ΘΕΟΥ",
      "ΘΕΟΝ",
      "ΘΕΩ",
      "ΘΕΟΙ"
    ],
    "note": "Le référent précis dépend de la source.",
    "ref": "https://logeion.uchicago.edu/%CE%B8%CE%B5%CF%8C%CF%82"
  },
  {
    "lemma": "πνεῦμα",
    "gloss": "souffle, vent, esprit",
    "category": "nom neutre",
    "forms": [
      "ΠΝΕΥΜΑ",
      "ΠΝΕΥΜΑΤΟΣ",
      "ΠΝΕΥΜΑΤΙ",
      "ΠΝΕΥΜΑΤΑ"
    ],
    "note": "Lecture religieuse à contextualiser.",
    "ref": "https://logeion.uchicago.edu/%CF%80%CE%BD%CE%B5%E1%BF%A6%CE%BC%CE%B1"
  },
  {
    "lemma": "γράμμα",
    "gloss": "lettre, signe écrit, document",
    "category": "nom neutre",
    "forms": [
      "ΓΡΑΜΜΑ",
      "ΓΡΑΜΜΑΤΟΣ",
      "ΓΡΑΜΜΑΤΑ",
      "ΓΡΑΜΜΑΣΙ"
    ],
    "note": "À ne pas confondre avec les valeurs numérales attachées aux lettres.",
    "ref": "https://logeion.uchicago.edu/%CE%B3%CF%81%CE%AC%CE%BC%CE%BC%CE%B1"
  },
  {
    "lemma": "φωνή",
    "gloss": "voix, son, bruit",
    "category": "nom féminin",
    "forms": [
      "ΦΩΝΗ",
      "ΦΩΝΗΣ",
      "ΦΩΝΗΝ",
      "ΦΩΝΑΙ"
    ],
    "note": "Chez Irénée, le son peut recevoir une interprétation spéculative.",
    "ref": "https://logeion.uchicago.edu/%CF%86%CF%89%CE%BD%CE%AE"
  },
  {
    "lemma": "κόσμος",
    "gloss": "ordre, monde, univers",
    "category": "nom masculin",
    "forms": [
      "ΚΟΣΜΟΣ",
      "ΚΟΣΜΟΥ",
      "ΚΟΣΜΟΝ",
      "ΚΟΣΜΩ"
    ],
    "note": "Selon le contexte : ordre ou monde.",
    "ref": "https://logeion.uchicago.edu/%CE%BA%CF%8C%CF%83%CE%BC%CE%BF%CF%82"
  },
  {
    "lemma": "περιστερά",
    "gloss": "colombe",
    "category": "nom féminin",
    "forms": [
      "ΠΕΡΙΣΤΕΡΑ",
      "ΠΕΡΙΣΤΕΡΑΣ",
      "ΠΕΡΙΣΤΕΡΑΝ"
    ],
    "note": "L'isopséphie traditionnelle donne 801 pour la forme περιστερά.",
    "ref": "https://logeion.uchicago.edu/%CF%80%CE%B5%CF%81%CE%B9%CF%83%CF%84%CE%B5%CF%81%CE%AC"
  },
  {
    "lemma": "ἄλφα",
    "gloss": "nom de la première lettre grecque, alpha",
    "category": "nom de lettre",
    "forms": [
      "ΑΛΦΑ"
    ],
    "note": "Alpha est Α, de rang 1 dans l'alphabet de 24 lettres.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%84%CE%BB%CF%86%CE%B1"
  },
  {
    "lemma": "ὦ μέγα",
    "gloss": "nom de la dernière lettre grecque, oméga",
    "category": "nom de lettre",
    "forms": [
      "ΩΜΕΓΑ"
    ],
    "note": "Oméga Ω est de rang 24 ; sa valeur isopséphique est 800.",
    "ref": "https://logeion.uchicago.edu/%E1%BD%A6%20%CE%BC%CE%AD%CE%B3%CE%B1"
  },
  {
    "lemma": "βῆτα",
    "gloss": "nom de la deuxième lettre grecque, bêta",
    "category": "nom de lettre",
    "forms": [
      "ΒΗΤΑ"
    ],
    "note": "Dans les récits d'enseignement, Alpha précède Bêta.",
    "ref": "https://logeion.uchicago.edu/%CE%B2%E1%BF%86%CF%84%CE%B1"
  },
  {
    "lemma": "δέλτα",
    "gloss": "nom de la lettre grecque delta",
    "category": "nom de lettre",
    "forms": [
      "ΔΕΛΤΑ"
    ],
    "note": "Marcus utilise les noms des lettres comme exemple d'expansion verbale.",
    "ref": "https://logeion.uchicago.edu/%CE%B4%CE%AD%CE%BB%CF%84%CE%B1"
  },
  {
    "lemma": "σοφία",
    "gloss": "sagesse, habileté",
    "category": "nom féminin",
    "forms": [
      "ΣΟΦΙΑ",
      "ΣΟΦΙΑΣ",
      "ΣΟΦΙΑΝ"
    ],
    "note": "Terme courant et nom d'une figure dans certains systèmes gnostiques.",
    "ref": "https://logeion.uchicago.edu/%CF%83%CE%BF%CF%86%CE%AF%CE%B1"
  },
  {
    "lemma": "ἀμήν",
    "gloss": "amen, formule d'assentiment",
    "category": "formule",
    "forms": [
      "ΑΜΗΝ"
    ],
    "note": "Le mot est une translittération liturgique ; pas un nom grec de lettre.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%80%CE%BC%CE%AE%CE%BD"
  },
  {
    "lemma": "ἑπτά",
    "gloss": "sept",
    "category": "numéral",
    "forms": [
      "ΕΠΤΑ"
    ],
    "note": "Le nombre sept ne suffit pas à établir un lien entre traditions.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%91%CF%80%CF%84%CE%AC"
  },
  {
    "lemma": "ἐν",
    "gloss": "dans, en, parmi",
    "category": "préposition",
    "forms": [
      "ΕΝ"
    ],
    "note": "Souvent construit avec le datif.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%90%CE%BD"
  },
  {
    "lemma": "καί",
    "gloss": "et, aussi, même",
    "category": "conjonction",
    "forms": [
      "ΚΑΙ"
    ],
    "note": "Le contexte précise sa nuance.",
    "ref": "https://logeion.uchicago.edu/%CE%BA%CE%B1%CE%AF"
  },
  {
    "lemma": "ὁ",
    "gloss": "le (article)",
    "category": "article",
    "forms": [
      "Ο"
    ],
    "note": "Des formes accentuées ou homographes peuvent changer l'analyse.",
    "ref": "https://logeion.uchicago.edu/%E1%BD%81"
  },
  {
    "lemma": "ἡ",
    "gloss": "la (article)",
    "category": "article",
    "forms": [
      "Η"
    ],
    "note": "Sans accents, Η est ambigu : lettre, article ou autre forme.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%A1"
  },
  {
    "lemma": "τό",
    "gloss": "le (article neutre)",
    "category": "article",
    "forms": [
      "ΤΟ"
    ],
    "note": "L'article seul n'indique pas la fonction grammaticale complète.",
    "ref": "https://logeion.uchicago.edu/%CF%84%CF%8C"
  },
  {
    "lemma": "ἦν",
    "gloss": "était / il y avait (forme de εἰμί)",
    "category": "verbe, forme",
    "forms": [
      "ΗΝ"
    ],
    "note": "Analyse verbale simplifiée : les distinctions de personne et contexte restent à établir.",
    "ref": "https://logeion.uchicago.edu/%E1%BC%A6%CE%BD"
  }
];
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleUpperCase("el").replace(/ς/g,"Σ").replace(/Ϲ/g,"Σ");
const map=new Map();
for(const entry of DICTIONARY)for(const form of entry.forms){const a=map.get(form)||[];a.push(entry);map.set(form,a);}
function lookup(form){
 const source=String(form??"").trim();
 if(!source||/[^\p{Script=Greek}\p{M}]/u.test(source))return {original:source,recognized:false,matches:[],status:"hors du lexique grec"};
 const cleaned=norm(source),matches=map.get(cleaned)||[];
 return {original:source,normalized:cleaned,recognized:matches.length>0,
  matches:matches.map(m=>({lemma:m.lemma,gloss:m.gloss,category:m.category,note:m.note,reference:m.ref})),
  status:matches.length>1?"formes ambiguës : plusieurs lectures possibles":matches.length===1?"correspondance explicite dans le mini-lexique":"forme grecque non reconnue (recherche externe conseillée)",
  automaticMeaning:false};
}
function annotate(text){
 const core=root?.PARISIS_ALPHA_READER;
 const words=core?core.tokenise(text):Array.from(String(text??"").matchAll(/[\p{L}\p{M}]+/gu),m=>m[0]);
 return words.map((word,index)=>({index,word,...lookup(word)}));
}
const api=Object.freeze({version:"ALPHA-LEXIQUE/1.0.0",entries:DICTIONARY.length,lookup,annotate,
 reference:"https://logeion.uchicago.edu/",scope:"Mini-lexique explicite : ne traduit pas les phrases et ne vérifie pas leur syntaxe."});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
if(root)root.PARISIS_ALPHA_LEXIQUE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
