/* Offline regression for the CDSQCD reference register. No network, no credentials. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('eloah-cdsqcd-evidence.js','utf8');
const mock={
 EloahCreationSources:{evidence:()=>[
  {key:'doc1',title:'Atelier confirmé',origin:'Document choisi',universe:'The Crew Orchies',excerpt:'Atelier : samedi 18h30.'}
 ]},
 EloahAutoSources:{evidence:()=>[
  {key:'doc2',title:'Ancien dossier',origin:'Création antérieure',universe:'The Crew Orchies',excerpt:'Une création IA antérieure non prouvée.'}
 ]},
 EloahValidatedMemory:{evidence:()=>[
  {key:'note1',title:'Consigne fondatrice',origin:'Note fondatrice',universe:'The Crew Orchies',excerpt:'Pas de Zumba dans la communication de The Crew.'}
 ]}
};
vm.runInNewContext(code,{window:mock},{timeout:1500});
const api=mock.EloahEvidence;
assert.equal(typeof api?.prepare,'function');
assert.equal(api.ambiguous('cdsqcd'),true,'Unknown one-word pseudoacronym must be blocked');
assert.equal(api.ambiguous('RGPD'),false,'Known real-world acronym remains available');
assert.equal(api.ambiguous('Nostradamus'),false,'Normal real topic remains available');
assert.equal(api.ambiguous('Je souhaite imaginer cdsqcd'),false,'Creative description is not blocked');
assert.equal(api.prepare('The Crew Orchies'),3);
assert.equal(api.sources().length,0,'A pending request must not replace the last completed answer');
api.commit();
assert.deepEqual(Array.from(api.sources(),x=>x.id),['S1','S2','S3']);
assert.match(api.context(),/\[S1\].*Atelier confirmé/);
assert.match(api.context(),/non vérifiés|non prouvée|NON|non vérifiée/i);
const withCitation=api.audit('L’atelier est le samedi. [S1]');
assert.deepEqual(Array.from(withCitation.cited),['S1']);
assert.equal(withCitation.unknown.length,0);
const invented=api.audit('L’entreprise est conforme ISO 27001 en 2026. [S9]');
assert.deepEqual(Array.from(invented.unknown),['S9']);
assert.ok(invented.warnings.some(w=>w.includes('absentes')));
api.prepare('ELOAH');
assert.equal(api.sources().length,3,'Unfinished request must preserve the last answer citations');
const unsupported=api.audit('ELOAH a été certifiée ISO 27001 en 2026.');
assert.ok(unsupported.uncited.length>=1);
api.clear();
assert.equal(api.sources().length,0);
assert.equal(api.prepare('ELOAH'),3);
mock.EloahCreationSources.evidence=()=>[];
mock.EloahAutoSources.evidence=()=>[];
mock.EloahValidatedMemory.evidence=()=>[];
api.clear();assert.equal(api.prepare('ELOAH'),0);
assert.match(api.context(),/AUCUNE SOURCE/);
assert.ok(api.audit('Selon [S1], le projet est certifié.').unknown.includes('S1'));
// Long source collections cannot create phantom references trimmed out of AI context.
mock.EloahCreationSources.evidence=()=>Array.from({length:8},(_,i)=>({
  key:'source-'+i,title:'Source documentée '+i,origin:'Dossier interne',
  universe:'ELOAH',excerpt:'Texte documenté '.repeat(100)
}));
mock.EloahAutoSources.evidence=()=>[{
  key:'source-1',title:'Doublon sélectionné',origin:'Création retrouvée',
  universe:'ELOAH',excerpt:'Déjà fourni'
}];
api.clear();api.prepare('ELOAH');
const textSent=api.context();
assert.ok(textSent.length<=4400,'Full CDSQCD context must fit the actual AI payload cap');
api.commit();
const sources=api.sources();
assert.ok(sources.length>0 && sources.length<=8);
for(const src of sources){
  assert.ok(textSent.includes('['+src.id+'] '+src.title),'Every registered source must be present in the AI context');
  assert.ok(textSent.includes(src.excerpt),'Its excerpt must be fully present in the AI context');
}
assert.equal(new Set(Array.from(sources,x=>x.title)).size,sources.length,'Duplicate selected / automatic sources must collapse');
console.log('CDSQCD v2: registry, ambiguity, citations, missing sources and reset OK.');
