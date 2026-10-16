/* ELOAH : recherche automatique limitée aux créations privées du compte fondatrice.
   Aucun Drive, Gmail ni WordPress prétendument connecté. */
(()=>{
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co';
const KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
let selected=[],memorySelected=[],lastStatus='Aucune recherche lancée.';
const normalize=s=>String(s||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const tokens=s=>[...new Set(normalize(s).split(/[^a-z0-9]+/).filter(w=>w.length>=4))].slice(0,30);
const allowMemory=()=>document.getElementById('eloah-memory-optin')?.checked===true;
const rank=(words,x)=>{
 const title=normalize(x.title),body=normalize(String(x.content||'').slice(0,3500));
 return words.reduce((sum,w)=>sum+(title.includes(w)?4:0)+(body.includes(w)?1:0),0);
};
window.EloahAutoSources={
 status:()=>lastStatus,
 evidence:()=>[
 ...selected.map(x=>({key:x.id,title:x.title,origin:'Création retrouvée non contrôlée',universe:x.universe,excerpt:x.content.slice(0,700)})),
 ...memorySelected.map(x=>({key:'memory-'+x.id,title:x.title,origin:'Conversation importée et approuvée, non vérifiée',universe:x.universe,excerpt:x.content.slice(0,700)}))
],
 sources:()=>[
 ...selected.map(x=>({id:x.id,title:x.title,universe:x.universe,origin:'ELOAH cloud',score:x.score})),
 ...memorySelected.map(x=>({id:'memory-'+x.id,title:x.title,universe:x.universe,origin:'Mémoire privée importée, non vérifiée',score:x.score}))
],
 context:()=>[
 ...selected.map(x=>'Création sauvegardée : '+x.title+'\n'+x.content.slice(0,1050)),
 ...memorySelected.map(x=>'Conversation importée et approuvée (non vérifiée) : '+x.title+'\n'+x.content.slice(0,900))
].join('\n\n').slice(0,3500),
 async prepare(text,universe){
  selected=[];memorySelected=[];lastStatus='Recherche en cours.';
  const note=document.getElementById('eloah-auto-sources-status');
  const update=t=>{lastStatus=t;if(note)note.textContent=t};
  try{
   const mod=await import('https://esm.sh/@supabase/supabase-js@2.116.0');
   const db=mod.createClient(BASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}});
   const {data:user,error:authError}=await db.auth.getUser();
   if(authError||user?.user?.id!==FOUNDER||user.user.is_anonymous){update('Références non consultées : connexion fondatrice requise.');return}
   const {data,error}=await db.from('eloah_creations').select('id,title,content,universe').eq('user_id',FOUNDER).order('updated_at',{ascending:false}).limit(100);
   if(error)throw error;
   const words=tokens(text);
   const scored=(data||[]).filter(x=>!universe||universe==='ELOAH'||x.universe===universe)
    .map(x=>{
     const title=normalize(x.title),body=normalize(x.content.slice(0,2500));
     const score=words.reduce((s,w)=>s+(title.includes(w)?4:0)+(body.includes(w)?1:0),0);
     return {...x,score};
    }).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score).slice(0,2);
   selected=scored;
   let memoryStatus='';
   if(allowMemory()){
    if(!universe){memoryStatus=' Choisis un univers pour retrouver les conversations sans mélanger les projets.';}
    else {
     const selectedUniverse=universe==='The Crew'?'The Crew Orchies':universe;
     const boilerplate=new Set(['parisis','engine','eloah','sonia','recherche','enquete','historique','documentaire','sources','document','projet','univers','dossier','question','presentation','officielle','retrouver','rediger','creer','creation','avec','pour','dans','selon','faire','analyse','methode','memoire']);
     const topicWords=words.filter(w=>!boilerplate.has(w)).slice(0,8);
     if(!topicWords.length){memoryStatus=' Précise un sujet historique ou un titre pour rechercher dans tes conversations.';}
     else {
      const baseQuery=()=>db.from('eloah_knowledge_entries')
        .select('id,title,content,universe,source_id').eq('owner_id',FOUNDER).eq('universe',selectedUniverse);
      let {data:entries,error:memoryError}=await baseQuery()
        .textSearch('search_vector',topicWords.slice(0,5).join(' OR '),{type:'websearch',config:'french'}).limit(80);
      if(memoryError||!entries?.length){
       ({data:entries,error:memoryError}=await baseQuery().ilike('content','%'+topicWords[0]+'%').limit(80));
      }
      if(memoryError){memoryStatus=' Mémoire privée inaccessible : '+String(memoryError.message||memoryError).slice(0,100);}
      else{
       memorySelected=(allowMemory()?entries||[]:[]).filter(x=>typeof x.content==='string')
         .map(x=>({...x,score:rank(topicWords,x)})).filter(x=>x.score>=2)
         .sort((a,b)=>b.score-a.score).slice(0,2);
       memoryStatus=memorySelected.length
         ?' Mémoire privée : '+memorySelected.length+' extrait(s) retrouvé(s) : '+memorySelected.map(x=>x.title).join(' ; ')
         :' Aucun passage pertinent enregistré dans la mémoire privée de cet univers.';
      }
     }
    }
   }
   update((selected.length?'Références trouvées automatiquement : '+selected.map(x=>x.title).join(' ; '):'Aucune création précédente suffisamment pertinente trouvée.')+memoryStatus);
  }catch(e){selected=[];update('Recherche automatique indisponible : '+String(e.message||e).slice(0,160))}
 }
};
function init(){
 const ai=document.getElementById('eloah-home-ai');if(!ai)return;
 const p=document.createElement('p');p.id='eloah-auto-sources-status';p.setAttribute('role','status');p.textContent='Avant chaque création, ELOAH cherche des créations enregistrées pertinentes dans ton compte cloud. Les titres retrouvés seront affichés.';
 const form=document.getElementById('home-ai-form');form?.before(p);
 const label=document.createElement('label');label.className='hai-check';
 label.style.display='flex';label.style.gap='8px';label.style.alignItems='flex-start';label.style.margin='8px 0 4px';
 const input=document.createElement('input');input.id='eloah-memory-optin';input.type='checkbox';input.checked=false;
 const caption=document.createElement('span');
 caption.textContent='Pour cette création, chercher aussi dans mes conversations importées et approuvées.';
 label.append(input,caption);p.after(label);
 const notice=document.createElement('p');notice.style.fontSize='12px';notice.style.margin='0 0 10px';
 notice.textContent='Désactivé par défaut. En cochant cette case, tu autorises l’envoi au moteur IA des extraits pertinents retrouvés dans la mémoire privée du projet choisi. Ces extraits ne sont pas des preuves historiques.';
 label.after(notice);
 input.addEventListener('change',()=>{memorySelected=[];lastStatus=input.checked?'Mémoire autorisée pour la prochaine création dans le projet choisi.':'Mémoire privée désactivée pour les prochaines demandes.';p.textContent=lastStatus;});
 document.getElementById('home-ai-project')?.addEventListener('change',()=>{input.checked=false;memorySelected=[];p.textContent='Univers changé : mémoire désactivée. Tu peux la réactiver volontairement.';});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();