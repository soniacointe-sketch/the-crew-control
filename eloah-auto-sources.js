/* ELOAH : recherche automatique limitée aux créations privées du compte fondatrice.
   Aucun Drive, Gmail ni WordPress prétendument connecté. */
(()=>{
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co';
const KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
let selected=[],lastStatus='Aucune recherche lancée.';
const normalize=s=>String(s||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const tokens=s=>[...new Set(normalize(s).split(/[^a-z0-9]+/).filter(w=>w.length>=4))].slice(0,30);
window.EloahAutoSources={
 status:()=>lastStatus,
 sources:()=>selected.map(x=>({id:x.id,title:x.title,universe:x.universe,origin:'ELOAH cloud',score:x.score})),
 context:()=>selected.map(x=>'Création sauvegardée : '+x.title+'\n'+x.content.slice(0,1050)).join('\n\n').slice(0,3500),
 async prepare(text,universe){
  selected=[];lastStatus='Recherche en cours.';
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
   update(selected.length?'Références trouvées automatiquement : '+selected.map(x=>x.title).join(' ; '):'Aucune création précédente suffisamment pertinente trouvée.');
  }catch(e){selected=[];update('Recherche automatique indisponible : '+String(e.message||e).slice(0,160))}
 }
};
function init(){
 const ai=document.getElementById('eloah-home-ai');if(!ai)return;
 const p=document.createElement('p');p.id='eloah-auto-sources-status';p.setAttribute('role','status');p.textContent='Avant chaque création, ELOAH cherche des créations enregistrées pertinentes dans ton compte cloud. Les titres retrouvés seront affichés.';
 const form=document.getElementById('home-ai-form');form?.before(p);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();