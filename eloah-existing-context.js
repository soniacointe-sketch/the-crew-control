/* ELOAH · Contexte professionnel existant (lecture seule).
   Chaque demande relit la mémoire active du compte fondatrice via Supabase/RLS.
   N'importe jamais les notes personnelles, les archives ChatGPT ou les courriers. */
const PREFIXES = {
  'Power & Glam':['pg-','etsy-'],
  'The Crew Orchies':['crew-'],
  'The Crew':['crew-'],
  'PARISIS ENGINE':['parisis-'],
  'SONIA OS':['sonia-os-'],
  'Agents transversaux':['sonia-os-'],
  'Sonia Velka':['velka-'],
  'ELOAH':['eloah-'],
  'Le Lion Blanc':['lion-blanc']
};
const SHARED = new Set(['authority-core','voice-core','memory-boundaries']);
const normalize = value => String(value||'').normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').toLowerCase();
const wordsOf = value => [...new Set(normalize(value).split(/[^a-z0-9]+/)
  .filter(word=>word.length>=4 && !['pour','dans','avec','quel','quelle','plus','cette','faire','créer','creer','aussi','eloah','sonia','projet','dossier','univers','document'].includes(word)))].slice(0,12);

export function selectExistingContext(rows,universe,question,limit=5){
  const prefixes=PREFIXES[universe]||[];
  const words=wordsOf(question);
  const relevant=(Array.isArray(rows)?rows:[]).filter(row=>{
    if(!row || row.enabled!==true || row.sensitivity!=='standard')return false;
    const slug=String(row.slug||'');
    return SHARED.has(slug)||prefixes.some(prefix=>slug.startsWith(prefix));
  }).map(row=>{
    const slug=String(row.slug||'');
    const topic=normalize(row.title)+' '+normalize((row.tags||[]).join(' '));
    const body=normalize(row.body);
    const relevance=words.reduce((score,word)=>score+(topic.includes(word)?6:0)+(body.includes(word)?2:0),0);
    const specific=prefixes.some(prefix=>slug.startsWith(prefix));
    return {...row,_score:relevance+(specific?5:0)+(row.core?2:0),_specific:specific};
  }).sort((a,b)=>b._score-a._score || Number(b.priority||0)-Number(a.priority||0));
  // Mieux vaut un repère précis de l'univers qu'un texte général.
  const selected=relevant.slice(0,Math.max(0,Math.min(Number(limit)||5,6)));
  const parts=[];
  for(const entry of selected){
    const date=String(entry.as_of||'').slice(0,10);
    const source=String(entry.source||'').slice(0,130);
    const piece='Fiche interne : '+String(entry.title||'').slice(0,110)
      +(date?' · état au '+date:'')
      +'\n'+String(entry.body||'').slice(0,540)
      +(source?'\nOrigine déclarée : '+source:'');
    const next=[...parts,piece].join('\n\n');
    if(next.length>2750)break;
    parts.push(piece);
  }
  return {text:parts.join('\n\n'),titles:selected.slice(0,parts.length).map(x=>x.title),count:parts.length};
}

export async function retrieveExistingContext({client,founderId,universe,question}){
  if(!client||!founderId)throw Error('Compte fondatrice non disponible.');
  const {data:auth,error:authError}=await client.auth.getUser();
  if(authError||!auth?.user||auth.user.is_anonymous||auth.user.id!==founderId){
    throw Error('Connexion fondatrice non confirmée.');
  }
  const {data,error}=await client.from('eloah_editorial_memory')
    .select('slug,title,body,tags,category,sensitivity,core,priority,enabled,source,as_of')
    .eq('owner_id',founderId).eq('enabled',true).eq('sensitivity','standard')
    .limit(80);
  if(error)throw Error('Mémoire professionnelle indisponible : '+String(error.message||error).slice(0,90));
  return selectExistingContext(data,universe,question);
}
