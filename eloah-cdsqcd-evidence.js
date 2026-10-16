/* CDSQCD v2 - registre local de références réellement transmises au moteur ELOAH.
   Les notes et créations antérieures ne sont PAS des preuves indépendantes. */
(()=>{
'use strict';
let register=[],activeRegister=[],prepared=false,projectAtSend='',activeProject='';
const HEADER='CDSQCD — EXTRAITS TRANSMIS AVEC LA DEMANDE. Ces documents peuvent être incomplets, anciens ou erronés. Les identifiants [S1], [S2] désignent uniquement les extraits visibles ci-dessous, et non des preuves indépendantes. Cite un identifiant uniquement si son extrait contient explicitement l information utilisée. Toute autre affirmation factuelle reste à vérifier.';
const MAX_CONTEXT=4400;
const clean=v=>String(v??'').replace(/[\u0000-\u001f]+/g,' ').trim();
const key=v=>clean(v).toLocaleLowerCase('fr');
const clip=(text,n)=>clean(text).slice(0,n);
const citations=text=>[...new Set([...String(text||'').matchAll(/\[S(\d{1,2})\]/gi)].map(m=>'S'+Number(m[1])))];
const suspiciousLine=line=>/\b(?:19\d\d|20\d\d|\d+(?:[,.]\d+)?\s?%|ISO\s*\d+|RGPD|CNIL|certifi\w*|conform\w*|une étude|selon\s+\w+|d’après\s+\w+|responsable\s+(?:de|du)|acteur majeur)\b/i.test(line);
const isAmbiguous=text=>{
 const t=clean(text);if(t.includes(' ')||t.includes('-')||t.includes('\n'))return false;
 if(!/^[\p{L}\p{N}]{4,32}$/u.test(t))return false;
 const normal=t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const known=new Set(['rgpd','cnil','iso27001','eloah','parisis','powerglam','nostradamus','chatgpt','openai','thecrew','zumba','html','json','sos','whatsapp','linkedin','youtube','gmail','supabase','wordpress']);
 if(known.has(normal))return false;
 return /\d/.test(normal)||/[^aeiouy]{5,}/i.test(normal)||(/^[A-Z]{4,18}$/.test(t)&&!known.has(normal));
};
function prepare(universe){
 projectAtSend=clean(universe)||'ELOAH';
 const selected=window.EloahCreationSources?.evidence?.()||[];
 const recent=window.EloahAutoSources?.evidence?.()||[];
 const notes=window.EloahValidatedMemory?.evidence?.(universe)||[];
 const entries=[...selected,...recent,...notes],keys=new Set();
 register=[];let consumed=HEADER.length;
 for(const e of entries){
  const k=key(e.universe||universe)+'|'+key(e.key||e.title);
  if(keys.has(k)||!clean(e.excerpt))continue;
  const info={id:'S'+(register.length+1),title:clip(e.title,100),origin:clip(e.origin,90),universe:clip(e.universe||universe,65)};
  const prefix='\n\n['+info.id+'] '+info.title+' — '+info.origin+' ('+info.universe+')\nEXTRAIT : ';
  const available=MAX_CONTEXT-consumed-prefix.length;
  if(available<100)break;
  const excerpt=clip(e.excerpt,Math.min(740,available));
  register.push({...info,excerpt});keys.add(k);consumed+=prefix.length+excerpt.length;
  if(register.length>=8)break;
 }
 prepared=true;
 return register.length;
}
function context(){
 if(!prepared)return '';
 if(!register.length)return 'CDSQCD — AUCUNE SOURCE documentaire consultable n’a été retrouvée. Ne crée aucune référence ou citation fictive. Les affirmations sur des faits externes restent à vérifier.';
 return HEADER+register.map(s=>'\n\n['+s.id+'] '+s.title+' — '+s.origin+' ('+s.universe+')\nEXTRAIT : '+s.excerpt).join('');
}
function commit(){activeRegister=register.map(x=>({...x}));activeProject=projectAtSend;}
function audit(answer){
 const register=activeRegister;
 const raw=String(answer||''),ids=new Set(register.map(x=>x.id)),referenced=citations(raw);
 const unknown=referenced.filter(id=>!ids.has(id));
 const cited=referenced.filter(id=>ids.has(id));
 const lines=raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);
 const flags=lines.filter(line=>line.length>25&&suspiciousLine(line)&&!citations(line).length)
  .slice(0,5).map(s=>clip(s,230));
 const warnings=[];
 if(unknown.length)warnings.push('Références absentes du registre : '+unknown.map(x=>'['+x+']').join(', ')+'.');
 if(!register.length&&referenced.length)warnings.push('Citations affichées sans aucune source consultée.');
 if(register.length&&!cited.length)warnings.push('Aucune source du registre citée dans cette réponse.');
 if(flags.length)warnings.push(flags.length+' passage(s) à portée factuelle repérés sans référence sur la même ligne. Vérification manuelle nécessaire.');
 return {sources:register.map(x=>({...x})),cited,unknown,uncited:flags,warnings,universe:activeProject};
}
window.EloahEvidence={
 prepare,context,commit,audit,sources:()=>activeRegister.map(x=>({...x})),clear:()=>{register=[];activeRegister=[];prepared=false;projectAtSend='';activeProject='';},
 ambiguous:isAmbiguous
};
})();
