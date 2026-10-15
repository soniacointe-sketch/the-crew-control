/* ELOAH · PARISIS ENGINE · HUMANITIES LAB · ALPHA-C7
 * Audit déterministe sur un corpus sourcé, révisable et explicitement limité.
 * N'effectue AUCUN scraping ni accès aux espaces privés. Aucune preuve d'emprunt créée par score de ressemblance.
 * Données éditoriales : 2026-10-15. 
 */
(function(root) {
 "use strict";
 const DATA = {
  "version": "ALPHA-C7/1.0.0",
  "asOf": "2026-10-15",
  "editorialScope": "Corpus fixe de sources contrôlées manuellement, pas une collecte web en direct",
  "alphabet": "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
  "bodyParts": [
    "Tête",
    "Cou",
    "Épaules et mains",
    "Poitrine",
    "Diaphragme",
    "Dos",
    "Ventre",
    "Cuisses",
    "Genoux",
    "Jambes",
    "Chevilles",
    "Pieds"
  ],
  "vowels": "ΑΕΗΙΟΥΩ",
  "classification": {
    "muettes": 9,
    "semivoyelles": 8,
    "voyelles": 7
  },
  "numerals": {
    "Α": 1,
    "Β": 2,
    "Γ": 3,
    "Δ": 4,
    "Ε": 5,
    "Ϛ": 6,
    "Ζ": 7,
    "Η": 8,
    "Θ": 9,
    "Ι": 10,
    "Κ": 20,
    "Λ": 30,
    "Μ": 40,
    "Ν": 50,
    "Ξ": 60,
    "Ο": 70,
    "Π": 80,
    "Ϟ": 90,
    "Ρ": 100,
    "Σ": 200,
    "Τ": 300,
    "Υ": 400,
    "Φ": 500,
    "Χ": 600,
    "Ψ": 700,
    "Ω": 800,
    "Ϡ": 900
  },
  "numeralsExpected": [
    {
      "word": "ΙΗΣΟΥΣ",
      "expected": 888,
      "source": "irenee-15"
    },
    {
      "word": "ΑΩ",
      "expected": 801,
      "source": "irenee-15"
    },
    {
      "word": "ΠΕΡΙΣΤΕΡΑ",
      "expected": 801,
      "source": "irenee-15"
    }
  ],
  "papyrus": {
    "vowelLines": 7,
    "repeatsPerLine": 7,
    "michael": [
      "ΜΙΧΑΗΛ",
      "ΙΧΑΗΛ",
      "ΧΑΗΛ",
      "ΑΗΛ",
      "ΗΛ",
      "Λ"
    ]
  },
  "sources": [
    {
      "id": "irenee-14",
      "short": "Irénée I,14",
      "title": "Contre les hérésies I,14, §§3,5,7",
      "url": "https://www.newadvent.org/fathers/0103114.htm",
      "date": {
        "min": 170,
        "max": 190
      },
      "kind": "témoignage polémique",
      "motifs": [
        "24-lettres",
        "corps-verite",
        "sept-voyelles",
        "sept-cieux",
        "son",
        "7",
        "nom-lettres"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "irenee-15",
      "short": "Irénée I,15",
      "title": "Contre les hérésies I,15",
      "url": "https://www.newadvent.org/fathers/0103115.htm",
      "date": {
        "min": 170,
        "max": 190
      },
      "kind": "témoignage polémique",
      "motifs": [
        "isopsephie",
        "alpha-omega",
        "colombe",
        "jesus-nom"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "irenee-20",
      "short": "Irénée I,20",
      "title": "Contre les hérésies I,20",
      "url": "https://www.newadvent.org/fathers/0103120.htm",
      "date": {
        "min": 170,
        "max": 190
      },
      "kind": "témoignage polémique",
      "motifs": [
        "alpha-beta",
        "jesus-enfant",
        "nom-lettres"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "apocalypse-aomega",
      "short": "Apocalypse 1,8 ; 21,6 ; 22,13",
      "title": "Alpha et Oméga dans l'Apocalypse",
      "url": "https://www.biblegateway.com/passage/?search=Revelation%201%3A8%3B21%3A6%3B22%3A13&version=ESV",
      "date": {
        "min": 85,
        "max": 110
      },
      "kind": "texte religieux",
      "motifs": [
        "alpha-omega",
        "commencement-fin"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "apocalypse-tonnerres",
      "short": "Apocalypse 10,3–4",
      "title": "Les paroles des sept tonnerres scellées",
      "url": "https://www.biblegateway.com/passage/?search=Revelation%2010%3A3-4&version=ESV",
      "date": {
        "min": 85,
        "max": 110
      },
      "kind": "texte religieux",
      "motifs": [
        "7",
        "son",
        "sept-tonnerres",
        "paroles-scellées"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "demetrios-71",
      "short": "Pseudo-Démétrios §71",
      "title": "Sur le style, §71 : prêtres égyptiens et voyelles",
      "url": "https://www.attalus.org/old/demetr2.html",
      "date": {
        "min": null,
        "max": null
      },
      "kind": "témoignage littéraire, datation discutée",
      "motifs": [
        "7",
        "sept-voyelles",
        "son",
        "chant"
      ],
      "directTransmissionEvidence": []
    },
    {
      "id": "papyrus-g328",
      "short": "P.Vindob. G 328",
      "title": "Papyrus de Vienne : plinthion vocalique et nom de Michel",
      "url": "https://www.onb.ac.at/mehr/blogs/detail/magie-der-erzengel-michael-und-maennerliebe",
      "date": {
        "min": 200,
        "max": 399
      },
      "kind": "objet matériel ; notice institutionnelle",
      "motifs": [
        "7",
        "sept-voyelles",
        "nom-lettres",
        "michel",
        "reduction-nom"
      ],
      "directTransmissionEvidence": []
    }
  ],
  "hypotheses": [
    {
      "id": "H1",
      "name": "Les sept tonnerres sont les sept voyelles",
      "a": "apocalypse-tonnerres",
      "b": "irenee-14",
      "claimed": "identité",
      "criticalMotif": "sept-voyelles",
      "counter": "Apocalypse 10,4 ne transcrit pas leurs paroles"
    },
    {
      "id": "H2",
      "name": "L'Apocalypse est la source directe de Marcus",
      "a": "apocalypse-aomega",
      "b": "irenee-15",
      "claimed": "emprunt",
      "criticalMotif": "alpha-omega",
      "counter": "Absence de citation ou de chaîne de transmission explicite dans les pièces examinées"
    },
    {
      "id": "H3",
      "name": "Le chant des voyelles d'Égypte a été repris directement par Marcus",
      "a": "demetrios-71",
      "b": "irenee-14",
      "claimed": "emprunt",
      "criticalMotif": "sept-voyelles",
      "counter": "Datation du traité incertaine ; communauté du motif ≠ filiation"
    },
    {
      "id": "H4",
      "name": "La réduction de Michel reproduit la méthode de Marcus",
      "a": "irenee-14",
      "b": "papyrus-g328",
      "claimed": "emprunt",
      "criticalMotif": "nom-lettres",
      "counter": "Réduction d'un nom versus expansion des noms des lettres"
    },
    {
      "id": "H5",
      "name": "Le récit Alpha/Bêta prouve la transmission par Jésus historique",
      "a": "irenee-20",
      "b": "irenee-14",
      "claimed": "origine historique",
      "criticalMotif": "nom-lettres",
      "counter": "Témoignage tardif sur une lecture marcosienne, pas une preuve biographique"
    }
  ]
};
 const auditAlpha = function auditAlpha(data){
 const checks=[],issues=[];
 const chars=[...data.alphabet];
 const push=(id,method,label,actual,expected,source)=>checks.push({id,method,label,actual,expected,ok:actual===expected,source});
 for(let i=0;i<12;i++){
  const a=i+1,b=chars.length-i;
  push("PAIR-"+String(i+1).padStart(2,"0"),"ALPHABET",data.bodyParts[i]+": "+chars[i]+"–"+chars[chars.length-i-1],a+b,25,"irenee-14");
 }
 push("LEN-24","CORPUS","Nombre de lettres grecques",chars.length,24,"irenee-14");
 const vowels=[...data.vowels];
 push("VOWELS-7","PHONÉ","Nombre de voyelles grecques distinctes",new Set(vowels).size,7,"irenee-14");
 push("VOWELS-ORDER","PHONÉ","Séquence rapportée par Irénée",vowels.join(""),"ΑΕΗΙΟΥΩ","irenee-14");
 push("CAT-24","CORPUS","9 muettes + 8 semi-voyelles + 7 voyelles",Object.values(data.classification).reduce((a,b)=>a+b,0),24,"irenee-14");
 for(const entry of data.numeralsExpected){
  const sum=[...entry.word].reduce((acc,c)=>acc+(data.numerals[c]??NaN),0);
  push("NUM-"+entry.word,"ARITHMOS","Isopséphie de "+entry.word,sum,entry.expected,entry.source);
 }
 push("PAPYRUS-49","ARITHMOS","7 lignes × 7 voyelles",data.papyrus.vowelLines*data.papyrus.repeatsPerLine,49,"papyrus-g328");
 const reduction=data.papyrus.michael.every((term,i,all)=>i===0 || term===[...all[i-1]].slice(1).join(""));
 push("MICHEL-REDUC","ALPHABET","Schéma de réduction du nom de Michel",reduction,true,"papyrus-g328");
 const sourceMap=new Map(data.sources.map(s=>[s.id,s]));
 const hypotheses=data.hypotheses.map(h=>{
  const a=sourceMap.get(h.a),b=sourceMap.get(h.b);
  const shared=a.motifs.filter(m=>b.motifs.includes(m));
  const chrono=(a.date.min==null||b.date.max==null)?"indéterminée":a.date.min<=b.date.max?"compatible (ne prouve pas l'emprunt)":"ordre chronologique défavorable";
  const direct=(a.directTransmissionEvidence||[]).some(s=>s===b.id)||(b.directTransmissionEvidence||[]).some(s=>s===a.id);
  const resolved=direct?"transmission documentée dans les données":"NON DÉMONTRÉ";
  const specificity=shared.filter(m=>!["7","son","nom-lettres"].includes(m));
  const missingCritical=!a.motifs.includes(h.criticalMotif)||!b.motifs.includes(h.criticalMotif);
  return {id:h.id,name:h.name,status:resolved,sourceA:a.short,sourceB:b.short,sourceIds:[a.id,b.id],shared,distinctiveShared:specificity,criticalMotifMissing:missingCritical,chronology:chrono,objection:h.counter,sourceURLs:[a.url,b.url]};
 });
 for(const h of hypotheses){
  if(h.criticalMotifMissing) issues.push({id:"GAP-"+h.id,type:"lacune",text:h.name+" : le motif nécessaire n'est pas attesté dans les deux témoins."});
  if(h.chronology==="indéterminée") issues.push({id:"DATE-"+h.id,type:"datation",text:h.name+" : datation insuffisante pour établir l'ordre."});
 }
 const datedPairs=hypotheses.filter(x=>x.chronology!=="indéterminée").length;
 const report={engine:data.version,asOf:data.asOf,sources:data.sources.length,checks:checks.length,passed:checks.filter(c=>c.ok).length,failed:checks.filter(c=>!c.ok).length,hypotheses:hypotheses.length,unproven:hypotheses.filter(h=>h.status==="NON DÉMONTRÉ").length,datedPairs,issues:issues.length};
 return {report,checks,hypotheses,issues,sources:data.sources,methods:["CORPUS","ALPHABET","PHONÉ","ARITHMOS","CHRONOS","STEMMA","AUDIT"]};
};
 const api = Object.freeze({version:DATA.version,corpus:DATA,run:function(){return auditAlpha(DATA);},audit:auditAlpha});
 if (typeof module!=="undefined" && module.exports) module.exports=api;
 if (root) root.PARISIS_ALPHA_ENGINE=api;
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:null));
